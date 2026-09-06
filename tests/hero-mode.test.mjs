import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../lib/hero-mode.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const runtimeModule = { exports: {} };
new Function("exports", "module", compiled)(runtimeModule.exports, runtimeModule);
const { selectHeroRenderMode } = runtimeModule.exports;

const base = {
  viewportWidth: 1440,
  coarsePointer: false,
  reducedMotion: false,
  saveData: false,
  effectiveType: "4g",
  hardwareConcurrency: 8,
  deviceMemory: 8,
  webglSupported: true,
};

test("selects full WebGL only for capable desktop input", () => {
  assert.equal(selectHeroRenderMode(base), "desktop-webgl");
});

test("keeps phones and coarse pointers on the mobile poster", () => {
  assert.equal(selectHeroRenderMode({ ...base, viewportWidth: 767 }), "mobile-poster");
  assert.equal(selectHeroRenderMode({ ...base, coarsePointer: true }), "mobile-poster");
});

test("uses the desktop poster when WebGL is unavailable", () => {
  assert.equal(selectHeroRenderMode({ ...base, webglSupported: false }), "desktop-poster");
});

test("uses a static poster for user constraints", () => {
  assert.equal(selectHeroRenderMode({ ...base, reducedMotion: true }), "static");
  assert.equal(selectHeroRenderMode({ ...base, saveData: true }), "static");
  assert.equal(selectHeroRenderMode({ ...base, effectiveType: "2g" }), "static");
});

test("keeps desktop WebGL independent of CPU heuristics", () => {
  assert.equal(selectHeroRenderMode({ ...base, viewportWidth: 900, hardwareConcurrency: 2 }), "desktop-webgl");
});
