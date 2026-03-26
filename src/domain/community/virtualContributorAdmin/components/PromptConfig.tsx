import { Button, OutlinedInput } from '@mui/material';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useAiPersonaQuery, useUpdateAiPersonaMutation } from '@/core/apollo/generated/apollo-hooks';
import { Actions } from '@/core/ui/actions/Actions';
import PageContent from '@/core/ui/content/PageContent';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { BlockTitle, Caption } from '@/core/ui/typography';

type FormValueType = {
  prompt: string;
};
const FormikEffect = FormikEffectFactory<FormValueType>();

export interface PromptConfigProps {
  vc: { id: string; aiPersona?: { id: string; prompt: string[] } };
}

export const PromptConfig = ({ vc }: PromptConfigProps) => {
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

  // Update prompt when aiPersona changes
  useEffect(() => {
    const newPrompt = aiPersona?.prompt?.[0];
    if (newPrompt !== undefined) {
      setPrompt(newPrompt);
    } else if (newPrompt === undefined && aiPersona?.id) {
      // Clear stale data when prompt becomes undefined
      setPrompt('');
    }
  }, [aiPersona?.id, aiPersona?.prompt?.[0]]);

  const initialValues: FormValueType = (() => {
    return {
      prompt: aiPersona?.prompt?.[0] || '',
    };
  })();

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
            enableReinitialize={true}
            validateOnMount={true}
            onSubmit={() => {}}
          >
            <FormikEffect onStatusChange={(isValid: boolean) => setIsValid(isValid)} />
            <OutlinedInput
              name="prompt"
              value={prompt}
              title={t('pages.virtualContributorProfile.settings.prompt.title')}
              onChange={e => setPrompt(e.target.value)}
              multiline={true}
              minRows={10}
              maxRows={35}
            />
            <Actions>
              <Button variant="contained" loading={loading || updateLoading} disabled={!isValid} onClick={handleSubmit}>
                {t('pages.virtualContributorProfile.settings.prompt.saveBtn')}
              </Button>
            </Actions>
          </Formik>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};
