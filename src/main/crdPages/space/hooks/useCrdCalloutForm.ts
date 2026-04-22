import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import { MIN_POLL_OPTIONS } from '@/crd/forms/callout/PollOptionsEditor';
import type { MediaGalleryFieldVisual } from '@/crd/forms/mediaGallery/MediaGalleryField';
import {
  DefaultWhiteboardPreviewSettings,
  type WhiteboardPreviewSettings,
} from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';
import type { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';

type CalloutFormValues = {
  title: string;
  description: string;
  tags: string;
  framingType: CalloutFramingType;
  visibility: 'draft' | 'published';
  commentsEnabled: boolean;
  allowedContributionTypes: Array<'post' | 'memo' | 'whiteboard' | 'link'>;
  // Framing-specific
  linkUrl: string;
  linkDisplayName: string;
  pollQuestion: string;
  pollOptions: PollOptionValue[];
  pollAllowMultiple: boolean;
  pollAllowCustomOptions: boolean;
  pollHideResultsUntilVoted: boolean;
  pollShowVoterAvatars: boolean;
  // Whiteboard framing — only submitted when framingType is Whiteboard
  whiteboardContent: string;
  whiteboardPreviewImages: WhiteboardPreviewImage[];
  whiteboardPreviewSettings: WhiteboardPreviewSettings;
  // Tracks whether the whiteboard has been edited at least once (vs. still the empty template)
  whiteboardConfigured: boolean;
  // Media-gallery framing — only submitted when framingType is MediaGallery.
  // Entries with `file` set are new visuals to upload post-save; entries with `id`
  // are existing ones (edit path). Shape matches `useUploadMediaGalleryVisuals`.
  mediaGalleryVisuals: MediaGalleryFieldVisual[];
  notifyMembers: boolean;
};

const createInitialPollOptions = (): PollOptionValue[] =>
  Array.from({ length: MIN_POLL_OPTIONS }, () => ({ text: '' }));

const initialValues: CalloutFormValues = {
  title: '',
  description: '',
  tags: '',
  framingType: CalloutFramingType.None,
  visibility: 'published',
  commentsEnabled: true,
  allowedContributionTypes: [],
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
  notifyMembers: false,
};

export function useCrdCalloutForm() {
  const { t } = useTranslation('crd-space');
  const [values, setValues] = useState<CalloutFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CalloutFormValues, string>>>({});

  const setField = <K extends keyof CalloutFormValues>(key: K, value: CalloutFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!values.title.trim()) {
      newErrors.title = t('validation.titleRequired');
    }
    if (values.framingType === CalloutFramingType.Link) {
      if (!values.linkUrl.trim()) {
        newErrors.linkUrl = t('validation.urlRequired');
      } else if (!values.linkUrl.startsWith('http://') && !values.linkUrl.startsWith('https://')) {
        newErrors.linkUrl = t('validation.urlInvalid');
      }
      if (!values.linkDisplayName.trim()) {
        newErrors.linkDisplayName = t('validation.displayNameRequired');
      }
    }
    if (values.framingType === CalloutFramingType.Poll && !values.pollQuestion.trim()) {
      newErrors.pollQuestion = t('validation.questionRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  const prefill = (data: Partial<CalloutFormValues>) => {
    setValues(prev => ({ ...prev, ...data }));
  };

  return {
    values,
    errors,
    setField,
    validate,
    reset,
    prefill,
  };
}
