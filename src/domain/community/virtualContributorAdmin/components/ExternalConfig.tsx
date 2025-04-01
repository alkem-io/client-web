import { useAiPersonaServiceQuery, useUpdateAiPersonaServiceMutation } from '@/core/apollo/generated/apollo-hooks';
import * as yup from 'yup';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { LoadingButton } from '@mui/lab';
import { Formik } from 'formik';
import { useMemo, useState } from 'react';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import { useNotification } from '@/core/ui/notifications/useNotification';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { AiPersonaEngine, OpenAiModel } from '@/core/apollo/generated/graphql-schema';
import FormikSelect from '@/core/ui/forms/FormikSelect';

type ExternalConfigFields = {
  apiKey?: string;
  assistantId?: string;
  model?: OpenAiModel;
};

type FormValueType = {
  apiKey: string;
  assistantId: string;
  model: OpenAiModel;
};

const FormikEffect = FormikEffectFactory<FormValueType>();

interface ExternalConfigProps {
  vc?: {
    aiPersona: {
      aiPersonaServiceID: string;
    };
  };
}

const ExternalConfig = ({ vc }: ExternalConfigProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [externalConfig, setExternalConfig] = useState<ExternalConfigFields>({});
  const [isValid, setIsValid] = useState(false);
  const aiPersonaServiceId = vc?.aiPersona?.aiPersonaServiceID!;

  const { data, loading } = useAiPersonaServiceQuery({
    variables: { id: aiPersonaServiceId },
    skip: !aiPersonaServiceId,
  });
  const aiPersonaService = data?.aiServer.aiPersonaService;
  const isAssistantFieldAvailable = aiPersonaService?.engine === AiPersonaEngine.OpenaiAssistant;

  const [updateAiPersonaService, { loading: updateLoading }] = useUpdateAiPersonaServiceMutation();

  const initialValues: FormValueType = useMemo(
    () => ({
      apiKey: '',
      model: aiPersonaService?.externalConfig?.model || OpenAiModel.O1,
      assistantId: aiPersonaService?.externalConfig?.assistantId || '',
    }),
    [aiPersonaService?.id]
  );

  const validationSchema = yup.object().shape({
    apiKey: yup.string().notRequired(),
    assisantId: isAssistantFieldAvailable ? yup.string().required() : yup.string().notRequired(),
    model: yup.mixed<OpenAiModel>().oneOf(Object.values(OpenAiModel)).required(),
  });

  const handleSubmit = () => {
    if (!externalConfig.apiKey || aiPersonaService?.externalConfig?.apiKey === externalConfig.apiKey) {
      delete externalConfig.apiKey;
    }
    if (!isAssistantFieldAvailable) {
      delete externalConfig.assistantId;
    }
    updateAiPersonaService({
      variables: {
        aiPersonaServiceData: {
          ID: aiPersonaService?.id!,
          externalConfig,
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
      onError: () => {
        notify(t('pages.virtualContributorProfile.error'), 'error');
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
          <BlockTitle>{t('pages.virtualContributorProfile.settings.externalConfig.title')}</BlockTitle>
          <Caption>{t('pages.virtualContributorProfile.settings.externalConfig.infoText')}</Caption>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            validateOnMount
            onSubmit={() => {}}
          >
            <>
              <FormikEffect
                onChange={(values: FormValueType) => setExternalConfig({ ...externalConfig, ...values })}
                onStatusChange={(isValid: boolean) => setIsValid(isValid)}
              />
              <FormikInputField
                name="apiKey"
                placeholder={t('pages.virtualContributorProfile.settings.externalConfig.apiKeyPlaceholder', {
                  value: aiPersonaService?.externalConfig?.apiKey,
                })}
                title={t('pages.virtualContributorProfile.settings.externalConfig.apiKey')}
              />
              {isAssistantFieldAvailable && (
                <FormikInputField
                  name="assistantId"
                  title={t('pages.virtualContributorProfile.settings.externalConfig.assistantId')}
                />
              )}
              <FormikSelect
                name="model"
                title={t('pages.virtualContributorProfile.settings.externalConfig.model')}
                values={Object.values(OpenAiModel).map(model => ({ id: model, name: model }))}
              />
              <Actions>
                <LoadingButton
                  variant="contained"
                  loading={loading || updateLoading}
                  disabled={!isValid}
                  onClick={handleSubmit}
                >
                  {t('pages.virtualContributorProfile.settings.externalConfig.saveBtn')}
                </LoadingButton>
              </Actions>
            </>
          </Formik>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default ExternalConfig;
