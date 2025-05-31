import * as yup from 'yup';
import { Button, Skeleton } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { Trans, useTranslation } from 'react-i18next';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import { Form, Formik } from 'formik';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { useSpaceContentTemplatesOnSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import { useMemo } from 'react';
import Gutters from '@/core/ui/grid/Gutters';
import { Actions } from '@/core/ui/actions/Actions';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption } from '@/core/ui/typography';
import { SettingsSection } from '@/domain/platform/admin/layout/EntitySettingsLayout/SettingsSection';
import { useSpace } from '@/domain/space/context/useSpace';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';

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
  const {
    space: {
      about: {
        profile: { url: spaceUrl },
      },
    },
  } = useSpace();
  const [handleSelectCollaborationTemplate, loadingSelectCollaborationTemplate] =
    useLoadingState(onSelectInnovationFlow);

  const { data, loading: loadingInnovationFlows } = useSpaceContentTemplatesOnSpaceQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const initialValues: FormValues = {
    collaborationTemplateSelectedId:
      defaultCollaborationTemplateId ?? data?.lookup.space?.templatesManager?.templatesSet?.spaceTemplates[0]?.id ?? '',
  };

  const validationSchema = yup.object().shape({
    collaborationTemplateSelectedId: yup.string().required(),
  });

  const spaceTemplates = useMemo(
    () =>
      data?.lookup.space?.templatesManager?.templatesSet?.spaceTemplates.map(template => ({
        id: template.id,
        name: template.profile.displayName,
      })),
    [data?.lookup.space?.templatesManager?.templatesSet?.spaceTemplates]
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
                    library: (
                      <RouterLink
                        to={`${buildSettingsUrl(spaceUrl)}/${SettingsSection.Templates}`}
                        underline="always"
                      />
                    ),
                    br: <br />,
                  }}
                />
              </Caption>
              {loadingInnovationFlows && <Skeleton variant="rectangular" />}
              {spaceTemplates && (
                <FormikSelect
                  title={t('common.category')}
                  name="collaborationTemplateSelectedId"
                  values={spaceTemplates}
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
