import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";

import { customers, db, products, reservations } from "@louez/db";

import { dashboardProcedure } from "../../procedures";
import { toORPCError } from "../../utils/orpc-error";

const RESULT_LIMIT = 5;

const escapeLikePattern = (term: string): string => term.replace(/[\\%_]/g, (char) => `\\${char}`);

const globalSearchOutputSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.string(),
      priceNegotiable: z.boolean().optional(),
      status: z.string().nullable().optional(),
      image: z.string().nullable(),
    }),
  ),
  reservations: z.array(
    z.object({
      id: z.string(),
      number: z.string(),
      status: z.string(),
      customerName: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    }),
  ),
  customers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    }),
  ),
});

/**
 * Lightweight cross-entity search backing the command palette. Each entity is
 * capped at RESULT_LIMIT rows and only returns what the palette displays.
 */
const global = dashboardProcedure
  .input(z.object({ query: z.string().trim().min(1).max(100) }))
  .output(globalSearchOutputSchema)
  .handler(async ({ context, input }) => {
    try {
      const storeId = context.store.id;
      const term = `%${input.query}%`;
      const tokens = input.query.split(/\s+/).filter(Boolean);

      const productConditions = [eq(products.storeId, storeId)];
      for (const token of tokens) {
        const pattern = `%${escapeLikePattern(token)}%`;
        productConditions.push(
          or(
            like(products.name, pattern),
            like(sql`COALESCE(${products.description}, '')`, pattern),
          )!,
        );
      }

      const [productRows, reservationRows, customerRows] = await Promise.all([
        db
          .select({
            id: products.id,
            name: products.name,
            price: products.price,
            priceNegotiable: products.priceNegotiable,
            status: products.status,
            images: products.images,
          })
          .from(products)
          .where(and(...productConditions))
          .orderBy(products.name)
          .limit(RESULT_LIMIT),
        db
          .select({
            id: reservations.id,
            number: reservations.number,
            status: reservations.status,
            startDate: reservations.startDate,
            endDate: reservations.endDate,
            firstName: customers.firstName,
            lastName: customers.lastName,
            companyName: customers.companyName,
          })
          .from(reservations)
          .innerJoin(customers, eq(reservations.customerId, customers.id))
          .where(
            and(
              eq(reservations.storeId, storeId),
              or(
                like(reservations.number, term),
                like(customers.firstName, term),
                like(customers.lastName, term),
                sql`CONCAT(${customers.firstName}, ' ', ${customers.lastName}) LIKE ${term}`,
                like(customers.companyName, term),
              ),
            ),
          )
          .orderBy(desc(reservations.createdAt))
          .limit(RESULT_LIMIT),
        db
          .select({
            id: customers.id,
            firstName: customers.firstName,
            lastName: customers.lastName,
            companyName: customers.companyName,
            email: customers.email,
          })
          .from(customers)
          .where(
            and(
              eq(customers.storeId, storeId),
              or(
                like(customers.firstName, term),
                like(customers.lastName, term),
                sql`CONCAT(${customers.firstName}, ' ', ${customers.lastName}) LIKE ${term}`,
                like(customers.companyName, term),
                like(customers.email, term),
                like(customers.phone, term),
              ),
            ),
          )
          .orderBy(desc(customers.createdAt))
          .limit(RESULT_LIMIT),
      ]);

      return {
        products: productRows.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          priceNegotiable: product.priceNegotiable,
          status: product.status,
          image: product.images?.[0] ?? null,
        })),
        reservations: reservationRows.map((reservation) => ({
          id: reservation.id,
          number: reservation.number,
          status: reservation.status,
          customerName:
            reservation.companyName || `${reservation.firstName} ${reservation.lastName}`.trim(),
          startDate: reservation.startDate,
          endDate: reservation.endDate,
        })),
        customers: customerRows.map((customer) => ({
          id: customer.id,
          name: customer.companyName || `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email,
        })),
      };
    } catch (error) {
      throw toORPCError(error);
    }
  });

export const dashboardSearchRouter = {
  global,
};
