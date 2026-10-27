import "server-only";

import { toAbsoluteUrl } from "@louez/utils";

import { env } from "@/env";
import { isSvgUrl, convertSvgToPngBuffer } from "@/lib/image-utils";
import type { EmailAttachment } from "./client";

/**
 * Resolves a logo URL for email compatibility.
 * SVG logos are converted to PNG and embedded as CID attachments,
 * because most email clients (Gmail, Outlook, Yahoo) don't render
 * SVG images or data: URIs in <img> tags.
 *
 * Returns the URL to use in <img src> (either the original URL or a cid: reference)
 * and an optional attachment to include in the email.
 */
export async function resolveEmailLogo(
  logoUrl: string | null | undefined,
  // A `cid:` URL only resolves against the attachment of a real message, so a
  // preview would show a broken image. Browsers also render SVG natively —
  // email clients are the ones that need the PNG — so a preview keeps the
  // original URL and skips the rasterisation entirely.
  { preview = false }: { preview?: boolean } = {},
): Promise<{ url: string | null; attachments: EmailAttachment[] }> {
  if (!logoUrl) return { url: null, attachments: [] };

  // Standalone deployments store site-relative asset paths; email clients
  // need absolute URLs (no-op for already-absolute cloud URLs).
  const absoluteLogoUrl = toAbsoluteUrl(logoUrl, env.NEXT_PUBLIC_APP_URL);
  if (preview || !isSvgUrl(absoluteLogoUrl)) {
    return { url: absoluteLogoUrl, attachments: [] };
  }

  const pngBuffer = await convertSvgToPngBuffer(absoluteLogoUrl, 200);
  if (!pngBuffer) return { url: null, attachments: [] };

  return {
    url: "cid:store-logo",
    attachments: [{ filename: "logo.png", content: pngBuffer, cid: "store-logo" }],
  };
}
