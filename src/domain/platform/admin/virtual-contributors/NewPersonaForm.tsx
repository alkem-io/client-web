import { useMemo } from 'react';
import { Form, Formik } from 'formik';
import Gutters from '../../../../core/ui/grid/Gutters';
import { useTranslation } from 'react-i18next';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { useCreateVirtualPersonaMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { Actions } from '../../../../core/ui/actions/Actions';
import { Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { VirtualPersonaEngine } from '../../../../core/apollo/generated/graphql-schema';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import { useBackToStaticPath } from '../../../../core/routing/useBackToPath';
import FormikSelect from '../../../../core/ui/forms/FormikSelect';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';

interface NewPersonaFormValues {
  displayName: string;
  nameId: string;
  description: string;
  prompt: string;
  engine: VirtualPersonaEngine;
}

interface NewPersonaFormProps {
  parentPagePath: string;
}

const NewPersonaForm = ({ parentPagePath }: NewPersonaFormProps) => {
  const { t } = useTranslation();
  const navigateBack = useBackToStaticPath(parentPagePath);
  const notify = useNotification();
  const initialValues = {
    displayName: '',
    nameId: '',
    prompt: '',
    description: '',
    engine: VirtualPersonaEngine.AlkemioWelcome,
  };
  const [createPersona, { loading }] = useCreateVirtualPersonaMutation({
    onCompleted: () => {
      notify('Persona Created Successfully!', 'success');
      navigateBack();
    },
  });

  const onCancel = () => {
    navigateBack();
  };

  const [handleSubmit] = useLoadingState(
    async ({ displayName, prompt, engine, nameId, description }: NewPersonaFormValues) => {
      await createPersona({
        variables: {
          virtualPersonaData: {
            prompt,
            nameID: nameId,
            profileData: {
              displayName,
              description,
            },
            engine,
          },
        },
      });
    }
  );

  const engines = useMemo(
    () =>
      (Object.values(VirtualPersonaEngine) as string[]).map(engine => ({
        id: engine,
        name: engine,
        label: engine,
      })),
    [VirtualPersonaEngine]
  );

  return (
    <AdminLayout currentTab={AdminSection.VirtualContributors}>
      <PageContentBlock>
        <PageContentBlockHeader title="Create Virtal Persona" />
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <Form>
            <Gutters>
              <FormikInputField title={t('common.title')} name="displayName" />
              <FormikInputField title={t('components.nameSegment.nameID.title')} name="nameId" />
              <FormikMarkdownField title={t('common.prompt')} name="prompt" />
              <FormikMarkdownField title={t('common.description')} name="description" />
              <FormikSelect title="Select Engine" name="engine" values={engines ?? []} />
              <Actions>
                <Button variant="text" onClick={onCancel}>
                  {t('buttons.cancel')}
                </Button>
                <LoadingButton loading={loading} type="submit" variant="contained">
                  {t('buttons.save')}
                </LoadingButton>
              </Actions>
            </Gutters>
          </Form>
        </Formik>
      </PageContentBlock>
    </AdminLayout>
  );
};

export default NewPersonaForm;
