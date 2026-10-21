import assert from "node:assert/strict";
import { test } from "node:test";

import { disableYouTubeCaptions } from "./util.youtube-captions";

test("unloads YouTube captions when the player exposes the captions module", () => {
  const unloadedModules: string[] = [];
  disableYouTubeCaptions({
    getOptions: () => ["captions"],
    unloadModule: (moduleName) => unloadedModules.push(moduleName),
  });

  assert.deepEqual(unloadedModules, ["captions"]);
});

test("does not unload unrelated YouTube player modules", () => {
  const unloadedModules: string[] = [];
  disableYouTubeCaptions({
    getOptions: () => ["annotations"],
    unloadModule: (moduleName) => unloadedModules.push(moduleName),
  });

  assert.deepEqual(unloadedModules, []);
});
