import { redirect } from "next/navigation";

export default function LegacyMondaySettingsPage() {
  redirect("/dashboard/settings/integrations/monday");
}
