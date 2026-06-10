import {
  AiPersonaEngine,
  OpenAiModel,
  type PromptGraph,
  SearchVisibility,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import type {
  VcPromptGraphNode,
  VcPromptGraphProperty,
} from '@/crd/components/virtualContributor/settings/VCPromptGraphCard.types';
import type {
  VcAiEngine,
  VcBodyOfKnowledgeType,
  VcSearchVisibility,
} from '@/crd/components/virtualContributor/settings/VCSettingsTabView.types';
import type {
  FormNodeValue,
  PromptGraphNode as LegacyPromptGraphNode,
} from '@/domain/community/virtualContributorAdmin/components/promptGraph/types';
import {
  prepareGraph,
  transformNodesMapToArray,
} from '@/domain/community/virtualContributorAdmin/components/promptGraph/utils';

/**
 * GraphQL → plain-string-union enum bridges for the VC Settings tab view.
 * The CRD components see only the lowercase plain-TS unions; the integration
 * hook maps generated enums into them via these helpers (FR-006).
 */

export const mapSearchVisibilityToView = (server: SearchVisibility | null | undefined): VcSearchVisibility => {
  switch (server) {
    case SearchVisibility.Public:
      return 'public';
    case SearchVisibility.Hidden:
      return 'hidden';
    default:
      return 'account';
  }
};

export const mapSearchVisibilityToServer = (view: VcSearchVisibility): SearchVisibility => {
  switch (view) {
    case 'public':
      return SearchVisibility.Public;
    case 'hidden':
      return SearchVisibility.Hidden;
    default:
      return SearchVisibility.Account;
  }
};

export const mapEngineToView = (engine: AiPersonaEngine | null | undefined): VcAiEngine | undefined => {
  if (!engine) return undefined;
  switch (engine) {
    case AiPersonaEngine.Expert:
      return 'expert';
    case AiPersonaEngine.OpenaiAssistant:
      return 'openaiAssistant';
    case AiPersonaEngine.GenericOpenai:
      return 'genericOpenai';
    case AiPersonaEngine.LibraFlow:
      return 'libraFlow';
    case AiPersonaEngine.Guidance:
      return 'guidance';
    default:
      return 'alkemio';
  }
};

export const mapBokTypeToView = (
  type: VirtualContributorBodyOfKnowledgeType | null | undefined
): VcBodyOfKnowledgeType | undefined => {
  switch (type) {
    case VirtualContributorBodyOfKnowledgeType.AlkemioSpace:
      return 'alkemioSpace';
    case VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase:
      return 'alkemioKnowledgeBase';
    case VirtualContributorBodyOfKnowledgeType.None:
      return undefined;
    default:
      return undefined;
  }
};

export type EngineCardVisibility = {
  showBodyOfKnowledge: boolean;
  showPrompt: boolean;
  showExternalConfig: boolean;
};

/**
 * Engine-conditional sub-section truth table — Decision #17 in research.md.
 * Pure function on view-side enums.
 */
export const computeEngineCardVisibility = (params: {
  engine: VcAiEngine | undefined;
  bodyOfKnowledgeType: VcBodyOfKnowledgeType | undefined;
}): EngineCardVisibility => {
  const { engine, bodyOfKnowledgeType } = params;
  return {
    showBodyOfKnowledge:
      bodyOfKnowledgeType === 'alkemioSpace' || bodyOfKnowledgeType === 'alkemioKnowledgeBase' || engine === 'guidance',
    showPrompt: engine === 'genericOpenai' || engine === 'libraFlow',
    showExternalConfig: engine === 'libraFlow' || engine === 'openaiAssistant' || engine === 'genericOpenai',
  };
};

/** Static model options sourced from the generated `OpenAiModel` enum. */
export const OPENAI_MODEL_OPTIONS = Object.values(OpenAiModel).map(value => ({ value, label: value }));

/**
 * Maps the server `PromptGraph` to the CRD card's ordered node list. Uses the
 * legacy `prepareGraph` traversal for START→END ordering, drops the terminal
 * START/END markers, and exposes only the editable shape.
 */
export const mapPromptGraphToNodes = (promptGraph: PromptGraph | null | undefined): VcPromptGraphNode[] => {
  if (!promptGraph?.nodes?.length) return [];

  const byName = new Map<string, LegacyPromptGraphNode>();
  for (const node of promptGraph.nodes) {
    if (node.name) byName.set(node.name, node as unknown as LegacyPromptGraphNode);
  }

  const ordered = prepareGraph(promptGraph);
  const seen = new Set<string>();
  const result: VcPromptGraphNode[] = [];

  const push = (name: string, real: LegacyPromptGraphNode) => {
    if (!name || name === 'START' || name === 'END' || seen.has(name)) return;
    seen.add(name);
    result.push({
      name,
      system: real.system ?? false,
      inputVariables: real.input_variables ?? [],
      prompt: real.prompt ?? '',
      outputProperties: (real.output?.properties ?? []).map(
        (p): VcPromptGraphProperty => ({
          name: p.name,
          type: p.type,
          optional: p.optional,
          description: p.description,
        })
      ),
    });
  };

  // Ordered path first, then any unreached nodes (fallback) in array order.
  for (const pathNode of ordered) {
    const real = pathNode.name ? byName.get(pathNode.name) : undefined;
    if (real) push(pathNode.name, real);
  }
  for (const node of promptGraph.nodes) {
    if (node.name) push(node.name, node as unknown as LegacyPromptGraphNode);
  }

  return result;
};

/**
 * Rebuilds the server `promptGraph.nodes` array from the edited CRD nodes,
 * preserving the rest of the original graph (edges / state / start / end).
 */
export const mapNodesToPromptGraph = (nodes: VcPromptGraphNode[], original: PromptGraph | null | undefined) => {
  const nodesMap: Record<string, FormNodeValue> = {};
  for (const node of nodes) {
    nodesMap[node.name] = {
      input_variables: node.inputVariables ?? [],
      prompt: node.prompt ?? '',
      output: { properties: node.outputProperties },
      system: node.system,
    };
  }
  return {
    ...(original ?? { nodes: [], edges: [] }),
    nodes: transformNodesMapToArray(nodesMap),
  };
};
