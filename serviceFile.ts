import {
  capitalizeFirstLetter,
  createAndReferOrInlineArgsForField,
  inlineArgsForField,
  variableDeclarationIsAsync,
  varStartsWithUppercase,
} from "./utils.ts";
import { typeMapper } from "./typeMap.ts";
import { graphql, path, tsMorph } from "./deps.ts";
import { AppContext } from "./context.ts";
import { FieldFacts } from "./typeFacts.ts";

export const lookAtServiceFile = async (file: string, context: AppContext) => {
  const { gql, prisma, settings } = context;

  if (!gql) throw new Error("No schema");
  if (!prisma) throw new Error("No prisma schema");

  // This isn't good enough, needs to be relative to api/src/services
  const filename = path.basename(file);
  const fileContents = await context.readFile(file);
  const referenceFileSourceFile = context.tsProject.createSourceFile(
    `/source/${filename}`,
    fileContents,
  );

  const vars = referenceFileSourceFile.getVariableDeclarations().filter((v) => v.isExported());

  const resolverContainers = vars.filter(varStartsWithUppercase);

  // TODO: Check this is everything, you can define a resolver via function or arrows
  const queryResolvers = vars.filter((v) => !varStartsWithUppercase(v));

  const fileDTS = context.tsProject.createSourceFile(
    "/source/index.d.ts",
    "",
    { overwrite: true },
  );

  const queryType = gql.getQueryType();
  if (!queryType) throw new Error("No query type");

  const mutationType = gql.getMutationType();
  if (!mutationType) throw new Error("No mutation type");

  const externalMapper = typeMapper(context, { preferPrismaModels: true });
  const returnTypeMapper = typeMapper(context, {});

  const extraPrismaReferences = new Set<string>();

  // Add the root resolvers
  queryResolvers.forEach((v) =>
    addTypeForQueryResolver(v.getName(), getResolverInformationForDeclaration(v.getInitializer(), queryType.name))
  );

  resolverContainers.forEach((c) => {
    addCustomTypeResolvers(c, {});
  });

  const sharedGraphQLObjectsReferenced = externalMapper.getReferencedGraphQLThingsInMapping();
  if (sharedGraphQLObjectsReferenced.types.length) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: `./${settings.sharedFilename.replace(".d.ts", "")}`,
      namedImports: sharedGraphQLObjectsReferenced.types,
    });
  }

  const sharedInternalGraphQLObjectsReferenced = returnTypeMapper.getReferencedGraphQLThingsInMapping();
  if (sharedInternalGraphQLObjectsReferenced.types.length) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: `./${settings.sharedInternalFilename.replace(".d.ts", "")}`,
      namedImports: sharedInternalGraphQLObjectsReferenced.types.map((t) => `${t} as RT${t}`),
    });
  }

  const aliases = [...new Set([...sharedGraphQLObjectsReferenced.scalars, ...sharedInternalGraphQLObjectsReferenced.scalars])];
  if (aliases.length) {
    fileDTS.addTypeAliases(
      aliases.map((s) => ({
        name: s,
        type: "any",
      })),
    );
  }

  const prismases = [
    ...new Set([
      ...sharedGraphQLObjectsReferenced.prisma,
      ...sharedInternalGraphQLObjectsReferenced.prisma,
      ...(extraPrismaReferences.values() || []),
    ]),
  ];

  if (prismases.length) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: "@prisma/client",
      namedImports: prismases.map((p) => `${p} as P${p}`),
    });
  }

  if (fileDTS.getText().includes("GraphQLResolveInfo")) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: "graphql",
      namedImports: ["GraphQLResolveInfo"],
    });
  }

  if (fileDTS.getText().includes("RedwoodGraphQLContext")) {
    fileDTS.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: "@redwoodjs/graphql-server/dist/functions/types",
      namedImports: ["RedwoodGraphQLContext"],
    });
  }

  fileDTS.formatText({ indentSize: 2 });

  await context.writeTextFile(
    path.join(
      context.settings.typesFolderRoot,
      filename.replace(".ts", ".d.ts"),
    ),
    fileDTS.getText(),
  );

  return;

  function addTypeForQueryResolver(
    name: string,
    config: ResolverTypeInformation,
  ) {
    let field = queryType!.getFields()[name];
    if (!field) {
      field = mutationType!.getFields()[name];
    }
    if (!field) {
      fileDTS.addStatements(
        `\n// ${name} does not exist on Query or Mutation`,
      );
      return;
    }

    // if (!field) throw new Error(`No field named ${name} on Query`)

    const interfaceDeclaration = fileDTS.addInterface({
      name: `${capitalizeFirstLetter(name)}Resolver`,
      isExported: true,
      docs: ["SDL: " + graphql.print(field.astNode!)],
    });

    const args = createAndReferOrInlineArgsForField(field, {
      name: interfaceDeclaration.getName(),
      file: fileDTS,
      mapper: externalMapper.map,
    });

    const argsParam = args || "object";

    const parentType = config.parentName === "Query" || config.parentName === "Mutation" ? "object" : config.parentName;
    const tType = returnTypeMapper.map(field.type, { preferNullOverUndefined: true, typenamePrefix: "RT" });

    let returnType = tType;
    const all = `${tType} | Promise<${tType}> | (() => Promise<${tType}>)`;

    if (config.isFunc && config.isAsync) returnType = `Promise<${tType}>`;
    else if (config.isFunc) returnType = all;
    else if (config.isObjLiteral) returnType = tType;
    else if (config.isUnknown) returnType = all;

    interfaceDeclaration.addCallSignature({
      parameters: [{ name: "args", type: argsParam, hasQuestionToken: config.funcArgCount < 1 }, {
        name: "obj",
        type: `{ root: ${parentType}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }`,
        hasQuestionToken: config.funcArgCount < 2,
      }],
      returnType,
    });
  }

  function addCustomTypeResolvers(
    variableDeclaration: tsMorph.VariableDeclaration,
    config: {},
  ) {
    const declarations = variableDeclaration.getVariableStatementOrThrow()
      .getDeclarations();

    declarations.forEach((d) => {
      const name = d.getName();
      // only do it if the first letter is a capital
      if (!name.match(/^[A-Z]/)) return;

      const type = d.getType();
      const hasGenericArgs = type && type.getText().includes("<");
      const fieldFacts: FieldFacts = {};

      // Grab the const Thing = { ... }
      const obj = d.getFirstDescendantByKind(
        tsMorph.SyntaxKind.ObjectLiteralExpression,
      );
      if (!obj) {
        throw new Error(
          `Could not find an object literal ( e.g. a { } ) in ${d.getName()}`,
        );
      }

      // Get a list of the defined keys
      const keys: { name: string; info: ResolverTypeInformation }[] = [];
      obj.getProperties().forEach((p) => {
        if (p.isKind(tsMorph.SyntaxKind.SpreadAssignment)) {
          return;
        }

        // keys.push({ name: p.getName(), info:  });

        if (p.isKind(tsMorph.SyntaxKind.PropertyAssignment) && p.hasInitializer()) {
          const name = p.getName();
          keys.push({ name, info: getResolverInformationForDeclaration(p.getInitializerOrThrow(), name) });
        }
        if (p.isKind(tsMorph.SyntaxKind.FunctionDeclaration) && p.getName()) {
          const name = p.getName();
          keys.push({ name, info: getResolverInformationForDeclaration(p as any, name) });
        }
      });

      // Make an interface

      // Account: MergePrismaWithSdlTypes<PrismaAccount, MakeRelationsOptional<Account, AllMappedModels>, AllMappedModels>;
      const gqlType = gql.getType(d.getName());
      if (!gqlType) {
        // throw new Error(`Could not find a GraphQL type named ${d.getName()}`);
        fileDTS.addStatements(
          `\n// ${d.getName()} does not exist in the schema`,
        );
        return;
      }
      if (!graphql.isObjectType(gqlType)) {
        throw new Error(
          `In your schema ${d.getName()} is not an object, which we can only make resolver types for`,
        );
      }

      const fields = gqlType.getFields();

      extraPrismaReferences.add(name);

      // See:   https://github.com/redwoodjs/redwood/pull/6228#issue-1342966511
      // For more ideas

      const fieldFromASTKey = (key: typeof keys[number]) => {
        const existsInGraphQLSchema = fields[key.name];
        const type = existsInGraphQLSchema ? fields[key.name].type : new graphql.GraphQLScalarType({ name: "JSON" });
        if (!existsInGraphQLSchema) {
          console.warn(
            `The service file ${filename} has a field ${key.name} on ${name} that does not exist in the generated schema.graphql`,
          );
        }
        const prefix = !existsInGraphQLSchema ? "\n// This field does not exist in the generated schema.graphql\n" : "";
        return `${prefix}${key.name}: () => Promise<${externalMapper.map(type, {})}>`;
      };

      fileDTS.addTypeAlias({
        name: `${name}AsParent`,
        typeParameters: hasGenericArgs ? ["Extended"] : [],
        type: `P${name} & { ${keys.map(fieldFromASTKey).join(", \n") + `} ` + (hasGenericArgs ? " & Extended" : "")}`,
      });

      const resolverInterface = fileDTS.addInterface({
        name: `${name}TypeResolvers`,
        typeParameters: hasGenericArgs ? ["Extended"] : [],
        isExported: true,
      });

      keys.forEach((key) => {
        const { name: fieldName, info } = key;
        const field = fields[fieldName];
        if (field) {
          if (fieldFacts[fieldName]) fieldFacts[fieldName].hasResolverImplementation = true;
          else fieldFacts[fieldName] = { hasResolverImplementation: true };

          const argsType = inlineArgsForField(field, { mapper: externalMapper.map });
          const param = hasGenericArgs ? "<Extended>" : "";

          const firstQ = info.funcArgCount < 1 ? "?" : "";
          const secondQ = info.funcArgCount < 2 ? "?" : "";
          const innerArgs =
            `args${firstQ}: ${argsType}, obj${secondQ}: { root: ${name}AsParent${param}, context: RedwoodGraphQLContext, info: GraphQLResolveInfo }`;

          const tType = returnTypeMapper.map(field.type, { preferNullOverUndefined: true, typenamePrefix: "RT" });

          let returnType = tType;
          const all = `=> ${tType} | Promise<${tType}> | (() => Promise<${tType}>)`;

          if (info.isFunc && info.isAsync) returnType = ` => Promise<${tType}>`;
          else if (info.isFunc) returnType = all;
          else if (info.isObjLiteral) returnType = tType;
          else if (info.isUnknown) returnType = all;

          resolverInterface.addProperty({
            name: fieldName,
            leadingTrivia: "\n",
            docs: ["SDL: " + graphql.print(field.astNode!)],
            type: info.isFunc || info.isUnknown ? `(${innerArgs}) ${returnType}` : returnType,
          });
        } else {
          resolverInterface.addCallSignature({
            docs: [
              ` @deprecated: SDL ${d.getName()}.${fieldName} does not exist in your schema`,
            ],
          });
        }
      });

      context.fieldFacts.set(d.getName(), fieldFacts);
    });
  }
};

