import { useAiPersonaServiceQuery, useUpdateAiPersonaServiceMutation } from '@/core/apollo/generated/apollo-hooks';
import * as yup from 'yup';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Field, Formik } from 'formik';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { useMemo, useState } from 'react';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import { useNotification } from '@/core/ui/notifications/useNotification';

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

  const initialValues: FormValueType = useMemo(
    () => ({
      prompt: aiPersonaService?.prompt[0] || '',
    }),
    [aiPersonaService?.id]
  );
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

  return (
    <PageContent background="background.paper">
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <BlockTitle>{t('pages.virtualContributorProfile.settings.prompt.title')}</BlockTitle>
          <Caption>{t('pages.virtualContributorProfile.settings.prompt.infoText')}</Caption>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            initialTouched={{
              prompt: initialValues.prompt !== '',
            }}
            enableReinitialize
            validateOnMount
            onSubmit={() => {}}
          >
            <>
              <FormikEffect
                onChange={(values: FormValueType) => setPrompt(values.prompt)}
                onStatusChange={(isValid: boolean) => setIsValid(isValid)}
              />
              <Field
                name="prompt"
                title={t('pages.virtualContributorProfile.settings.prompt.title')}
                rows={7}
                as="textarea"
                maxLength={MARKDOWN_TEXT_LENGTH}
                temporaryLocation={false}
                hideImageOptions
              />
              <Actions>
                <LoadingButton
                  variant="contained"
                  loading={loading || updateLoading}
                  disabled={!isValid}
                  onClick={handleSubmit}
                >
                  {t('pages.virtualContributorProfile.settings.prompt.saveBtn')}
                </LoadingButton>
              </Actions>
            </>
          </Formik>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default PromptConfig;
