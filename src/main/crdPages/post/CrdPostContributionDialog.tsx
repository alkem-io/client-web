import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationError } from 'yup';
import {
  useCalloutContributionCommentsQuery,
  useCreatePostOnCalloutMutation,
  useCreateReferenceOnProfileMutation,
  useDeleteContributionMutation,
  useDeleteReferenceMutation,
  useMoveContributionToCalloutMutation,
  usePostCalloutsInCalloutSetQuery,
  usePostSettingsQuery,
  useUpdatePostMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Loading } from '@/crd/components/common/Loading';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { ReferencesEditor } from '@/crd/forms/callout/ReferencesEditor';
// MarkdownEditor lives at @/crd/forms/markdown/MarkdownEditor — non-collaborative editor (single-author posts).
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
import { ensureHttps } from '@/crd/lib/ensureHttps';
import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';
import { Input } from '@/crd/primitives/input';
import { Label } from '@/crd/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/crd/primitives/select';
import useValidationMessageTranslation from '@/domain/shared/i18n/ValidationMessageTranslation/useValidationMessageTranslation';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { useStorageConfigContext } from '@/domain/storage/StorageBucket/StorageConfigContext';
import { useMarkdownEditorIntegration } from '@/main/crdPages/markdown/useMarkdownEditorIntegration';
import { CalloutCommentsConnector } from '@/main/crdPages/space/callout/CalloutCommentsConnector';
import { useReferenceFileUpload } from '@/main/crdPages/space/callout/useReferenceFileUpload';
import {
  emptyPostContributionFormValues,
  type PostContributionFormValues,
  postContributionFormSchema,
} from './postContributionFormSchema';

type CrdPostContributionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** create — render an empty form; edit — fetch the post and prefill. */
  mode: 'create' | 'edit';
  /** Required in both modes. The callout the post belongs to. */
  calloutId: string;
  /** edit mode only: drives the "Post location" dropdown (sibling-callout list). */
  calloutsSetId?: string;
  /** edit mode: the underlying Post id (from `ContributionCardData.postId`). */
  postId?: string;
  /** edit mode: the wrapping Contribution id, used for delete via `useDeleteContributionMutation`. */
  contributionId?: string;
  defaultDisplayName?: string;
  defaultDescription?: string;
  onCreated?: (post: { id: string }) => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
};

type FieldErrors = Partial<Record<'displayName' | 'description', string>>;

