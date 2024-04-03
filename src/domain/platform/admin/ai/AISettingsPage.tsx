import React, { FC } from 'react';
import AdminLayout from '../layout/toplevel/AdminLayout';
import { AdminSection } from '../layout/toplevel/constants';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { Form, Formik } from 'formik';
import { Actions } from '../../../../core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import Gutters from '../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../core/ui/grid/utils';
import { useCookies } from 'react-cookie';

interface VirtualContributorsConfig {
  prompt1: string;
  prompt2: string;
  prompt3: string;
}

const ALKEMIO_COOKIE_PROMPT1 = 'prompt1';
const ALKEMIO_COOKIE_PROMPT2 = 'prompt2';
const ALKEMIO_COOKIE_PROMPT3 = 'prompt3';
const COOKIE_EXPIRY = 2147483647 * 1000; // Y2k38 -> 2^31 - 1 = 2147483647 ie. 2038-01-19 04:14:07

// Virtual Community Manager
const PROMPT1_DEFAULT = `
You are an expert community manager.
You need to confirm that a message written by the a user in the community follows these set of rules:
----
{communityRules}
----
You have to answer just two lines of text. The fist line will be "YES", or "NO" if the message follows the rules. The second line will be the reason why you think so.
----
{message}
----
`;

// Virtual Expert:
const PROMPT2_DEFAULT = `
You are an expert in the topic of Energy Transition.
Answer the following message sent by one of our users:
----
{message}
----
`;

// Digital Twin:

const PROMPT3_DEFAULT = '';

interface AISettingsPageProps {}

const AISettingsPage: FC<AISettingsPageProps> = () => {
  const [cookies, setCookie] = useCookies([ALKEMIO_COOKIE_PROMPT1, ALKEMIO_COOKIE_PROMPT2, ALKEMIO_COOKIE_PROMPT3]);

  const initialValues = {
    prompt1: (cookies.prompt1 as string) ?? PROMPT1_DEFAULT,
    prompt2: (cookies.prompt2 as string) ?? PROMPT2_DEFAULT,
    prompt3: (cookies.prompt3 as string) ?? PROMPT3_DEFAULT,
  };

  const onSave = (values: VirtualContributorsConfig) => {
    setCookie(ALKEMIO_COOKIE_PROMPT1, values.prompt1, {
      expires: new Date(COOKIE_EXPIRY),
      path: '/',
      sameSite: 'strict',
    });
    setCookie(ALKEMIO_COOKIE_PROMPT2, values.prompt1, {
      expires: new Date(COOKIE_EXPIRY),
      path: '/',
      sameSite: 'strict',
    });
    setCookie(ALKEMIO_COOKIE_PROMPT3, values.prompt1, {
      expires: new Date(COOKIE_EXPIRY),
      path: '/',
      sameSite: 'strict',
    });
  };
  const textAreasStyle = {
    InputProps: {
      sx: { fontFamily: 'monospace', height: gutters(20) },
    },
    sx: { height: gutters(20), div: { alignItems: 'flex-start' } },
  };

  return (
    <AdminLayout currentTab={AdminSection.AISettings}>
      <Formik initialValues={initialValues} onSubmit={onSave}>
        <Form>
          <Gutters>
            <FormikInputField
              multiline
              name="prompt1"
              label="Virtual Community Manager Prompt (Prompt 1)"
              title="Prompt"
              {...textAreasStyle}
            />
            <FormikInputField
              multiline
              name="prompt2"
              label="Ask an expert (Prompt 2)"
              title="Prompt"
              {...textAreasStyle}
            />
            <FormikInputField
              multiline
              name="prompt3"
              label="Virtual twin (Prompt 3)"
              title="Prompt"
              {...textAreasStyle}
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
