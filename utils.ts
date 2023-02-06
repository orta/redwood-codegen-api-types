import { graphql, tsMorph } from "./deps.ts";
import { TypeMapper, typeMapper } from "./typeMap.ts";

export const varStartsWithUppercase = (v: tsMorph.VariableDeclaration) => v.getName()[0] === v.getName()[0].toUpperCase();

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const variableDeclarationIsAsync = (vd: tsMorph.VariableDeclaration) => {
  const res = !!vd.getFirstChildByKind(tsMorph.SyntaxKind.AsyncKeyword);
  return res;
};

export const inlineArgsForField = (field: graphql.GraphQLField<any, any>, config: { mapper: TypeMapper["map"] }) => {
  return field.args?.length
    // Always use an args obj
    ? `{${
      field.args.map((f) => {
        const type = config.mapper(f.type, {});
        if (!type) throw new Error(`No type for ${f.name} on ${field.name}!`);

        const q = type?.includes("undefined") ? "?" : "";
        const displayType = type.replace("| undefined", "");
        return `${f.name}${q}: ${displayType}`;
      }).join(", ")
    }}`
    : undefined;
};

export const createAndReferOrInlineArgsForField = (
  field: graphql.GraphQLField<any, any>,
  config: {
    name: string;
    file: tsMorph.SourceFile;
    mapper: TypeMapper["map"];
    noSeparateType?: true;
  },
) => {
  const inlineArgs = inlineArgsForField(field, config);
  if (!inlineArgs) return undefined;
  if (inlineArgs.length < 120) return inlineArgs;

  const argsInterface = config.file.addInterface({
    name: `${config.name}Args`,
    isExported: true,
  });

  field.args.forEach((a) => {
    argsInterface.addProperty({
      name: a.name,
      type: config.mapper(a.type, {}),
    });
  });

  return `${config.name}Args`;
};
