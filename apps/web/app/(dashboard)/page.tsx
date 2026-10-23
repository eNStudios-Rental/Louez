import { redirect } from "next/navigation";
import { getCurrentStore } from "@/lib/store-context";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function RootPage() {
  const store = await getCurrentStore();

  // Redirect to onboarding if no store or not set up
  if (!store?.onboardingCompleted) {
    redirect("/onboarding");
  }

  // Redirect to dashboard home
  redirect("/dashboard");
}
