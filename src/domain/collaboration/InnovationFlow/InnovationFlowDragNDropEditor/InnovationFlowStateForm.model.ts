import type { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';

// This form edits name/description/allowNewCallouts/visible only — sidebar
// configuration lives on the separate Settings > Layout per-phase dialog
// (PhaseLayoutDialog) and its own settings-only save path. Omitting it here
// (rather than typing it optional) keeps the create/update mutation payload
// honest: this form never sends a `sidebar` key, so it can never
// accidentally clobber it.
export interface InnovationFlowStateFormValues extends Omit<InnovationFlowStateModel, 'id' | 'settings'> {
  settings: Omit<InnovationFlowStateModel['settings'], 'sidebar'>;
}
