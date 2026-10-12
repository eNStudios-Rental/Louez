"use client";

import { useState } from "react";

import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button, Input, Switch } from "@louez/ui";
import { cn } from "@louez/utils";

import { updateAiCreditsAutoTopup } from "@/app/(dashboard)/dashboard/ai-assistant/credit-actions";
import { DashboardSectionCard } from "@/components/dashboard/shared/dashboard-section-card";
import type { AiCreditPackage } from "@/lib/plans";

interface AiCreditsAutoTopupProps {
  enabled: boolean;
  thresholdCredits: number;
  /** Index into `packages`, -1 when the saved pack no longer exists. */
  packIndex: number;
  packages: AiCreditPackage[];
}

const formatPrice = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} zł`;

/**
 * Off-session refill: below the threshold, the saved card buys the chosen pack
 * again so the assistant never goes silent mid-conversation.
 */
export const AiCreditsAutoTopup = ({
  enabled,
  thresholdCredits,
  packIndex,
  packages,
}: AiCreditsAutoTopupProps) => {
  const t = useTranslations("dashboard.aiCredits");

  const [autoEnabled, setAutoEnabled] = useState(enabled);
  const [threshold, setThreshold] = useState(String(thresholdCredits || ""));
  const [selectedPack, setSelectedPack] = useState(
    packIndex >= 0 ? packIndex : packages.length > 0 ? 0 : -1,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const result = await updateAiCreditsAutoTopup({
        enabled: autoEnabled,
        thresholdCredits: Number(threshold) || 0,
        packIndex: selectedPack,
      });
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardSectionCard
      title={t("autoTopup.title")}
      description={t("autoTopup.description")}
      icon={RefreshCw}
      accent="progress"
      action={
        <Switch
          checked={autoEnabled}
          onCheckedChange={(checked) => setAutoEnabled(Boolean(checked))}
        />
      }
      contentClassName="space-y-4"
    >
      <>
        {autoEnabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="ai-credits-auto-threshold"
                className="text-muted-foreground text-xs font-medium"
              >
                {t("autoTopup.thresholdLabel")}
              </label>
              <Input
                id="ai-credits-auto-threshold"
                type="number"
                min={0}
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                className="max-w-40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-medium">
                {t("autoTopup.packLabel")}
              </span>
              <div className="flex flex-wrap gap-2">
                {packages.map((pack, index) => (
                  <button
                    key={`${pack.credits}-${pack.priceCents}`}
                    type="button"
                    onClick={() => setSelectedPack(index)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                      index === selectedPack
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    {t("autoTopup.pack", {
                      credits: pack.credits,
                      amount: formatPrice(pack.priceCents),
                    })}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={handleSave} isPending={saving}>
            {t("autoTopup.save")}
          </Button>
          {saved && <span className="text-success text-xs">{t("autoTopup.saved")}</span>}
          {autoEnabled && (
            <p className="text-muted-foreground/70 min-w-0 flex-1 text-xs">
              {t("autoTopup.cardNote")}
            </p>
          )}
        </div>
      </>
    </DashboardSectionCard>
  );
};
