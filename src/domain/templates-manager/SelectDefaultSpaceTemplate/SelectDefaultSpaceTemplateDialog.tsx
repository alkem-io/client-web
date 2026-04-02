import { Button, Skeleton } from '@mui/material';
import { Form, Formik } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useSpaceContentTemplatesOnSpaceQuery } from '@/core/apollo/generated/apollo-hooks';
import { Actions } from '@/core/ui/actions/Actions';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';
import Gutters from '@/core/ui/grid/Gutters';
import RouterLink from '@/core/ui/link/RouterLink';
import { Caption } from '@/core/ui/typography';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { useSpace } from '@/domain/space/context/useSpace';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';

interface FormValues {
  spaceTemplateSelectedId: string;
}

interface SelectDefaultSpaceTemplateDialogProps {
  spaceId: string | undefined;
  open: boolean;
  onClose?: () => void;
  defaultSpaceTemplateId?: string;
  onSelectSpaceTemplate: (spaceTemplateId: string) => Promise<unknown>;
}

const SelectDefaultSpaceTemplateDialog = ({
  spaceId,
  open,
  onClose,
  defaultSpaceTemplateId,
  onSelectSpaceTemplate: onSelectInnovationFlow,
}: SelectDefaultSpaceTemplateDialogProps) => {
  const { t } = useTranslation();
  const {
    space: {
      about: {
        profile: { url: spaceUrl },
      },
    },
  } = useSpace();
  const [handleSelectSpaceTemplate, loadingSelectSpaceTemplate] = useLoadingState(onSelectInnovationFlow);

  const { data, loading: loadingInnovationFlows } = useSpaceContentTemplatesOnSpaceQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const initialValues: FormValues = {
    spaceTemplateSelectedId:
      defaultSpaceTemplateId ?? data?.lookup.space?.templatesManager?.templatesSet?.spaceTemplates[0]?.id ?? '',
  };

  const validationSchema = yup.object().shape({
    spaceTemplateSelectedId: textLengthValidator({ required: true }),
  });

  const spaceTemplates = data?.lookup.space?.templatesManager?.templatesSet?.spaceTemplates.map(template => ({
    id: template.id,
    name: template.profile.displayName,
  }));

  return (
    <DialogWithGrid open={open} onClose={onClose} aria-labelledby="select-default-space-template-dialog">
      <DialogHeader
        id="select-default-space-template-dialog"
        title={t('pages.admin.space.sections.subspaces.defaultSettings.defaultSpaceTemplate.title')}
        onClose={onClose}
      />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={() => {}}
      >
        {({ isValid, values }) => (
          <Form noValidate={true}>
            <Gutters>
              <Caption>
                <Trans
                  i18nKey="pages.admin.space.sections.subspaces.defaultSettings.defaultSpaceTemplate.description"
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
                <FormikSelect title={t('common.category')} name="spaceTemplateSelectedId" values={spaceTemplates} />
              )}
              <Actions justifyContent="end">
                <Button variant="text" onClick={onClose}>
                  {t('buttons.cancel')}
                </Button>
                <Button
                  variant="contained"
                  loading={loadingSelectSpaceTemplate}
                  disabled={!isValid}
                  onClick={() => handleSelectSpaceTemplate(values.spaceTemplateSelectedId)}
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

export default SelectDefaultSpaceTemplateDialog;
