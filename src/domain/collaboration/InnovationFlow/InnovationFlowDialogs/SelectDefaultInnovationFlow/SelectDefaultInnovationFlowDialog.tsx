import * as yup from 'yup';
import { Button, Skeleton } from '@mui/material';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../../core/ui/dialog/DialogWithGrid';
import WrapperMarkdown from '../../../../../core/ui/markdown/WrapperMarkdown';
import { useTranslation } from 'react-i18next';
import FormikSelect from '../../../../../core/ui/forms/FormikSelect';
import { Form, Formik } from 'formik';
import useLoadingState from '../../../../shared/utils/useLoadingState';
import { LoadingButton } from '@mui/lab';
import { useSpaceInnovationFlowsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { Actions } from '../../../../../core/ui/actions/Actions';

interface FormValues {
  innovationFlowSelectedId: string;
}

interface SelectDefaultInnovationFlowDialogProps {
  spaceId: string | undefined;
  open: boolean;
  onClose?: () => void;
  defaultInnovationFlowId?: string;
  onSelectInnovationFlow: (innovationFlowTemplateId: string) => Promise<unknown>;
}

const SelectDefaultInnovationFlowDialog = ({
  spaceId,
  open,
  onClose,
  defaultInnovationFlowId,
  onSelectInnovationFlow,
}: SelectDefaultInnovationFlowDialogProps) => {
  const { t } = useTranslation();
  const [handleSelectInnovationFlow, loadingSelectInnovationFlow] = useLoadingState(onSelectInnovationFlow);

  const { data, loading: loadingInnovationFlows } = useSpaceInnovationFlowsQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const initialValues: FormValues = {
    innovationFlowSelectedId: defaultInnovationFlowId ?? data?.space.templates?.innovationFlowTemplates[0]?.id ?? '',
  };

  const validationSchema = yup.object().shape({
    innovationFlowSelectedId: yup.string().required(),
  });

  const innovationFlowTemplates = useMemo(
    () =>
      data?.space.templates?.innovationFlowTemplates.map(template => ({
        id: template.id,
        name: template.profile.displayName,
      })),
    [data?.space.templates?.innovationFlowTemplates]
  );

  return (
    <DialogWithGrid open={open} onClose={onClose}>
      <DialogHeader
        title={t('pages.admin.space.sections.challenges.defaultSettings.defaultInnovationFlow.title')}
        onClose={onClose}
      />
      <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={() => {}}>
        {({ isValid, values }) => (
          <Form noValidate>
            <Gutters>
              <WrapperMarkdown caption>
                {t('pages.admin.space.sections.challenges.defaultSettings.defaultInnovationFlow.description')}
              </WrapperMarkdown>
              {loadingInnovationFlows && <Skeleton variant="rectangular" />}
              {innovationFlowTemplates && (
                <FormikSelect
                  title={t('components.discussionForm.category.title')}
                  name="innovationFlowSelectedId"
                  values={innovationFlowTemplates}
                />
              )}
              <Actions justifyContent="end">
                <Button variant="text" onClick={onClose}>
                  {t('buttons.cancel')}
                </Button>
                <LoadingButton
                  variant="contained"
                  loading={loadingSelectInnovationFlow}
                  disabled={!isValid}
                  onClick={() => handleSelectInnovationFlow(values.innovationFlowSelectedId)}
                >
                  {t('buttons.save')}
                </LoadingButton>
              </Actions>
            </Gutters>
          </Form>
        )}
      </Formik>
    </DialogWithGrid>
  );
};

export default SelectDefaultInnovationFlowDialog;
