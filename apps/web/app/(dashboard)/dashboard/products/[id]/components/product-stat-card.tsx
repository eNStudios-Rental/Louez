import type { ComponentType } from "react";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@louez/ui";
import { cn } from "@louez/utils";

interface ProductStatCardTrend {
  value: number;
  label?: string;
}

interface ProductStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: ProductStatCardTrend;
  icon?: ComponentType<{ className?: string }>;
}

/**
 * Presentational stat tile for the product dashboard. Mirrors the colored
 * trend-pill styling from `dashboard/analytics/stat-card.tsx`, adapted to a
 * more compact card for a 4-up grid.
 */
export function ProductStatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
}: ProductStatCardProps) {
  const isPositive = trend !== undefined && trend.value > 0;
  const isNegative = trend !== undefined && trend.value < 0;
  const isNeutral = trend === undefined || trend.value === 0;

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
          {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
        </div>
        <p className="mt-1 text-xl font-bold tracking-tight wrap-break-word sm:text-2xl">{value}</p>

        {subtitle && !trend && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}

        {trend && (
          <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                isPositive &&
                  "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
                isNegative && "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
                isNeutral && "bg-muted text-muted-foreground",
              )}
            >
              {isPositive && <ArrowUpRight className="h-3 w-3 shrink-0" />}
              {isNegative && <ArrowDownRight className="h-3 w-3 shrink-0" />}
              {isNeutral && <Minus className="h-3 w-3 shrink-0" />}
              <span>{isNeutral ? "0" : `${isPositive ? "+" : ""}${trend.value.toFixed(1)}`}%</span>
            </div>
            {trend.label && <span className="text-xs text-muted-foreground">{trend.label}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
