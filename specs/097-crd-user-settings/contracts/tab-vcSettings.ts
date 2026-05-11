/**
 * VC Settings tab — view contract.
 *
 * Engine-conditional sub-sections (Decision #17 in research.md). Mirrors the
 * MUI `VirtualContributorSettingsPage`
 * (`src/domain/community/virtualContributorAdmin/VirtualContributorSettingsPage/`)
 * — same orchestration, same mutations
 * (`updateVirtualContributor`, `updateVirtualContributorSettings`,
 * `updateAiPersona`, `refreshBodyOfKnowledge`), restyled.
 *
 * Sub-sections rendered by engine + auth:
 * - **Visibility** — always rendered.
 * - **Body of Knowledge** — when `bodyOfKnowledgeType` ∈ {`AlkemioSpace`,
 *   `AlkemioKnowledgeBase`} OR `engine === 'Guidance'`.
 * - **Prompt** — when `engine` ∈ {`GenericOpenai`, `LibraFlow`}.
 * - **External Config** — when `engine` ∈ {`LibraFlow`, `OpenaiAssistant`,
 *   `GenericOpenai`}.
 * - **Prompt Graph fallback tile** — when `engine === 'Expert'` AND
 *   (`platformAdmin` OR `platformSettings.promptGraphEditingEnabled`).
 *   This is a small read-only tile linking to the legacy MUI Settings page —
 *   the full node/edge editor is deferred to a follow-up spec.
 */

import type { SectionSaveStatus } from './tab-userProfile';

export type VcSearchVisibility = 'public' | 'account' | 'hidden';

export type VcAiEngine =
  | 'alkemio'
  | 'expert'
  | 'openaiAssistant'
  | 'genericOpenai'
  | 'libraFlow'
  | 'guidance';

export type VcBodyOfKnowledgeType = 'alkemioSpace' | 'alkemioKnowledgeBase' | 'external';

/**
 * VC Visibility card — search visibility radio + listed-in-store toggle.
 * Each control commits immediately on change (parity with the optimistic-
 * overrides pattern on User Notifications: visual flip first, mutation
 * second, revert + toast on hard failure).
 */
export type VcVisibilityCardProps = {
  searchVisibility: VcSearchVisibility;
  onChangeSearchVisibility: (next: VcSearchVisibility) => void;
  searchVisibilitySaving: boolean;
  /** Available only when `searchVisibility === 'public'`. */
  listedInStore: boolean;
  onToggleListedInStore: (next: boolean) => void;
  listedInStoreSaving: boolean;
};

/**
 * Body of Knowledge card — privacy toggle + manual refresh + last-updated
 * timestamp. When `bodyOfKnowledgeType === 'external'` this card is hidden.
 */
export type VcBodyOfKnowledgeCardProps = {
  bodyOfKnowledgeType: VcBodyOfKnowledgeType;
  /** `settings.privacy.knowledgeBaseContentVisible` */
  contentVisible: boolean;
  onToggleContentVisible: (next: boolean) => void;
  contentVisibleSaving: boolean;
  /** ISO timestamp of the last `refreshBodyOfKnowledge` mutation success. */
  lastUpdatedIso?: string;
  /** Pre-localized refresh-button label. */
  refreshLabel: string;
  onRefresh: () => void;
  refreshing: boolean;
};

/**
 * Prompt card — markdown editor for `aiPersona.prompt[0]`. Per-section save
 * via FieldFooter (status + Save button). Markdown editor is the existing
 * `@/crd/forms/markdown/MarkdownEditor` — same component used by User /
 * Org Profile Bio / Description.
 */
export type VcPromptCardProps = {
  value: string;
  onChange: (next: string) => void;
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
  /** Documentation copy + variable list shown under the editor. */
  helpText: string;
};

/**
 * External AI config card. Fields:
 * - `apiKey` — never echoed back; the input renders empty regardless of
 *   server state. Only NEW values are sent (matches MUI semantics:
 *   `ExternalConfig.tsx` line 72).
 * - `assistantId` — required when `engine === 'openaiAssistant'`.
 * - `model` — select from `OpenAiModel` enum values supplied via `modelOptions`.
 *
 * Per-section save via FieldFooter.
 */
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

/**
 * Prompt Graph fallback tile. Rendered when the underlying flow editor is
 * out of scope for the CRD shell (Decision #17 — deferred). Links the admin
 * to the legacy MUI page so they can edit the graph there.
 */
export type VcPromptGraphFallbackProps = {
  /** Pre-localized heading. */
  heading: string;
  /** Pre-localized body copy. */
  description: string;
  /** Pre-localized CTA label ("Open Prompt Graph editor in legacy view"). */
  ctaLabel: string;
  /** Legacy MUI Settings page URL — e.g. `/vc/<nameId>/settings` (when CRD off). */
  legacyHref: string;
};

/** Top-level view contract for the VC Settings tab. */
export type VcSettingsViewProps = {
  loading: boolean;
  visibility: VcVisibilityCardProps;
  /** Absent when `bodyOfKnowledgeType === 'external'`. */
  bodyOfKnowledge?: VcBodyOfKnowledgeCardProps;
  /** Absent when engine doesn't expose a prompt. */
  prompt?: VcPromptCardProps;
  /** Absent when engine has no external config (e.g. Alkemio / Expert / Guidance). */
  externalConfig?: VcExternalConfigCardProps;
  /** Present only when Prompt Graph editing is enabled for this VC + viewer (Decision #17). */
  promptGraphFallback?: VcPromptGraphFallbackProps;
};
