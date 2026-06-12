// Contract: VC Prompt Graph card (US4 — the ONLY remaining admin-config surface) — plain TS props.
// Layer 3 component: src/crd/components/virtualContributor/settings/VCPromptGraphCard.tsx
// Plugs into the existing VCSettingsTabView; data via useVcSettingsTabData (extend) + vcSettingsMapper.
// Built from shadcn Accordion + a custom property-row editor — NO graph library.

export type VcPromptGraphPropertyType = string; // 'string' | 'object' | ... (free-form, per legacy)

export type VcPromptGraphProperty = {
  name: string;
  type: VcPromptGraphPropertyType;
  optional: boolean;
  description: string;
};

export type VcPromptGraphNode = {
  name: string;
  /** system nodes are locked/read-only; user nodes are editable */
  system: boolean;
  /** variables referenced in the node's prompt (the in-use subset) */
  inputVariables?: string[];
  /** all variables available to this node: base START vars + every upstream
   *  node's output properties. Rendered under "Input variables"; the in-use
   *  ones (derived live from the prompt text) are highlighted green. */
  availableInputVariables?: string[];
  prompt?: string; // markdown, editable for user nodes
  outputProperties: VcPromptGraphProperty[];
};

export type SectionSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type VcPromptGraphCardProps = {
  nodes: VcPromptGraphNode[]; // ordered START → END (linear traversal of edges)

  // user-node edits
  onChangeNodePrompt: (nodeName: string, prompt: string) => void;
  onChangeNodeProperties: (nodeName: string, properties: VcPromptGraphProperty[]) => void;

  onSave: () => void;
  onReset: () => void; // sends promptGraph: null then re-initialises
  dirty: boolean;
  status: SectionSaveStatus;

  // platform-admin gate
  editingEnabled: boolean; // platformSettings.promptGraphEditingEnabled
  canTogglePlatformSetting: boolean; // platform-admin only
  onToggleEditingEnabled?: (next: boolean) => void;
};
