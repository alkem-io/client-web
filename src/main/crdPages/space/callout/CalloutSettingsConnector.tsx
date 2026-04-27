import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutContentLazyQuery,
  useCalloutContributionsSortOrderQuery,
  useUpdateContributionsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { CalloutVisibility, TemplateType } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CalloutContextMenu } from '@/crd/components/callout/CalloutContextMenu';
import { CalloutContributionsSortDialog } from '@/crd/components/callout/CalloutContributionsSortDialog';
import { CalloutVisibilityChangeDialog } from '@/crd/components/callout/CalloutVisibilityChangeDialog';
import { DeleteCalloutDialog } from '@/crd/components/dialogs/DeleteCalloutDialog';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { useCalloutManager } from '@/domain/collaboration/callout/utils/useCalloutManager';
import { useSpace } from '@/domain/space/context/useSpace';
import CreateTemplateDialog from '@/domain/templates/components/Dialogs/CreateEditTemplateDialog/CreateTemplateDialog';
import { useCreateCalloutTemplate } from '@/domain/templates/hooks/useCreateCalloutTemplate';
import type { CalloutMoveActions } from '@/main/crdPages/space/hooks/useCrdCalloutMoveActions';
import { CalloutEditConnector } from './CalloutEditConnector';
import { deriveCalloutMenuVisibility } from './deriveCalloutMenuVisibility';

/** Plan D12 kill-switch for the Save-as-Template flow. When false, the menu item is hidden. */
const CRD_SAVE_AS_TEMPLATE_ENABLED = true;

type CalloutSettingsConnectorProps = {
  callout: CalloutDetailsModelExtended;
  /** Move-action prop bag (plan D9). Hooked up by the list / detail connector. */
  moveActions?: CalloutMoveActions;
  /**
   * Open the Share dialog. Mounted by the parent (LazyCalloutItem /
   * CalloutDetailDialogConnector) so multiple Share triggers — the 3-dots
   * menu, the detail dialog header icon, the reactions bar — can share a
   * single dialog instance. When omitted, the Share menu item is hidden.
   */
  onShare?: () => void;
};

/**
 * Hosts the 3-dots menu for a single callout, plus the lifecycle dialogs it
 * triggers: visibility change, delete, sort contributions (plan T062).
 * Rendered inside `LazyCalloutItem` (feed 3-dots) and
 * `CalloutDetailDialogConnector` (sticky-header 3-dots).
 *
 * Permissions are derived via `deriveCalloutMenuVisibility` (pure helper
 * unit-tested in T099). Mutations flow through `useCalloutManager`
 * (`changeCalloutVisibility`, `deleteCallout`) + the callouts sort-order
 * mutation exposed via `moveActions`.
 *
 * Share is owned by the parent connector via `onShare` (so the detail dialog's
 * header / reactions-bar Share buttons share state with the menu's Share item).
 * Save-as-Template is hidden behind `CRD_SAVE_AS_TEMPLATE_ENABLED` until its
 * MUI portal is wired (plan D12 / T082).
 */
