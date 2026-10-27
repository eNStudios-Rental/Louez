import { redirect } from "next/navigation";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

interface CalendarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The calendar page has been merged into the reservations page.
 * Redirect while translating the old query params to the unified scheme.
 */
export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;

  const getParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const target = new URLSearchParams();

  const view = getParam("view") === "products" ? "planning" : "calendar";
  target.set("view", view);

  const date = getParam("date");
  if (date) target.set("date", date);

  const range = view === "planning" ? getParam("productsPeriod") : getParam("calendarPeriod");
  if (range === "week" || range === "twoWeeks" || range === "month") {
    target.set("range", range);
  }

  const productId = getParam("productId");
  if (productId && productId !== "all") target.set("productId", productId);

  redirect(`/dashboard/reservations?${target.toString()}`);
}
