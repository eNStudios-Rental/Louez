import { redirect } from "next/navigation";

import {
  resolveAiAdvisorSettingsRedirect,
  type AiAssistantSearchParams,
} from "@/app/(dashboard)/dashboard/ai-assistant/util.legacy-redirect";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

/**
 * The AI advisor moved out of settings, then out of a tabbed page. Old links
 * (emails, bookmarks, the ?conversation= deep link) land here — forward them to
 * the section they were aiming at, query string included.
 */
export default async function AiAdvisorSettingsRedirect({
  searchParams,
}: {
  searchParams: Promise<AiAssistantSearchParams>;
}) {
  redirect(resolveAiAdvisorSettingsRedirect(await searchParams));
}
