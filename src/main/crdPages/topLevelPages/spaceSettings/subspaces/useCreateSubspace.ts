import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  refetchSubspacesInSpaceQuery,
  useDefaultVisualTypeConstraintsQuery,
  useSpaceContentTemplatesOnSpaceQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import type {
  CreateSubspaceFieldErrors,
  CreateSubspaceFormValues,
  CreateSubspaceTemplateChoice,
} from '@/crd/components/space/settings/CreateSubspaceDialog';
import { useSubspaceCreation } from '@/domain/space/components/CreateSpace/hooks/useSubspaceCreation/useSubspaceCreation';
import { resizeImageToConstraints, type VisualConstraints } from './resizeImageToConstraints';

export type UseCreateSubspaceResult = {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  values: CreateSubspaceFormValues;
  errors: CreateSubspaceFieldErrors;
  templates: CreateSubspaceTemplateChoice[];
  templatesLoading: boolean;
  submitting: boolean;
  canSubmit: boolean;
  avatarConstraints: VisualConstraints | null;
  cardBannerConstraints: VisualConstraints | null;
  onChange: (patch: Partial<CreateSubspaceFormValues>) => void;
  onSubmit: () => Promise<void>;
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
 */
export function useCreateSubspace(spaceId: string): UseCreateSubspaceResult {
  const { t } = useTranslation('crd-spaceSettings');
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CreateSubspaceFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<CreateSubspaceFieldErrors>({});

  const { createSubspace, loading: submitting } = useSubspaceCreation({
    refetchQueries: [refetchSubspacesInSpaceQuery({ spaceId })],
    awaitRefetchQueries: true,
  });

  const { data: templatesData, loading: templatesLoading } = useSpaceContentTemplatesOnSpaceQuery({
    variables: { spaceId },
    skip: !spaceId || !open,
  });

  const { data: avatarConstraintsData } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.Avatar },
    skip: !open,
  });
  const { data: cardBannerConstraintsData } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.Card },
    skip: !open,
  });

  const avatarConstraints: VisualConstraints | null = avatarConstraintsData?.platform.configuration
    .defaultVisualTypeConstraints
    ? { ...avatarConstraintsData.platform.configuration.defaultVisualTypeConstraints }
    : null;
  const cardBannerConstraints: VisualConstraints | null = cardBannerConstraintsData?.platform.configuration
    .defaultVisualTypeConstraints
    ? { ...cardBannerConstraintsData.platform.configuration.defaultVisualTypeConstraints }
    : null;

  const [getTemplateContent] = useTemplateContentLazyQuery();

  const templates =
    templatesData?.lookup.space?.templatesManager?.templatesSet?.spaceTemplates.map(tmpl => ({
      id: tmpl.id,
      name: tmpl.profile.displayName,
    })) ?? [];

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        displayName: yup
          .string()
          .trim()
          .min(3, 'Must be at least 3 characters')
          .max(SMALL_TEXT_LENGTH, `Must be ${SMALL_TEXT_LENGTH} characters or fewer`)
          .required('Name is required'),
        tagline: yup.string().max(SMALL_TEXT_LENGTH, `Must be ${SMALL_TEXT_LENGTH} characters or fewer`).notRequired(),
        description: yup
          .string()
          .max(MARKDOWN_TEXT_LENGTH, `Must be ${MARKDOWN_TEXT_LENGTH} characters or fewer`)
          .notRequired(),
        tags: yup.array().of(yup.string().min(2)).notRequired(),
        spaceTemplateId: yup.string().notRequired(),
      }),
    []
  );

  const validate = (): CreateSubspaceFieldErrors => {
    try {
      validationSchema.validateSync(values, { abortEarly: false });
      return {};
    } catch (err) {
      const next: CreateSubspaceFieldErrors = {};
      if (err instanceof yup.ValidationError) {
        for (const inner of err.inner) {
          if (inner.path && !next[inner.path as keyof CreateSubspaceFormValues]) {
            next[inner.path as keyof CreateSubspaceFormValues] = inner.message;
          }
        }
      }
      return next;
    }
  };

  const isValid = values.displayName.trim().length >= 3 && Object.keys(validate()).length === 0;

  const applyImageResize = async (
    key: 'avatarFile' | 'cardBannerFile',
    source: File,
    constraints: VisualConstraints | null
  ) => {
    if (!constraints) return;
    const result = await resizeImageToConstraints(source, constraints);
    if (result.ok) {
      setValues(prev => ({ ...prev, [key]: result.file }));
    } else {
      const message =
        result.reason === 'tooSmall'
          ? t('subspaces.createDialog.visuals.tooSmall', {
              defaultValue: 'Image is too small. Minimum {{width}} × {{height}} px required.',
              width: constraints.minWidth,
              height: constraints.minHeight,
            })
          : t('subspaces.createDialog.visuals.loadFailed', { defaultValue: 'Failed to read image file.' });
      setValues(prev => ({ ...prev, [key]: null }));
      setErrors(prev => ({ ...prev, [key]: message }));
    }
  };

  const onChange = (patch: Partial<CreateSubspaceFormValues>) => {
    setValues(prev => ({ ...prev, ...patch }));
    // Clear only the errors for changed fields so the user sees updated state.
    setErrors(prev => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof CreateSubspaceFormValues)[]) {
        delete next[key];
      }
      return next;
    });

    // When a fresh image is picked, center-crop + resize it to match the backend's
    // visual constraints before storing it. The optimistic `setValues` above puts
    // the raw file in state so the preview renders immediately; this async swap
    // replaces it with the resized version as soon as it's ready.
    if ('avatarFile' in patch && patch.avatarFile instanceof File) {
      void applyImageResize('avatarFile', patch.avatarFile, avatarConstraints);
    }
    if ('cardBannerFile' in patch && patch.cardBannerFile instanceof File) {
      void applyImageResize('cardBannerFile', patch.cardBannerFile, cardBannerConstraints);
    }

    // When the user picks a template, fetch its content and pre-fill the form's
    // text fields. Picking "No template" (empty id) is left alone — we don't
    // reset a form the user may have already edited.
    if (patch.spaceTemplateId && patch.spaceTemplateId.length > 0) {
      const templateId = patch.spaceTemplateId;
      void getTemplateContent({ variables: { templateId, includeSpace: true } }).then(({ data }) => {
        const template = data?.lookup.template;
        if (!template) return;
        // Prefer the snapshot of the original space (contentSpace) for rich content,
        // but fall back to the template's own profile metadata when the snapshot
        // fields are empty — templates created from thinly-populated subspaces
        // often have blank tagline/description/tags on the snapshot, and the
        // template-level profile is what the user actually saw when choosing it.
        const contentProfile = template.contentSpace?.about?.profile;
        const templateProfile = template.profile;

        const contentTagset =
          contentProfile?.tagsets?.find(ts => ts.name === 'default' || ts.type === 'FREEFORM') ??
          contentProfile?.tagsets?.[0];
        const contentTags = contentTagset?.tags ?? [];
        const templateTags = templateProfile?.defaultTagset?.tags ?? [];

        const displayName = contentProfile?.displayName || templateProfile?.displayName || '';
        const tagline = contentProfile?.tagline || '';
        const description = contentProfile?.description || templateProfile?.description || '';
        const tags = contentTags.length > 0 ? contentTags : templateTags;

        setValues(prev => ({
          ...prev,
          displayName: displayName || prev.displayName,
          tagline: tagline || prev.tagline,
          description: description || prev.description,
          tags: tags.length > 0 ? tags : prev.tags,
        }));
        // Drop any stale errors on the pre-filled fields.
        setErrors({});
      });
    }
  };

  const reset = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
  };

  const openDialog = () => {
    reset();
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const onSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    await createSubspace({
      spaceID: spaceId,
      about: {
        profile: {
          displayName: values.displayName.trim(),
          tagline: values.tagline.trim(),
          description: values.description.trim() || undefined,
          tags: values.tags,
          visuals: {
            avatar: values.avatarFile ? { file: values.avatarFile, altText: '' } : undefined,
            cardBanner: values.cardBannerFile ? { file: values.cardBannerFile, altText: '' } : undefined,
          },
        },
      },
      addTutorialCallouts: false,
      addCallouts: true,
      spaceTemplateId: values.spaceTemplateId || undefined,
    });

    closeDialog();
  };

  return {
    open,
    openDialog,
    closeDialog,
    values,
    errors,
    templates,
    templatesLoading,
    submitting,
    canSubmit: isValid && !submitting,
    avatarConstraints,
    cardBannerConstraints,
    onChange,
    onSubmit,
  };
}
