// deno run -A scripts/buildNPM.ts 0.1.x

import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: [{
    kind: "bin",
    name: "redwood-alt-api-codegen",
    path: "./cli.ts",
  }],
  outDir: "./npm",
  shims: {
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
