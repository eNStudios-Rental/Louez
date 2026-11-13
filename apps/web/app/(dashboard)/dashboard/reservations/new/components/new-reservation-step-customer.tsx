"use client";

import { useState } from "react";

import { User, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@louez/ui";

import { CustomerCombobox } from "@/components/dashboard/customer-combobox";
import { CustomerCreateDialog } from "@/components/dashboard/customer-create-dialog";
import { NewFeatureBadge } from "@/components/dashboard/new-feature-badge";
import { parseCustomerQuery } from "@/components/dashboard/util.customer-query";
import { useWhatsNew } from "@/hooks/use-whats-new";

import type { Customer, NewReservationFormComponentApi, StepFieldName } from "../types";

interface NewReservationStepCustomerProps {
  form: NewReservationFormComponentApi;
  customers: Customer[];
  clearStepFieldError: (name: StepFieldName) => void;
  getFieldErrorMessage: (error: unknown) => string;
  onCustomerCreated: (customer: Customer) => void;
}

export function NewReservationStepCustomer({
  form,
  customers,
  clearStepFieldError,
  getFieldErrorMessage,
  onCustomerCreated,
}: NewReservationStepCustomerProps) {
  const t = useTranslations("dashboard.reservations.manualForm");
  const tCustomerSearch = useTranslations("common.customerSearch");
  const { dismissFeature } = useWhatsNew();
  const [createDialog, setCreateDialog] = useState({ isOpen: false, query: "" });

  const openCreateDialog = () => {
    dismissFeature("reservation-creation-simplified");
    setCreateDialog({ isOpen: true, query: "" });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("customer")}
          </CardTitle>
          <CardDescription>{t("customerStepDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form.Field name="customerId">
            {(field) => (
              <div className="space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  <CustomerCombobox
                    className="sm:flex-1"
                    customers={customers}
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value);
                      clearStepFieldError("customerId");
                    }}
                    onCreateRequest={(query) => setCreateDialog({ isOpen: true, query })}
                  />
                  <Button
                    className="h-11 shrink-0 max-sm:w-full"
                    onClick={openCreateDialog}
                    type="button"
                    variant="outline"
                  >
                    <UserPlus className="h-4 w-4" />
                    {tCustomerSearch("createCustomer")}
                    {/* Dot rather than a pill: the button shares its row with the combobox. */}
                    <NewFeatureBadge
                      className="absolute -top-1 -right-1"
                      featureId="reservation-creation-simplified"
                      mode="dot"
                    />
                  </Button>
                </div>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm font-medium text-destructive">
                    {getFieldErrorMessage(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="reservation-booked-by-name">{t("bookedByName")} *</Label>
            <form.Field name="bookedByName">
              {(field) => (
                <Input
                  id="reservation-booked-by-name"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("bookedByNamePlaceholder")}
                  maxLength={255}
                />
              )}
            </form.Field>
            <p className="text-xs text-muted-foreground">
              {t("bookedByNameHelp")}
            </p>
          </div>
        </CardContent>
      </Card>

      <CustomerCreateDialog
        open={createDialog.isOpen}
        onOpenChange={(isOpen) => setCreateDialog((prev) => ({ ...prev, isOpen }))}
        prefill={parseCustomerQuery(createDialog.query)}
        onCreated={onCustomerCreated}
      />
    </>
  );
}
