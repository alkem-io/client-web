import { useTranslation } from 'react-i18next';
import { AuthCard } from '@/crd/components/auth/AuthCard';
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
    <AuthCard title={t('settings.title')}>
      {isLoading || !descriptor ? (
        <output aria-label={t('loading')} className="flex w-full flex-col gap-5">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-12 w-full" />
        </output>
      ) : (
        <CrdKratosFlow descriptor={descriptor} />
      )}
    </AuthCard>
  );
}
