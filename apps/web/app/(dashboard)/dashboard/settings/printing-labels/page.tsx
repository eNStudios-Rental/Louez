import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { SettingsPageShell } from "@/components/dashboard/settings-page-shell";
import { getCurrentStore } from "@/lib/store-context";

import { PrintingLabelSettingsForm } from "./printing-label-settings-form";

export default async function PrintingLabelSettingsPage() {
  const store = await getCurrentStore();

  if (!store) {
    redirect("/onboarding");
  }

  const t = await getTranslations("dashboard.settings.printingLabels");

  return (
    <SettingsPageShell title={t("title")} description={t("description")}>
      <PrintingLabelSettingsForm template={store.settings?.printingLabelTemplate ?? null} />
    </SettingsPageShell>
  );
}
