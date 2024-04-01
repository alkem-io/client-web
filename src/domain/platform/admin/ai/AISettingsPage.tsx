import React, { FC } from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { Form, Formik } from 'formik';
import { Actions } from '../../../../core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';

interface AISettingsPageProps {}

const AISettingsPage: FC<AISettingsPageProps> = () => {
  const initialValues = {
    prompt: `You will be provided with customer service inquiries that require troubleshooting in a technical support context. Help the user by:
    - Ask them to check that all cables to/from the router are connected. Note that it is common for cables to come loose over time.
    - If all cables are connected and the issue persists, ask them which router model they are using
    - Now you will advise them how to restart their device:
    -- If the model number is MTD-327J, advise them to push the red button and hold it for 5 seconds, then wait 5 minutes before testing the connection.
    -- If the model number is MTD-327S, advise them to unplug and replug it, then wait 5 minutes before testing the connection.
    - If the customers issue persists after restarting the device and waiting 5 minutes, connect them to IT support by outputting { "IT support requested"}.
    - If the user starts asking questions that are unrelated to this topic then confirm if they would like to end the current chat about troubleshooting and classify their request according to the following scheme:
    `,
  };

  const onSave = () => {};

  return (
    <AdminLayout currentTab={AdminSection.AISettings}>
      <Formik initialValues={initialValues} onSubmit={onSave}>
        <Form>
          <Gutters>
            <FormikInputField
              multiline
              name="prompt"
              label="Prompt"
              title="Prompt"
              sx={{ height: gutters(20), fontFamily: 'monospace' }}
            />
            <Actions>
              <LoadingButton loading={false} type="submit" variant="contained">
                Save
              </LoadingButton>
            </Actions>
          </Gutters>
        </Form>
      </Formik>
    </AdminLayout>
  );
};

export default AISettingsPage;
