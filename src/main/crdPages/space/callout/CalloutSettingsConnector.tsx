import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCalloutContentLazyQuery,
  useCalloutContributionsSortOrderQuery,
  useSpaceTemplatesManagerQuery,
  useUpdateContributionsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { CalloutVisibility, VisualType } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { CalloutContextMenu } from '@/crd/components/callout/CalloutContextMenu';
import { CalloutContributionsSortDialog } from '@/crd/components/callout/CalloutContributionsSortDialog';
import { CalloutVisibilityChangeDialog } from '@/crd/components/callout/CalloutVisibilityChangeDialog';
import { DeleteCalloutDialog } from '@/crd/components/dialogs/DeleteCalloutDialog';
import { TemplateFormDialog } from '@/crd/components/templates/TemplateFormDialog';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { useCalloutManager } from '@/domain/collaboration/callout/utils/useCalloutManager';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { useSpace } from '@/domain/space/context/useSpace';
import type { CalloutFormValues } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import type { CalloutMoveActions } from '@/main/crdPages/space/hooks/useCrdCalloutMoveActions';
import { fetchPreviewImageBlob } from '@/main/crdPages/templates/fetchPreviewImageBlob';
import { useSaveAsTemplate } from '@/main/crdPages/templates/useSaveAsTemplate';
import { CalloutEditConnector } from './CalloutEditConnector';
import { mapCalloutDetailsToFormValues } from './dataMappers/mapCalloutDetailsToFormValues';
import { deriveCalloutMenuVisibility } from './deriveCalloutMenuVisibility';

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
 * triggers: visibility change, delete, sort contributions, and "Save as
 * template" (plan T062 / T069). Rendered inside `LazyCalloutItem` (feed 3-dots)
 * and `CalloutDetailDialogConnector` (sticky-header 3-dots).
 *
 * Permissions are derived via `deriveCalloutMenuVisibility` (pure helper).
 * Mutations flow through `useCalloutManager` (`changeCalloutVisibility`,
 * `deleteCallout`) + the callouts sort-order mutation exposed via `moveActions`.
 * Save-as-Template now goes through the CRD `useSaveAsTemplate` flow (the legacy
 * MUI `CreateTemplateDialog` bridge was removed in T036/T025).
 *
 * Share is owned by the parent connector via `onShare` (so the detail dialog's
 * header / reactions-bar Share buttons share state with the menu's Share item).
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
  const [mutating, setMutating] = useState(false);

  const { changeCalloutVisibility, deleteCallout } = useCalloutManager();
  const [fetchCalloutContent] = useCalloutContentLazyQuery();

  // Save-as-template — the level-zero space owns the templates set.
  const { data: templatesManagerData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId: levelZeroSpaceId ?? '' },
    skip: !levelZeroSpaceId,
  });
  const saveAsTemplatesSetId = templatesManagerData?.lookup.space?.templatesManager?.templatesSet?.id;
  const saveAs = useSaveAsTemplate({ templatesSetId: saveAsTemplatesSetId, spaceId: levelZeroSpaceId });

  // Contributions sort — fetched only while the dialog is open.
  const { data: sortData, loading: sortLoading } = useCalloutContributionsSortOrderQuery({
    variables: { calloutId: callout.id },
    skip: !sortOpen,
    fetchPolicy: 'cache-and-network',
  });
  const [updateContributionsSortOrder, { loading: updatingSort }] = useUpdateContributionsSortOrderMutation();

  const sortableContributions = [...(sortData?.lookup.callout?.contributions ?? [])]
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

  const perms = deriveCalloutMenuVisibility({
    myPrivileges: callout.authorization?.myPrivileges,
    visibility: callout.settings.visibility,
    // Set-level Update is not exposed on `callout.authorization`; the parent
    // list connector (LazyCalloutItem / CalloutListConnector) only hands down
    // `moveActions` when the user has it, so its presence is the authoritative
    // signal. `hasMoveNeighbours` then narrows further to "is there a sibling
    // to swap with?".
    canMoveSet: !!moveActions,
    contributionsEnabled: callout.settings.contribution.enabled,
    contributionsCount: callout.contributions.length,
    canBeSavedAsTemplate: callout.canBeSavedAsTemplate,
    saveAsTemplateFeatureEnabled: true,
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
      notify(t('visibilityChange.saveFailed'), 'error');
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
      notify(t('deleteCallout.saveFailed'), 'error');
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

  // Fetch the callout's full content, map it to CRD callout-form values (incl. the whiteboard / memo
  // body, which the live-edit prefill omits but a template stores statically), then open the dialog.
  const handleSaveAsTemplate = async () => {
    const { data } = await fetchCalloutContent({ variables: { calloutId: callout.id } });
    const loaded = data?.lookup.callout;
    const body: Partial<CalloutFormValues> = mapCalloutDetailsToFormValues(data);
    if (loaded?.framing.whiteboard?.content) body.whiteboardContent = loaded.framing.whiteboard.content;
    else if (body.whiteboardConfigured) body.whiteboardContent = EmptyWhiteboardString;
    body.memoMarkdown = loaded?.framing.memo?.markdown ?? '';
    // Seed the source whiteboard's server-rendered preview as a blob so the post-create upload step
    // (uploadCalloutWhiteboardPreview) persists it onto the new template whiteboard's WHITEBOARD_PREVIEW
    // Visual — otherwise the template is created with content but no preview image. Mirrors
    // loadCalloutTemplateFormValues (D18). A failed fetch is non-fatal — the blob seed is just skipped.
    if (body.whiteboardPreviewServerUrl) {
      const blob = await fetchPreviewImageBlob(body.whiteboardPreviewServerUrl);
      if (blob) {
        body.whiteboardPreviewImages = [{ visualType: VisualType.WhiteboardPreview, imageData: blob }];
      }
    }
    saveAs.openSaveAs({
      kind: 'callout',
      name: callout.framing.profile.displayName,
      description: callout.framing.profile.description ?? undefined,
      calloutBody: body,
    });
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
        onSaveAsTemplate={perms.showSaveAsTemplate ? () => void handleSaveAsTemplate() : undefined}
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
          editCallout={callout}
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

      <TemplateFormDialog
        open={saveAs.form.open}
        intent={saveAs.form.intent}
        type={saveAs.form.type}
        commonValue={saveAs.form.commonValue}
        commonErrors={saveAs.form.commonErrors}
        onCommonChange={saveAs.form.onCommonChange}
        perTypeFormSlot={saveAs.form.perTypeFormSlot}
        submitting={saveAs.form.submitting}
        onSubmit={saveAs.form.onSubmit}
        onCancel={saveAs.form.onCancel}
        isDirty={saveAs.form.isDirty}
      />
    </>
  );
}
