import { useTranslation } from 'react-i18next';
import { CrdKratosFlow } from '@/crd/components/auth/CrdKratosFlow';
import type { KratosFlowDescriptor } from '@/crd/components/auth/flowDescriptor';
import { Skeleton } from '@/crd/primitives/skeleton';

export type SettingsCardProps = {
  /**
   * The adapted settings flow. Currently used for the final stage of password
   * recovery (set-new-password); Kratos issues a settings flow after the user
   * follows the recovery link from their email. While `undefined` (or
   * `isLoading`), a skeleton renders.
   */
  descriptor?: KratosFlowDescriptor;
  isLoading?: boolean;
};

export function SettingsCard({ descriptor, isLoading }: SettingsCardProps) {
  const { t } = useTranslation('crd-auth');

  return (
    <div className="rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <h1 className="text-hero mb-6 text-foreground">{t('settings.title')}</h1>

      {isLoading || !descriptor ? (
        <output aria-label={t('loading')} className="flex w-full flex-col gap-5">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-12 w-full" />
        </output>
      ) : (
        <CrdKratosFlow descriptor={descriptor} />
      )}
    </div>
  );
}
