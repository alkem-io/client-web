import { Callout } from '../../../../models/graphql-schema';
import { CalloutFormInput } from '../CalloutForm';
import { CalloutCardTemplate } from '../creation-dialog/CalloutCreationDialog';

export type CalloutEditType = Required<Omit<CalloutFormInput, 'cardTemplateType'>> & { id: Callout['id'] } & {
  cardTemplate?: CalloutCardTemplate;
};
