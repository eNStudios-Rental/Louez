'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@louez/ui'
import {
  CreditCardSolidIcon,
  ReviewSolidIcon,
  SuccessSolidIcon,
  XCircleSolidIcon,
} from '@louez/ui/icons'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@louez/ui'
import { cn, getCurrencySymbol } from '@louez/utils'

interface PaymentStatusBadgeProps {
  rentalAmount: number
  rentalPaid: number
  depositAmount: number
  depositCollected: number
  depositReturned: number
  className?: string
  showDetails?: boolean
  currency?: string
}

export function PaymentStatusBadge({
  rentalAmount,
  rentalPaid,
  depositAmount,
  depositCollected,
  depositReturned,
  className,
  showDetails = true,
  currency = 'PLN',
}: PaymentStatusBadgeProps) {
  const t = useTranslations('dashboard.reservations')
  const currencySymbol = getCurrencySymbol(currency)

  const isRentalFullyPaid = rentalPaid >= rentalAmount
  const isDepositFullyCollected = depositCollected >= depositAmount
  const depositToReturn = depositCollected - depositReturned

  // Calcul du statut global de paiement
  const getPaymentStatus = () => {
    if (isRentalFullyPaid) {
      return 'paid'
    }
    if (rentalPaid > 0) {
      return 'partial'
    }
    return 'unpaid'
  }

  const paymentStatus = getPaymentStatus()

  // Calcul du statut de la caution
  const getDepositStatus = () => {
    if (depositAmount === 0) return null
    if (!isDepositFullyCollected) return 'to_collect'
    if (depositToReturn > 0) return 'to_return'
    return 'returned'
  }

  const depositStatus = getDepositStatus()

  const paymentStatusConfig = {
    paid: {
      label: t('paymentBadge.paid'),
      icon: SuccessSolidIcon,
      variant: 'success' as const,
    },
    partial: {
      label: t('paymentBadge.partial'),
      icon: ReviewSolidIcon,
      variant: 'pending' as const,
    },
    unpaid: {
      label: t('paymentBadge.unpaid'),
      icon: XCircleSolidIcon,
      variant: 'failed' as const,
    },
  }

  const depositStatusConfig = {
    to_collect: {
      label: t('paymentBadge.depositToCollect'),
      variant: 'pending' as const,
    },
    to_return: {
      label: t('paymentBadge.depositToReturn'),
      variant: 'submitted' as const,
    },
    returned: {
      label: t('paymentBadge.depositReturned'),
      variant: 'success' as const,
    },
  }

  const currentPaymentConfig = paymentStatusConfig[paymentStatus]
  const currentDepositConfig = depositStatus ? depositStatusConfig[depositStatus] : null
  const PaymentIcon = currentPaymentConfig.icon

  const tooltipContent = (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center justify-between gap-4">
        <span>{t('payment.rental')}:</span>
        <span className="font-mono">
          {rentalPaid.toFixed(2)}{currencySymbol} / {rentalAmount.toFixed(2)}{currencySymbol}
        </span>
      </div>
      {depositAmount > 0 && (
        <>
          <div className="flex items-center justify-between gap-4">
            <span>{t('payment.deposit')}:</span>
            <span className="font-mono">
              {depositCollected.toFixed(2)}{currencySymbol} / {depositAmount.toFixed(2)}{currencySymbol}
            </span>
          </div>
          {depositReturned > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span>{t('payment.returned')}:</span>
              <span className="font-mono text-emerald-600">
                -{depositReturned.toFixed(2)}{currencySymbol}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
        {/* Badge statut paiement principal */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Badge
                variant={currentPaymentConfig.variant}
                className="cursor-default transition-colors"
              />
            }
          >
            <PaymentIcon className="h-3 w-3" />
            {currentPaymentConfig.label}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {tooltipContent}
          </TooltipContent>
        </Tooltip>

        {/* Badge statut caution */}
        {showDetails && currentDepositConfig && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Badge
                  variant={currentDepositConfig.variant}
                  className="cursor-default transition-colors"
                />
              }
            >
              <CreditCardSolidIcon className="h-3 w-3" />
              {currentDepositConfig.label}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {depositStatus === 'to_collect' && (
                <span>
                  {t('paymentBadge.depositToCollectAmount', {
                    formattedAmount: `${(depositAmount - depositCollected).toFixed(2)}${currencySymbol}`,
                  })}
                </span>
              )}
              {depositStatus === 'to_return' && (
                <span>
                  {t('paymentBadge.depositToReturnAmount', {
                    formattedAmount: `${depositToReturn.toFixed(2)}${currencySymbol}`,
                  })}
                </span>
              )}
              {depositStatus === 'returned' && (
                <span>{t('paymentBadge.depositFullyReturned')}</span>
              )}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
