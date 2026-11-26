import { ApolloError } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useCreateSubspaceRootQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import { error as logError } from '@/core/logging/sentry/log';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import type { ImageCropConfig } from '@/crd/components/common/ImageCropDialog';
import type {
  CreateSubspaceFieldErrors,
  CreateSubspaceFormValues,
} from '@/crd/components/space/settings/CreateSubspaceDialog';
import type { TemplateContent, TemplatePickerSelectProps } from '@/crd/components/templates/types';
import type { VisualConstraints } from '@/domain/common/visual/model/VisualModel';
import { useCreateDialogMarkdown } from '@/domain/space/components/CreateSpace/hooks/useCreateDialogMarkdown';
import { useSpaceVisualConstraints } from '@/domain/space/components/CreateSpace/hooks/useSpaceVisualConstraints';
import { useSubspaceCreation } from '@/domain/space/components/CreateSpace/hooks/useSubspaceCreation/useSubspaceCreation';
import { useSpaceTemplatePicker } from '@/main/crdPages/templates/spaceTemplates/useSpaceTemplatePicker';
import { useSubspaceDefaultTemplate } from '@/main/crdPages/templates/spaceTemplates/useSubspaceDefaultTemplate';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

/** An avatar/card image awaiting crop in the ImageCropDialog. */
export type CreateSubspacePendingCrop = {
  key: 'avatarFile' | 'cardBannerFile';
  file: File;
  config: ImageCropConfig;
};

export type UseCreateSubspaceResult = {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  values: CreateSubspaceFormValues;
  errors: CreateSubspaceFieldErrors;
  /** Non-null while a picked avatar/card image is being cropped — drives the ImageCropDialog. */
  pendingCrop: CreateSubspacePendingCrop | null;
  onCropComplete: (file: File, altText: string) => void;
  onCropCancel: () => void;
  /** Props for the shared `TemplatePicker` (`mode: 'select'`) — the consumer renders `<TemplatePicker {...picker} />`. */
  picker: TemplatePickerSelectProps;
  onOpenTemplatePicker: () => void;
  onClearTemplate: () => void;
  selectedTemplateName: string | undefined;
  selectedTemplateContent: TemplateContent | undefined;
  selectedTemplateLoading: boolean;
  overwriteConfirmOpen: boolean;
  onConfirmOverwriteTemplate: () => void;
  onCancelOverwriteTemplate: () => void;
  submitting: boolean;
  canSubmit: boolean;
  avatarConstraints: VisualConstraints | null;
  cardBannerConstraints: VisualConstraints | null;
  onChange: (patch: Partial<CreateSubspaceFormValues>) => void;
  onSubmit: () => Promise<void>;
  /** The description editor's integration before the subspace exists (useCreateDialogMarkdown). */
  markdown: ReturnType<typeof useCreateDialogMarkdown>;
};

const EMPTY_VALUES: CreateSubspaceFormValues = {
  displayName: '',
  tagline: '',
  description: '',
  tags: [],
  spaceTemplateId: '',
  avatarFile: null,
  cardBannerFile: null,
};

/**
 * Drives the CRD CreateSubspaceDialog. Matches the MUI `useSubspaceCreation`
 * data flow (same underlying mutation + visual upload pipeline) but without
 * Formik — state is held locally and validated via yup on submit.
 *
 * The Space-template selector is the shared {@link useTemplatePicker} (`mode: 'select'`,
 * `allowedTypes: ['space']`). Picking a template re-fetches its content, renders a
 * preview, and pre-fills the form's text fields — guarded by an overwrite-confirm
 * dialog when the form already holds user data. The space's configured default
 * subspace template (if any) is pre-selected when the dialog opens.
 */
