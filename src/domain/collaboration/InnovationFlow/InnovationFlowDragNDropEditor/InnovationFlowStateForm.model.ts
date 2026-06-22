import type { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';

export interface InnovationFlowStateFormValues extends Omit<InnovationFlowStateModel, 'id'> {}
