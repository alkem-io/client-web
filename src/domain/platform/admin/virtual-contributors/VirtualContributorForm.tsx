import { FC } from 'react';
import { Form, Formik } from 'formik';
import Gutters from '../../../../core/ui/grid/Gutters';
import VisualUpload, { VisualUploadProps } from '../../../../core/ui/upload/VisualUpload/VisualUpload';
import { useTranslation } from 'react-i18next';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { Actions } from '../../../../core/ui/actions/Actions';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';

interface VirtualContributorFormValues {
  displayName: string;
  description: string;
}

interface VirtualContributorFormProps {
  virtualContributor: {
    profile: {
      id: string;
      displayName: string;
      description?: string;
      avatar?: VisualUploadProps['visual'];
    };
  };
  onSave?: (values: VirtualContributorFormValues) => Promise<unknown> | void;
}

const VirtualContributorForm: FC<VirtualContributorFormProps> = ({ virtualContributor, onSave }) => {
  const { t } = useTranslation();
  const initialValues = {
    displayName: virtualContributor.profile.displayName,
    description: virtualContributor.profile.description ?? '',
  };

  const [handleSubmit, loading] = useLoadingState(async (values: VirtualContributorFormValues) => {
    await onSave?.(values);
  });

  return (
    <Gutters disablePadding>
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        <Form>
          <Gutters disablePadding>
            <FormikInputField title={t('common.title')} name="displayName" />
            <FormikMarkdownField title={t('common.description')} name="description" />
            <Actions>
              <Button variant="text">{t('buttons.cancel')}</Button>
              <LoadingButton loading={loading} type="submit" variant="contained">
                {t('buttons.save')}
              </LoadingButton>
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
    </Gutters>
  );
};

export default VirtualContributorForm;
