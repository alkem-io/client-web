import { useTranslation } from 'react-i18next';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import type { ValidationMessageWithPayload } from './ValidationMessageWithPayload';

const useValidationMessageTranslation = () => {
  const { t } = useTranslation();

  return (
    validationMessage: TranslationKey | ValidationMessageWithPayload | undefined,
    perFieldInterpolations: Record<string, string | number> = {}
  ) => {
    if (typeof validationMessage === 'undefined') {
      return;
    }
    if (typeof validationMessage === 'string') {
      return t(validationMessage, perFieldInterpolations);
    }
    const { message, ...interpolations } = validationMessage;
    return t(message, {
      ...perFieldInterpolations,
      ...interpolations,
    });
  };
};

export default useValidationMessageTranslation;