export function CrdPostContributionDialog({
  open,
  onOpenChange,
  mode,
  calloutId,
  calloutsSetId,
  postId,
  contributionId,
  defaultDisplayName,
  defaultDescription,
  onCreated,
  onDeleted,
  onUpdated,
}: CrdPostContributionDialogProps) {
  const { t } = useTranslation('crd-space');
  const translateValidation = useValidationMessageTranslation();
  const notify = useNotification();
  const markdownIntegration = useMarkdownEditorIntegration();
  const referenceUpload = useReferenceFileUpload(useStorageConfigContext());
  const titleFieldId = useId();
  const descriptionFieldId = useId();
  const tagsFieldId = useId();

  const fallbackName = defaultDisplayName ?? t('callout.defaultPostName');
  const fallbackDescription = defaultDescription ?? '';

  const [values, setValues] = useState<PostContributionFormValues>(() =>
    mode === 'create'
      ? emptyPostContributionFormValues(fallbackName, fallbackDescription)
      : emptyPostContributionFormValues('')
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Edit mode — fetch the post; prefill once data arrives.
  const { data, loading: loadingPost } = usePostSettingsQuery({
    variables: { postId: postId ?? '', calloutId },
    skip: mode !== 'edit' || !postId || !open,
  });
  const post = data?.lookup.post;
  const tagsetId = post?.profile.tagset?.id;
  const canDelete = (post?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Delete);
  const canMove = (post?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.MovePost);

  // "Post location" dropdown — lets the user move this contribution to a
  // different POST-type callout in the same callouts-set. Mirrors MUI
  // `CalloutContributionDialogPost` (uses the same `PostCalloutsInCalloutSet`
  // query + `moveContributionToCallout` mutation).
  const { data: siblingCalloutsData, refetch: refetchSiblingCallouts } = usePostCalloutsInCalloutSetQuery({
    variables: { calloutsSetId: calloutsSetId ?? '' },
    skip: mode !== 'edit' || !calloutsSetId || !open || !canMove,
  });
  const siblingCallouts = siblingCalloutsData?.lookup.calloutsSet?.callouts ?? [];
  const [targetCalloutId, setTargetCalloutId] = useState<string>(calloutId);
  // Mutable baseline for move detection. After a successful move, the prop
  // `calloutId` doesn't change but the contribution now lives in
  // `targetCalloutId` — so subsequent saves must compare against the new
  // location, not the immutable prop, otherwise the move re-fires and fails.
  const baselineCalloutIdRef = useRef<string>(calloutId);
  // Reset the dropdown to the current callout whenever the dialog opens against a fresh post.
  useEffect(() => {
    if (open) {
      setTargetCalloutId(calloutId);
      baselineCalloutIdRef.current = calloutId;
    }
  }, [open, calloutId]);
  const isMoveTargetChanged = targetCalloutId !== baselineCalloutIdRef.current;

  const [moveContributionToCallout] = useMoveContributionToCalloutMutation();

  // Comments live on a separate query that follows the contribution → post.comments path.
  // The connector also fetches this internally; we fetch here to know the roomId up-front
  // and pass `roomData` so the connector skips its own fetch.
  const { data: commentsData } = useCalloutContributionCommentsQuery({
    variables: { contributionId: contributionId ?? '', includePost: true },
    skip: mode !== 'edit' || !contributionId || !open,
  });
  const commentsRoom = commentsData?.lookup.contribution?.post?.comments;

  // Reset state on open / mode change.
  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      setValues(emptyPostContributionFormValues(fallbackName, fallbackDescription));
      setIsDirty(false);
      setErrors({});
    }
  }, [open, mode, fallbackName, fallbackDescription]);

  // Prefill from server data in edit mode. Apollo can hand back a fresh
  // reference for `data.lookup.post` whenever the cache is touched (refetch,
  // sibling mutation, normalized-field invalidation), so guard against
  // re-prefilling and clobbering in-flight user edits — only seed once per
  // post id per open dialog session.
  const prefilledPostIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!open) {
      prefilledPostIdRef.current = null;
      return;
    }
    if (mode !== 'edit' || !post) return;
    if (prefilledPostIdRef.current === post.id) return;
    setValues({
      displayName: post.profile.displayName,
      description: post.profile.description ?? '',
      tags: post.profile.tagset?.tags ?? [],
      references: (post.profile.references ?? []).map(ref => ({
        id: ref.id,
        title: ref.name,
        url: ref.uri,
        description: ref.description ?? '',
      })),
    });
    setIsDirty(false);
    setErrors({});
    prefilledPostIdRef.current = post.id;
  }, [mode, post, open]);

  const updateField = <K extends keyof PostContributionFormValues>(field: K, value: PostContributionFormValues[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field as keyof FieldErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const [createPost, { loading: creating }] = useCreatePostOnCalloutMutation();
  const [updatePost, { loading: updating }] = useUpdatePostMutation();
  const [deleteContribution] = useDeleteContributionMutation();
  const [createReferenceOnProfile] = useCreateReferenceOnProfileMutation();
  const [deleteReference] = useDeleteReferenceMutation();

  const validate = (): boolean => {
    try {
      postContributionFormSchema.validateSync(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        const next: FieldErrors = {};
        for (const inner of err.inner) {
          if (!inner.path) continue;
          if (inner.path === 'displayName' || inner.path === 'description') {
            // Yup messages from our shared validators are either translation keys (strings)
            // or { message, ...interpolations } objects — translate them via the i18n helper.
            const message = inner.message as unknown;
            next[inner.path as keyof FieldErrors] =
              translateValidation(message as Parameters<typeof translateValidation>[0]) ?? '';
          }
        }
        setErrors(next);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (mode === 'create') {
      const { data: createData } = await createPost({
        variables: {
          calloutId,
          post: {
            profileData: {
              displayName: values.displayName.trim(),
              description: values.description,
            },
            tags: values.tags,
          },
        },
        refetchQueries: ['CalloutDetails', 'CalloutContributions'],
        awaitRefetchQueries: true,
      });
      const created = createData?.createContributionOnCallout.post;
      if (created) onCreated?.({ id: created.id });
      onOpenChange(false);
    } else if (mode === 'edit' && post) {
      // References — diff the form's `references` against the server's
      // `post.profile.references`. Rows without an `id` are brand-new and need
      // `createReferenceOnProfile`; original rows missing from the form are
      // deletions. Update-in-place isn't supported by the schema, so a row
      // whose title/url/description was edited is converted to delete+create
      // (matches MUI's post-edit dialog approach).
      const originalReferences = post.profile.references ?? [];
      const originalById = new Map(originalReferences.map(r => [r.id, r]));
      const currentIds = new Set(values.references.map(r => r.id).filter(Boolean) as string[]);

      // Existing rows whose content has changed → delete+recreate.
      const modifiedRows = values.references.filter((r): r is (typeof values.references)[number] & { id: string } => {
        if (!r.id) return false;
        const original = originalById.get(r.id);
        if (!original) return false;
        if (!r.title.trim() || !r.url.trim()) return false;
        return (
          original.name !== r.title.trim() ||
          original.uri !== ensureHttps(r.url) ||
          (original.description ?? '') !== r.description.trim()
        );
      });
      const modifiedIds = new Set(modifiedRows.map(r => r.id));
      const removedIds = originalReferences.map(r => r.id).filter(id => !currentIds.has(id) || modifiedIds.has(id));
      const newRows = values.references.filter(r => !r.id && r.title.trim() && r.url.trim());
      const rowsToCreate = [...newRows, ...modifiedRows];

      try {
        for (const refId of removedIds) {
          await deleteReference({ variables: { input: { ID: refId } } });
        }
        for (const row of rowsToCreate) {
          await createReferenceOnProfile({
            variables: {
              input: {
                profileID: post.profile.id,
                name: row.title.trim(),
                uri: ensureHttps(row.url),
                description: row.description.trim() || undefined,
              },
            },
          });
        }
      } catch (err) {
        logError(new Error('Post reference CRUD failed', { cause: err as Error }));
        notify(t('callout.referencesSaveFailed'), 'error');
      }

      await updatePost({
        variables: {
          input: {
            ID: post.id,
            profileData: {
              displayName: values.displayName.trim(),
              description: values.description,
              tagsets: tagsetId ? [{ ID: tagsetId, tags: values.tags }] : undefined,
            },
          },
        },
        refetchQueries: ['PostSettings'],
      });

      // Post-location move — runs AFTER the in-place update so the new
      // callout doesn't receive a stale-content version. MUI parity:
      // `CalloutContributionDialogPost` calls `moveContributionToCallout`
      // when the target callout differs from the current one.
      if (isMoveTargetChanged && contributionId && canMove) {
        try {
          await moveContributionToCallout({
            variables: { contributionId, calloutId: targetCalloutId },
            refetchQueries: ['CalloutContributions', 'CalloutDetails'],
          });
          await refetchSiblingCallouts();
          baselineCalloutIdRef.current = targetCalloutId;
          notify(t('postLocation.moved'), 'success');
        } catch (err) {
          logError(new Error('Post move failed', { cause: err as Error }));
          notify(t('postLocation.moveFailed'), 'error');
        }
      }

      notify(t('contribution.edit'), 'success');
      setIsDirty(false);
      onUpdated?.();
    }
  };

  const [handleDelete, deleting] = useLoadingState(async () => {
    if (mode !== 'edit' || !contributionId) return;
    await deleteContribution({
      variables: { contributionId },
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
      awaitRefetchQueries: true,
    });
    setDeleteConfirmOpen(false);
    onDeleted?.();
    onOpenChange(false);
  });

  const requestClose = () => {
    if (isDirty) {
      setCloseConfirmOpen(true);
    } else {
      onOpenChange(false);
    }
  };

  const submitting = creating || updating;
  const showCommentsSection = mode === 'edit' && Boolean(commentsRoom);
  const dialogTitle = mode === 'create' ? t('callout.createPost') : t('callout.editPost');

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={isOpen => {
          if (!isOpen) requestClose();
          else onOpenChange(true);
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription className="sr-only">{dialogTitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 min-w-0">
            {mode === 'edit' && loadingPost && !post && <Loading />}

            {(mode === 'create' || post) && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor={titleFieldId} className="text-body text-foreground">
                    {t('callout.postNameLabel')}
                  </Label>
                  <Input
                    id={titleFieldId}
                    value={values.displayName}
                    onChange={e => updateField('displayName', e.target.value)}
                    autoFocus={mode === 'create'}
                    disabled={submitting}
                    aria-invalid={!!errors.displayName}
                    aria-describedby={errors.displayName ? `${titleFieldId}-error` : undefined}
                  />
                  {errors.displayName && (
                    <p id={`${titleFieldId}-error`} className="text-caption text-destructive" aria-live="polite">
                      {errors.displayName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={descriptionFieldId} className="text-body text-foreground">
                    {t('callout.postDescriptionLabel')}
                  </Label>
                  <MarkdownEditor
                    value={values.description}
                    onChange={value => updateField('description', value)}
                    disabled={submitting}
                    placeholder={t('callout.postDescriptionPlaceholder')}
                    onImageUpload={markdownIntegration.onImageUpload}
                    iframeAllowedUrls={markdownIntegration.iframeAllowedUrls}
                    onError={markdownIntegration.onError}
                  />
                  {errors.description && (
                    <p className="text-caption text-destructive" aria-live="polite">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={tagsFieldId} className="text-body text-foreground">
                    {t('callout.postTagsLabel')}
                  </Label>
                  <TagsInput
                    value={values.tags}
                    onChange={tags => updateField('tags', tags)}
                    placeholder={t('forms.tagsPlaceholder')}
                    minLength={2}
                    formatTooShortErrorMessage={min => t('forms.tagsTooShort', { min })}
                  />
                </div>

                <ReferencesEditor
                  rows={values.references}
                  onChange={rows => updateField('references', rows)}
                  disabled={submitting}
                  onFileUpload={referenceUpload.onFileUpload}
                  uploadAccept={referenceUpload.accept}
                />

                {/* Post location — MUI parity (`post-edit.postLocation.*`). Rendered only
                    in edit mode when the user has `MovePost` privilege AND the parent
                    callouts-set has more than one post-collecting callout. The actual
                    move happens on Save (see `handleSubmit`). */}
                {mode === 'edit' && canMove && siblingCallouts.length > 1 && (
                  <div className="space-y-1.5">
                    <Label className="text-body text-foreground">{t('postLocation.label')}</Label>
                    <Select
                      value={targetCalloutId}
                      onValueChange={value => {
                        setTargetCalloutId(value);
                        setIsDirty(true);
                      }}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {siblingCallouts.map(sibling => (
                          <SelectItem key={sibling.id} value={sibling.id}>
                            {sibling.framing.profile.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-caption text-muted-foreground">{t('postLocation.warning')}</p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
            <div>
              {mode === 'edit' && canDelete && (
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={submitting || deleting}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4 mr-1.5" aria-hidden="true" />
                  {t('callout.postDelete')}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={requestClose} disabled={submitting || deleting}>
                {t('dialogs.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || deleting} aria-busy={submitting}>
                {submitting && <Loader2 aria-hidden="true" className="mr-1.5 size-4 animate-spin" />}
                {mode === 'create' ? t('callout.postCreate') : t('callout.postSave')}
              </Button>
            </div>
          </DialogFooter>

          {showCommentsSection && commentsRoom && contributionId && (
            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <CalloutCommentsConnector
                roomId={commentsRoom.id}
                contributionId={contributionId}
                roomData={commentsRoom}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        title={t('callout.postUnsavedCloseTitle')}
        description={t('callout.postUnsavedCloseDescription')}
        confirmLabel={t('callout.postUnsavedCloseConfirm')}
        cancelLabel={t('callout.postUnsavedCloseCancel')}
        variant="destructive"
        onConfirm={() => {
          setCloseConfirmOpen(false);
          onOpenChange(false);
        }}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('callout.postDeleteConfirmTitle')}
        description={t('callout.postDeleteConfirmDescription')}
        confirmLabel={t('callout.postDelete')}
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
