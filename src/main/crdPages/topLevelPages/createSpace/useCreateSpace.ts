import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  useDefaultVisualTypeConstraintsQuery,
  useTemplateContentLazyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { VisualType } from '@/core/apollo/generated/graphql-schema';
import { info, TagCategoryValues } from '@/core/logging/sentry/log';
import useNavigate from '@/core/routing/useNavigate';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { NAMEID_MAX_LENGTH } from '@/core/ui/forms/validator/nameIdValidator';
import { useNotification } from '@/core/ui/notifications/useNotification';
import createNameId from '@/core/utils/nameId/createNameId';
import type { ImageCropConfig } from '@/crd/components/common/ImageCropDialog';
import type { CreateSpaceFieldErrors, CreateSpaceFormValues } from '@/crd/components/space/CreateSpaceDialog';
import type { TemplateContent, TemplatePickerSelectProps } from '@/crd/components/templates/types';
import { useSpacePlans } from '@/domain/space/components/CreateSpace/hooks/spacePlans/useSpacePlans';
import { useSpaceCreation } from '@/domain/space/components/CreateSpace/hooks/useSpaceCreation/useSpaceCreation';
import { addSpaceWelcomeCache } from '@/domain/space/components/CreateSpace/utils';
import { mapTemplateContent } from '@/main/crdPages/templates/templateContentMapper';
import { useTemplatePicker } from '@/main/crdPages/templates/useTemplatePicker';
import type { VisualConstraints } from '@/main/crdPages/topLevelPages/spaceSettings/subspaces/resizeImageToConstraints';
import { useDashboardSpaces } from '@/main/topLevelPages/myDashboard/DashboardWithMemberships/DashboardSpaces/useDashboardSpaces';

/** The number of innovation-flow states a Space template must have to seed an L0 Space (parity with the MUI selector). */
const REQUIRED_FLOW_STATES = 4;

export type CreatedSpaceResult = {
  id: string;
  about: { profile: { url: string } };
};

export type UseCreateSpaceOptions = {
  /** Controlled open state — owned by the account tab and passed through the connector. */
  open: boolean;
  /** Target account the Space is created in (user's own, or an organization's). */
  accountId: string | undefined;
  /** Closes the dialog (resets the owner's open state). Called on cancel and on success. */
  onClose: () => void;
  /** When provided, the caller handles the created Space; otherwise the hook navigates to it. */
  onSpaceCreated?: (space: CreatedSpaceResult) => void;
};

/** A banner/card image awaiting crop in the ImageCropDialog. */
export type CreateSpacePendingCrop = {
  key: 'bannerFile' | 'cardBannerFile';
  file: File;
  config: ImageCropConfig;
};

export type UseCreateSpaceResult = {
  values: CreateSpaceFormValues;
  errors: CreateSpaceFieldErrors;
  /** Non-null while a picked banner/card image is being cropped — drives the ImageCropDialog. */
  pendingCrop: CreateSpacePendingCrop | null;
  onCropComplete: (file: File, altText: string) => void;
  onCropCancel: () => void;
  picker: TemplatePickerSelectProps;
  onOpenTemplatePicker: () => void;
  onClearTemplate: () => void;
  selectedTemplateName: string | undefined;
  selectedTemplateContent: TemplateContent | undefined;
  selectedTemplateLoading: boolean;
  overwriteConfirmOpen: boolean;
  onConfirmOverwriteTemplate: () => void;
  onCancelOverwriteTemplate: () => void;
  bannerConstraints: VisualConstraints | null;
  cardBannerConstraints: VisualConstraints | null;
  submitting: boolean;
  canSubmit: boolean;
  noPlanAvailable: boolean;
  onChange: (patch: Partial<CreateSpaceFormValues>) => void;
  onSubmit: () => Promise<void>;
};

const EMPTY_VALUES: CreateSpaceFormValues = {
  displayName: '',
  nameId: '',
  tagline: '',
  description: '',
  tags: [],
  spaceTemplateId: '',
  bannerFile: null,
  cardBannerFile: null,
  addTutorialCallouts: false,
  acceptedTerms: false,
};