type ResolverTypeInformation = {
  isFunc: boolean;
  isAsync: boolean;
  isUnknown: boolean;
  parentName: string;
  funcArgCount: number;
  isObjLiteral: boolean;
};

const getResolverInformationForDeclaration = (
  initialiser: tsMorph.Expression<tsMorph.ts.Expression> | undefined,
  parentName: string,
): ResolverTypeInformation => {
  // Who knows what folks could do, lets not crash
  if (!initialiser) {
    return {
      parentName,
      funcArgCount: 0,
      isFunc: false,
      isAsync: false,
      isUnknown: true,
      isObjLiteral: false,
    };
  }

  // resolver is a fn
  if (initialiser.isKind(tsMorph.SyntaxKind.ArrowFunction) || initialiser.isKind(tsMorph.SyntaxKind.FunctionExpression)) {
    return {
      parentName,
      funcArgCount: initialiser.getParameters().length,
      isFunc: true,
      isAsync: initialiser.isAsync(),
      isUnknown: false,
      isObjLiteral: false,
    };
  }

  // resolver is a raw obj
  if (
    initialiser.isKind(tsMorph.SyntaxKind.ObjectLiteralExpression) || initialiser.isKind(tsMorph.SyntaxKind.StringLiteral) ||
    initialiser.isKind(tsMorph.SyntaxKind.NumericLiteral) || initialiser.isKind(tsMorph.SyntaxKind.TrueKeyword) ||
    initialiser.isKind(tsMorph.SyntaxKind.FalseKeyword) || initialiser.isKind(tsMorph.SyntaxKind.NullKeyword) ||
    initialiser.isKind(tsMorph.SyntaxKind.UndefinedKeyword)
  ) {
    return {
      parentName,
      funcArgCount: 0,
      isFunc: false,
      isAsync: false,
      isUnknown: false,
      isObjLiteral: true,
    };
  }

  // who knows
  return {
    parentName,
    funcArgCount: 0,
    isFunc: false,
    isAsync: false,
    isUnknown: true,
    isObjLiteral: false,
  };
};
