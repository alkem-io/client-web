import type { ReactNode } from 'react';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreateTemplateFromSpaceMutation,
  useCreateTemplateMutation,
  useUpdateCalloutTemplateMutation,
  useUpdateCommunityGuidelinesMutation,
  useUpdateTemplateMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  type CreateProfileInput,
  type CreateReferenceInput,
  TemplateType as GqlTemplateType,
} from '@/core/apollo/generated/graphql-schema';
import { CommunityGuidelinesTemplateForm } from '@/crd/components/templates/forms/CommunityGuidelinesTemplateForm';
import { PostTemplateForm } from '@/crd/components/templates/forms/PostTemplateForm';
import { SpaceTemplateForm } from '@/crd/components/templates/forms/SpaceTemplateForm';
import type {
  ReferenceRow,
  TemplateCommonValues,
  TemplateFormErrors,
  TemplateFormValues,
  TemplateType,
} from '@/crd/components/templates/types';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import useHandlePreviewImages from '@/domain/templates/utils/useHandlePreviewImages';
import {
  type CalloutFormValues,
  EMPTY_CALLOUT_FORM_VALUES,
  useCrdCalloutForm,
} from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { CalloutTemplateForm } from './CalloutTemplateForm';
import {
  type CalloutTemplateMapperFallbacks,
  calloutFormValuesToCreateCalloutInput,
  calloutFormValuesToUpdateCalloutEntityInput,
} from './calloutTemplateMapper';
import { WhiteboardTemplateFormConnector } from './WhiteboardTemplateFormConnector';

// ---------------------------------------------------------------------------
// Empty per-type values
// ---------------------------------------------------------------------------

const EMPTY_COMMON: TemplateCommonValues = { name: '', description: '', tags: [] };

function emptyValuesFor(type: TemplateType): TemplateFormValues {
  switch (type) {
    case 'post':
      return { ...EMPTY_COMMON, type: 'post', defaultDescription: '' };
    case 'whiteboard':
      return { ...EMPTY_COMMON, type: 'whiteboard', whiteboardContent: '' };
    case 'communityGuidelines':
      return { ...EMPTY_COMMON, type: 'communityGuidelines', title: '', guidelinesMarkdown: '', references: [] };
    case 'space':
      return { ...EMPTY_COMMON, type: 'space', recursive: true };
    case 'callout':
      return {
        ...EMPTY_COMMON,
        type: 'callout',
        framingKind: 'none',
        framingTitle: '',
        framingDescription: '',
        allowedContributionTypes: [],
        commentsEnabled: true,
      };
  }
}

// ---------------------------------------------------------------------------
// CRD form values → generated create-mutation inputs (no loose casts)
// ---------------------------------------------------------------------------

function toReferencesData(rows: ReferenceRow[]): CreateReferenceInput[] | undefined {
  if (rows.length === 0) return undefined;
  return rows.map((r, i) => ({
    name: r.name || `Reference ${i + 1}`,
    uri: r.uri || undefined,
    description: r.description || undefined,
  }));
}

