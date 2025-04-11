import * as yup from 'yup';
import { Button, Skeleton } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { Trans, useTranslation } from 'react-i18next';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import { Form, Formik } from 'formik';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { useSpaceCollaborationTemplatesQuery } from '@/core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';
import Gutters from '@/core/ui/grid/Gutters';
import { Actions } from '@/core/ui/actions/Actions';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption } from '@/core/ui/typography';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';

interface FormValues {
  collaborationTemplateSelectedId: string;
}

interface SelectDefaultCollaborationTemplateDialogProps {
  spaceId: string | undefined;
  open: boolean;
  onClose?: () => void;
  defaultCollaborationTemplateId?: string;
  onSelectCollaborationTemplate: (collaborationTemplateId: string) => Promise<unknown>;
}

const SelectDefaultCollaborationTemplateDialog = ({
  spaceId,
  open,
  onClose,
  defaultCollaborationTemplateId,
  onSelectCollaborationTemplate: onSelectInnovationFlow,
}: SelectDefaultCollaborationTemplateDialogProps) => {
  const { t } = useTranslation();
  const [handleSelectCollaborationTemplate, loadingSelectCollaborationTemplate] =
    useLoadingState(onSelectInnovationFlow);

  const { data, loading: loadingInnovationFlows } = useSpaceCollaborationTemplatesQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const initialValues: FormValues = {
    collaborationTemplateSelectedId:
      defaultCollaborationTemplateId ??
      data?.lookup.space?.templatesManager?.templatesSet?.collaborationTemplates[0]?.id ??
      '',
  };

  const validationSchema = yup.object().shape({
    collaborationTemplateSelectedId: yup.string().required(),
  });

  const collaborationTemplates = useMemo(
    () =>
      data?.lookup.space?.templatesManager?.templatesSet?.collaborationTemplates.map(template => ({
        id: template.id,
        name: template.profile.displayName,
      })),
    [data?.lookup.space?.templatesManager?.templatesSet?.collaborationTemplates]
  );

  return (
    <DialogWithGrid open={open} onClose={onClose}>
      <DialogHeader
        title={t('pages.admin.space.sections.subspaces.defaultSettings.defaultCollaborationTemplate.title')}
        onClose={onClose}
      />
      <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={() => {}}>
        {({ isValid, values }) => (
          <Form noValidate>
            <Gutters>
              <Caption>
                <Trans
                  i18nKey="pages.admin.space.sections.subspaces.defaultSettings.defaultCollaborationTemplate.description"
                  components={{
                    library: <RouterLink to={`../../${SettingsSection.Templates}`} underline="always" />,
                    br: <br />,
                  }}
                />
              </Caption>
              {loadingInnovationFlows && <Skeleton variant="rectangular" />}
              {collaborationTemplates && (
                <FormikSelect
                  title={t('common.category')}
                  name="collaborationTemplateSelectedId"
                  values={collaborationTemplates}
                />
              )}
              <Actions justifyContent="end">
                <Button variant="text" onClick={onClose}>
                  {t('buttons.cancel')}
                </Button>
                <Button
                  variant="contained"
                  loading={loadingSelectCollaborationTemplate}
                  disabled={!isValid}
                  onClick={() => handleSelectCollaborationTemplate(values.collaborationTemplateSelectedId)}
                >
                  {t('buttons.save')}
                </Button>
              </Actions>
            </Gutters>
          </Form>
        )}
      </Formik>
    </DialogWithGrid>
  );
};

export default SelectDefaultCollaborationTemplateDialog;
