import { AppContext } from "./context.ts";
import { graphql } from "./deps.ts";
import { PrismaMap } from "./prismaModeller.ts";

export type TypeMapper = ReturnType<typeof typeMapper>;

export const typeMapper = (
  context: AppContext,
  config: { preferPrismaModels?: true },
) => {
  const referencedGraphQLTypes = new Set<string>();
  const referencedPrismaModels = new Set<string>();
  const customScalars = new Set<string>();

  const clear = () => {
    referencedGraphQLTypes.clear();
    customScalars.clear();
    referencedPrismaModels.clear();
  };
  const getReferencedGraphQLThingsInMapping = () => {
    return {
      types: [...referencedGraphQLTypes.keys()],
      scalars: [...customScalars.keys()],
      prisma: [...referencedPrismaModels.keys()],
    };
  };

  const map = (
    type: graphql.GraphQLType,
    mapConfig: {
      parentWasNotNull?: true;
      preferNullOverUndefined?: true;
    },
  ): string | undefined => {
    // The AST for GQL uses a parent node to indicate the !, we need the opposite
    // for TS which uses '| undefined' after.
    if (graphql.isNonNullType(type)) {
      return map(type.ofType, { parentWasNotNull: true, ...mapConfig });
    }

    // So we can add the | undefined
    const getInner = () => {
      if (graphql.isListType(type)) {
        if (graphql.isNonNullType(type.ofType)) {
          return `${map(type.ofType, mapConfig)}[]`;
        } else {
          return `Array<${map(type.ofType, mapConfig)}>`;
        }
      }
      if (graphql.isScalarType(type)) {
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

        customScalars.add(type.name);
        return type.name;
      }
      if (graphql.isObjectType(type)) {
        if (config.preferPrismaModels && context.prisma.has(type.name)) {
          referencedPrismaModels.add(type.name);
          return "P" + type.name;
        } else {
          // GraphQL only type
          referencedGraphQLTypes.add(type.name);
          return type.name;
        }
      }
      if (graphql.isInterfaceType(type)) {
        return type.name;
      }
      if (graphql.isUnionType(type)) {
        const types = type.getTypes();
        return types.map((t) => map(t, mapConfig)).join(" | ");
      }
      if (graphql.isEnumType(type)) {
        return type.name;
      }
      if (graphql.isInputObjectType(type)) {
        referencedGraphQLTypes.add(type.name);

        return type.name;
      }

      throw new Error(
        `Unknown type ${type} - ${JSON.stringify(type, null, 2)}`,
      );
    };

    const suffix = mapConfig.parentWasNotNull ? "" : mapConfig.preferNullOverUndefined ? "| null" : " | undefined";
    return getInner() + suffix;
  };

  return { map, clear, getReferencedGraphQLThingsInMapping };
};
