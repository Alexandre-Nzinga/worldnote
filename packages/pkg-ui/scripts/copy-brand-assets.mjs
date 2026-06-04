import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(packageRoot, "src/brand/logo/assets");
const target = join(packageRoot, "dist/brand/logo/assets");

mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
