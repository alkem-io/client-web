import { useMemo, useState } from 'react';
import { useAiPersonaQuery, useUpdateAiPersonaMutation } from '@/core/apollo/generated/apollo-hooks';
import * as yup from 'yup';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Switch, Alert } from '@mui/material';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Formik } from 'formik';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { FormValueType } from './types';
import PromptGraphConfigForm from './PromptGraphConfigForm';
import { transformNodesMapToArray } from './utils';

const PromptGraphConfig = ({ vc }) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [prompt, setPrompt] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const vcId = vc?.id;

  const { data } = useAiPersonaQuery({
    variables: { id: vcId },
    skip: !vcId,
  });
  const aiPersona = data?.virtualContributor?.aiPersona;

  const [updateAiPersona] = useUpdateAiPersonaMutation();

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
    // Transform the nodes map from the form into an array of promptGraph nodes
    const transformedNodes = transformNodesMapToArray(values?.nodes);

    // Merge with existing promptGraph from server so we don't drop other fields
    const existingPromptGraph = aiPersona?.promptGraph || { nodes: [], edges: [] };
    const updatedPromptGraph = {
      ...existingPromptGraph,
      // overwrite nodes with values from the form
      nodes: transformedNodes,
    };

    // Proceed with the existing update logic (kept commented as before)
    updateAiPersona({
      variables: {
        aiPersonaData: {
          ID: aiPersona?.id!,
          prompt: [prompt],
          promptGraph: updatedPromptGraph,
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };

  if (!vc) return null;

  const availableVariables = 'duration, audience, workshop_type, role, purpose';
  const promptGraph = aiPersona?.promptGraph || { nodes: [], edges: [] };

  return (
    <PageContent background="background.paper">
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <BlockTitle sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Switch checked={showAdvanced} onChange={() => setShowAdvanced(s => !s)} />
            {t('pages.virtualContributorProfile.settings.promptGraph.title')}
          </BlockTitle>
          <Caption>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('pages.virtualContributorProfile.settings.promptGraph.warning')}
            </Alert>
            {t('pages.virtualContributorProfile.settings.promptGraph.infoText', { availableVariables })}
          </Caption>
          {showAdvanced && (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              enableReinitialize
              validateOnMount
              onSubmit={() => { }}
            >
              <PromptGraphConfigForm
                promptGraph={promptGraph}
                setIsValid={setIsValid}
                isValid={isValid}
                handleSubmit={handleSubmit}
              />
            </Formik>
          )}
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default PromptGraphConfig;
