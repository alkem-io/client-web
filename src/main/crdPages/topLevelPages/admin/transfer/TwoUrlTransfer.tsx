import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TransferOperationCard } from '@/crd/components/admin/transfer/TransferOperationCard';
import { UrlResolveField } from '@/crd/components/admin/transfer/UrlResolveField';

type UrlStep = {
  label: string;
  /** Already-translated error, if any. */
  error?: string;
  resolved: boolean;
  /** Optional resolved-entity name to display. */
  resolvedLabel?: string;
  loading: boolean;
  onResolve: (url: string) => void;
};

type TwoUrlTransferProps = {
  title: string;
  description?: string;
  source: UrlStep;
  target: UrlStep;
  canTransfer: boolean;
  transferLoading: boolean;
  onTransfer: () => void;
  transferLabel: string;
  confirmTitle: string;
  confirmDescription: string;
};

/**
 * Connector for the two-URL transfers (Space transfer, Callout/Post transfer):
 * resolve a source URL and a target URL, then transfer behind a confirmation.
 * The caller supplies the reused hook's resolve/transfer handlers and state.
 */
export function TwoUrlTransfer({
  title,
  description,
  source,
  target,
  canTransfer,
  transferLoading,
  onTransfer,
  transferLabel,
  confirmTitle,
  confirmDescription,
}: TwoUrlTransferProps) {
  const { t } = useTranslation('crd-admin');

  return (
    <TransferOperationCard
      title={title}
      description={description}
      action={
        canTransfer
          ? {
              label: transferLabel,
              confirmTitle,
              confirmDescription,
              confirmLabel: transferLabel,
              onConfirm: onTransfer,
              loading: transferLoading,
            }
          : undefined
      }
    >
      <UrlStepView step={source} resolveLabel={t('transfer.resolve')} resolvedFallback={t('transfer.resolved')} />
      <UrlStepView step={target} resolveLabel={t('transfer.resolve')} resolvedFallback={t('transfer.resolved')} />
    </TransferOperationCard>
  );
}

function UrlStepView({
  step,
  resolveLabel,
  resolvedFallback,
}: {
  step: UrlStep;
  resolveLabel: string;
  resolvedFallback: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <UrlResolveField
        label={step.label}
        buttonLabel={resolveLabel}
        onResolve={step.onResolve}
        loading={step.loading}
      />
      {step.error ? <p className="text-body text-destructive">{step.error}</p> : null}
      {step.resolved ? (
        <p className="text-caption text-muted-foreground flex items-center gap-1">
          <Check aria-hidden="true" className="size-3 text-primary" />
          {step.resolvedLabel ?? resolvedFallback}
        </p>
      ) : null}
    </div>
  );
}
