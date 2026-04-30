import { isEqual } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import { MIN_POLL_OPTIONS } from '@/crd/forms/callout/PollOptionsEditor';
import type {
  AllowedActors,
  ContributionDefaults,
  FramingChip,
  LinkRow,
  ReferenceRow,
  ResponseType,
} from '@/crd/forms/callout/types';
import type { MediaGalleryFieldVisual } from '@/crd/forms/mediaGallery/MediaGalleryField';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';

// Re-export the form-shape types so existing `@/main/*` consumers can keep
// importing them from this hook. New code should import directly from
// `@/crd/forms/callout/types`.
export type { AllowedActors, ContributionDefaults, FramingChip, LinkRow, ReferenceRow, ResponseType };

export type CalloutFormValues = {
  title: string;
  description: string;
  tags: string;
  // Zone 1 — framing
  framingChip: FramingChip;
  framingCommentsEnabled: boolean;
  memoMarkdown: string;
  linkUrl: string;
  linkDisplayName: string;
  pollQuestion: string;
  pollOptions: PollOptionValue[];
  pollAllowMultiple: boolean;
  pollAllowCustomOptions: boolean;
  pollHideResultsUntilVoted: boolean;
  pollShowVoterAvatars: boolean;
  whiteboardContent: string;
  whiteboardPreviewImages: WhiteboardPreviewImage[];
  whiteboardPreviewSettings: WhiteboardPreviewSettings;
  whiteboardConfigured: boolean;
  mediaGalleryVisuals: MediaGalleryFieldVisual[];
  // Collabora document framing — only submitted when framingType is CollaboraDocument
  collaboraDocumentType: CollaboraDocumentType;
  // Zone 2 — responses
  responseType: ResponseType;
  allowedActors: AllowedActors;
  contributionCommentsEnabled: boolean;
  contributionDefaults: ContributionDefaults;
  prePopulateLinkRows: LinkRow[];
  // Zone 3 — more options
  referenceRows: ReferenceRow[];
  // Footer
  notifyMembers: boolean;
  /**
   * Edit-mode only: server id of the `default` tagset on the framing profile,
   * captured at prefill time. Used by the update mapper to emit the correct
   * `UpdateTagsetInput`. `undefined` on create.
   */
  editMeta?: {
    framingProfileTagsetId?: string;
    framingLinkId?: string;
    pollId?: string;
    memoId?: string;
    whiteboardId?: string;
  };
};

export type CalloutFormErrors = Partial<Record<keyof CalloutFormValues | string, string>>;

const createInitialPollOptions = (): PollOptionValue[] =>
  Array.from({ length: MIN_POLL_OPTIONS }, () => ({ text: '' }));

export const EMPTY_CALLOUT_FORM_VALUES: CalloutFormValues = {
  title: '',
  description: '',
  tags: '',
  framingChip: 'none',
  framingCommentsEnabled: true,
  memoMarkdown: '',
  linkUrl: '',
  linkDisplayName: '',
  pollQuestion: '',
  pollOptions: createInitialPollOptions(),
  pollAllowMultiple: false,
  pollAllowCustomOptions: false,
  pollHideResultsUntilVoted: false,
  pollShowVoterAvatars: true,
  whiteboardContent: EmptyWhiteboardString,
  whiteboardPreviewImages: [],
  whiteboardPreviewSettings: DefaultWhiteboardPreviewSettings,
  whiteboardConfigured: false,
  mediaGalleryVisuals: [],
  collaboraDocumentType: CollaboraDocumentType.Wordprocessing,
  responseType: 'none',
  allowedActors: { members: true, admins: true },
  contributionCommentsEnabled: true,
  contributionDefaults: { defaultDisplayName: '', postDescription: '', whiteboardContent: '' },
  prePopulateLinkRows: [],
  referenceRows: [],
  notifyMembers: false,
  editMeta: undefined,
};

/**
 * Short yup error codes → translation-key bodies. Matches the
 * `useCreateSubspace.ts` pattern (spec FR-86, plan D20).
 */
type ValidationCode =
  | 'required'
  | 'urlRequired'
  | 'urlInvalid'
  | 'displayNameRequired'
  | 'questionRequired'
  | 'maxSmall'
  | 'maxMarkdown'
  | 'minPollOptions'
  | 'pollOptionRequired'
  | 'referenceTitleRequired'
  | 'linkRowTitleRequired';

export type UseCrdCalloutFormResult = {
  values: CalloutFormValues;
  errors: CalloutFormErrors;
  initialValues: CalloutFormValues;
  dirty: boolean;
  setField: <K extends keyof CalloutFormValues>(key: K, value: CalloutFormValues[K]) => void;
  setValues: (updater: (prev: CalloutFormValues) => CalloutFormValues) => void;
  validate: () => CalloutFormErrors;
  reset: () => void;
  prefill: (data: Partial<CalloutFormValues>) => void;
};

