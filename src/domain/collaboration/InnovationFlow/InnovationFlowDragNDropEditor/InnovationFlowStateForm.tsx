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
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';

export interface InnovationFlowStateFormValues extends InnovationFlowStateModel {}

type InnovationFlowStateFormProps = {
  state?: InnovationFlowStateModel;
  forbiddenFlowStateNames?: string[];
  onSubmit: (formData: InnovationFlowStateFormValues) => Promise<unknown>;
  onCancel?: () => void;
};

// Leave description empty if the Markdown component has returned just a <br> tag
const emptyMarkdown = (markdown: string | undefined = '') => (markdown.trim() === '<br>' ? '' : markdown.trim());

const InnovationFlowStateForm = ({
  state,
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
    displayName: displayNameValidator({ required: true })
      // Avoid commas in state names, because they are used to separate states (in tagsets) in the database
      // This validation is also performed on the server: domain/collaboration/innovation-flow-states/innovation.flow.state.service.ts
      // Keep them in sync
      .test('no-comma', t('components.innovationFlowSettings.stateEditor.invalidChars'), value => !value?.includes(','))
      // This is also still needed at least until we have callouts classified by state id and not by displayName
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
