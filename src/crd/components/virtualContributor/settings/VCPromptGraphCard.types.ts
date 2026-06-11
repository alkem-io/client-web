import type { FieldFooterLabels, SectionSaveStatus } from '@/crd/components/common/FieldFooter';

export type { SectionSaveStatus };

export type VcPromptGraphProperty = {
  name: string;
  /** Free-form value type, e.g. 'string' | 'object' (matches the legacy DataPoint). */
  type: string;
  optional: boolean;
  description: string;
};

export type VcPromptGraphNode = {
  name: string;
  /** System nodes are locked (read-only output, no prompt editing). */
  system: boolean;
  /** Variables referenced in the node's prompt (the in-use subset). */
  inputVariables?: string[];
  /** All variables available to this node — base START vars + every upstream
   *  node's output properties (resolved by the integration layer). Rendered
   *  under "Input variables", with the in-use ones highlighted. */
  availableInputVariables?: string[];
  /** Markdown. Editable for user nodes. */
  prompt?: string;
  outputProperties: VcPromptGraphProperty[];
};

export type VcPromptGraphCardProps = {
  /** Nodes ordered START → END (resolved by the integration layer via `prepareGraph`). */
  nodes: VcPromptGraphNode[];

  // user-node edits
  onChangeNodePrompt: (nodeName: string, prompt: string) => void;
  onChangeNodeProperties: (nodeName: string, properties: VcPromptGraphProperty[]) => void;

  onSave: () => void;
  onReset: () => void;
  dirty: boolean;
  status: SectionSaveStatus;

  /** Whether prompt-graph editing is enabled for this VC (platform setting). */
  editingEnabled: boolean;
  /** Platform admins may flip `editingEnabled`. */
  canTogglePlatformSetting: boolean;
  onToggleEditingEnabled?: (next: boolean) => void;
  toggleSaving?: boolean;

  labels: FieldFooterLabels;
};
