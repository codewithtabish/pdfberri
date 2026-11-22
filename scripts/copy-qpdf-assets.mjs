import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = join(root, "node_modules", "@neslinesli93", "qpdf-wasm", "dist");
const targetDir = join(root, "public", "vendor", "qpdf");
const files = ["qpdf.js", "qpdf.wasm"];

mkdirSync(targetDir, { recursive: true });

for (const file of files) {
  const from = join(sourceDir, file);
  if (!existsSync(from)) {
    console.error(
      `[protect-pdf] Missing ${from}\nRun: npm install --save-exact @neslinesli93/qpdf-wasm@0.3.0`
    );
    process.exit(1);
  }
  copyFileSync(from, join(targetDir, file));
}

console.log("[protect-pdf] qpdf assets copied to public/vendor/qpdf");