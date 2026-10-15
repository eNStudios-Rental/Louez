/** Minimal customer shape shared by the dashboard customer picker and quick-create dialog. */
export interface DashboardCustomer {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  companyName?: string | null;
}
