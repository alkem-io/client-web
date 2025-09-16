import { useAiPersonaQuery, useUpdateAiPersonaMutation } from '@/core/apollo/generated/apollo-hooks';
import * as yup from 'yup';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { Formik } from 'formik';
import { useMemo, useRef, useState } from 'react';
import FormikEffectFactory from '@/core/ui/forms/FormikEffect';
import { useNotification } from '@/core/ui/notifications/useNotification';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { AiPersonaEngine, OpenAiModel } from '@/core/apollo/generated/graphql-schema';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import { Button } from '@mui/material';

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
  vc: {
    aiPersonaID?: string;
  };
}

const ExternalConfig = ({ vc }: ExternalConfigProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [externalConfig, setExternalConfig] = useState<ExternalConfigFields>({});
  const [isValid, setIsValid] = useState(false);
  const apiKeyRef = useRef<HTMLInputElement>(null);

  const aiPersonaId = vc?.aiPersonaID!;

  const { data, loading } = useAiPersonaQuery({
    variables: { id: aiPersonaId },
    skip: !aiPersonaId,
  });
  const aiPersona = data?.aiServer.aiPersona;
  const isAssistantFieldAvailable = aiPersona?.engine === AiPersonaEngine.OpenaiAssistant;

  const [updateAiPersona, { loading: updateLoading }] = useUpdateAiPersonaMutation();

  const initialValues: FormValueType = useMemo(
    () => ({
      apiKey: '',
      model: aiPersona?.externalConfig?.model || OpenAiModel.O1,
      assistantId: aiPersona?.externalConfig?.assistantId || '',
    }),
    [aiPersona?.id]
  );

  const validationSchema = yup.object().shape({
    apiKey: yup.string().notRequired(),
    assistantId: isAssistantFieldAvailable ? yup.string().required() : yup.string().notRequired(),
    model: yup.mixed<OpenAiModel>().oneOf(Object.values(OpenAiModel)).required(),
  });

  const handleSubmit = () => {
    if (!externalConfig.apiKey || aiPersona?.externalConfig?.apiKey === externalConfig.apiKey) {
      delete externalConfig.apiKey;
    }
    if (!isAssistantFieldAvailable) {
      delete externalConfig.assistantId;
    }
    updateAiPersona({
      variables: {
        aiPersonaData: {
          ID: aiPersona?.id!,
          externalConfig,
        },
      },
      onCompleted: () => {
        if (apiKeyRef.current) {
          apiKeyRef.current.value = '';
        }
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
                inputProps={{ ref: apiKeyRef }}
                name="apiKey"
                placeholder={t('pages.virtualContributorProfile.settings.externalConfig.apiKeyPlaceholder', {
                  value: aiPersona?.externalConfig?.apiKey,
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
                <Button
                  variant="contained"
                  loading={loading || updateLoading}
                  disabled={!isValid}
                  onClick={handleSubmit}
                >
                  {t('pages.virtualContributorProfile.settings.externalConfig.saveBtn')}
                </Button>
              </Actions>
            </>
          </Formik>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default ExternalConfig;
