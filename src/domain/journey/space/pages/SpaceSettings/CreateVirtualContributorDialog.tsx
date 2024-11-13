import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import * as yup from 'yup';
import DialogHeader from '@core/ui/dialog/DialogHeader';
import Gutters from '@core/ui/grid/Gutters';
import { Actions } from '@core/ui/actions/Actions';
import { gutters } from '@core/ui/grid/utils';
import { Form, Formik } from 'formik';
import FormikInputField from '@core/ui/forms/FormikInputField/FormikInputField';
import FormikSelect from '@core/ui/forms/FormikSelect';
import useLoadingState from '../../../../shared/utils/useLoadingState';
import { Caption } from '@core/ui/typography';
import { nameSegmentSchema } from '../../../../platform/admin/components/Common/NameSegment';

export interface VirtualContributorFormValues {
  displayName: string;
  bodyOfKnowledgeID: string;
}

interface CreateVirtualContributorDialogProps {
  spaces: { name: string; id: string }[];
  open: boolean;
  onClose: () => void;
  onCreate: ({ bodyOfKnowledgeID, displayName }) => void;
  submitting: boolean;
}

const CreateVirtualContributorDialog: FC<CreateVirtualContributorDialogProps> = ({
  spaces,
  open,
  onClose,
  onCreate,
  submitting,
}) => {
  const { t } = useTranslation();

  const initialValues = {
    displayName: '',
    spaces: [],
    bodyOfKnowledgeID: '',
  };

  const validationSchema = yup.object().shape({
    displayName: nameSegmentSchema.fields?.name ?? yup.string(),
    bodyOfKnowledgeID: yup.string().required(t('forms.validations.required')),
  });

  const [handleCreate, loading] = useLoadingState(async (values: VirtualContributorFormValues) => {
    await onCreate?.({
      ...values,
    });
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose} title={t('virtualContributorSpaceSettings.create.title')} />
      <DialogContent>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleCreate}>
          <Form noValidate>
            <Gutters>
              <FormikInputField title={t('virtualContributorSpaceSettings.name')} name="displayName" required />
              <FormikSelect
                title={t('virtualContributorSpaceSettings.bodyOfKnowledge')}
                name="bodyOfKnowledgeID"
                values={spaces ?? []}
                required
              />
              <Caption>{t('virtualContributorSpaceSettings.infoTextBoK')}</Caption>
              <Actions justifyContent="flex-end" paddingTop={gutters()}>
                <Button onClick={onClose}>{t('buttons.cancel')}</Button>
                <LoadingButton
                  variant="contained"
                  disabled={loading}
                  loading={submitting}
                  loadingIndicator="..."
                  type="submit"
                >
                  {t('buttons.create')}
                </LoadingButton>
              </Actions>
            </Gutters>
          </Form>
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVirtualContributorDialog;
