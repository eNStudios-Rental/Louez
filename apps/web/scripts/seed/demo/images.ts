/**
 * Resolves the photos used by the demo catalog.
 *
 * Products whose subject exists in an already-seeded dev store reuse those
 * photos directly. The rest (paddles, kayaks, camping gear…) point at
 * `sourcedImage` keys uploaded by `upload-images.ts`; when that upload has not
 * been run, they fall back to the closest reused photo so the seed still
 * produces a complete, browsable catalog.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { IMG, type DemoProduct, type SourcedImageKey } from "./catalog";

const HERE = dirname(fileURLToPath(import.meta.url));
const MANIFEST = join(HERE, "demo-images.json");

let sourced: Partial<Record<SourcedImageKey, string>> = {};

if (existsSync(MANIFEST)) {
  try {
    const parsed = JSON.parse(readFileSync(MANIFEST, "utf8")) as {
      images?: Record<string, string>;
    };
    sourced = (parsed.images ?? {}) as Partial<Record<SourcedImageKey, string>>;
  } catch {
    sourced = {};
  }
}

/** Closest available photo when the sourced upload is missing. */
const FALLBACKS: Record<SourcedImageKey, string> = {
  sup: IMG.balade,
  supRigid: IMG.balade,
  kayak: IMG.balade,
  kayak2: IMG.balade,
  wetsuit: IMG.helmet,
  wing: IMG.balade,
  tent4: IMG.tent2,
  sleepingBag: IMG.tent2,
  mattress: IMG.tent2,
  stove: IMG.tent2,
  lock: IMG.helmetAlt,
  gps: IMG.helmet,
  repairKit: IMG.helmetAlt,
  basket: IMG.city,
  trailgator: IMG.kid20Alt,
  carrier: IMG.panniersAlt,
  cargoTrailer: IMG.trailerKidAlt,
  balanceBike: IMG.kid20Alt,
  tandem: IMG.route,
  folding: IMG.cityAlt2,
};

export function hasSourcedImages(): boolean {
  return Object.keys(sourced).length > 0;
}

/**
 * Final image list for a product: the sourced photo first (it is the one that
 * actually shows the product), then any reused photos as secondary shots.
 */
export function resolveProductImages(spec: DemoProduct): string[] {
  if (!spec.sourcedImage) return spec.images;

  const primary = sourced[spec.sourcedImage] ?? FALLBACKS[spec.sourcedImage];
  return [primary, ...spec.images.filter((image) => image !== primary)];
}
