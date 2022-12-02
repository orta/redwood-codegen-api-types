import { graphql, tsMorph } from "./deps.ts";
import { TypeMapper, typeMapper } from "./typeMap.ts";

export const varStartsWithUppercase = (v: tsMorph.VariableDeclaration) => v.getName()[0] === v.getName()[0].toUpperCase();

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const variableDeclarationIsAsync = (vd: tsMorph.VariableDeclaration) => !!vd.getFirstAncestorByKind(tsMorph.SyntaxKind.AsyncKeyword);

export const createAndReferOrInlineArgsForField = (
  field: graphql.GraphQLField<any, any>,
  config: {
    name: string;
    file: tsMorph.SourceFile;
    mapper: TypeMapper["map"];
  },
) => {
  if (!field.args.length) return undefined;

  // inline the type if it's small
  const inlineArgs = "{" +
    field.args.map((f) => `${f.name}: ${config.mapper(f.type)}`).join(", ") +
    "}";

  if (inlineArgs.length < 120) return inlineArgs;

  const argsInterface = config.file.addInterface({
    name: `${config.name}Args`,
    isExported: true,
  });

  field.args.forEach((a) => {
    argsInterface.addProperty({
      name: a.name,
      type: config.mapper(a.type),
    });
  });

  return `${config.name}Args`;
};
