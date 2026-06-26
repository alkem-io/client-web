import { isEqual } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import { MAX_POLL_OPTIONS, MIN_POLL_OPTIONS } from '@/crd/forms/callout/PollOptionsEditor';
import type {
  AllowedActors,
  ContributionDefaults,
  ContributorCollectionConfig,
  FramingChip,
  LinkRow,
  ReferenceRow,
  ResponseType,
} from '@/crd/forms/callout/types';
import type { MediaGalleryFieldVisual } from '@/crd/forms/mediaGallery/MediaGalleryField';
import { ensureHttps, isValidHttpUrl } from '@/crd/lib/ensureHttps';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';

// Re-export the form-shape types so existing `@/main/*` consumers can keep
// importing them from this hook. New code should import directly from
// `@/crd/forms/callout/types`.
export type {
  AllowedActors,
  ContributionDefaults,
  ContributorCollectionConfig,
  FramingChip,
  LinkRow,
  ReferenceRow,
  ResponseType,
};

export type CalloutFormValues = {
  title: string;
  description: string;
  /**
   * Array of tag strings — the same shape the chip-based `TagsInput` from
   * `@/crd/forms/tags-input` produces (used in profile / org / VC / space
   * explorer). One `TagsInput`, one type, everywhere — no per-surface
   * string ↔ array bridges.
   */
  tags: string[];
  // Zone 1 — framing
  framingChip: FramingChip;
  framingCommentsEnabled: boolean;
  /**
   * Contributor-collection callout config (feature 008). Only meaningful when
   * `framingChip === 'contributors'`. Serialized into
   * `settings.framing.contributors` on create/update; prefilled on edit.
   */
  contributorCollection: ContributorCollectionConfig;
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
  /**
   * Server-rendered whiteboard preview image URL (`framing.whiteboard.profile.preview.uri`).
   * Display-only — never sent back to the server; shown by the inline framing preview as the
   * read-time fallback when no fresh in-form blob (`whiteboardPreviewImages`) exists. The
   * blob URL wins when the user re-opens the inline editor and saves (it reflects the
   * just-saved state); this URL is the placeholder for "loaded but not re-edited yet".
   * Populated by `calloutTemplateContentToFormValues` (Callout-template edit/duplicate prefill)
   * and by `mapCalloutDetailsToFormValues` (live-callout edit prefill, when present). D16, 2026-05-18.
   */
  whiteboardPreviewServerUrl?: string;
  whiteboardConfigured: boolean;
  mediaGalleryVisuals: MediaGalleryFieldVisual[];
  // Collabora document framing — only submitted when framingType is CollaboraDocument
  collaboraDocumentType: CollaboraDocumentType;
  /** Optional file staged for the upload-path of Document framing. Mutually exclusive with the blank-create card selection. */
  collaboraUploadFile: File | null;
  /**
   * The post title that was auto-prefilled when `collaboraUploadFile` was staged
   * (filename minus extension). Compared against the current `title` at submit time
   * to decide whether to send `framing.collaboraDocument.displayName` explicitly
   * (typed/edited) or rely on the server's filename-derivation default (unchanged).
   */
  collaboraAutoPrefilledTitle?: string;
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
    /** Framing profile id — where references live. Used to create newly-added references on edit. */
    framingProfileId: string;
    /** Reference ids present at edit-open, so the submit can detect which references were removed. */
    originalReferenceIds: string[];
  };
};

export type CalloutFormErrors = Partial<Record<keyof CalloutFormValues | string, string>>;

/**
 * Reference-row errors in the shared `ReferencesEditor` contract — keyed `<index>.name` / `<index>.uri`.
 * `validate()` namespaces them as `referenceRows.<index>.…` (symmetric with `prePopulateLinkRows.…`); the
 * editor reads the un-prefixed shape, so consumers strip the prefix here before passing them in (mirroring
 * how `InnovationPackForm` / `CommunityGuidelinesTemplateForm` feed the same editor).
 */
