import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ValidationError } from 'yup';
import {
  useCalloutContributionCommentsQuery,
  useCreatePostOnCalloutMutation,
  useDeleteContributionMutation,
  usePostSettingsQuery,
  useUpdatePostMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Loading } from '@/crd/components/common/Loading';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
// MarkdownEditor lives at @/crd/forms/markdown/MarkdownEditor — non-collaborative editor (single-author posts).
import { MarkdownEditor } from '@/crd/forms/markdown/MarkdownEditor';
import { TagsInput } from '@/crd/forms/tags-input';
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
import useValidationMessageTranslation from '@/domain/shared/i18n/ValidationMessageTranslation/useValidationMessageTranslation';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { CalloutCommentsConnector } from '@/main/crdPages/space/callout/CalloutCommentsConnector';
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

  // Prefill from server data in edit mode.
  useEffect(() => {
    if (mode !== 'edit' || !post || !open) return;
    setValues({
      displayName: post.profile.displayName,
      description: post.profile.description ?? '',
      tags: post.profile.tagset?.tags ?? [],
      references: [],
    });
    setIsDirty(false);
    setErrors({});
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
      });
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
                  <TagsInput value={values.tags} onChange={tags => updateField('tags', tags)} />
                </div>
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
