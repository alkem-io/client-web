import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';

interface FormIntroductionFieldProps {
  disabled?: boolean;
}

const FormIntroductionField: FC<FormIntroductionFieldProps> = ({ disabled }) => {
  const { t } = useTranslation();
  return <FormikMarkdownField title={t('common.introduction')} name="description" disabled={disabled} />;
};

export default FormIntroductionField;
