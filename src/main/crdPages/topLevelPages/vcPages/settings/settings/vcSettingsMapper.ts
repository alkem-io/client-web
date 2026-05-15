import {
  AiPersonaEngine,
  OpenAiModel,
  SearchVisibility,
  VirtualContributorBodyOfKnowledgeType,
} from '@/core/apollo/generated/graphql-schema';
import type {
  VcAiEngine,
  VcBodyOfKnowledgeType,
  VcSearchVisibility,
} from '@/crd/components/virtualContributor/settings/VCSettingsTabView.types';

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
