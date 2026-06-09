import { useTranslation } from 'react-i18next';
import { TransferOperationCard } from '@/crd/components/admin/transfer/TransferOperationCard';
import { TransferGroup, TransferSectionLayout } from '@/crd/components/admin/transfer/TransferSectionLayout';
import { UrlResolveField } from '@/crd/components/admin/transfer/UrlResolveField';
import useTransferCallout from '@/domain/platformAdmin/management/transfer/transferCallout/useTransferCallout';
import useTransferInnovationHub from '@/domain/platformAdmin/management/transfer/transferInnovationHub/useTransferInnovationHub';
import useTransferInnovationPack from '@/domain/platformAdmin/management/transfer/transferInnovationPack/useTransferInnovationPack';
import useTransferSpace from '@/domain/platformAdmin/management/transfer/transferSpace/useTransferSpace';
import useTransferVirtualContributor from '@/domain/platformAdmin/management/transfer/transferVirtualContributor/useTransferVirtualContributor';
import useVcConversion from '@/domain/platformAdmin/management/transfer/vcConversion/useVcConversion';
import { AccountTargetTransfer } from './AccountTargetTransfer';
import { TwoUrlTransfer } from './TwoUrlTransfer';

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

const SpaceTransferPanel = () => {
  const { t } = useTranslation('crd-admin');
  const { t: tApp } = useTranslation();
  const {
    space,
    accountOwner,
    spaceError,
    ownerError,
    spaceLoading,
    ownerLoading,
    transferLoading,
    handleSpaceSubmit,
    handleAccountOwnerSubmit,
    handleTransfer,
  } = useTransferSpace();
  return (
    <TwoUrlTransfer
      title={t('transfer.spaceTransfer.title')}
      description={t('transfer.spaceTransfer.description')}
      source={{
        label: t('transfer.spaceTransfer.sourceLabel'),
        error: spaceError ? tApp(spaceError) : undefined,
        resolved: Boolean(space),
        loading: spaceLoading,
        onResolve: handleSpaceSubmit,
      }}
      target={{
        label: t('transfer.spaceTransfer.targetLabel'),
        error: ownerError ? tApp(ownerError) : undefined,
        resolved: Boolean(accountOwner),
        resolvedLabel: accountOwner?.name ?? undefined,
        loading: ownerLoading,
        onResolve: handleAccountOwnerSubmit,
      }}
      canTransfer={Boolean(space && accountOwner)}
      transferLoading={transferLoading}
      onTransfer={() => {
        void handleTransfer();
      }}
      transferLabel={t('transfer.transfer')}
      confirmTitle={t('transfer.spaceTransfer.confirmTitle')}
      confirmDescription={t('transfer.spaceTransfer.confirmDescription')}
    />
  );
};

const CalloutTransferPanel = () => {
  const { t } = useTranslation('crd-admin');
  const { t: tApp } = useTranslation();
  const {
    callout,
    calloutsSetId,
    calloutError,
    spaceError,
    calloutLoading,
    spaceLoading,
    transferLoading,
    handleCalloutSubmit,
    handleSpaceSubmit,
    handleTransfer,
  } = useTransferCallout();
  return (
    <TwoUrlTransfer
      title={t('transfer.calloutTransfer.title')}
      description={t('transfer.calloutTransfer.description')}
      source={{
        label: t('transfer.calloutTransfer.sourceLabel'),
        error: calloutError ? tApp(calloutError) : undefined,
        resolved: Boolean(callout),
        loading: calloutLoading,
        onResolve: handleCalloutSubmit,
      }}
      target={{
        label: t('transfer.calloutTransfer.targetLabel'),
        error: spaceError ? tApp(spaceError) : undefined,
        resolved: Boolean(calloutsSetId),
        loading: spaceLoading,
        onResolve: handleSpaceSubmit,
      }}
      canTransfer={Boolean(callout && calloutsSetId)}
      transferLoading={transferLoading}
      onTransfer={() => {
        void handleTransfer();
      }}
      transferLabel={t('transfer.transfer')}
      confirmTitle={t('transfer.calloutTransfer.confirmTitle')}
      confirmDescription={t('transfer.calloutTransfer.confirmDescription')}
    />
  );
};

const ComingSoonPanel = ({ title }: { title: string }) => {
  const { t } = useTranslation('crd-admin');
  return <TransferOperationCard title={title} description={t('transfer.comingSoon')} />;
};

/**
 * Transfer & Conversions admin section. Reuses the MUI-free transfer/conversion
 * hooks verbatim. All transfers (Space, Innovation Hub/Pack, Virtual
 * Contributor, Callout) and VC conversion are live; Space conversion (the
 * multi-step level-conversion flow with move panels) is migrated in a follow-up
 * and shown as a coming-soon panel.
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
        <SpaceTransferPanel />
        <InnovationHubTransferPanel />
        <InnovationPackTransferPanel />
        <VirtualContributorTransferPanel />
        <CalloutTransferPanel />
      </TransferGroup>
    </TransferSectionLayout>
  );
};

export default CrdAdminTransferPage;
