import { graphql } from "./deps.ts"

export const defaultTypeSwapper = (field: graphql.GraphQLField<any, any>) => {
    const hasBang = field.type.toString().endsWith("!")
    const type = hasBang ? field.type.toString().slice(0, -1) : field.type.toString()
    const orUndefined = hasBang ? "" : " | undefined"
    switch(type) {
        case 'Int': return "number" + orUndefined
        case 'Float': return "number" + orUndefined
        case 'String': return "string" + orUndefined
        case 'Boolean': return "boolean" + orUndefined
    }
    return undefined
}


