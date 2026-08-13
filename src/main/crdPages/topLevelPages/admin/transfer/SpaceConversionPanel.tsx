import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpaceTargetPicker } from '@/crd/components/admin/transfer/SpaceTargetPicker';
import { UrlResolveField } from '@/crd/components/admin/transfer/UrlResolveField';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { Button } from '@/crd/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import useSpaceConversion from '@/domain/platformAdmin/management/transfer/spaceConversion/useSpaceConversion';

type PendingOp = 'l1l0' | 'l1l2' | 'l2l1' | 'movel1l0' | 'movel1l2' | 'movel2l1' | null;

/**
 * Space conversion + move connector — resolve a space URL, then promote/demote it
 * between levels (L1→L0, L1→L2 with a parent, L2→L1), or move it cross-L0
 * to a different top-level space hierarchy, each behind a confirmation.
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
    movedSpaceUrl,
    targetL0Spaces,
    targetL0Loading,
    targetL0ExcludeIds,
    targetL1Subspaces,
    targetL1Loading,
    setSelectedTargetL0Id,
    handleResolve,
    handlePromoteL1ToL0,
    handleDemoteL1ToL2,
    handlePromoteL2ToL1,
    moveL1ToL0,
    moveL1ToL2,
    moveL2ToL1,
  } = useSpaceConversion();

  const [parentId, setParentId] = useState('');
  const [pendingOp, setPendingOp] = useState<PendingOp>(null);
  // US1 (L1→L0) has its own dedicated state — decoupled from US3's moveTargetL0Id
  const [moveL1L0TargetId, setMoveL1L0TargetId] = useState('');
  // US2 (L2→L1) and US3 (L1→L2) share these; they are mutually exclusive by level
  const [moveTargetL0Id, setMoveTargetL0Id] = useState('');
  const [moveTargetL1Id, setMoveTargetL1Id] = useState('');
  const [moveError, setMoveError] = useState<string | undefined>(undefined);

  // US4: auto-invite state
  const [autoInvite, setAutoInvite] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState('');

  const resolved = Boolean(space);
  const isL0 = resolvedLevel === SpaceLevel.L0;
  const isL1 = resolvedLevel === SpaceLevel.L1;
  const isL2 = resolvedLevel === SpaceLevel.L2;

  // Reset move state when a new space is resolved
  const onResolve = (url: string) => {
    setMoveL1L0TargetId('');
    setMoveTargetL0Id('');
    setMoveTargetL1Id('');
    setMoveError(undefined);
    setAutoInvite(false);
    setInvitationMessage('');
    handleResolve(url);
  };

  // When the user picks a different L0 in the move flow, reset the L1 selection
  const handleMoveL0Select = (l0Id: string) => {
    setMoveTargetL0Id(l0Id);
    setMoveTargetL1Id('');
    setSelectedTargetL0Id(l0Id);
  };

  const confirmConversion = () => {
    if (pendingOp === 'l1l0') void handlePromoteL1ToL0();
    else if (pendingOp === 'l1l2' && parentId) void handleDemoteL1ToL2(parentId);
    else if (pendingOp === 'l2l1') void handlePromoteL2ToL1();
    setPendingOp(null);
  };

  const confirmMove = async () => {
    setMoveError(undefined);
    try {
      if (pendingOp === 'movel1l0' && moveL1L0TargetId) {
        await moveL1ToL0(
          moveL1L0TargetId,
          autoInvite || undefined,
          autoInvite && invitationMessage ? invitationMessage : undefined
        );
      } else if (pendingOp === 'movel1l2' && moveTargetL1Id) {
        await moveL1ToL2(
          moveTargetL1Id,
          autoInvite || undefined,
          autoInvite && invitationMessage ? invitationMessage : undefined
        );
      } else if (pendingOp === 'movel2l1' && moveTargetL1Id) {
        await moveL2ToL1(
          moveTargetL1Id,
          autoInvite || undefined,
          autoInvite && invitationMessage ? invitationMessage : undefined
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('transfer.spaceMove.confirmTitle');
      setMoveError(msg);
    }
    setPendingOp(null);
  };

  const isMoveOp = pendingOp === 'movel1l0' || pendingOp === 'movel1l2' || pendingOp === 'movel2l1';

  const moveConfirmDisabled =
    mutationLoading ||
    (pendingOp === 'movel1l0' && !moveL1L0TargetId) ||
    ((pendingOp === 'movel1l2' || pendingOp === 'movel2l1') && !moveTargetL1Id);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-subheader font-semibold">{t('transfer.spaceConversion.title')}</h3>
        <p className="text-body text-muted-foreground">{t('transfer.spaceConversion.description')}</p>
      </div>

      <UrlResolveField
        label={t('transfer.urlLabel')}
        buttonLabel={t('transfer.resolve')}
        onResolve={onResolve}
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

          {/* ---- Conversion section (L1) ---- */}
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

          {/* ---- Conversion section (L2) ---- */}
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

          {/* ---- Move section ---- */}
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <h4 className="text-subheader font-semibold">{t('transfer.spaceMove.title')}</h4>
            <p className="text-body text-muted-foreground">{t('transfer.spaceMove.description')}</p>

            {isL0 && <p className="text-body text-muted-foreground">{t('transfer.spaceMove.noMoves')}</p>}

            {/* US1: L1 → move to another L0 */}
            {isL1 && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <span className="text-body-emphasis">{t('transfer.spaceMove.targetL0Label')}</span>
                  <SpaceTargetPicker
                    items={targetL0Spaces}
                    value={moveL1L0TargetId}
                    onValueChange={setMoveL1L0TargetId}
                    excludeIds={targetL0ExcludeIds}
                    placeholder={t('transfer.spaceMove.targetL0Placeholder')}
                    emptyLabel={t('transfer.spaceMove.targetL0Empty')}
                    loading={targetL0Loading}
                    disabled={mutationLoading}
                  />
                  <div>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={mutationLoading || !moveL1L0TargetId}
                      onClick={() => setPendingOp('movel1l0')}
                    >
                      {t('transfer.spaceMove.moveL1ToL0Label')}
                    </Button>
                  </div>
                </div>

                {/* US3: L1 → move under another L0's L1 (demotion cross-L0) */}
                <div className="flex flex-col gap-2">
                  <span className="text-body-emphasis">{t('transfer.spaceMove.moveL1ToL2Label')}</span>
                  <SpaceTargetPicker
                    items={targetL0Spaces}
                    value={moveTargetL0Id}
                    onValueChange={handleMoveL0Select}
                    excludeIds={targetL0ExcludeIds}
                    placeholder={t('transfer.spaceMove.targetL0Placeholder')}
                    emptyLabel={t('transfer.spaceMove.targetL0Empty')}
                    loading={targetL0Loading}
                    disabled={mutationLoading}
                  />
                  {moveTargetL0Id && (
                    <SpaceTargetPicker
                      items={targetL1Subspaces}
                      value={moveTargetL1Id}
                      onValueChange={setMoveTargetL1Id}
                      placeholder={t('transfer.spaceMove.targetL1Placeholder')}
                      emptyLabel={t('transfer.spaceMove.targetL1Empty')}
                      loading={targetL1Loading}
                      disabled={mutationLoading}
                    />
                  )}
                  <div>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={mutationLoading || !moveTargetL1Id}
                      onClick={() => setPendingOp('movel1l2')}
                    >
                      {t('transfer.spaceMove.moveL1ToL2Label')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* US2: L2 → move under another L0's L1 */}
            {isL2 && (
              <div className="flex flex-col gap-2">
                <span className="text-body-emphasis">{t('transfer.spaceMove.moveL2ToL1Label')}</span>
                <SpaceTargetPicker
                  items={targetL0Spaces}
                  value={moveTargetL0Id}
                  onValueChange={handleMoveL0Select}
                  excludeIds={targetL0ExcludeIds}
                  placeholder={t('transfer.spaceMove.targetL0Placeholder')}
                  emptyLabel={t('transfer.spaceMove.targetL0Empty')}
                  loading={targetL0Loading}
                  disabled={mutationLoading}
                />
                {moveTargetL0Id && (
                  <SpaceTargetPicker
                    items={targetL1Subspaces}
                    value={moveTargetL1Id}
                    onValueChange={setMoveTargetL1Id}
                    placeholder={t('transfer.spaceMove.targetL1Placeholder')}
                    emptyLabel={t('transfer.spaceMove.targetL1Empty')}
                    loading={targetL1Loading}
                    disabled={mutationLoading}
                  />
                )}
                <div>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={mutationLoading || !moveTargetL1Id}
                    onClick={() => setPendingOp('movel2l1')}
                  >
                    {t('transfer.spaceMove.moveL2ToL1Label')}
                  </Button>
                </div>
              </div>
            )}

            {moveError && <p className="text-body text-destructive">{moveError}</p>}
          </div>
        </div>
      )}

      {/* Success state after a move — FR-015 */}
      {movedSpaceUrl && (
        <div className="flex flex-col gap-1">
          <p className="text-body text-foreground">
            {t('transfer.spaceMove.successPrefix')}{' '}
            <a
              href={movedSpaceUrl}
              className="text-primary underline focus-visible:ring-2 focus-visible:ring-ring outline-none rounded"
            >
              {t('transfer.spaceMove.newLocationLabel')}
            </a>
          </p>
        </div>
      )}

      {/* Conversion confirm dialog */}
      <ConfirmationDialog
        open={Boolean(pendingOp) && !isMoveOp}
        onOpenChange={open => {
          if (!open) setPendingOp(null);
        }}
        variant="destructive"
        title={t('transfer.spaceConversion.confirmTitle')}
        description={t('transfer.spaceConversion.confirmDescription')}
        confirmLabel={t('transfer.spaceConversion.title')}
        loading={mutationLoading}
        onConfirm={confirmConversion}
      />

      {/* Move confirm dialog (US1/US2/US3 + US4 auto-invite) */}
      <ConfirmationDialog
        open={isMoveOp}
        onOpenChange={open => {
          if (!open) {
            setPendingOp(null);
            setAutoInvite(false);
            setInvitationMessage('');
          }
        }}
        variant="destructive"
        title={t('transfer.spaceMove.confirmTitle')}
        description={t('transfer.spaceMove.confirmDescription')}
        confirmLabel={t('transfer.spaceMove.move')}
        loading={mutationLoading || moveConfirmDisabled}
        onConfirm={() => {
          void confirmMove();
        }}
      >
        {/* US4: auto-invite toggle + message */}
        <div className="flex flex-col gap-2 py-2">
          <label className="flex items-center gap-2 text-body cursor-pointer">
            <input
              type="checkbox"
              checked={autoInvite}
              onChange={e => setAutoInvite(e.target.checked)}
              className="size-4"
            />
            {t('transfer.spaceMove.autoInviteLabel')}
          </label>
          {autoInvite && (
            <div className="flex flex-col gap-1">
              <label htmlFor="move-invitation-message" className="text-body-emphasis">
                {t('transfer.spaceMove.invitationMessageLabel')}
              </label>
              <textarea
                id="move-invitation-message"
                value={invitationMessage}
                onChange={e => setInvitationMessage(e.target.value)}
                maxLength={500}
                placeholder={t('transfer.spaceMove.invitationMessagePlaceholder')}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>
      </ConfirmationDialog>
    </div>
  );
}