export function useCrdCalloutForm(): UseCrdCalloutFormResult {
  const { t } = useTranslation('crd-space');
  const [initialValues, setInitialValues] = useState<CalloutFormValues>(EMPTY_CALLOUT_FORM_VALUES);
  const [values, setValuesState] = useState<CalloutFormValues>(EMPTY_CALLOUT_FORM_VALUES);
  const [errors, setErrors] = useState<CalloutFormErrors>({});

  const translateValidationMessage = (code: string, params?: Record<string, unknown>): string => {
    const typed = code as ValidationCode;
    switch (typed) {
      case 'required':
        return t('validation.required');
      case 'urlRequired':
        return t('validation.urlRequired');
      case 'urlInvalid':
        return t('validation.urlInvalid');
      case 'displayNameRequired':
        return t('validation.displayNameRequired');
      case 'questionRequired':
        return t('validation.questionRequired');
      case 'maxSmall':
        return t('validation.maxSmall', { count: SMALL_TEXT_LENGTH, ...params });
      case 'maxMarkdown':
        return t('validation.maxMarkdown', { count: MARKDOWN_TEXT_LENGTH, ...params });
      case 'minPollOptions':
        return t('validation.minPollOptions', { count: MIN_POLL_OPTIONS, ...params });
      case 'pollOptionRequired':
        return t('validation.pollOptionRequired');
      case 'referenceTitleRequired':
        return t('validation.referenceTitleRequired');
      case 'linkRowTitleRequired':
        return t('validation.linkRowTitleRequired');
      default:
        return code;
    }
  };

  const schema = yup.object().shape({
    title: yup.string().trim().required('required').max(SMALL_TEXT_LENGTH, 'maxSmall'),
    description: yup.string().max(MARKDOWN_TEXT_LENGTH, 'maxMarkdown').notRequired(),
  });

  const validateFraming = (v: CalloutFormValues, next: CalloutFormErrors) => {
    if (v.framingChip === 'cta') {
      if (!v.linkDisplayName.trim()) next.linkDisplayName = translateValidationMessage('displayNameRequired');
      if (!v.linkUrl.trim()) {
        next.linkUrl = translateValidationMessage('urlRequired');
      } else if (!/^https?:\/\//i.test(v.linkUrl.trim())) {
        next.linkUrl = translateValidationMessage('urlInvalid');
      }
    }
    if (v.framingChip === 'poll') {
      if (!v.pollQuestion.trim()) next.pollQuestion = translateValidationMessage('questionRequired');
      const filled = v.pollOptions.filter(o => o.text.trim().length > 0);
      if (filled.length < MIN_POLL_OPTIONS) {
        next.pollOptions = translateValidationMessage('minPollOptions');
      }
    }
  };

  const validateReferences = (v: CalloutFormValues, next: CalloutFormErrors) => {
    v.referenceRows.forEach((row, idx) => {
      if (row.url.trim() && !row.title.trim()) {
        next[`referenceRows.${idx}.title`] = translateValidationMessage('referenceTitleRequired');
      }
    });
  };

  const validatePrePopulateLinks = (v: CalloutFormValues, next: CalloutFormErrors) => {
    if (v.responseType !== 'link') return;
    v.prePopulateLinkRows.forEach((row, idx) => {
      if (row.url.trim() && !row.title.trim()) {
        next[`prePopulateLinkRows.${idx}.title`] = translateValidationMessage('linkRowTitleRequired');
      }
    });
  };

  const validate = (): CalloutFormErrors => {
    const next: CalloutFormErrors = {};
    try {
      schema.validateSync(values, { abortEarly: false });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        for (const inner of err.inner) {
          if (inner.path && !next[inner.path]) {
            next[inner.path] = translateValidationMessage(inner.message);
          }
        }
      }
    }
    validateFraming(values, next);
    validateReferences(values, next);
    validatePrePopulateLinks(values, next);
    setErrors(next);
    return next;
  };

  const setField = <K extends keyof CalloutFormValues>(key: K, value: CalloutFormValues[K]) => {
    setValuesState(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const copy: CalloutFormErrors = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const setValues = (updater: (prev: CalloutFormValues) => CalloutFormValues) => {
    setValuesState(updater);
  };

  const reset = () => {
    setInitialValues(EMPTY_CALLOUT_FORM_VALUES);
    setValuesState(EMPTY_CALLOUT_FORM_VALUES);
    setErrors({});
  };

  const prefill = (data: Partial<CalloutFormValues>) => {
    const nextValues = { ...EMPTY_CALLOUT_FORM_VALUES, ...data };
    setInitialValues(nextValues);
    setValuesState(nextValues);
    setErrors({});
  };

  const dirty = !isEqual(values, initialValues);

  return {
    values,
    errors,
    initialValues,
    dirty,
    setField,
    setValues,
    validate,
    reset,
    prefill,
  };
}
