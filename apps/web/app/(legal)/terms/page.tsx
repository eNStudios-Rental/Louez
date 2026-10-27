import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalPage } from "../_components/legal-page";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legalPages.terms");
  return {
    title: t("title"),
    description: t("intro"),
  };
}

export default function TermsPage() {
  return <LegalPage namespace="legalPages.terms" sectionCount={9} />;
}
