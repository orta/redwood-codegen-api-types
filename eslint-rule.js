// This is here as a reference, it's not used in the app.
// Nor is it deployed, because I dont need to share it yet.

const { basename } = require("path");

const { ESLintUtils } = require("@typescript-eslint/utils");
const createRule = ESLintUtils.RuleCreator(
  (name) => `https://orta.io/rule/noop/${name}`
);

module.exports = createRule({
  create(context) {
    const thisFilename = basename(context.getFilename());
    const thisFileCorrespondingImport = `src/lib/types/${thisFilename.replace(
      ".ts",
      ""
    )}`;

    /** @type {import("@typescript-eslint/types/dist/generated/ast-spec").ImportDeclaration} */
    let importForThisFile = null;
    return {
      ImportDeclaration(node) {
        importForThisFile ||=
          node.source.value === thisFileCorrespondingImport ? node : null;
      },

      ExportNamedDeclaration(node) {
        if (!node.declaration) return;
        if (!node.declaration.declarations) return;

        node.declaration.declarations.forEach((vd) => {
          // VariableDeclarator means an `export const abcThing =`
          if (vd.type === "VariableDeclarator" && vd.id.type === "Identifier") {
            if (vd.id.name.startsWith("_")) return;

            // Lowercase means something we think should be an query/mutation fn
            const isGlobalOrMutationResolver = /^[a-z]/.test(vd.id.name);

            const suffix = isGlobalOrMutationResolver
              ? "Resolver"
              : "TypeResolvers";
            const typeName = capitalizeFirstLetter(vd.id.name) + suffix;

            // Only run for lowercase  arrow funcs ATM
            if (
              isGlobalOrMutationResolver &&
              vd.init?.type !== "ArrowFunctionExpression"
            )
              return;

            // If there's no type annotation, then we should add one
            if (!vd.id.typeAnnotation) {
              context.report({
                messageId: "needsType",
                node: vd.id,
                data: {
                  name: vd.id.name,
                  typeName,
                },
                *fix(fixer) {
                  yield fixer.insertTextAfter(vd.id, `: ${typeName}`);
                  if (!importForThisFile) {
                    yield fixer.insertTextAfter(
                      context.getAncestors()[0],
                      `import { ${typeName} } from "${thisFileCorrespondingImport}"`
                    );
                  } else {
                    const lastImportSpecifier =
                      importForThisFile.specifiers[
                        importForThisFile.specifiers.length - 1
                      ];
                    yield fixer.insertTextAfter(
                      lastImportSpecifier,
                      `, ${typeName}`
                    );
                  }
                },
              });

              return;
            }

            // If there is one and it's wrong, edit it
            if (
              vd.id.typeAnnotation.typeAnnotation.type === "TSTypeReference" &&
              vd.id.typeAnnotation.typeAnnotation.typeName.name !== typeName
            ) {
              context.report({
                messageId: "needsType",
                node: vd.id,
                data: {
                  name: vd.id.name,
                  typeName,
                },
                *fix(fixer) {
                  // Remove the old type reference - does this need to include a -1 for the ':'?
                  yield fixer.removeRange([
                    vd.id.typeAnnotation.range[0],
                    vd.id.typeAnnotation.range[1],
                  ]);
                  yield fixer.insertTextAfter(vd.id, `: ${typeName}`);

                  if (!importForThisFile) {
                    yield fixer.insertTextAfter(
                      context.getAncestors()[0],
                      `import { ${typeName} } from "${thisFileCorrespondingImport}"`
                    );
                  } else {
                    const lastImportSpecifier =
                      importForThisFile.specifiers[
                        importForThisFile.specifiers.length - 1
                      ];
                    yield fixer.insertTextAfter(
                      lastImportSpecifier,
                      `, ${typeName}`
                    );
                  }
                },
              });
            }
          }
        });
      },
    };
  },
  name: "use-custom-types",
  meta: {
    docs: {
      description:
        "Sets the types on a query/mutation function to the correct type",
      recommended: "warn",
    },
    messages: {
      needsType:
        "The query/mutation function ({{name}}) needs a type annotation of {{typeName}}.",
    },
    fixable: "code",
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});

const capitalizeFirstLetter = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);
