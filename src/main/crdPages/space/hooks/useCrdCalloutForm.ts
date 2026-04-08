import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import type { PollOptionValue } from '@/crd/forms/callout/PollOptionsEditor';
import { MIN_POLL_OPTIONS } from '@/crd/forms/callout/PollOptionsEditor';

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
