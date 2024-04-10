import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import Gutters from '../../../../core/ui/grid/Gutters';
import { useTranslation } from 'react-i18next';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import useLoadingState from '../../../shared/utils/useLoadingState';
import { useCreateVirtualPersonaMutation } from '../../../../core/apollo/generated/apollo-hooks';
import { Actions } from '../../../../core/ui/actions/Actions';
import { Button, Container } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { VirtualPersonaEngine } from '../../../../core/apollo/generated/graphql-schema';
import { v4 as uuidv4 } from 'uuid';
import { useNotification } from '../../../../core/ui/notifications/useNotification';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import FormikSelect from '../../../../core/ui/forms/FormikSelect';

interface NewPersonaFormValues {
  displayName: string;
  prompt: string;
  engine: VirtualPersonaEngine;
}

const NewPersonaForm: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotification();
  const initialValues = { displayName: '', prompt: '', engine: VirtualPersonaEngine.AlkemioWelcome };
  const [createPersona, { loading }] = useCreateVirtualPersonaMutation({
    onCompleted: () => {
      notify('Persona Created Successfully!', 'success');
      navigate(-1);
    },
  });

  const onCancel = () => {
    navigate(-1);
  };

  const [handleSubmit] = useLoadingState(async (values: NewPersonaFormValues) => {
    const { displayName, prompt, engine } = values;

    await createPersona({
      variables: {
        virtualPersonaData: {
          prompt,
          nameID: `${'V'}-${'P'}-${uuidv4()}`.slice(0, 25).toLocaleLowerCase(),
          profileData: {
            displayName,
          },
          engine,
        },
      },
    });
  });

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
      <Container maxWidth="xl">
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <Form>
            <Gutters>
              <FormikInputField title={t('common.title')} name="displayName" />
              <FormikMarkdownField title={t('common.prompt')} name="prompt" />
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
      </Container>
    </AdminLayout>
  );
};

export default NewPersonaForm;
