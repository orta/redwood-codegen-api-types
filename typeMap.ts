import { graphql } from "./deps.ts";
import { PrismaMap } from "./prismaModeller.ts";

export const typeMapper = (prismaSchema: PrismaMap) => {
  let referencedGraphQLTypes: string[] = [];

  const clear = () => {
    referencedGraphQLTypes = [];
  };
  const getReferencedGraphQLTypesInMapping = () => {
    return [...referencedGraphQLTypes];
  };

  const map = (
    type: graphql.GraphQLType,
    parentWasNotNull?: true,
  ): string | undefined => {
    // The AST for GQL uses a parent node to indicate the !, we need the opposite
    // for TS which uses '| undefined' after.
    if (graphql.isNonNullType(type)) {
      return map(type.ofType, true);
    }

    // So we can add the | undefined
    const getInner = () => {
      if (graphql.isListType(type)) {
        if (graphql.isNonNullType(type.ofType)) {
          return `${map(type.ofType)}[]`;
        } else {
          return `Array<${map(type.ofType)}>`;
        }
      }
      if (graphql.isScalarType(type)) {
        return scalarMapper(type) || type.name;
      }
      if (graphql.isObjectType(type)) {
        if (prismaSchema.has(type.name)) {
          return "PrismaModel" + type.name;
        } else {
          // GraphQL only type
          referencedGraphQLTypes.push(type.name);
          return type.name;
        }
      }
      if (graphql.isInterfaceType(type)) {
        return type.name;
      }
      if (graphql.isUnionType(type)) {
        const types = type.getTypes();
        return types.map((t) => map(t)).join(" | ");
      }
      if (graphql.isEnumType(type)) {
        return type.name;
      }
      if (graphql.isInputObjectType(type)) {
        referencedGraphQLTypes.push(type.name);

        return type.name;
      }

      throw new Error(`Unknown type ${type}`);
    };

    const suffix = parentWasNotNull ? "" : " | undefined";
    return getInner() + suffix;
  };

  return { map, clear, getReferencedGraphQLTypesInMapping };
};

export const scalarMapper = (type: graphql.GraphQLType) => {
  switch (type.toString()) {
    case "Int":
      return "number";
    case "Float":
      return "number";
    case "String":
      return "string";
    case "Boolean":
      return "boolean";
  }
  return `any /** ${type.toString()} */`;
};
