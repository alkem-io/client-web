import { FC } from 'react'
import { VirtualPersonaType } from '../../../../core/apollo/generated/graphql-schema';
import { Form, Formik, FormikValues } from 'formik';
import Gutters from '../../../../core/ui/grid/Gutters';
import VisualUpload, { VisualUploadProps } from '../../../../core/ui/upload/VisualUpload/VisualUpload';
import { useTranslation } from 'react-i18next';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { Actions } from '../../../../core/ui/actions/Actions';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { gutters } from '../../../../core/ui/grid/utils';

interface VirtualContributorFormValues {
  displayName: string;
  description: string;
  type: VirtualPersonaType;
  prompt: string;
}

interface VirtualContributorFormProps {
  virtualContributor: {
    profile: {
      id: string;
      displayName: string;
      description: string;
      avatar: VisualUploadProps['visual'];
    }
    prompt: string;
    type: VirtualPersonaType;
  }
  onSave: (values: VirtualContributorFormValues) => Promise<unknown> | void;
}

const VirtualContributorForm: FC<VirtualContributorFormProps> = ({ virtualContributor, onSave}) => {
  const { t } = useTranslation();
  const initialValues = {
    displayName: virtualContributor.profile.displayName,
    description: virtualContributor.profile.description,
    type: virtualContributor.type,
    prompt: virtualContributor.prompt
  };

  const [handleSubmit, loading] = useLoadingState(async (values: VirtualContributorFormValues) => {
    await onSave(values);
  });

  return (
    <>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        <Form>
          <Gutters>
            <FormikInputField title={t('common.title')} name="displayName" />
            <FormikMarkdownField title={t('common.description')} name="description" />
            <FormikInputField
              multiline
              name="prompt"
              label={t('common.prompt')}
              title={t('common.prompt')}
              InputProps={{
                sx: { fontFamily: 'monospace', height: gutters(20) },
              }}
              sx={{ height: gutters(20), 'div': { alignItems: 'flex-start' }}}
            />
            <Actions>
              <Button variant="text">{t('buttons.cancel')}</Button>
              <LoadingButton loading={loading} type="submit" variant="contained">{t('buttons.save')}</LoadingButton>
            </Actions>
          </Gutters>
        </Form>
      </Formik>
      <VisualUpload
        visual={virtualContributor.profile.avatar}
        altText={t('visuals-alt-text.avatar.contributor.text', {
          displayName: virtualContributor.profile.displayName,
          altText: virtualContributor.profile.avatar?.alternativeText,
        })}
      />
    </>
);
}

export default VirtualContributorForm;