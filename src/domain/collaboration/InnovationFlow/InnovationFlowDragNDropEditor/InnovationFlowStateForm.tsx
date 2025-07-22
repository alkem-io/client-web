import { Button } from '@mui/material';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Actions } from '@/core/ui/actions/Actions';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';
import Gutters from '@/core/ui/grid/Gutters';

export interface InnovationFlowStateFormValues extends InnovationFlowStateModel {}

type InnovationFlowStateFormProps = {
  state?: InnovationFlowStateModel;
  /**
   * @deprecated Shouldn't be needed anymore
   */
  forbiddenFlowStateNames?: string[];
  onSubmit: (formData: InnovationFlowStateFormValues) => Promise<unknown>;
  onCancel?: () => void;
};

// Leave description empty if the Markdown component has returned just a <br> tag
const emptyMarkdown = (markdown: string | undefined = '') => (markdown.trim() === '<br>' ? '' : markdown.trim());

const InnovationFlowStateForm = ({
  state,
  /**
   * @deprecated Shouldn't be needed anymore
   */
  forbiddenFlowStateNames = [],
  onSubmit,
  onCancel,
}: InnovationFlowStateFormProps) => {
  const { t } = useTranslation();

  const initialValues: InnovationFlowStateFormValues = {
    displayName: state?.displayName ?? '',
    description: state?.description ?? '',
    sortOrder: state?.sortOrder ?? 0,
    settings: {
      allowNewCallouts: state?.settings?.allowNewCallouts ?? false, // TODO: Not used yet
    },
  };

  const validationSchema = yup.object().shape({
    displayName: yup
      .string()
      .required()
      .max(SMALL_TEXT_LENGTH)
      .notOneOf(forbiddenFlowStateNames, t('components.innovationFlowSettings.stateEditor.noRepeatedStates')),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  });

  const [handleSave, loading] = useLoadingState((formData: InnovationFlowStateFormValues) =>
    onSubmit({ ...formData, description: emptyMarkdown(formData.description) })
  );

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={handleSave}>
      {({ handleSubmit, isValid }) => {
        return (
          <Gutters disablePadding>
            <FormikInputField name="displayName" title={t('common.title')} maxLength={SMALL_TEXT_LENGTH} />
            <FormikMarkdownField name="description" title={t('common.description')} maxLength={MARKDOWN_TEXT_LENGTH} />
            <Actions justifyContent="end">
              <Button variant="text" onClick={onCancel}>
                {t('buttons.cancel')}
              </Button>
              <Button loading={loading} disabled={!isValid} variant="contained" onClick={() => handleSubmit()}>
                {t('buttons.save')}
              </Button>
            </Actions>
          </Gutters>
        );
      }}
    </Formik>
  );
};

export default InnovationFlowStateForm;
