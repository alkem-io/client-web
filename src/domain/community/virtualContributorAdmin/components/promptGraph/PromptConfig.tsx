import { useMemo, useState } from 'react';
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
// ...existing code...
import { useNotification } from '@/core/ui/notifications/useNotification';
import { FormValueType } from './types';
import PromptConfigForm from './PromptConfigForm';

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

    // Use a deep copy of the promptGraph from aiPersona so we don't mutate the original
    const promptGraph = aiPersona?.promptGraph || { nodes: [], edges: [] };
    const promptGraphCopy = JSON.parse(JSON.stringify(promptGraph));

    // Build nodes object from the copied promptGraph nodes keyed by node.name
    const nodesData: Record<string, { input_variables: string[]; prompt: string; output?: { properties: any[] } }> = {};
    promptGraphCopy.nodes?.forEach((node: any) => {
      if (node?.name) {
        nodesData[node.name] = {
          input_variables: node.input_variables || [],
          prompt: node.prompt || '',
          output: node.output?.properties ? { properties: node.output.properties } : undefined,
        };
      }
    });

    return {
      prompt: aiPersona?.prompt[0] || '',
      nodes: nodesData,
    };
  }, [aiPersona?.id]);

  const validationSchema = yup.object().shape({
    prompt: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
  });

  const handleSubmit = (values: any) => {
    // updateAiPersona({
    //   variables: {
    //     aiPersonaData: {
    //       ID: aiPersona?.id!,
    //       prompt: [prompt],
    //     },
    //   },
    //   onCompleted: () => {
    //     notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
    //   },
    // });
  };

  if (!vc) return null;

  const availableVariables = 'duration, audience, workshop_type, role, purpose';
  const promptGraph = aiPersona?.promptGraph || { nodes: [], edges: [] };

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
            onSubmit={() => { }}
          >
            <PromptConfigForm
              promptGraph={promptGraph}
              setPrompt={setPrompt}
              setIsValid={setIsValid}
              isValid={isValid}
              loading={loading}
              updateLoading={updateLoading}
              handleSubmit={handleSubmit}
              t={t}
            />
          </Formik>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default PromptConfig;
