import { useTranslation } from 'react-i18next';
import { TransferOperationCard } from '@/crd/components/admin/transfer/TransferOperationCard';
import { TransferGroup, TransferSectionLayout } from '@/crd/components/admin/transfer/TransferSectionLayout';
import { UrlResolveField } from '@/crd/components/admin/transfer/UrlResolveField';
import useTransferInnovationHub from '@/domain/platformAdmin/management/transfer/transferInnovationHub/useTransferInnovationHub';
import useTransferInnovationPack from '@/domain/platformAdmin/management/transfer/transferInnovationPack/useTransferInnovationPack';
import useTransferVirtualContributor from '@/domain/platformAdmin/management/transfer/transferVirtualContributor/useTransferVirtualContributor';
import useVcConversion from '@/domain/platformAdmin/management/transfer/vcConversion/useVcConversion';
import { AccountTargetTransfer } from './AccountTargetTransfer';

const InnovationHubTransferPanel = () => {
  const { t } = useTranslation('crd-admin');
  const { t: tApp } = useTranslation();
  const { hub, currentAccountName, error, loading, transferLoading, handleResolve, handleTransfer } =
    useTransferInnovationHub();
  return (
    <AccountTargetTransfer
      title={t('transfer.hub.title')}
      description={t('transfer.hub.description')}
      resolved={Boolean(hub)}
      currentAccountName={currentAccountName ?? undefined}
      error={error ? tApp(error) : undefined}
      loading={loading}
      transferLoading={transferLoading}
      onResolve={handleResolve}
      onTransfer={handleTransfer}
    />
  );
};

const InnovationPackTransferPanel = () => {
  const { t } = useTranslation('crd-admin');
  const { t: tApp } = useTranslation();
  const { pack, currentAccountName, error, loading, transferLoading, handleResolve, handleTransfer } =
    useTransferInnovationPack();
  return (
    <AccountTargetTransfer
      title={t('transfer.pack.title')}
      description={t('transfer.pack.description')}
      resolved={Boolean(pack)}
      currentAccountName={currentAccountName ?? undefined}
      error={error ? tApp(error) : undefined}
      loading={loading}
      transferLoading={transferLoading}
      onResolve={handleResolve}
      onTransfer={handleTransfer}
    />
  );
};

const VirtualContributorTransferPanel = () => {
  const { t } = useTranslation('crd-admin');
  const { t: tApp } = useTranslation();
  const { vc, currentAccountName, error, loading, transferLoading, handleResolve, handleTransfer } =
    useTransferVirtualContributor();
  return (
    <AccountTargetTransfer
      title={t('transfer.vc.title')}
      description={t('transfer.vc.description')}
      resolved={Boolean(vc)}
      currentAccountName={currentAccountName ?? undefined}
      error={error ? tApp(error) : undefined}
      loading={loading}
      transferLoading={transferLoading}
      onResolve={handleResolve}
      onTransfer={handleTransfer}
    />
  );
};

const VcConversionPanel = () => {
  const { t } = useTranslation('crd-admin');
  const { t: tApp } = useTranslation();
  const {
    vc,
    isSpaceBased,
    isAlreadyConverted,
    accountOwnerName,
    error,
    loading,
    convertLoading,
    handleResolve,
    handleConvert,
  } = useVcConversion();
  const resolved = Boolean(vc);
  const canConvert = resolved && isSpaceBased && !isAlreadyConverted;

  return (
    <TransferOperationCard
      title={t('transfer.vcConversion.title')}
      description={t('transfer.vcConversion.description')}
      error={error ? tApp(error) : undefined}
      action={
        resolved
          ? {
              label: t('transfer.vcConversion.convert'),
              confirmTitle: t('transfer.vcConversion.confirmTitle'),
              confirmDescription: t('transfer.vcConversion.confirmDescription'),
              confirmLabel: t('transfer.vcConversion.convert'),
              onConfirm: () => {
                void handleConvert();
              },
              disabled: !canConvert,
              loading: convertLoading,
            }
          : undefined
      }
    >
      <UrlResolveField
        label={t('transfer.urlLabel')}
        buttonLabel={t('transfer.resolve')}
        onResolve={handleResolve}
        loading={loading}
      />
      {resolved && (
        <div className="flex flex-col gap-1 text-body">
          {accountOwnerName ? <p>{t('transfer.currentAccount', { name: accountOwnerName })}</p> : null}
          {!canConvert ? <p className="text-muted-foreground">{t('transfer.vcConversion.notEligible')}</p> : null}
        </div>
      )}
    </TransferOperationCard>
  );
};

const ComingSoonPanel = ({ title }: { title: string }) => {
  const { t } = useTranslation('crd-admin');
  return <TransferOperationCard title={title} description={t('transfer.comingSoon')} />;
};

/**
 * Transfer & Conversions admin section. Reuses the MUI-free transfer/conversion
 * hooks verbatim. Hub/Pack/Virtual-Contributor transfers and VC conversion are
 * live; Space conversion and Space/Callout transfers (the multi-step URL-pair
 * and level-conversion flows) are migrated in a follow-up and shown as
 * coming-soon panels so the section is complete and the warning is present.
 */
const CrdAdminTransferPage = () => {
  const { t } = useTranslation('crd-admin');

  return (
    <TransferSectionLayout warning={t('transfer.warning')}>
      <TransferGroup title={t('transfer.conversionsArea')}>
        <VcConversionPanel />
        <ComingSoonPanel title={t('transfer.spaceConversion.title')} />
      </TransferGroup>
      <TransferGroup title={t('transfer.transfersArea')}>
        <InnovationHubTransferPanel />
        <InnovationPackTransferPanel />
        <VirtualContributorTransferPanel />
        <ComingSoonPanel title={t('transfer.spaceTransfer.title')} />
        <ComingSoonPanel title={t('transfer.calloutTransfer.title')} />
      </TransferGroup>
    </TransferSectionLayout>
  );
};

export default CrdAdminTransferPage;
