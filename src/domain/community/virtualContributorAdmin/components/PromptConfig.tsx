import { useAiPersonaQuery, useUpdateAiPersonaMutation } from '@/core/apollo/generated/apollo-hooks';
import * as yup from 'yup';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Formik } from 'formik';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { useMemo, useState } from 'react';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Button, OutlinedInput, Box } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';

type FormValueType = {
  prompt: string;
};
const FormikEffect = FormikEffectFactory<FormValueType>();

const PromptConfig = ({ vc }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [prompt, setPrompt] = useState('');
  const [isValid, setIsValid] = useState(false);
  const vcId = vc?.id;

  const { data, loading } = useAiPersonaQuery({
    variables: { id: vcId },
    skip: !vcId,
  });
  const aiPersona = data?.virtualContributor?.aiPersona;

  const [updateAiPersona, { loading: updateLoading }] = useUpdateAiPersonaMutation();

  const initialValues: FormValueType = useMemo(() => {
    setPrompt(aiPersona?.prompt[0] || '');
    return {
      prompt: aiPersona?.prompt[0] || '',
    };
  }, [aiPersona?.id]);

  const validationSchema = yup.object().shape({
    prompt: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  });

  const handleSubmit = () => {
    updateAiPersona({
      variables: {
        aiPersonaData: {
          ID: aiPersona?.id!,
          prompt: [prompt],
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };
  if (!vc) {
    return null;
  }
  const availableVariables = 'duration, audience, workshop_type, role, purpose';

  return (
    <PageContent background="background.paper">
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <BlockTitle>{t('pages.virtualContributorProfile.settings.prompt.title')}</BlockTitle>
          <Caption>{t('pages.virtualContributorProfile.settings.prompt.infoText', { availableVariables })}</Caption>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            validateOnMount
            onSubmit={() => {}}
          >
            <>
              <FormikEffect onStatusChange={(isValid: boolean) => setIsValid(isValid)} />
              <Box>
                <Box>
                  <BlockTitle variant="h5" sx={{ marginBottom: 0 }}>
                    Steps
                  </BlockTitle>
                </Box>

                {[1, 2, 3].map(i => (
                  <>
                    <Box>
                      <Box>
                        <OutlinedInput
                          name="step_description"
                          title="Step"
                          sx={{ width: '100%' }}
                          placeholder="Step description"
                        />
                      </Box>
                      <Box sx={{ marginTop: 1, marginBottom: 1 }}>
                        Input is the output of all steps plus:
                        <ul>
                          <li>{'{knowledge}'} - relevant parts of the VC knowledge base structured like: ...</li>
                          <li>
                            {'{conversation}'} - the conversation so far structured as: <br /> <b>human</b>: some human
                            message
                            <br />
                            <b>assistant</b>: some assistant message <br />
                            <br />
                          </li>
                          <li>
                            {'{first_message}'} - the contents of the first message in the conversation as simple string
                          </li>
                          <li>
                            {'{last_message}'} - the contents of the last message in the conversation as simple string
                          </li>
                        </ul>
                      </Box>
                      <OutlinedInput
                        name="prompt"
                        value={prompt}
                        title={t('pages.virtualContributorProfile.settings.prompt.title')}
                        onChange={e => setPrompt(e.target.value)}
                        multiline
                        minRows={10}
                        maxRows={35}
                        fullWidth
                      />

                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', marginBottom: 1 }}>
                        {/* <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column' }}> */}
                        {/*   <Box> */}
                        {/*     <BlockTitle variant="h6" sx={{ marginBottom: 0 }}> */}
                        {/*       Input */}
                        {/*     </BlockTitle> */}
                        {/*   </Box> */}
                        {/*   <Box sx={{ display: 'flex', width: '100%', flexDirection: 'row', alignItems: 'flex-start' }}> */}
                        {/*     <OutlinedInput sx={{ width: '100%' }} name="label" title="key" /> */}
                        {/*     <OutlinedInput sx={{ width: '100%' }} name="description" title="description" /> */}
                        {/*   </Box> */}
                        {/*   <Button variant="outlined" sx={{ marginTop: 1 }}> */}
                        {/*     + Add */}
                        {/*   </Button> */}
                        {/* </Box> */}
                        <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                          <Box>
                            <BlockTitle variant="h6" sx={{ marginBottom: 0 }}>
                              Output
                            </BlockTitle>
                          </Box>
                          {[1, 2, 3].map(() => (
                            <Box
                              sx={{ display: 'flex', width: '100%', flexDirection: 'row', alignItems: 'flex-start' }}
                            >
                              <OutlinedInput sx={{ width: '100%' }} name="label" title="key" placeholder="Name" />
                              <OutlinedInput
                                sx={{ width: '100%' }}
                                name="description"
                                title="description"
                                placeholder="Description"
                              />
                            </Box>
                          ))}
                          <Button variant="outlined" sx={{ marginTop: 1 }}>
                            + Add
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                    <hr style={{ margin: '40px 0' }} />
                  </>
                ))}

                <Button variant="outlined" sx={{ marginTop: 1 }}>
                  + Add
                </Button>
              </Box>
              <Actions>
                <Button
                  variant="contained"
                  loading={loading || updateLoading}
                  disabled={!isValid}
                  onClick={handleSubmit}
                >
                  {t('pages.virtualContributorProfile.settings.prompt.saveBtn')}
                </Button>
              </Actions>
            </>
          </Formik>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default PromptConfig;
