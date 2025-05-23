import { useAiPersonaServiceQuery, useUpdateAiPersonaServiceMutation } from '@/core/apollo/generated/apollo-hooks';
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
import { Button, OutlinedInput } from '@mui/material';

type FormValueType = {
  prompt: string;
};
const FormikEffect = FormikEffectFactory<FormValueType>();

const PromptConfig = ({ vc }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [prompt, setPrompt] = useState('');
  const [isValid, setIsValid] = useState(false);
  const aiPersonaServiceId = vc?.aiPersona?.aiPersonaServiceID;

  const { data, loading } = useAiPersonaServiceQuery({
    variables: { id: aiPersonaServiceId },
    skip: !aiPersonaServiceId,
  });
  const aiPersonaService = data?.aiServer.aiPersonaService;

  const [updateAiPersonaService, { loading: updateLoading }] = useUpdateAiPersonaServiceMutation();

  const initialValues: FormValueType = useMemo(() => {
    setPrompt(aiPersonaService?.prompt[0] || '');
    return {
      prompt: aiPersonaService?.prompt[0] || '',
    };
  }, [aiPersonaService?.id]);

  const validationSchema = yup.object().shape({
    prompt: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  });

  const handleSubmit = () => {
    updateAiPersonaService({
      variables: {
        aiPersonaServiceData: {
          ID: aiPersonaService?.id!,
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
              <OutlinedInput
                name="prompt"
                value={prompt}
                title={t('pages.virtualContributorProfile.settings.prompt.title')}
                onChange={e => setPrompt(e.target.value)}
                multiline
                minRows={10}
                maxRows={35}
              />
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
