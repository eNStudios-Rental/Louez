#!/usr/bin/env tsx
/**
 * Demo Store Image Upload
 *
 * The demo catalog covers products (paddles, kayaks, camping gear) that no
 * existing dev store has photos for. This script downloads a curated set of
 * freely-licensed Wikimedia Commons photos, uploads them to the configured
 * object storage, and writes `demo-images.json` next to it. The demo seed
 * picks that file up automatically; when it is missing, the seed falls back
 * to photos already hosted on the platform.
 *
 * Run once before `db:seed:demo` (re-running is safe, it overwrites):
 *   pnpm --filter @louez/web db:seed:demo:images
 */
import "dotenv/config";

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { colors, logError, logInfo, logSuccess } from "../utils";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(HERE, "demo-images.json");
const KEY_PREFIX = "demo/ar-mor-location/products";

const USER_AGENT = "LouezDemoSeed/1.0 (https://louez.fr; contact@louez.fr) seed-image-fetch";

/**
 * Curated photos, keyed by the `sourcedImage` value used in `catalog.ts`.
 * Every entry is a freely-licensed Wikimedia Commons file; `credit` keeps the
 * attribution next to the URL so the licence terms stay traceable.
 */
const SOURCES: Record<string, { url: string; credit: string }> = {
  sup: {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/84/Inflatable_Stand_Up_Paddle_board.png",
    credit: "Inflatable Stand Up Paddle board — Wikimedia Commons, CC BY-SA 4.0",
  },
  supRigid: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Paddleboarding_at_Shanklin_-_geograph.org.uk_-_8126530.jpg/1280px-Paddleboarding_at_Shanklin_-_geograph.org.uk_-_8126530.jpg",
    credit: "Paddleboarding at Shanklin — geograph.org.uk, CC BY-SA 2.0",
  },
  kayak: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Sit-On-Top_kayak_with_outriggers.jpg/1280px-Sit-On-Top_kayak_with_outriggers.jpg",
    credit: "Sit-On-Top kayak with outriggers — Wikimedia Commons, CC BY 4.0",
  },
  kayak2: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Tri-Yak_kayak_sit-on-top_FeelFree_for_three_persons.jpg/1280px-Tri-Yak_kayak_sit-on-top_FeelFree_for_three_persons.jpg",
    credit: "Tri-Yak sit-on-top kayak — Wikimedia Commons, CC BY-SA 4.0",
  },
  wetsuit: {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Wetsuit_a.jpg",
    credit: "Wetsuit — Wikimedia Commons, CC BY-SA 3.0",
  },
  wing: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Wing_foil_board_%28cropped%29.jpg",
    credit: "Wing foil board — Wikimedia Commons, CC BY-SA 4.0",
  },
  tent4: {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Dome_tent_in_the_BWCA_%28CDM11452CT%29.jpg",
    credit: "Dome tent in the BWCA — Wikimedia Commons, CC BY-SA 4.0",
  },
  sleepingBag: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/OutDoor_2018%2C_Friedrichshafen_%281X7A0298%29.jpg/1280px-OutDoor_2018%2C_Friedrichshafen_%281X7A0298%29.jpg",
    credit: "OutDoor 2018, Friedrichshafen — Wikimedia Commons, CC BY-SA 4.0",
  },
  mattress: {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Self-inflating_mat.jpg",
    credit: "Self-inflating mat — Wikimedia Commons, CC BY 3.0",
  },
  stove: {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/75/JetBoil-camping-stove-atop-gas-cylinder.jpg",
    credit: "JetBoil camping stove — Wikimedia Commons, CC BY-SA 2.0",
  },
  lock: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/-_Anti-theft_device_-.jpg/1280px--_Anti-theft_device_-.jpg",
    credit: "Anti-theft device — Wikimedia Commons, CC BY-SA 2.5",
  },
  gps: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Garmin_Edge_1040_Solar_02.jpg/1280px-Garmin_Edge_1040_Solar_02.jpg",
    credit: "Garmin Edge 1040 Solar — Wikimedia Commons, CC BY 2.0",
  },
  repairKit: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Bicycle_emergency_repair_kit.jpg/1280px-Bicycle_emergency_repair_kit.jpg",
    credit: "Bicycle emergency repair kit — Wikimedia Commons, CC0",
  },
  basket: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Bicycle_Basket_Pots_Plants_%28Unsplash%29.jpg/1280px-Bicycle_Basket_Pots_Plants_%28Unsplash%29.jpg",
    credit: "Bicycle basket — Unsplash via Wikimedia Commons, CC0",
  },
  cargoTrailer: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Bicycle_cargo_trailer.jpg/1280px-Bicycle_cargo_trailer.jpg",
    credit: "Bicycle cargo trailer — Wikimedia Commons, CC BY-SA 4.0",
  },
  balanceBike: {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/de/Kids_balance_bike_%28Kinderlaufrad%29.jpg",
    credit: "Kids balance bike — Wikimedia Commons, CC BY-SA 2.0",
  },
  tandem: {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/69/Tandem_bicycle_red.jpg",
    credit: "Tandem bicycle — Wikimedia Commons, CC BY 2.0",
  },
  folding: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Brompton_bicycle_half_folded_and_loaded.jpg/1280px-Brompton_bicycle_half_folded_and_loaded.jpg",
    credit: "Brompton folded — Wikimedia Commons, CC0",
  },
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    logError(`${name} is not set — cannot upload demo images.`);
    process.exit(1);
  }
  return value;
}

function extensionFor(url: string, contentType: string | undefined): string {
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return "jpg";
  return url.toLowerCase().endsWith(".png") ? "png" : "jpg";
}

async function main(): Promise<void> {
  const bucket = requireEnv("S3_BUCKET");
  const publicUrl = requireEnv("S3_PUBLIC_URL").replace(/\/$/, "");

  const client = new S3Client({
    region: requireEnv("S3_REGION"),
    endpoint: requireEnv("S3_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });

  const result: Record<string, string> = {};
  const credits: Record<string, string> = {};

  for (const [key, source] of Object.entries(SOURCES)) {
    const response = await fetch(source.url, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) {
      logError(`${key}: download failed (${response.status})`);
      continue;
    }
    const contentType = response.headers.get("content-type") ?? undefined;
    const body = Buffer.from(await response.arrayBuffer());
    const objectKey = `${KEY_PREFIX}/${key}.${extensionFor(source.url, contentType)}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: body,
        ContentType: contentType ?? "image/jpeg",
        ACL: "public-read",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    result[key] = `${publicUrl}/${objectKey}`;
    credits[key] = source.credit;
    logSuccess(`${key} → ${result[key]}`);
  }

  writeFileSync(OUTPUT, `${JSON.stringify({ images: result, credits }, null, 2)}\n`, "utf8");
  logInfo(`Wrote ${OUTPUT}`);
  console.log(`${colors.green}${Object.keys(result).length} images uploaded${colors.reset}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
