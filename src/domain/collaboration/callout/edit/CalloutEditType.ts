import { Callout } from '../../../../core/apollo/generated/graphql-schema';
import { CalloutFormInput } from '../CalloutForm';
import { CalloutCanvasTemplate, CalloutCardTemplate } from '../creation-dialog/CalloutCreationDialog';

export type CalloutEditType = Omit<CalloutFormInput, 'cardTemplateType' | 'canvasTemplateTitle' | 'type'> & {
  id: Callout['id'];
} & {
  cardTemplate?: CalloutCardTemplate;
  canvasTemplate?: CalloutCanvasTemplate;
};
