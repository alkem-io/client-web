import { useTranslation } from 'react-i18next';
import { useNotification } from '../ui/notifications/useNotification';

const useEnsurePresence = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const ensurePresence = <Value>(
    value: Value | undefined | null,
    fieldName: string = t('forms.validations.field'),
    message: string = t('forms.validations.fieldNotPresent', { fieldName })
  ): Value => {
    if (!value) {
      notify(message, 'error');
      throw new Error(message);
    }
    return value;
  };
  return ensurePresence;
};

export default useEnsurePresence;
