import { useEffect, useRef, useState } from 'react';
import {
  useAiPersonaQuery,
  useRefreshBodyOfKnowledgeMutation,
  useUpdateAiPersonaMutation,
  useUpdateVirtualContributorMutation,
  useUpdateVirtualContributorPlatformSettingsMutation,
  useUpdateVirtualContributorSettingsMutation,
  useVirtualContributorKnowledgeBaseLastUpdatedQuery,
  useVirtualContributorQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, type UpdateAiPersonaInput } from '@/core/apollo/generated/graphql-schema';
import { SAVED_FLASH_MS } from '@/crd/components/common/FieldFooter';
import type {
  VcPromptGraphCardProps,
  VcPromptGraphNode,
  VcPromptGraphProperty,
} from '@/crd/components/virtualContributor/settings/VCPromptGraphCard.types';
import type {
  SectionSaveStatus,
  VcBodyOfKnowledgeCardProps,
  VcExternalConfigCardProps,
  VcPromptCardProps,
  VcSearchVisibility,
  VcVisibilityCardProps,
} from '@/crd/components/virtualContributor/settings/VCSettingsTabView.types';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import {
  computeEngineCardVisibility,
  mapBokTypeToView,
  mapEngineToView,
  mapNodesToPromptGraph,
  mapPromptGraphToNodes,
  mapSearchVisibilityToServer,
  mapSearchVisibilityToView,
  OPENAI_MODEL_OPTIONS,
} from './vcSettingsMapper';

/**
 * The hook's result reuses the CRD view contract types — the integration
 * page adds the i18n-resolved `refreshLabel` / `helpText` / fallback copy
 * before passing them into the view (parity with the User Profile +
 * Membership integration pages). Cards the engine doesn't expose are `undefined`.
 */
type UseVcSettingsTabDataResult = {
  loading: boolean;
  visibility: VcVisibilityCardProps;
  bodyOfKnowledge?: Omit<VcBodyOfKnowledgeCardProps, 'refreshLabel'>;
  prompt?: Omit<VcPromptCardProps, 'helpText'>;
  externalConfig?: VcExternalConfigCardProps;
  promptGraph?: Omit<VcPromptGraphCardProps, 'labels'>;
};

/**
 * Integration hook for the VC Settings tab. Implements Decision #17:
 * engine-conditional sub-section presence with the optimistic-revert
 * commit-on-change pattern for Visibility + BoK privacy (parity with User
 * Notifications) and the per-section Save pattern for Prompt + External
 * Config.
 *
 * `apiKey` is **never echoed back** — the field is rendered empty regardless
 * of server state. Only NEW values are sent in the mutation payload (matches
 * MUI semantics in `ExternalConfig.tsx`).
 */
/**
 * Hook arguments. `onCommitError` is invoked when an immediate-commit
 * mutation (Visibility radio, listed-in-store, BoK privacy) fails — the
 * page wires this to a toast so failures aren't silent (FR-181, parity
 * with FR-064 / FR-133).
 */
export type UseVcSettingsTabDataArgs = {
  vcId: string | undefined;
  onCommitError?: () => void;
};

