import { tsMorph, } from "./deps.ts"

export const varStartsWithUppercase = (v: tsMorph.VariableDeclaration) =>  v.getName()[0] === v.getName()[0].toUpperCase()

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  
export const variableDeclarationIsAsync = (vd: tsMorph.VariableDeclaration) => 
     !!vd.getFirstAncestorByKind(tsMorph.SyntaxKind.AsyncKeyword)
