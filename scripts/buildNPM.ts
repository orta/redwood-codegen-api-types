// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: [{
    kind: "bin",
    name: "redwood-api-codegen", // command name
    path: "./main.ts",
  }],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
    crypto: true,
  },
  packageManager: "pnpm",
  scriptModule: false,

  package: {
    // package.json properties
    name: "@orta/redwood-codegen-api-types",
    version: Deno.args[0],
    description: "Replaces the generic Redwood codegen with one built just for the  tool.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/orta/redwood-codegen-api-types.git",
    },
    bugs: {
      url: "https://github.com/orta/redwood-codegen-api-types/issues",
    },
    devDependencies: {
      "@types/fb-watchman": "^2.0.0",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