export function CalloutSettingsConnector({ callout, moveActions, onShare }: CalloutSettingsConnectorProps) {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const {
    space: { levelZeroSpaceId },
  } = useSpace();
  const [editOpen, setEditOpen] = useState(false);
  const [visibilityAction, setVisibilityAction] = useState<'publish' | 'unpublish' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [saveAsTemplateOpen, setSaveAsTemplateOpen] = useState(false);
  const [mutating, setMutating] = useState(false);

  const { changeCalloutVisibility, deleteCallout } = useCalloutManager();
  const { handleCreateCalloutTemplate } = useCreateCalloutTemplate();
  const [fetchCalloutContent] = useCalloutContentLazyQuery();

  // Contributions sort — fetched only while the dialog is open.
  const { data: sortData, loading: sortLoading } = useCalloutContributionsSortOrderQuery({
    variables: { calloutId: callout.id },
    skip: !sortOpen,
    fetchPolicy: 'cache-and-network',
  });
  const [updateContributionsSortOrder, { loading: updatingSort }] = useUpdateContributionsSortOrderMutation();

  const sortableContributions = useMemo(() => {
    const list = sortData?.lookup.callout?.contributions ?? [];
    return [...list]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(c => ({
        id: c.id,
        title:
          c.post?.profile.displayName ??
          c.link?.profile.displayName ??
          c.whiteboard?.profile.displayName ??
          c.memo?.profile.displayName ??
          '',
      }));
  }, [sortData]);

  const perms = deriveCalloutMenuVisibility({
    myPrivileges: callout.authorization?.myPrivileges,
    visibility: callout.settings.visibility,
    // Set-level privileges aren't on `callout.authorization` — we can't gate
    // move actions by set privileges here. The parent (LazyCalloutItem /
    // CalloutListConnector) is the authoritative source for "movable" since
    // it knows the ordered list; if `moveActions` is undefined or the callout
    // is alone, moves are hidden.
    calloutsSetMyPrivileges: callout.authorization?.myPrivileges,
    contributionsEnabled: callout.settings.contribution.enabled,
    contributionsCount: callout.contributions.length,
    canBeSavedAsTemplate: callout.canBeSavedAsTemplate,
    saveAsTemplateFeatureEnabled: CRD_SAVE_AS_TEMPLATE_ENABLED,
    hasMoveNeighbours: !!moveActions && (!moveActions.isTop || !moveActions.isBottom),
  });

  const handleVisibilityConfirm = async (sendNotification: boolean) => {
    if (!visibilityAction) return;
    const nextVisibility = visibilityAction === 'publish' ? CalloutVisibility.Published : CalloutVisibility.Draft;
    setMutating(true);
    try {
      await changeCalloutVisibility(callout, nextVisibility, sendNotification);
      setVisibilityAction(null);
    } catch (err) {
      logError(new Error('Callout visibility change failed', { cause: err as Error }));
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setMutating(true);
    try {
      await deleteCallout(callout);
      setDeleteOpen(false);
    } catch (err) {
      logError(new Error('Callout delete failed', { cause: err as Error }));
    } finally {
      setMutating(false);
    }
  };

  const handleSortConfirm = async (sortedIds: string[]) => {
    try {
      await updateContributionsSortOrder({
        variables: { calloutID: callout.id, contributionIds: sortedIds },
        refetchQueries: ['CalloutDetails', 'CalloutContributionsSortOrder'],
      });
      setSortOpen(false);
    } catch (err) {
      logError(new Error('Contribution sort-order update failed', { cause: err as Error }));
      notify(t('sortContributions.saveFailed'), 'error');
    }
  };

  return (
    <>
      <CalloutContextMenu
        isDraft={perms.isDraft}
        editable={perms.editable}
        movable={perms.movable}
        canSaveAsTemplate={perms.showSaveAsTemplate}
        onEdit={perms.showEdit ? () => setEditOpen(true) : undefined}
        onPublish={perms.showPublish ? () => setVisibilityAction('publish') : undefined}
        onUnpublish={perms.showUnpublish ? () => setVisibilityAction('unpublish') : undefined}
        onDelete={perms.showDelete ? () => setDeleteOpen(true) : undefined}
        onSortContributions={perms.showSortContributions ? () => setSortOpen(true) : undefined}
        onSaveAsTemplate={perms.showSaveAsTemplate ? () => setSaveAsTemplateOpen(true) : undefined}
        onShare={perms.showShare && onShare ? onShare : undefined}
        onMoveTop={moveActions?.onMoveToTop}
        onMoveUp={moveActions?.onMoveUp}
        onMoveDown={moveActions?.onMoveDown}
        onMoveBottom={moveActions?.onMoveToBottom}
      />

      {editOpen && (
        <CalloutEditConnector
          open={editOpen}
          onOpenChange={setEditOpen}
          calloutId={callout.id}
          calloutsSetId={callout.calloutsSetId}
        />
      )}

      <CalloutVisibilityChangeDialog
        open={visibilityAction !== null}
        onOpenChange={open => !open && setVisibilityAction(null)}
        action={visibilityAction ?? 'publish'}
        loading={mutating}
        onConfirm={handleVisibilityConfirm}
      />

      <DeleteCalloutDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        calloutTitle={callout.framing.profile.displayName}
        loading={mutating}
        onConfirm={handleDeleteConfirm}
      />

      <CalloutContributionsSortDialog
        open={sortOpen}
        onOpenChange={setSortOpen}
        contributions={sortableContributions}
        loading={sortLoading || updatingSort}
        onConfirm={handleSortConfirm}
      />

      {saveAsTemplateOpen && (
        <CreateTemplateDialog
          open={saveAsTemplateOpen}
          onClose={() => setSaveAsTemplateOpen(false)}
          templateType={TemplateType.Callout}
          onSubmit={async values => {
            if (!levelZeroSpaceId) return;
            try {
              await handleCreateCalloutTemplate(values, levelZeroSpaceId);
              setSaveAsTemplateOpen(false);
            } catch (err) {
              logError(new Error('Save as template failed', { cause: err as Error }));
            }
          }}
          getDefaultValues={async () => {
            const { data } = await fetchCalloutContent({ variables: { calloutId: callout.id } });
            return {
              type: TemplateType.Callout,
              callout: data?.lookup.callout,
            };
          }}
        />
      )}
    </>
  );
}
