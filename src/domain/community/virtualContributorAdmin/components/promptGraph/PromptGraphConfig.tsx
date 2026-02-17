import { useMemo, useState } from 'react';
import {
  useAiPersonaQuery,
  useUpdateAiPersonaMutation,
  useUpdateVirtualContributorPlatformSettingsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { UpdateAiPersonaInput, PromptGraphInput } from '@/core/apollo/generated/graphql-schema';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContent from '@/core/ui/content/PageContent';
import { useTranslation } from 'react-i18next';
import { BlockTitle, Caption } from '@/core/ui/typography';
import { Switch, Alert } from '@mui/material';
import { Formik } from 'formik';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { FormNodeValue, FormValueType, PromptGraphNode } from './types';
import PromptGraphConfigForm from './PromptGraphConfigForm';
import { transformNodesMapToArray } from './utils';

type PromptGraphConfigProps = {
  vc: {
    id: string;
    platformSettings?: {
      promptGraphEditingEnabled?: boolean | null;
    } | null;
  };
  isPlatformAdmin?: boolean;
};

// Local override: Server accepts null for promptGraph (to trigger reset), but codegen only generates T | undefined
type UpdateAiPersonaInputWithNull = Omit<UpdateAiPersonaInput, 'promptGraph'> & {
  promptGraph?: PromptGraphInput | null;
};

const PromptGraphConfig = ({ vc, isPlatformAdmin = false }: PromptGraphConfigProps) => {
  const { t } = useTranslation();
  const notify = useNotification();
  const [isValid, setIsValid] = useState(false);
  const vcId = vc?.id;

  const { data } = useAiPersonaQuery({
    variables: { id: vcId },
    skip: !vcId,
  });
  const aiPersona = data?.virtualContributor?.aiPersona;

  const [updateAiPersona, { loading: isResetting }] = useUpdateAiPersonaMutation();
  const [updatePlatformSettings, { loading: updatingPlatformSettings }] =
    useUpdateVirtualContributorPlatformSettingsMutation();

  const initialValues: FormValueType = useMemo(() => {
    // Use a deep copy of the promptGraph from aiPersona so we don't mutate the original
    const promptGraph = aiPersona?.promptGraph || { nodes: [], edges: [] };
    const promptGraphCopy = JSON.parse(JSON.stringify(promptGraph));

    // Build nodes object from the copied promptGraph nodes keyed by node.name
    const nodesData: Record<string, FormNodeValue> = {};
    promptGraphCopy.nodes?.forEach((node: PromptGraphNode) => {
      if (node?.name) {
        nodesData[node.name] = {
          input_variables: node.input_variables || [],
          prompt: node.prompt || '',
          output: node.output?.properties ? { properties: node.output.properties } : undefined,
          system: node.system || false,
        };
      }
    });

    return {
      nodes: nodesData,
      state: promptGraphCopy.state || { properties: [] },
    };
  }, [aiPersona]);

  const handleSubmit = (values: FormValueType) => {
    if (!aiPersona) return;
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
          ID: aiPersona.id,
          promptGraph: updatedPromptGraph,
        },
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.success', { entity: t('common.settings') }), 'success');
      },
    });
  };

  const handleReset = () => {
    if (!aiPersona) return;

    // Server accepts null for promptGraph to trigger reset (see UpdateAiPersonaInput on server)
    // Cast required: codegen only generates T | undefined, not T | null | undefined
    // Note: codegen.yml could be configured (maybeValue/inputMaybeValue: T | null | undefined) to support null globally,
    // but this would be a breaking change affecting all generated types across the codebase. Many places may assume
    // optional fields cannot be null, leading to runtime errors. The local override is safer and more explicit.
    const resetData: UpdateAiPersonaInputWithNull = {
      ID: aiPersona.id,
      promptGraph: null,
    };

    updateAiPersona({
      variables: {
        aiPersonaData: resetData as UpdateAiPersonaInput,
      },
      onCompleted: () => {
        notify(t('pages.virtualContributorProfile.settings.promptGraph.resetSuccess'), 'success');
      },
      refetchQueries: ['AiPersona'],
    });
  };

  if (!vc) return null;

  const availableVariables = 'duration, audience, workshop_type, role, purpose';
  const promptGraph = aiPersona?.promptGraph || { nodes: [], edges: [] };
  const promptGraphEditingEnabled = vc.platformSettings?.promptGraphEditingEnabled ?? false;

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.checked;

    // Only allow platform admins to change the platform-wide flag
    if (!isPlatformAdmin) {
      return;
    }

    if (!vcId) return;

    updatePlatformSettings({
      variables: {
        settingsData: {
          virtualContributorID: vcId,
          settings: {
            promptGraphEditingEnabled: nextValue,
          },
        },
      },
    });
  };

  return (
    <PageContent background="background.paper">
      <PageContentColumn columns={12}>
        <PageContentBlock>
          <BlockTitle sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Switch
              checked={promptGraphEditingEnabled}
              onChange={handleToggleChange}
              color="primary"
              disabled={updatingPlatformSettings}
            />
            {t('pages.virtualContributorProfile.settings.promptGraph.title')}
          </BlockTitle>
          <Caption>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t('pages.virtualContributorProfile.settings.promptGraph.warning')}
            </Alert>
            {t('pages.virtualContributorProfile.settings.promptGraph.infoText', { availableVariables })}
          </Caption>
          {promptGraphEditingEnabled && (
            <Formik initialValues={initialValues} enableReinitialize validateOnMount onSubmit={() => {}}>
              <PromptGraphConfigForm
                promptGraph={promptGraph}
                setIsValid={setIsValid}
                isValid={isValid}
                handleSubmit={handleSubmit}
                handleReset={handleReset}
                isResetting={isResetting}
              />
            </Formik>
          )}
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default PromptGraphConfig;
