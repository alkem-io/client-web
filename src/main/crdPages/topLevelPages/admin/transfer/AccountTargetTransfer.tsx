import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountPicker } from '@/crd/components/admin/transfer/AccountPicker';
import { TransferOperationCard } from '@/crd/components/admin/transfer/TransferOperationCard';
import { UrlResolveField } from '@/crd/components/admin/transfer/UrlResolveField';
import useAccountSearch from '@/domain/platformAdmin/management/transfer/shared/useAccountSearch';

type AccountTargetTransferProps = {
  title: string;
  description?: string;
  /** Whether the source entity has been resolved from its URL. */
  resolved: boolean;
  currentAccountName?: string;
  /** Already-translated error, if any. */
  error?: string;
  loading: boolean;
  transferLoading: boolean;
  onResolve: (url: string) => void;
  onTransfer: (targetAccountId: string) => void;
};

/**
 * Shared connector for the account-target transfers (Innovation Hub / Pack /
 * Virtual Contributor): resolve the source by URL, search + pick a target
 * account (`useAccountSearch`), then transfer behind a confirmation. The
 * caller supplies the section-specific reused hook's outputs as props.
 */
export function AccountTargetTransfer({
  title,
  description,
  resolved,
  currentAccountName,
  error,
  loading,
  transferLoading,
  onResolve,
  onTransfer,
}: AccountTargetTransferProps) {
  const { t } = useTranslation('crd-admin');
  const { searchTerm, results, loading: searchLoading, handleSearch } = useAccountSearch();
  const [targetAccountId, setTargetAccountId] = useState<string>();

  const options = results.map(result => ({ id: result.accountId, name: result.name }));

  return (
    <TransferOperationCard
      title={title}
      description={description}
      error={error}
      action={
        resolved
          ? {
              label: t('transfer.transfer'),
              confirmTitle: t('transfer.confirmTitle'),
              confirmDescription: t('transfer.confirmDescription'),
              confirmLabel: t('transfer.transfer'),
              onConfirm: () => {
                if (targetAccountId) onTransfer(targetAccountId);
              },
              disabled: !targetAccountId,
              loading: transferLoading,
            }
          : undefined
      }
    >
      <UrlResolveField
        label={t('transfer.urlLabel')}
        buttonLabel={t('transfer.resolve')}
        onResolve={onResolve}
        loading={loading}
      />
      {resolved && (
        <>
          {currentAccountName ? (
            <p className="text-body">{t('transfer.currentAccount', { name: currentAccountName })}</p>
          ) : null}
          <AccountPicker
            label={t('transfer.targetAccount')}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            results={options}
            loading={searchLoading}
            selectedId={targetAccountId}
            onSelect={setTargetAccountId}
          />
        </>
      )}
    </TransferOperationCard>
  );
}
