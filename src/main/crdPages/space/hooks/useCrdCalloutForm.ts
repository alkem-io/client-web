import { useState } from 'react';
import { CalloutFramingType } from '@/core/apollo/generated/graphql-schema';

type CalloutFormValues = {
  title: string;
  description: string;
  tags: string;
  framingType: CalloutFramingType;
  visibility: 'draft' | 'published';
  commentsEnabled: boolean;
  allowedContributionTypes: string[];
  // Framing-specific
  linkUrl: string;
  linkDisplayName: string;
  pollQuestion: string;
  pollOptions: string[];
  notifyMembers: boolean;
};

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
  pollOptions: ['', ''],
  notifyMembers: false,
};

export function useCrdCalloutForm() {
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
      newErrors.title = 'Title is required';
    }
    if (values.framingType === CalloutFramingType.Link) {
      if (!values.linkUrl.trim()) {
        newErrors.linkUrl = 'URL is required';
      } else if (!values.linkUrl.startsWith('http://') && !values.linkUrl.startsWith('https://')) {
        newErrors.linkUrl = 'URL must start with http:// or https://';
      }
      if (!values.linkDisplayName.trim()) {
        newErrors.linkDisplayName = 'Display name is required';
      }
    }
    if (values.framingType === CalloutFramingType.Poll && !values.pollQuestion.trim()) {
      newErrors.pollQuestion = 'Question is required';
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