export const useVcSettingsTabData = ({ vcId, onCommitError }: UseVcSettingsTabDataArgs): UseVcSettingsTabDataResult => {
  const {
    data: vcData,
    loading: vcLoading,
    refetch: refetchVc,
  } = useVirtualContributorQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });

  const { data: aiPersonaData, loading: aiPersonaLoading } = useAiPersonaQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });

  const { data: bokData, refetch: refetchBokTimestamp } = useVirtualContributorKnowledgeBaseLastUpdatedQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });

  const [updateVc] = useUpdateVirtualContributorMutation();
  const [updateVcSettings] = useUpdateVirtualContributorSettingsMutation();
  const [updateAiPersona] = useUpdateAiPersonaMutation();
  const [refreshBok] = useRefreshBodyOfKnowledgeMutation();

  const vc = vcData?.lookup.virtualContributor;
  const aiPersona = aiPersonaData?.virtualContributor?.aiPersona;
  const engine = mapEngineToView(aiPersona?.engine ?? vc?.aiPersona?.engine);
  const bokType = mapBokTypeToView(vc?.bodyOfKnowledgeType);

  const cards = computeEngineCardVisibility({
    engine,
    bodyOfKnowledgeType: bokType,
  });

  // ────────────────── Visibility ──────────────────
  // Optimistic-revert pattern: visual flip first, mutation second, revert
  // on hard failure (parity with User Notifications + Org Settings).
  const [overrideSearchVisibility, setOverrideSearchVisibility] = useState<VcSearchVisibility | null>(null);
  const [overrideListedInStore, setOverrideListedInStore] = useState<boolean | null>(null);
  const [searchVisibilitySaving, setSearchVisibilitySaving] = useState(false);
  const [listedInStoreSaving, setListedInStoreSaving] = useState(false);

  const serverSearchVisibility = mapSearchVisibilityToView(vc?.searchVisibility);
  const serverListedInStore = vc?.listedInStore ?? false;
  const searchVisibility = overrideSearchVisibility ?? serverSearchVisibility;
  const listedInStore = overrideListedInStore ?? serverListedInStore;

  const onChangeSearchVisibility = async (next: VcSearchVisibility) => {
    if (!vcId) return;
    setOverrideSearchVisibility(next);
    setSearchVisibilitySaving(true);
    try {
      await updateVc({
        variables: {
          virtualContributorData: { ID: vcId, searchVisibility: mapSearchVisibilityToServer(next) },
        },
      });
      await refetchVc();
      setOverrideSearchVisibility(null);
    } catch {
      setOverrideSearchVisibility(null); // revert
      onCommitError?.();
    } finally {
      setSearchVisibilitySaving(false);
    }
  };

  const onToggleListedInStore = async (next: boolean) => {
    if (!vcId) return;
    setOverrideListedInStore(next);
    setListedInStoreSaving(true);
    try {
      await updateVc({
        variables: { virtualContributorData: { ID: vcId, listedInStore: next } },
      });
      await refetchVc();
      setOverrideListedInStore(null);
    } catch {
      setOverrideListedInStore(null); // revert
      onCommitError?.();
    } finally {
      setListedInStoreSaving(false);
    }
  };

  // ────────────────── BoK ──────────────────
  const serverContentVisible = vc?.settings?.privacy?.knowledgeBaseContentVisible ?? false;
  const [overrideContentVisible, setOverrideContentVisible] = useState<boolean | null>(null);
  const [contentVisibleSaving, setContentVisibleSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | undefined>(undefined);

  const contentVisible = overrideContentVisible ?? serverContentVisible;
  const lastUpdatedFromServer = bokData?.virtualContributor?.aiPersona?.bodyOfKnowledgeLastUpdated;
  const serverLastUpdatedIso = lastUpdatedFromServer
    ? new Date(lastUpdatedFromServer as unknown as string | number).toISOString()
    : undefined;

  // The local timestamp is only a transient optimistic value. As soon as the
  // server returns a fresher (or any) timestamp we clear it so the card
  // reflects the backend value going forward.
  useEffect(() => {
    if (!lastRefreshedAt) return;
    if (!serverLastUpdatedIso) return;
    if (serverLastUpdatedIso >= lastRefreshedAt) {
      setLastRefreshedAt(undefined);
    }
  }, [lastRefreshedAt, serverLastUpdatedIso]);

  const lastUpdatedIso: string | undefined = lastRefreshedAt ?? serverLastUpdatedIso;

  const onToggleContentVisible = async (next: boolean) => {
    if (!vcId) return;
    setOverrideContentVisible(next);
    setContentVisibleSaving(true);
    try {
      await updateVcSettings({
        variables: {
          settingsData: {
            virtualContributorID: vcId,
            settings: { privacy: { knowledgeBaseContentVisible: next } },
          },
        },
      });
      await refetchVc();
      setOverrideContentVisible(null);
    } catch {
      setOverrideContentVisible(null);
      onCommitError?.();
    } finally {
      setContentVisibleSaving(false);
    }
  };

  const onRefresh = async () => {
    if (!vcId) return;
    setRefreshing(true);
    try {
      await refreshBok({ variables: { refreshData: { virtualContributorID: vcId } } });
      setLastRefreshedAt(new Date().toISOString());
      await refetchBokTimestamp();
    } finally {
      setRefreshing(false);
    }
  };

  // ────────────────── Prompt (per-section save) ──────────────────
  const [promptDraft, setPromptDraft] = useState<string | null>(null);
  const [promptStatus, setPromptStatus] = useState<SectionSaveStatus>({ kind: 'idle' });
  const promptFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverPrompt = aiPersona?.prompt?.[0] ?? '';
  const promptValue = promptDraft ?? serverPrompt;
  const promptDirty = promptDraft !== null && promptDraft !== serverPrompt;

  useEffect(
    () => () => {
      if (promptFlashTimer.current) clearTimeout(promptFlashTimer.current);
    },
    []
  );

  const flashPromptSaved = () => {
    setPromptStatus({ kind: 'saved', at: Date.now() });
    if (promptFlashTimer.current) clearTimeout(promptFlashTimer.current);
    promptFlashTimer.current = setTimeout(() => setPromptStatus({ kind: 'idle' }), SAVED_FLASH_MS);
  };

  const onChangePrompt = (next: string) => {
    setPromptDraft(next);
    if (promptStatus.kind === 'error') setPromptStatus({ kind: 'idle' });
  };

  const onSavePrompt = async () => {
    if (!aiPersona?.id || promptDraft === null) return;
    setPromptStatus({ kind: 'saving' });
    try {
      await updateAiPersona({
        variables: { aiPersonaData: { ID: aiPersona.id, prompt: [promptDraft] } },
      });
      setPromptDraft(null);
      flashPromptSaved();
    } catch (err) {
      setPromptStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Save failed' });
    }
  };

  // ────────────────── External Config (per-section save) ──────────────────
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [assistantIdDraft, setAssistantIdDraft] = useState<string | null>(null);
  const [modelDraft, setModelDraft] = useState<string | null>(null);
  const [externalStatus, setExternalStatus] = useState<SectionSaveStatus>({ kind: 'idle' });
  const externalFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (externalFlashTimer.current) clearTimeout(externalFlashTimer.current);
    },
    []
  );

  const serverAssistantId = aiPersona?.externalConfig?.assistantId ?? '';
  const serverModel = aiPersona?.externalConfig?.model ?? OPENAI_MODEL_OPTIONS[0]?.value ?? '';
  const assistantIdValue = assistantIdDraft ?? serverAssistantId;
  const modelValue = modelDraft ?? serverModel;

  const externalDirty =
    apiKeyDraft.trim() !== '' ||
    (assistantIdDraft !== null && assistantIdDraft !== serverAssistantId) ||
    (modelDraft !== null && modelDraft !== serverModel);

  const flashExternalSaved = () => {
    setExternalStatus({ kind: 'saved', at: Date.now() });
    if (externalFlashTimer.current) clearTimeout(externalFlashTimer.current);
    externalFlashTimer.current = setTimeout(() => setExternalStatus({ kind: 'idle' }), SAVED_FLASH_MS);
  };

  const onSaveExternal = async () => {
    if (!aiPersona?.id) return;
    setExternalStatus({ kind: 'saving' });
    const payload: { apiKey?: string; assistantId?: string; model?: string } = {};
    if (apiKeyDraft.trim() !== '') {
      payload.apiKey = apiKeyDraft;
    }
    if (engine === 'openaiAssistant') {
      payload.assistantId = assistantIdValue;
    }
    payload.model = modelValue as typeof payload.model;
    try {
      await updateAiPersona({
        variables: {
          aiPersonaData: { ID: aiPersona.id, externalConfig: payload as Record<string, unknown> },
        },
      });
      setApiKeyDraft('');
      setAssistantIdDraft(null);
      setModelDraft(null);
      flashExternalSaved();
    } catch (err) {
      setExternalStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Save failed' });
    }
  };

  // ────────────────── Prompt Graph (whole-section save + reset) ──────────────────
  const { platformPrivilegeWrapper } = useCurrentUserContext();
  const isPlatformAdmin = platformPrivilegeWrapper?.hasPlatformPrivilege(AuthorizationPrivilege.PlatformAdmin) ?? false;
  const editingEnabled = vc?.platformSettings?.promptGraphEditingEnabled ?? false;

  const [updatePlatformSettings, { loading: togglingPlatformSetting }] =
    useUpdateVirtualContributorPlatformSettingsMutation();

  const [graphDraft, setGraphDraft] = useState<VcPromptGraphNode[] | null>(null);
  const [graphStatus, setGraphStatus] = useState<SectionSaveStatus>({ kind: 'idle' });
  const graphFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverGraphNodes = mapPromptGraphToNodes(aiPersona?.promptGraph);
  const graphNodes = graphDraft ?? serverGraphNodes;
  const graphDirty = graphDraft !== null && JSON.stringify(graphDraft) !== JSON.stringify(serverGraphNodes);

  useEffect(
    () => () => {
      if (graphFlashTimer.current) clearTimeout(graphFlashTimer.current);
    },
    []
  );

  const flashGraphSaved = () => {
    setGraphStatus({ kind: 'saved', at: Date.now() });
    if (graphFlashTimer.current) clearTimeout(graphFlashTimer.current);
    graphFlashTimer.current = setTimeout(() => setGraphStatus({ kind: 'idle' }), SAVED_FLASH_MS);
  };

  const onChangeNodePrompt = (nodeName: string, prompt: string) => {
    setGraphDraft((graphDraft ?? serverGraphNodes).map(n => (n.name === nodeName ? { ...n, prompt } : n)));
    if (graphStatus.kind === 'error') setGraphStatus({ kind: 'idle' });
  };

  const onChangeNodeProperties = (nodeName: string, outputProperties: VcPromptGraphProperty[]) => {
    setGraphDraft((graphDraft ?? serverGraphNodes).map(n => (n.name === nodeName ? { ...n, outputProperties } : n)));
    if (graphStatus.kind === 'error') setGraphStatus({ kind: 'idle' });
  };

  const onSaveGraph = async () => {
    if (!aiPersona?.id || graphDraft === null) return;
    setGraphStatus({ kind: 'saving' });
    try {
      await updateAiPersona({
        variables: {
          aiPersonaData: { ID: aiPersona.id, promptGraph: mapNodesToPromptGraph(graphDraft, aiPersona.promptGraph) },
        },
      });
      setGraphDraft(null);
      flashGraphSaved();
    } catch (err) {
      setGraphStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Save failed' });
    }
  };

  const onResetGraph = async () => {
    if (!aiPersona?.id) return;
    setGraphStatus({ kind: 'saving' });
    try {
      // The server accepts `null` to reset the graph; codegen only types it as
      // `T | undefined`, so the local cast is required (matches the legacy editor).
      const resetData = { ID: aiPersona.id, promptGraph: null } as unknown as UpdateAiPersonaInput;
      await updateAiPersona({ variables: { aiPersonaData: resetData } });
      setGraphDraft(null);
      flashGraphSaved();
    } catch (err) {
      setGraphStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Reset failed' });
    }
  };

  const onToggleEditingEnabled = async (next: boolean) => {
    if (!vcId) return;
    await updatePlatformSettings({
      variables: { settingsData: { virtualContributorID: vcId, settings: { promptGraphEditingEnabled: next } } },
    });
  };

  return {
    loading: vcLoading || aiPersonaLoading,
    visibility: {
      searchVisibility,
      onChangeSearchVisibility,
      searchVisibilitySaving,
      listedInStore,
      onToggleListedInStore,
      listedInStoreSaving,
    },
    bodyOfKnowledge: cards.showBodyOfKnowledge
      ? {
          bodyOfKnowledgeType: bokType ?? 'alkemioSpace',
          contentVisible,
          onToggleContentVisible,
          contentVisibleSaving,
          lastUpdatedIso,
          onRefresh,
          refreshing,
        }
      : undefined,
    prompt: cards.showPrompt
      ? {
          value: promptValue,
          onChange: onChangePrompt,
          dirty: promptDirty,
          status: promptStatus,
          onSave: onSavePrompt,
        }
      : undefined,
    externalConfig:
      cards.showExternalConfig && (engine === 'libraFlow' || engine === 'openaiAssistant' || engine === 'genericOpenai')
        ? {
            engine,
            apiKey: apiKeyDraft,
            onChangeApiKey: setApiKeyDraft,
            assistantId: engine === 'openaiAssistant' ? assistantIdValue : undefined,
            onChangeAssistantId: engine === 'openaiAssistant' ? setAssistantIdDraft : undefined,
            modelOptions: OPENAI_MODEL_OPTIONS,
            modelValue,
            onChangeModel: setModelDraft,
            dirty: externalDirty,
            status: externalStatus,
            onSave: onSaveExternal,
          }
        : undefined,
    promptGraph:
      editingEnabled || isPlatformAdmin
        ? {
            nodes: graphNodes,
            onChangeNodePrompt,
            onChangeNodeProperties,
            onSave: onSaveGraph,
            onReset: onResetGraph,
            dirty: graphDirty,
            status: graphStatus,
            editingEnabled,
            canTogglePlatformSetting: isPlatformAdmin,
            onToggleEditingEnabled,
            toggleSaving: togglingPlatformSetting,
          }
        : undefined,
  };
};

export default useVcSettingsTabData;
