type ReservationCustomerName = {
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
};

export const getReservationApplicantName = (
  bookedByName: string | null | undefined,
  customer: ReservationCustomerName | null | undefined,
) => {
  const applicantName = bookedByName?.trim();
  if (applicantName) return applicantName;

  const personalName = [customer?.firstName?.trim(), customer?.lastName?.trim()]
    .filter(Boolean)
    .join(" ");

  return personalName || customer?.companyName?.trim() || "Client";
};
