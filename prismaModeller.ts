import { PrismaSchemaBlocks, PrismaModel } from "./deps.ts";

type Model = {
    rootComments: string[]
    properties: PrismaModel["properties"]
}

export type PrismaMap = ReadonlyMap<string, Model>

export const prismaModeller = (schema: PrismaSchemaBlocks) => {
    
    const types = new Map<string, Model>()

    let leadingComments: string[] = []
    schema.list.forEach(b => {
        if (b.type === "comment") leadingComments.push(b.text)
        
        if (b.type === "model") {
            types.set(b.name, { properties: b.properties, rootComments: leadingComments})
            leadingComments = []
        } 
    })

    return types
}