function toProfileData(values: TemplateFormValues): CreateProfileInput {
  return { displayName: values.name, description: values.description || undefined };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export type UseTemplateFormsArgs = {
  templatesSetId: string | undefined;
  /** Parent space id — threaded through the Callout template form's `ResponseDefaultsConnector`. */
  spaceId?: string;
  /** Called after a successful create/update so the consumer can refetch / react. */
  onSaved?: () => void;
};

export type UseTemplateFormsResult = {
  open: boolean;
  intent: 'create' | 'edit';
  type: TemplateType;
  commonValue: TemplateCommonValues;
  commonErrors: TemplateFormErrors;
  onCommonChange: (next: TemplateCommonValues) => void;
  perTypeFormSlot: ReactNode;
  submitting: boolean;
  isDirty: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  /** Open the create dialog for a type (blank values). Callout delegates to `openCreateCallout()`. */
  openCreate: (type: TemplateType) => void;
  /** Open the create dialog pre-filled (used by the "save X as a template" flows). Not for callout — use `openCreateCallout`. */
  openCreatePrefilled: (values: TemplateFormValues) => void;
  /**
   * Open the edit dialog for an existing template, pre-filled. `subEntityId` is the id of the per-type
   * sub-entity that has its own update mutation (the CommunityGuidelines id for a CG template; unused otherwise).
   * Not for callout — use `openEditCallout`.
   */
  openEdit: (templateId: string, values: TemplateFormValues, subEntityId?: string) => void;
  /**
   * Fire the create mutation directly for an arbitrary values object (used by duplicate / import-from-library).
   * Not validated, not wrapped in a transition — the caller owns the spinner. Rejects on failure. Not for callout.
   */
  submitValues: (values: TemplateFormValues) => Promise<void>;
  // ── Callout-specific (the callout body lives in a dedicated `useCrdCalloutForm` instance) ──
  /** Open the create dialog for a Callout template, optionally pre-filled (used by Duplicate and "save callout as template"). */
  openCreateCallout: (prefill?: { common?: Partial<TemplateCommonValues>; body?: Partial<CalloutFormValues> }) => void;
  /** Open the edit dialog for an existing Callout template. `calloutId` is the template's underlying `Callout` id. */
  openEditCallout: (
    templateId: string,
    calloutId: string,
    common: Partial<TemplateCommonValues>,
    body: Partial<CalloutFormValues>
  ) => void;
  /** Fire the create-callout-template mutation directly (used by Duplicate / import-from-library). Rejects on failure. */
  submitCalloutCopy: (common: Partial<TemplateCommonValues>, body: Partial<CalloutFormValues>) => Promise<void>;
};

/**
 * Per-type template-form lifecycle (integration layer). Owns the form state, validation, and the
 * create/edit mutations; assembles the `perTypeFormSlot` and hands it to `TemplateFormDialog`.
 *
 * Post / Community Guidelines / Whiteboard / Space carry their values in `TemplateFormValues`; the
 * **Callout** body is large and reuses the live callout-authoring stack, so it lives in a dedicated
 * `useCrdCalloutForm` instance (rendered via `CalloutTemplateForm`). Space edit is profile-only
 * (re-capture isn't wired); CG edit can't add new references via that mutation (existing rows only).
 */
export function useTemplateForms({ templatesSetId, spaceId, onSaved }: UseTemplateFormsArgs): UseTemplateFormsResult {
  const { t } = useTranslation('crd-templates');
  const { t: tSpace } = useTranslation('crd-space');
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<'create' | 'edit'>('create');
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [editSubEntityId, setEditSubEntityId] = useState<string | null>(null);
  const [editCalloutId, setEditCalloutId] = useState<string | null>(null);
  const [values, setValues] = useState<TemplateFormValues>(() => emptyValuesFor('post'));
  const [errors, setErrors] = useState<TemplateFormErrors>({});
  const [pristine, setPristine] = useState(true);
  const [submitting, startSubmitting] = useTransition();
  const calloutForm = useCrdCalloutForm();
  // Preview screenshots the whiteboard editor generated on save (Whiteboard templates) — uploaded against
  // the template's profile visuals after the create/update mutation so the screenshot becomes the card image.
  const [whiteboardTemplatePreviewImages, setWhiteboardTemplatePreviewImages] = useState<WhiteboardPreviewImage[]>([]);
  const { handlePreviewTemplates } = useHandlePreviewImages();

  const [createTemplate] = useCreateTemplateMutation({ refetchQueries: ['AllTemplatesInTemplatesSet'] });
  const [createTemplateFromSpace] = useCreateTemplateFromSpaceMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });
  const [updateTemplate] = useUpdateTemplateMutation({ refetchQueries: ['AllTemplatesInTemplatesSet'] });
  const [updateCalloutTemplate] = useUpdateCalloutTemplateMutation({ refetchQueries: ['AllTemplatesInTemplatesSet'] });
  const [updateCommunityGuidelines] = useUpdateCommunityGuidelinesMutation({
    refetchQueries: ['AllTemplatesInTemplatesSet'],
  });

  const calloutFallbacks: CalloutTemplateMapperFallbacks = {
    whiteboardFallbackDisplayName: tSpace('callout.whiteboard'),
    collaboraFallbackDisplayName: tSpace('callout.defaultDocumentName'),
  };

  const commonValue: TemplateCommonValues = {
    name: values.name,
    description: values.description,
    tags: values.tags,
  };
  const onCommonChange = (next: TemplateCommonValues) => {
    setPristine(false);
    setValues(prev => ({ ...prev, ...next }));
  };
  const onPerTypeChange = (next: TemplateFormValues) => {
    setPristine(false);
    setValues(next);
  };

  const reset = (type: TemplateType, initial?: TemplateFormValues) => {
    setIntent('create');
    setEditTemplateId(null);
    setEditSubEntityId(null);
    setEditCalloutId(null);
    setValues(initial ?? emptyValuesFor(type));
    setErrors({});
    setPristine(true);
    setWhiteboardTemplatePreviewImages([]);
    setOpen(true);
  };
  const openEdit = (templateId: string, initial: TemplateFormValues, subEntityId?: string) => {
    setIntent('edit');
    setEditTemplateId(templateId);
    setEditSubEntityId(subEntityId ?? null);
    setEditCalloutId(null);
    setValues(initial);
    setErrors({});
    setPristine(true);
    setWhiteboardTemplatePreviewImages([]);
    setOpen(true);
  };
  const openCreateCallout: UseTemplateFormsResult['openCreateCallout'] = prefill => {
    setIntent('create');
    setEditTemplateId(null);
    setEditSubEntityId(null);
    setEditCalloutId(null);
    setValues({ ...emptyValuesFor('callout'), ...prefill?.common });
    if (prefill?.body) calloutForm.prefill(prefill.body);
    else calloutForm.reset();
    setErrors({});
    setPristine(true);
    setOpen(true);
  };
  const openEditCallout: UseTemplateFormsResult['openEditCallout'] = (templateId, calloutId, common, body) => {
    setIntent('edit');
    setEditTemplateId(templateId);
    setEditSubEntityId(null);
    setEditCalloutId(calloutId);
    setValues({ ...emptyValuesFor('callout'), ...common });
    calloutForm.prefill(body);
    setErrors({});
    setPristine(true);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setErrors({});
    setWhiteboardTemplatePreviewImages([]);
  };

  const submitCreate = async (current: TemplateFormValues, setId: string) => {
    const profileData = toProfileData(current);
    const tags = current.tags.length > 0 ? current.tags : undefined;
    switch (current.type) {
      case 'post':
        await createTemplate({
          variables: {
            templatesSetId: setId,
            type: GqlTemplateType.Post,
            profileData,
            tags,
            postDefaultDescription: current.defaultDescription || undefined,
          },
        });
        return;
      case 'communityGuidelines':
        await createTemplate({
          variables: {
            templatesSetId: setId,
            type: GqlTemplateType.CommunityGuidelines,
            profileData,
            communityGuidelinesData: {
              profile: {
                displayName: current.title,
                description: current.guidelinesMarkdown || undefined,
                referencesData: toReferencesData(current.references),
              },
            },
          },
        });
        return;
      case 'whiteboard': {
        const wantsPreview = whiteboardTemplatePreviewImages.length > 0;
        const result = await createTemplate({
          variables: {
            templatesSetId: setId,
            type: GqlTemplateType.Whiteboard,
            profileData,
            tags,
            whiteboard: { content: current.whiteboardContent || undefined, profile: { displayName: current.name } },
            includeProfileVisuals: wantsPreview,
          },
        });
        if (wantsPreview && result.data?.createTemplate) {
          await handlePreviewTemplates(whiteboardTemplatePreviewImages, result.data.createTemplate);
        }
        return;
      }
      case 'space':
        if (!current.sourceSpaceId) throw new Error('A source space is required to create a Space template');
        await createTemplateFromSpace({
          variables: {
            templatesSetId: setId,
            spaceId: current.sourceSpaceId,
            profileData,
            tags,
            recursive: current.recursive,
          },
        });
        return;
      case 'callout': {
        const calloutData = calloutFormValuesToCreateCalloutInput(calloutForm.values, calloutFallbacks);
        await createTemplate({
          variables: { templatesSetId: setId, type: GqlTemplateType.Callout, profileData, tags, calloutData },
        });
        return;
      }
    }
  };

  /** Fire the create-callout-template mutation directly for arbitrary common + body values (Duplicate / import). */
  const submitCalloutCopy = async (common: Partial<TemplateCommonValues>, body: Partial<CalloutFormValues>) => {
    if (!templatesSetId) throw new Error('No templates set');
    const merged: CalloutFormValues = { ...EMPTY_CALLOUT_FORM_VALUES, ...body };
    const calloutData = calloutFormValuesToCreateCalloutInput(merged, calloutFallbacks);
    await createTemplate({
      variables: {
        templatesSetId,
        type: GqlTemplateType.Callout,
        profileData: { displayName: common.name ?? merged.title, description: common.description || undefined },
        tags: common.tags && common.tags.length > 0 ? common.tags : undefined,
        calloutData,
      },
    });
  };

  const submitEdit = async (current: TemplateFormValues, templateId: string, subEntityId: string | null) => {
    const profile = { displayName: current.name, description: current.description || undefined };
    switch (current.type) {
      case 'post':
        await updateTemplate({
          variables: { templateId, profile, postDefaultDescription: current.defaultDescription || undefined },
        });
        return;
      case 'whiteboard': {
        const wantsPreview = whiteboardTemplatePreviewImages.length > 0;
        const result = await updateTemplate({
          variables: {
            templateId,
            profile,
            whiteboardContent: current.whiteboardContent || undefined,
            includeProfileVisuals: wantsPreview,
          },
        });
        if (wantsPreview && result.data?.updateTemplate) {
          await handlePreviewTemplates(whiteboardTemplatePreviewImages, result.data.updateTemplate);
        }
        return;
      }
      case 'space':
        // Profile-only update — re-capturing from a different source space (`useUpdateTemplateFromSpaceMutation`)
        // is not wired (the Space form's source picker has no search results in this build) — TODO(098/T031).
        await updateTemplate({ variables: { templateId, profile } });
        return;
      case 'communityGuidelines': {
        await updateTemplate({ variables: { templateId, profile } });
        if (subEntityId) {
          await updateCommunityGuidelines({
            variables: {
              communityGuidelinesData: {
                communityGuidelinesID: subEntityId,
                profile: {
                  displayName: current.title,
                  description: current.guidelinesMarkdown || undefined,
                  // Only existing references can be updated here (new rows would need a `referencesAddedData`-style
                  // input the schema doesn't expose for this mutation) — TODO(098).
                  references: current.references.flatMap(r =>
                    r.id
                      ? [{ ID: r.id, name: r.name, uri: r.uri || undefined, description: r.description || undefined }]
                      : []
                  ),
                },
              },
            },
          });
        }
        return;
      }
      case 'callout': {
        if (!editCalloutId) throw new Error('Missing callout id for Callout template edit');
        await updateTemplate({ variables: { templateId, profile } });
        await updateCalloutTemplate({
          variables: { calloutData: calloutFormValuesToUpdateCalloutEntityInput(calloutForm.values, editCalloutId) },
        });
        return;
      }
    }
  };

  const onSubmit = () => {
    if (!templatesSetId) return;
    const errs: TemplateFormErrors = {};
    if (!values.name.trim()) errs.name = t('form.common.nameRequired');
    if (values.type === 'communityGuidelines' && !values.title.trim())
      errs.title = t('form.communityGuidelines.titleRequired');
    if (values.type === 'space' && !values.sourceSpaceId) errs.sourceSpaceId = t('form.space.sourceRequired');
    setErrors(errs);
    const calloutErrors = values.type === 'callout' ? calloutForm.validate() : {};
    if (Object.keys(errs).length > 0 || Object.keys(calloutErrors).length > 0) return;
    const current = values;
    const setId = templatesSetId;
    const editId = editTemplateId;
    const subEntityId = editSubEntityId;
    startSubmitting(async () => {
      try {
        if (intent === 'edit' && editId) {
          await submitEdit(current, editId, subEntityId);
        } else {
          await submitCreate(current, setId);
        }
        close();
        onSaved?.();
      } catch {
        // surfaced by the Apollo error link / global handler; keep the dialog open
      }
    });
  };

  let perTypeFormSlot: ReactNode = null;
  switch (values.type) {
    case 'post':
      perTypeFormSlot = <PostTemplateForm value={values} errors={errors} onChange={onPerTypeChange} />;
      break;
    case 'communityGuidelines':
      perTypeFormSlot = <CommunityGuidelinesTemplateForm value={values} errors={errors} onChange={onPerTypeChange} />;
      break;
    case 'whiteboard':
      perTypeFormSlot = (
        <WhiteboardTemplateFormConnector
          value={values}
          onChange={onPerTypeChange}
          onPreviewImagesChange={setWhiteboardTemplatePreviewImages}
          disabled={submitting}
        />
      );
      break;
    case 'space':
      perTypeFormSlot = (
        <SpaceTemplateForm
          value={values}
          errors={errors}
          onChange={onPerTypeChange}
          searchResults={[]}
          searchValue=""
          onSearchChange={() => {}}
        />
      );
      break;
    case 'callout':
      perTypeFormSlot = <CalloutTemplateForm form={calloutForm} spaceId={spaceId} disabled={submitting} />;
      break;
  }

  return {
    open,
    intent,
    type: values.type,
    commonValue,
    commonErrors: errors,
    onCommonChange,
    perTypeFormSlot,
    submitting,
    isDirty: !pristine || (values.type === 'callout' && calloutForm.dirty),
    onSubmit,
    onCancel: close,
    openCreate: type => (type === 'callout' ? openCreateCallout() : reset(type)),
    openCreatePrefilled: initial => reset(initial.type, initial),
    openEdit,
    submitValues: vals =>
      templatesSetId ? submitCreate(vals, templatesSetId) : Promise.reject(new Error('No templates set')),
    openCreateCallout,
    openEditCallout,
    submitCalloutCopy,
  };
}
