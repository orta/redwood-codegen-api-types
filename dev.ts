// deno run --allow-all --unstable dev.ts
// or watch mode:
// deno run --allow-all --unstable --watch dev.ts

import { run } from "./run.ts";
import { dotenv, path } from "./deps.ts";

async function start() {
  Deno.stdout.write(new TextEncoder().encode("\x1b[2J"));

  const appRoot = Deno.cwd();
  const vendorSrcRoot = path.join(appRoot, "tests", "vendor", "soccersage.io-main");
  const vendorTypesRoot = path.join(appRoot, "tests", "vendor", "soccersage-output");
  await run(vendorSrcRoot, vendorTypesRoot);

  const cfg = await dotenv.config({});
  if (cfg["MAIN_APP_PATH"]) {
    const appRoot = cfg["MAIN_APP_PATH"];
    const typesRoot = cfg["MAIN_TYPES_DEPLOY"];
    await run(appRoot, typesRoot, { runESLint: true });
  }
}

start();