/**
 * Drives the CRD CreateSpaceDialog. The L0 sibling of {@link useCreateSubspace}:
 * same template-picker / image-resize / yup-on-submit machinery, plus account
 * scoping, license-plan selection, URL-slug derivation, and the post-create
 * navigate/cache/log side-effects of the MUI `CreateSpace` container.
 */
export function useCreateSpace({
  open,
  accountId,
  onClose,
  onSpaceCreated,
}: UseCreateSpaceOptions): UseCreateSpaceResult {
  const { t } = useTranslation('crd-createSpace');
  const notify = useNotification();
  const navigate = useNavigate();
  // Monotonic counter guarding against out-of-order template fetches: only the
  // most recent applyTemplate() call is allowed to write selection state.
  const templateRequestSeqRef = useRef(0);

  const [values, setValues] = useState<CreateSpaceFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<CreateSpaceFieldErrors>({});
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const [selectedTemplateName, setSelectedTemplateName] = useState<string | undefined>(undefined);
  const [selectedTemplateContent, setSelectedTemplateContent] = useState<TemplateContent | undefined>(undefined);
  const [selectedTemplateLoading, setSelectedTemplateLoading] = useState(false);
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [overwriteConfirmOpen, setOverwriteConfirmOpen] = useState(false);
  const [pendingCrop, setPendingCrop] = useState<CreateSpacePendingCrop | null>(null);
  // Alt text entered in the crop dialog, kept per visual until submit (the
  // presentational dialog never edits it, so it lives here, not in form values).
  const [visualAltText, setVisualAltText] = useState<Record<'bannerFile' | 'cardBannerFile', string>>({
    bannerFile: '',
    cardBannerFile: '',
  });

  const { refetchSpaces } = useDashboardSpaces();
  const { createSpace, loading: submitting } = useSpaceCreation({
    refetchQueries: ['AccountInformation'],
    onCompleted: () => refetchSpaces(),
    awaitRefetchQueries: true,
  });

  const { availablePlans, loading: plansLoading } = useSpacePlans({
    accountId,
    skip: !open || !accountId,
  });
  const licensePlanId = availablePlans[0]?.id;
  const noPlanAvailable = open && !plansLoading && Boolean(accountId) && availablePlans.length === 0;

  const templatePicker = useTemplatePicker({ allowedTypes: ['space'], accountId });

  const { data: bannerConstraintsData } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.Banner },
    skip: !open,
  });
  const { data: cardBannerConstraintsData } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.Card },
    skip: !open,
  });

  const bannerConstraints: VisualConstraints | null = bannerConstraintsData?.platform.configuration
    .defaultVisualTypeConstraints
    ? { ...bannerConstraintsData.platform.configuration.defaultVisualTypeConstraints }
    : null;
  const cardBannerConstraints: VisualConstraints | null = cardBannerConstraintsData?.platform.configuration
    .defaultVisualTypeConstraints
    ? { ...cardBannerConstraintsData.platform.configuration.defaultVisualTypeConstraints }
    : null;

  const [getTemplateContent] = useTemplateContentLazyQuery();

  const validationSchema = yup.object().shape({
    displayName: yup.string().trim().min(3, 'min3').max(SMALL_TEXT_LENGTH, 'maxSmall').required('required'),
    nameId: yup
      .string()
      .trim()
      .min(3, 'min3')
      .max(NAMEID_MAX_LENGTH, 'maxNameId')
      .matches(/^[a-z0-9-]*$/, 'slugInvalid')
      .required('slugRequired'),
    tagline: yup.string().max(SMALL_TEXT_LENGTH, 'maxSmall').notRequired(),
    description: yup.string().max(MARKDOWN_TEXT_LENGTH, 'maxMarkdown').notRequired(),
    tags: yup.array().of(yup.string().min(2)).notRequired(),
    spaceTemplateId: yup.string().notRequired(),
    acceptedTerms: yup.boolean().oneOf([true], 'acceptedTerms'),
  });

  const translateValidationMessage = (code: string): string => {
    switch (code) {
      case 'min3':
        return t('validation.min3');
      case 'maxSmall':
        return t('validation.maxSmall', { count: SMALL_TEXT_LENGTH });
      case 'maxNameId':
        return t('validation.maxSmall', { count: NAMEID_MAX_LENGTH });
      case 'maxMarkdown':
        return t('validation.maxMarkdown', { count: MARKDOWN_TEXT_LENGTH });
      case 'required':
        return t('validation.required');
      case 'slugRequired':
        return t('validation.slugRequired');
      case 'slugInvalid':
        return t('validation.slugInvalid');
      case 'acceptedTerms':
        return t('validation.acceptedTerms');
      default:
        return code;
    }
  };

  const validate = (): CreateSpaceFieldErrors => {
    try {
      validationSchema.validateSync(values, { abortEarly: false });
      return {};
    } catch (err) {
      const next: CreateSpaceFieldErrors = {};
      if (err instanceof yup.ValidationError) {
        for (const inner of err.inner) {
          if (inner.path && !next[inner.path as keyof CreateSpaceFormValues]) {
            next[inner.path as keyof CreateSpaceFormValues] = translateValidationMessage(inner.message);
          }
        }
      }
      return next;
    }
  };

  const isValid =
    values.displayName.trim().length >= 3 &&
    values.nameId.trim().length >= 3 &&
    /^[a-z0-9-]+$/.test(values.nameId.trim()) &&
    values.acceptedTerms &&
    Object.keys(validate()).length === 0;

  const canSubmit = isValid && Boolean(licensePlanId) && !noPlanAvailable && !submitting;

  const hasUserContent = () =>
    values.displayName.trim().length > 0 ||
    values.tagline.trim().length > 0 ||
    values.description.trim().length > 0 ||
    values.tags.length > 0 ||
    values.bannerFile !== null ||
    values.cardBannerFile !== null;

  const clearSelectedTemplate = () => {
    setSelectedTemplateName(undefined);
    setSelectedTemplateContent(undefined);
    setValues(prev => ({ ...prev, spaceTemplateId: '' }));
  };

  /**
   * Fetch the chosen Space template's content. Only templates whose captured
   * space has a complete 4-state innovation flow may seed an L0 Space (parity
   * with the MUI selector's `isTemplateSelectable`) — a non-conforming pick is
   * rejected here (the picker can't pre-filter: card data carries no flow info).
   * Otherwise: render the preview and pre-fill the form's text fields.
   */
  const applyTemplate = async (templateId: string) => {
    const requestSeq = ++templateRequestSeqRef.current;
    setSelectedTemplateLoading(true);
    try {
      const { data } = await getTemplateContent({ variables: { templateId, includeSpace: true } });
      // A newer selection has superseded this fetch — drop the stale response.
      if (requestSeq !== templateRequestSeqRef.current) return;
      const template = data?.lookup.template;
      if (!template) return;
      const mapped = mapTemplateContent(template, 'space');
      const flowStateCount = mapped.type === 'space' ? mapped.phases.length : 0;

      if (flowStateCount !== REQUIRED_FLOW_STATES) {
        notify(t('template.invalidFlow'), 'warning');
        templatePicker.clearSelection();
        setAppliedTemplateId(null);
        clearSelectedTemplate();
        return;
      }

      setSelectedTemplateName(template.profile.displayName);
      setSelectedTemplateContent(mapped);

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

      setValues(prev => {
        const nextDisplayName = displayName || prev.displayName;
        return {
          ...prev,
          spaceTemplateId: templateId,
          displayName: nextDisplayName,
          nameId: isSlugEdited ? prev.nameId : createNameId(nextDisplayName) || prev.nameId,
          tagline: tagline || prev.tagline,
          description: description || prev.description,
          tags: tags.length > 0 ? tags : prev.tags,
        };
      });
      setErrors({});
    } finally {
      if (requestSeq === templateRequestSeqRef.current) {
        setSelectedTemplateLoading(false);
      }
    }
  };

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
  }, [open, pickerSelectedId, appliedTemplateId, pendingTemplateId]);

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

  // A newly picked banner/card image opens the ImageCropDialog instead of going
  // straight into form state; the dialog crops + resizes to the constraints.
  const openCropFor = (key: 'bannerFile' | 'cardBannerFile', file: File) => {
    const constraints = key === 'bannerFile' ? bannerConstraints : cardBannerConstraints;
    if (constraints) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
      setPendingCrop({ key, file, config: toCropConfig(constraints) });
    } else {
      // Constraints not loaded yet — apply the raw file as a fallback.
      setValues(prev => ({ ...prev, [key]: file }));
    }
  };

  const onChange = (patch: Partial<CreateSpaceFormValues>) => {
    // Image patches always carry only the image key — route a fresh pick to the crop dialog.
    if (patch.bannerFile instanceof File) {
      openCropFor('bannerFile', patch.bannerFile);
      return;
    }
    if (patch.cardBannerFile instanceof File) {
      openCropFor('cardBannerFile', patch.cardBannerFile);
      return;
    }

    setValues(prev => {
      const next = { ...prev, ...patch };
      if ('displayName' in patch && !isSlugEdited) {
        next.nameId = createNameId(patch.displayName ?? '');
      }
      return next;
    });
    if ('nameId' in patch) {
      setIsSlugEdited(true);
    }
    setErrors(prev => {
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof CreateSpaceFormValues)[]) {
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
    // Invalidate any in-flight template fetch so its response can't write into the reset form.
    templateRequestSeqRef.current += 1;
    setValues(EMPTY_VALUES);
    setErrors({});
    setIsSlugEdited(false);
    setSelectedTemplateName(undefined);
    setSelectedTemplateContent(undefined);
    setAppliedTemplateId(null);
    setPendingTemplateId(null);
    setOverwriteConfirmOpen(false);
    setPendingCrop(null);
    setVisualAltText({ bannerFile: '', cardBannerFile: '' });
    templatePicker.clearSelection();
  };

  // Reset the form each time the dialog transitions closed → open.
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      reset();
    }
    prevOpenRef.current = open;
  }, [open]);

  const onSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!accountId || !licensePlanId) {
      return;
    }

    try {
      const result = await createSpace({
        accountId,
        nameId: values.nameId.trim(),
        licensePlanId,
        about: {
          profile: {
            displayName: values.displayName.trim(),
            tagline: values.tagline.trim(),
            description: values.description.trim() || undefined,
            tags: values.tags,
            visuals: {
              banner: values.bannerFile ? { file: values.bannerFile, altText: visualAltText.bannerFile } : undefined,
              cardBanner: values.cardBannerFile
                ? { file: values.cardBannerFile, altText: visualAltText.cardBannerFile }
                : undefined,
            },
          },
        },
        addTutorialCallouts: values.addTutorialCallouts,
        addCallouts: true,
        spaceTemplateId: values.spaceTemplateId || undefined,
      });

      const spaceId = result?.id;
      const spaceUrl = result?.about?.profile?.url;
      if (!spaceId || !spaceUrl) {
        notify(t('createError'), 'error');
        return;
      }

      addSpaceWelcomeCache(spaceId);
      info(`Space Created SpaceId:${spaceId}`, {
        category: TagCategoryValues.SPACE_CREATION,
        label: 'Space Created',
      });

      onClose();
      if (onSpaceCreated) {
        onSpaceCreated(result);
      } else {
        navigate(spaceUrl);
      }
    } catch {
      // Keep the dialog open with the user's input intact so they can retry.
      // Apollo's error link surfaces the server message as a notification.
    }
  };

  return {
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
    bannerConstraints,
    cardBannerConstraints,
    submitting,
    canSubmit,
    noPlanAvailable,
    onChange,
    onSubmit,
  };
}
