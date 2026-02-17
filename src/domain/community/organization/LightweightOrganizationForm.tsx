import { CreateOrganizationInput } from '@/core/apollo/generated/graphql-schema';
import Gutters from '@/core/ui/grid/Gutters';
import { Form, Formik } from 'formik';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContent from '@/core/ui/content/PageContent';
import { gutters } from '@/core/ui/grid/utils';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import { LONG_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { FormikInputField } from '@/core/ui/forms/FormikInputField/FormikInputField';
import MarkdownInput from '@/core/ui/forms/MarkdownInput/MarkdownInput';
import { Button } from '@mui/material';
interface LightweightOrganizationFormValues {
  displayName: string;
  tagline?: string;
  description?: string;
}

interface LightweightOrganizationFormProps {
  onSave?: (organization: CreateOrganizationInput) => Promise<unknown>;
  onBack?: () => void;
}

/**
 * Simplified form for creating lightweight (non-verified) organizations.
 * Only requires basic profile information: name, tagline, description, and avatar.
 */
export const LightweightOrganizationForm: FC<LightweightOrganizationFormProps> = ({ onSave, onBack }) => {
  const { t } = useTranslation();

  const initialValues: LightweightOrganizationFormValues = {
    displayName: '',
    tagline: '',
    description: '',
  };

  const validationSchema = yup.object().shape({
    displayName: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH, required: true }),
    tagline: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH }),
    description: textLengthValidator({ maxLength: LONG_TEXT_LENGTH }),
  });

  const handleSubmit = async (values: LightweightOrganizationFormValues) => {
    const input: CreateOrganizationInput = {
      nameID: values.displayName.toLowerCase().replaceAll(' ', '-'), // Auto-generate nameID
      profileData: {
        displayName: values.displayName,
        tagline: values.tagline,
        description: values.description,
      },
    };

    return onSave?.(input);
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isValid }) => (
        <Form>
          <PageContent>
            <PageContentColumn columns={12}>
              <Gutters>
                <FormikInputField
                  name="displayName"
                  title={t('components.profileSegment.displayName.title')}
                  placeholder={t('components.profileSegment.displayName.placeholder')}
                  required
                />
              </Gutters>
              <Gutters>
                <FormikInputField
                  name="tagline"
                  title={t('components.profileSegment.tagline.title')}
                  placeholder={t('components.profileSegment.tagline.placeholder')}
                />
              </Gutters>
              <Gutters>
                <MarkdownInput
                  name="description"
                  title={t('components.profileSegment.description.title')}
                  placeholder={t('components.profileSegment.description.placeholder')}
                  maxLength={LONG_TEXT_LENGTH}
                />
              </Gutters>
            </PageContentColumn>
          </PageContent>
          <Actions padding={gutters()} justifyContent="end">
            {onBack && (
              <Button variant="text" onClick={onBack}>
                {t('buttons.back')}
              </Button>
            )}
            <Button variant="contained" type="submit" disabled={!isValid}>
              {t('buttons.create')}
            </Button>
          </Actions>
        </Form>
      )}
    </Formik>
  );
};

export default LightweightOrganizationForm;
