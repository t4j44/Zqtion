import { readFile } from "node:fs/promises";
import ts from "typescript";

export async function moduleUrl(path, imports = {}) {
  const source = await readFile(new URL(`../../${path}`, import.meta.url), "utf8");
  let compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const [specifier, url] of Object.entries(imports)) {
    compiled = compiled.replaceAll(`from "${specifier}"`, `from "${url}"`).replaceAll(`import "${specifier}"`, `import "${url}"`);
  }
  return `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
}