export function useCreateSubspace(spaceId: string): UseCreateSubspaceResult {
  const { t } = useTranslation('crd-spaceSettings');
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CreateSubspaceFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<CreateSubspaceFieldErrors>({});

  const [selectedTemplateName, setSelectedTemplateName] = useState<string | undefined>(undefined);
  const [selectedTemplateContent, setSelectedTemplateContent] = useState<TemplateContent | undefined>(undefined);
  const [selectedTemplateLoading, setSelectedTemplateLoading] = useState(false);
  // The picker's `selectedTemplateId` we've already reconciled into form state — guards the effect below.
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const [pendingCrop, setPendingCrop] = useState<CreateSubspacePendingCrop | null>(null);
  // Alt text entered in the crop dialog, kept per visual until submit.
  const [visualAltText, setVisualAltText] = useState<Record<'avatarFile' | 'cardBannerFile', string>>({
    avatarFile: '',
    cardBannerFile: '',
  });

  // 023 FR-020 "After the subspace submit": each mounted view re-reads through its own read;
  // the parent's subspace list is NativeSubspaces (RF1).
  const { createSubspace, loading: submitting } = useSubspaceCreation({
    refetchQueries: ['NativeSubspaces'],
    awaitRefetchQueries: true,
  });

  // item9 "Who sends what": scope = the root (L0) space; the account source is the root's hosting account.
  const { levelZeroSpaceId } = useUrlResolver();
  const rootSpaceId = levelZeroSpaceId ?? spaceId;
  const { data: rootData } = useCreateSubspaceRootQuery({
    variables: { root: rootSpaceId },
    skip: !open || !rootSpaceId,
  });
  const rootNode = rootData?.node;
  const accountId = rootNode && 'host' in rootNode ? (rootNode.host?.account?.id ?? undefined) : undefined;
  const templatePicker = useSpaceTemplatePicker({ rootSpaceId, accountId });
  const defaultTemplate = useSubspaceDefaultTemplate(rootSpaceId, !open);
  // True from opening until the root's default has been read and, when there is one, applied (FR-020 preselect).
  const [preselectPending, setPreselectPending] = useState(false);
  const handleError = useApolloErrorHandler();
  const markdown = useCreateDialogMarkdown();

  const { constraintsFor } = useSpaceVisualConstraints({ skip: !open });
  const avatarConstraints = constraintsFor('avatar');
  const cardBannerConstraints = constraintsFor('card');

  // Messages are keys resolved via t() in `validate()` so yup never carries
  // user-visible English literals.
  const validationSchema = yup.object().shape({
    displayName: yup.string().trim().min(3, 'min3').max(SMALL_TEXT_LENGTH, 'maxSmall').required('required'),
    tagline: yup.string().max(SMALL_TEXT_LENGTH, 'maxSmall').notRequired(),
    description: yup.string().max(MARKDOWN_TEXT_LENGTH, 'maxMarkdown').notRequired(),
    tags: yup.array().of(yup.string().min(2)).notRequired(),
    spaceTemplateId: yup.string().notRequired(),
  });

  const translateValidationMessage = (code: string): string => {
    switch (code) {
      case 'min3':
        return t('subspaces.createDialog.validation.min3');
      case 'maxSmall':
        return t('subspaces.createDialog.validation.maxSmall', { count: SMALL_TEXT_LENGTH });
      case 'maxMarkdown':
        return t('subspaces.createDialog.validation.maxMarkdown', { count: MARKDOWN_TEXT_LENGTH });
      case 'required':
        return t('subspaces.createDialog.validation.required');
      default:
        return code;
    }
  };

  const validate = (): CreateSubspaceFieldErrors => {
    try {
      validationSchema.validateSync(values, { abortEarly: false });
      return {};
    } catch (err) {
      const next: CreateSubspaceFieldErrors = {};
      if (err instanceof yup.ValidationError) {
        for (const inner of err.inner) {
          if (inner.path && !next[inner.path as keyof CreateSubspaceFormValues]) {
            next[inner.path as keyof CreateSubspaceFormValues] = translateValidationMessage(inner.message);
          }
        }
      }
      return next;
    }
  };

  const isValid = values.displayName.trim().length >= 3 && Object.keys(validate()).length === 0;

  const hasUserContent = () =>
    values.displayName.trim().length > 0 ||
    values.tagline.trim().length > 0 ||
    values.description.trim().length > 0 ||
    values.tags.length > 0 ||
    values.avatarFile !== null ||
    values.cardBannerFile !== null;

  const clearSelectedTemplate = () => {
    setSelectedTemplateName(undefined);
    setSelectedTemplateContent(undefined);
    setValues(prev => ({ ...prev, spaceTemplateId: '' }));
  };

  /**
   * Fetch the chosen Space template's content: render its preview and pre-fill
   * the form's text fields. Prefers the captured-space snapshot (`contentSpace`)
   * for rich content, falling back to the template's own profile metadata when
   * the snapshot fields are empty (templates created from thinly-populated
   * subspaces often have blank tagline/description/tags on the snapshot).
   */
  const applyTemplate = async (templateId: string) => {
    setSelectedTemplateLoading(true);
    try {
      const fetched = await templatePicker.fetchSpaceTemplate(templateId);
      if (!fetched) return;
      const { templateName, displayName, tagline, description, tags } = fetched.prefill;
      setSelectedTemplateName(templateName);
      setSelectedTemplateContent(fetched.content);
      setValues(prev => ({
        ...prev,
        spaceTemplateId: templateId,
        displayName: displayName || prev.displayName,
        tagline: tagline || prev.tagline,
        description: description || prev.description,
        tags: tags.length > 0 ? tags : prev.tags,
      }));
      setErrors({});
    } catch (error) {
      // The read failed: show it and hold no template, so nothing unpreviewed is submitted.
      if (error instanceof ApolloError) handleError(error);
      else logError(error instanceof Error ? error : new Error(String(error)));
      templatePicker.clearSelection();
      setAppliedTemplateId(null);
      clearSelectedTemplate();
    } finally {
      setSelectedTemplateLoading(false);
    }
  };

  // React to the picker's selection. A null selection (the picker's "No
  // template" footer button, and the picker's initial state) is ignored here —
  // the dialog's own "use blank" affordance clears the selection instead.
  const pickerSelectedId = templatePicker.selectedTemplateId;
  useEffect(() => {
    if (!open || pickerSelectedId === null) return;
    if (pickerSelectedId === appliedTemplateId || pickerSelectedId === pendingTemplateId) return;
    if (hasUserContent()) {
      setPendingTemplateId(pickerSelectedId);
      setOverwriteConfirmOpen(true);
    } else {
      setAppliedTemplateId(pickerSelectedId);
      void applyTemplate(pickerSelectedId);
    }
  }, [open, pickerSelectedId, appliedTemplateId, pendingTemplateId, hasUserContent, applyTemplate]);

  const onConfirmOverwriteTemplate = () => {
    if (pendingTemplateId === null) return;
    const id = pendingTemplateId;
    setAppliedTemplateId(id);
    setPendingTemplateId(null);
    setOverwriteConfirmOpen(false);
    void applyTemplate(id);
  };

  const onCancelOverwriteTemplate = () => {
    templatePicker.clearSelection();
    setPendingTemplateId(null);
    setOverwriteConfirmOpen(false);
  };

  const onClearTemplate = () => {
    templatePicker.clearSelection();
    setAppliedTemplateId(null);
    clearSelectedTemplate();
  };

  const toCropConfig = (c: VisualConstraints): ImageCropConfig => ({
    aspectRatio: c.aspectRatio,
    maxWidth: c.maxWidth,
    maxHeight: c.maxHeight,
    minWidth: c.minWidth,
    minHeight: c.minHeight,
  });

  // A newly picked avatar/card image opens the ImageCropDialog instead of going
  // straight into form state; the dialog crops + resizes to the constraints.
  const openCropFor = (key: 'avatarFile' | 'cardBannerFile', file: File) => {
    const constraints = key === 'avatarFile' ? avatarConstraints : cardBannerConstraints;
    if (constraints) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
      setPendingCrop({ key, file, config: toCropConfig(constraints) });
    } else {
      setValues(prev => ({ ...prev, [key]: file }));
    }
  };

  const onChange = (patch: Partial<CreateSubspaceFormValues>) => {
    // Image patches always carry only the image key — route a fresh pick to the crop dialog.
    if (patch.avatarFile instanceof File) {
      openCropFor('avatarFile', patch.avatarFile);
      return;
    }
    if (patch.cardBannerFile instanceof File) {
      openCropFor('cardBannerFile', patch.cardBannerFile);
      return;
    }

    setValues(prev => ({ ...prev, ...patch }));
    // Clear only the errors for changed fields so the user sees updated state.
    setErrors(prev => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof CreateSubspaceFormValues)[]) {
        delete next[key];
      }
      return next;
    });
  };

  const onCropComplete = (file: File, altText: string) => {
    const crop = pendingCrop;
    setPendingCrop(null);
    if (!crop) return;
    setValues(prev => ({ ...prev, [crop.key]: file }));
    setVisualAltText(prev => ({ ...prev, [crop.key]: altText }));
  };

  const onCropCancel = () => setPendingCrop(null);

  const reset = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
    setSelectedTemplateName(undefined);
    setSelectedTemplateContent(undefined);
    setPendingTemplateId(null);
    setOverwriteConfirmOpen(false);
    setPendingCrop(null);
    setVisualAltText({ avatarFile: '', cardBannerFile: '' });
    templatePicker.clearSelection();
  };

  const openDialog = () => {
    reset();
    setAppliedTemplateId(null);
    setPreselectPending(true);
    setOpen(true);
  };

  // FR-020 "Default preselect": the root's subspace_default, read when the dialog opens, is preselected,
  // previewed and submitted; a masked or absent binding preselects nothing and the submit omits `template`.
  const defaultTemplateId = defaultTemplate.templateId;
  useEffect(() => {
    if (!open || !preselectPending || defaultTemplate.loading) return;
    setPreselectPending(false);
    // A template the user picked before the default arrived wins.
    if (!defaultTemplateId || appliedTemplateId !== null || pendingTemplateId !== null) return;
    setAppliedTemplateId(defaultTemplateId);
    setValues(prev => ({ ...prev, spaceTemplateId: defaultTemplateId }));
    void applyTemplate(defaultTemplateId);
  }, [open, preselectPending, defaultTemplate.loading, defaultTemplateId]);

  const closeDialog = () => {
    setPreselectPending(false);
    setOpen(false);
  };

  const onSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createSubspace({
        parentId: spaceId,
        profile: {
          displayName: values.displayName.trim(),
          tagline: values.tagline.trim(),
          description: values.description.trim() || undefined,
          tags: values.tags,
        },
        visuals: {
          avatar: values.avatarFile ? { file: values.avatarFile, altText: visualAltText.avatarFile } : undefined,
          card: values.cardBannerFile
            ? { file: values.cardBannerFile, altText: visualAltText.cardBannerFile }
            : undefined,
        },
        spaceTemplateId: values.spaceTemplateId || undefined,
      });
    } catch {
      // Keep the dialog open with the user's input; useSubspaceCreation has shown the refusal.
      return;
    }

    closeDialog();
  };

  return {
    open,
    openDialog,
    closeDialog,
    values,
    errors,
    pendingCrop,
    onCropComplete,
    onCropCancel,
    picker: templatePicker.pickerProps,
    onOpenTemplatePicker: templatePicker.openPicker,
    onClearTemplate,
    selectedTemplateName,
    selectedTemplateContent,
    selectedTemplateLoading,
    overwriteConfirmOpen,
    onConfirmOverwriteTemplate,
    onCancelOverwriteTemplate,
    submitting,
    canSubmit: isValid && !submitting,
    avatarConstraints,
    cardBannerConstraints,
    onChange,
    onSubmit,
    markdown,
  };
}
