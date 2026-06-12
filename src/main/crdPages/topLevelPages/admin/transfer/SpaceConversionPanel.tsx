import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { UrlResolveField } from '@/crd/components/admin/transfer/UrlResolveField';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Button } from '@/crd/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import useSpaceConversion from '@/domain/platformAdmin/management/transfer/spaceConversion/useSpaceConversion';

type PendingOp = 'l1l0' | 'l1l2' | 'l2l1' | null;

/**
 * Space conversion connector — resolve a space URL, then promote/demote it
 * between levels (L1→L0, L1→L2 with a parent, L2→L1), each behind a
 * confirmation. Reuses the MUI-free `useSpaceConversion` hook verbatim.
 */
export function SpaceConversionPanel() {
  const { t } = useTranslation('crd-admin');
  const { t: tApp } = useTranslation();
  const {
    space,
    resolvedLevel,
    accountOwnerName,
    siblingSubspaces,
    error,
    loading,
    mutationLoading,
    handleResolve,
    handlePromoteL1ToL0,
    handleDemoteL1ToL2,
    handlePromoteL2ToL1,
  } = useSpaceConversion();

  const [parentId, setParentId] = useState('');
  const [pendingOp, setPendingOp] = useState<PendingOp>(null);

  const resolved = Boolean(space);
  const isL0 = resolvedLevel === SpaceLevel.L0;
  const isL1 = resolvedLevel === SpaceLevel.L1;
  const isL2 = resolvedLevel === SpaceLevel.L2;

  const confirm = () => {
    if (pendingOp === 'l1l0') void handlePromoteL1ToL0();
    else if (pendingOp === 'l1l2' && parentId) void handleDemoteL1ToL2(parentId);
    else if (pendingOp === 'l2l1') void handlePromoteL2ToL1();
    setPendingOp(null);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-subheader font-semibold">{t('transfer.spaceConversion.title')}</h3>
        <p className="text-body text-muted-foreground">{t('transfer.spaceConversion.description')}</p>
      </div>

      <UrlResolveField
        label={t('transfer.urlLabel')}
        buttonLabel={t('transfer.resolve')}
        onResolve={handleResolve}
        loading={loading}
      />

      {error ? <p className="text-body text-destructive">{tApp(error)}</p> : null}

      {resolved && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-body">
            <p>{t('transfer.spaceConversion.resolvedLevel', { level: resolvedLevel ?? '' })}</p>
            {accountOwnerName ? <p>{t('transfer.currentAccount', { name: accountOwnerName })}</p> : null}
          </div>

          {isL0 && <p className="text-body text-muted-foreground">{t('transfer.spaceConversion.noConversions')}</p>}

          {isL1 && (
            <div className="flex flex-col gap-3">
              <div>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={mutationLoading}
                  onClick={() => setPendingOp('l1l0')}
                >
                  {t('transfer.spaceConversion.promoteL1L0')}
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-body-emphasis">{t('transfer.spaceConversion.parentLabel')}</span>
                <Select value={parentId} onValueChange={setParentId} disabled={mutationLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('transfer.spaceConversion.parentPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {siblingSubspaces.map(sibling => (
                      <SelectItem key={sibling.id} value={sibling.id}>
                        {sibling.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={mutationLoading || !parentId}
                    onClick={() => setPendingOp('l1l2')}
                  >
                    {t('transfer.spaceConversion.demoteL1L2')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isL2 && (
            <div>
              <Button
                type="button"
                variant="destructive"
                disabled={mutationLoading}
                onClick={() => setPendingOp('l2l1')}
              >
                {t('transfer.spaceConversion.promoteL2L1')}
              </Button>
            </div>
          )}
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(pendingOp)}
        onOpenChange={open => {
          if (!open) setPendingOp(null);
        }}
        variant="destructive"
        title={t('transfer.spaceConversion.confirmTitle')}
        description={t('transfer.spaceConversion.confirmDescription')}
        confirmLabel={t('transfer.spaceConversion.title')}
        loading={mutationLoading}
        onConfirm={confirm}
      />
    </div>
  );
}