export const referenceRowErrors = (errors: CalloutFormErrors): Record<string, string | undefined> => {
  const out: Record<string, string | undefined> = {};
  for (const key of Object.keys(errors)) {
    if (key.startsWith('referenceRows.')) out[key.slice('referenceRows.'.length)] = errors[key];
  }
  return out;
};

const createInitialPollOptions = (): PollOptionValue[] =>
  Array.from({ length: MIN_POLL_OPTIONS }, () => ({ text: '' }));

export const EMPTY_CALLOUT_FORM_VALUES: CalloutFormValues = {
  title: '',
  description: '',
  tags: [],
  framingChip: 'none',
  framingCommentsEnabled: true,
  // Default contributor-collection config mirrors the server migration default:
  // all three types, default type USER, default view LIST.
  contributorCollection: {
    types: ['user', 'organization', 'virtualContributor'],
    defaultType: 'user',
    defaultView: 'list',
  },
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
  whiteboardPreviewServerUrl: undefined,
  whiteboardConfigured: false,
  mediaGalleryVisuals: [],
  collaboraDocumentType: CollaboraDocumentType.Wordprocessing,
  collaboraUploadFile: null,
  collaboraAutoPrefilledTitle: undefined,
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
  | 'minDisplayName'
  | 'maxSmall'
  | 'maxMid'
  | 'maxMarkdown'
  | 'minPollOptions'
  | 'maxPollOptions'
  | 'pollOptionRequired'
  | 'referenceTitleRequired'
  | 'referenceUrlInvalid'
  | 'linkRowTitleRequired'
  | 'linkRowUrlInvalid'
  | 'contributorTypesRequired';

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

/**
 * @param initialOverrides Create-mode seed merged over `EMPTY_CALLOUT_FORM_VALUES`
 *   (e.g. restriction-driven `framingCommentsEnabled: false`). Edit/template
 *   `prefill` always wins over these — the overrides only seed the empty form.
 */
export function useCrdCalloutForm(initialOverrides?: Partial<CalloutFormValues>): UseCrdCalloutFormResult {
  const { t } = useTranslation('crd-space');
  const [initialValues, setInitialValues] = useState<CalloutFormValues>(() => ({
    ...EMPTY_CALLOUT_FORM_VALUES,
    ...initialOverrides,
  }));
  const [values, setValuesState] = useState<CalloutFormValues>(() => ({
    ...EMPTY_CALLOUT_FORM_VALUES,
    ...initialOverrides,
  }));
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
      case 'minDisplayName':
        return t('validation.minDisplayName', { count: 3, ...params });
      case 'maxSmall':
        return t('validation.maxSmall', { count: SMALL_TEXT_LENGTH, ...params });
      case 'maxMid':
        return t('validation.maxMid', { count: MID_TEXT_LENGTH, ...params });
      case 'maxMarkdown':
        return t('validation.maxMarkdown', { count: MARKDOWN_TEXT_LENGTH, ...params });
      case 'minPollOptions':
        return t('validation.minPollOptions', { count: MIN_POLL_OPTIONS, ...params });
      case 'maxPollOptions':
        return t('validation.maxPollOptions', { count: MAX_POLL_OPTIONS, ...params });
      case 'pollOptionRequired':
        return t('validation.pollOptionRequired');
      case 'referenceTitleRequired':
        return t('validation.referenceTitleRequired');
      case 'referenceUrlInvalid':
        return t('validation.urlInvalid');
      case 'linkRowTitleRequired':
        return t('validation.linkRowTitleRequired');
      case 'linkRowUrlInvalid':
        return t('validation.urlInvalid');
      case 'contributorTypesRequired':
        return t('validation.contributorTypesRequired');
      default:
        return code;
    }
  };

  // Title (framing.profile.displayName) mirrors the MUI `displayNameValidator({ required: true })`:
  // required, min 3, max SMALL_TEXT_LENGTH, no spaces-only.
  const schema = yup.object().shape({
    title: yup.string().trim().required('required').min(3, 'minDisplayName').max(SMALL_TEXT_LENGTH, 'maxSmall'),
    description: yup.string().max(MARKDOWN_TEXT_LENGTH, 'maxMarkdown').notRequired(),
  });

  const validateFraming = (v: CalloutFormValues, next: CalloutFormErrors) => {
    if (v.framingChip === 'cta') {
      // Display name (link.profile.displayName) — required, min 3, max SMALL_TEXT_LENGTH.
      const displayName = v.linkDisplayName.trim();
      if (!displayName) {
        next.linkDisplayName = translateValidationMessage('displayNameRequired');
      } else if (displayName.length < 3) {
        next.linkDisplayName = translateValidationMessage('minDisplayName');
      } else if (displayName.length > SMALL_TEXT_LENGTH) {
        next.linkDisplayName = translateValidationMessage('maxSmall');
      }
      // URL (link.uri) — required, valid URL after `ensureHttps`, max MID_TEXT_LENGTH.
      const rawUrl = v.linkUrl.trim();
      if (!rawUrl) {
        next.linkUrl = translateValidationMessage('urlRequired');
      } else {
        const normalized = ensureHttps(rawUrl);
        if (normalized.length > MID_TEXT_LENGTH) {
          next.linkUrl = translateValidationMessage('maxMid');
        } else if (!isValidHttpUrl(rawUrl)) {
          next.linkUrl = translateValidationMessage('urlInvalid');
        }
      }
    }
    if (v.framingChip === 'contributors') {
      // FR-006a: at least one contributor type must be selected; saving with
      // zero types is blocked by validation.
      if (v.contributorCollection.types.length === 0) {
        next.contributorCollection = translateValidationMessage('contributorTypesRequired');
      }
    }
    if (v.framingChip === 'poll') {
      // Poll question — `displayNameValidator()` is non-required at the schema level, but the
      // server requires `framing.poll.title` for poll framing, so the form keeps it required.
      const question = v.pollQuestion.trim();
      if (!question) {
        next.pollQuestion = translateValidationMessage('questionRequired');
      } else if (question.length < 3) {
        next.pollQuestion = translateValidationMessage('minDisplayName');
      } else if (question.length > SMALL_TEXT_LENGTH) {
        next.pollQuestion = translateValidationMessage('maxSmall');
      }
      const filled = v.pollOptions.filter(o => o.text.trim().length > 0);
      if (filled.length < MIN_POLL_OPTIONS) {
        next.pollOptions = translateValidationMessage('minPollOptions');
      } else if (filled.length > MAX_POLL_OPTIONS) {
        next.pollOptions = translateValidationMessage('maxPollOptions');
      }
    }
  };

  const validateReferences = (v: CalloutFormValues, next: CalloutFormErrors) => {
    v.referenceRows.forEach((row, idx) => {
      const uri = row.uri.trim();
      const name = row.name.trim();
      if (uri && !name) {
        next[`referenceRows.${idx}.name`] = translateValidationMessage('referenceTitleRequired');
      }
      if (uri && !isValidHttpUrl(uri)) {
        next[`referenceRows.${idx}.uri`] = translateValidationMessage('referenceUrlInvalid');
      }
    });
  };

  const validatePrePopulateLinks = (v: CalloutFormValues, next: CalloutFormErrors) => {
    if (v.responseType !== 'link') return;
    v.prePopulateLinkRows.forEach((row, idx) => {
      const url = row.url.trim();
      const title = row.title.trim();
      if (url && !title) {
        next[`prePopulateLinkRows.${idx}.title`] = translateValidationMessage('linkRowTitleRequired');
      }
      if (url && !isValidHttpUrl(url)) {
        next[`prePopulateLinkRows.${idx}.url`] = translateValidationMessage('linkRowUrlInvalid');
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
    const seeded = { ...EMPTY_CALLOUT_FORM_VALUES, ...initialOverrides };
    setInitialValues(seeded);
    setValuesState(seeded);
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
