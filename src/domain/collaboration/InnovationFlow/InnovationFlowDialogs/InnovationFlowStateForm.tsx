import { Button } from '@mui/material';
import { Formik } from 'formik';
import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { Actions } from '../../../../core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import useLoadingState from '../../../shared/utils/useLoadingState';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { InnovationFlowState } from '../InnovationFlow';

export interface InnovationFlowStateFormValues extends InnovationFlowState {}

interface InnovationFlowStateFormProps {
  state?: InnovationFlowState;
  forbiddenFlowStateNames?: string[];
  onSubmit: (formData: InnovationFlowStateFormValues) => Promise<unknown>;
  onCancel?: () => void;
}

const InnovationFlowStateForm: FC<InnovationFlowStateFormProps> = ({
  state,
  forbiddenFlowStateNames = [],
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();

  const initialValues: InnovationFlowStateFormValues = {
    displayName: state?.displayName ?? '',
    description: state?.description ?? '',
  };

  const validationSchema = yup.object().shape({
    displayName: yup
      .string()
      .required()
      .max(SMALL_TEXT_LENGTH)
      .notOneOf(forbiddenFlowStateNames, t('components.innovationFlowSettings.stateEditor.noRepeatedStates')),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  });

  const [handleSave, loading] = useLoadingState(onSubmit);

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={handleSave}>
      {({ handleSubmit, isValid }) => {
        return (
          <>
            <FormikInputField name="displayName" title={t('common.title')} maxLength={SMALL_TEXT_LENGTH} />
            <FormikMarkdownField name="description" title={t('common.description')} maxLength={MARKDOWN_TEXT_LENGTH} />
            <Actions justifyContent="end">
              <Button variant="text" onClick={onCancel}>
                {t('buttons.cancel')}
              </Button>
              <LoadingButton loading={loading} disabled={!isValid} variant="contained" onClick={() => handleSubmit()}>
                {t('buttons.save')}
              </LoadingButton>
            </Actions>
          </>
        );
      }}
    </Formik>
  );
};

export default InnovationFlowStateForm;
