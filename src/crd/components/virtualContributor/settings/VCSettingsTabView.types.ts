/**
 * Public types for `VCSettingsTabView` + sub-section cards. Plain TypeScript
 * — no GraphQL types, no Apollo imports, no MUI imports.
 *
 * Implements the contract documented in
 * `specs/097-crd-user-settings/contracts/tab-vcSettings.ts`.
 *
 * Engine-conditional sub-section presence (Decision #17): the orchestrator
 * only renders cards whose props are PRESENT on `VcSettingsViewProps`. The
 * mapper omits absent cards entirely.
 */

import type { SectionSaveStatus } from '@/crd/components/common/FieldFooter';

export type { SectionSaveStatus };

export type VcSearchVisibility = 'public' | 'account' | 'hidden';

export type VcAiEngine = 'alkemio' | 'expert' | 'openaiAssistant' | 'genericOpenai' | 'libraFlow' | 'guidance';

export type VcBodyOfKnowledgeType = 'alkemioSpace' | 'alkemioKnowledgeBase' | 'external';

export type VcVisibilityCardProps = {
  searchVisibility: VcSearchVisibility;
  onChangeSearchVisibility: (next: VcSearchVisibility) => void;
  searchVisibilitySaving: boolean;
  listedInStore: boolean;
  onToggleListedInStore: (next: boolean) => void;
  listedInStoreSaving: boolean;
};

export type VcBodyOfKnowledgeCardProps = {
  bodyOfKnowledgeType: VcBodyOfKnowledgeType;
  contentVisible: boolean;
  onToggleContentVisible: (next: boolean) => void;
  contentVisibleSaving: boolean;
  lastUpdatedIso?: string;
  /** Pre-localized refresh-button label. */
  refreshLabel: string;
  onRefresh: () => void;
  refreshing: boolean;
};

export type VcPromptCardProps = {
  value: string;
  onChange: (next: string) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  /** Pre-localized helper copy + variable list. */
  helpText: string;
};

export type VcExternalConfigCardProps = {
  engine: 'libraFlow' | 'openaiAssistant' | 'genericOpenai';
  /** Always rendered empty; the parent never reads the current key from the server. */
  apiKey: string;
  onChangeApiKey: (next: string) => void;
  assistantId?: string;
  onChangeAssistantId?: (next: string) => void;
  modelOptions: Array<{ value: string; label: string }>;
  modelValue: string;
  onChangeModel: (next: string) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
};

export type VcPromptGraphFallbackProps = {
  /** Pre-localized heading. */
  heading: string;
  /** Pre-localized body copy. */
  description: string;
  /** Pre-localized CTA label. */
  ctaLabel: string;
  /** Legacy MUI Settings page URL. */
  legacyHref: string;
};

export type VcSettingsViewProps = {
  loading: boolean;
  visibility: VcVisibilityCardProps;
  /** Absent when `bodyOfKnowledgeType === 'external'`. */
  bodyOfKnowledge?: VcBodyOfKnowledgeCardProps;
  /** Absent when engine doesn't expose a prompt. */
  prompt?: VcPromptCardProps;
  /** Absent when engine has no external config. */
  externalConfig?: VcExternalConfigCardProps;
  /** Present only when Prompt Graph editing is enabled for this VC + viewer. */
  promptGraphFallback?: VcPromptGraphFallbackProps;
};
