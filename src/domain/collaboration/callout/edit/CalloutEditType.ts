import { Callout } from '../../../../core/apollo/generated/graphql-schema';
import { CalloutFormInput } from '../CalloutForm';
import { CalloutCanvasTemplate, CalloutCardTemplate } from '../creation-dialog/CalloutCreationDialog';

export type CalloutEditType = Omit<CalloutFormInput, 'cardTemplateType' | 'canvasTemplateData' | 'type'> & {
  id: Callout['id'];
  profile: {
    displayName?: string;
    description?: string;
  };
} & {
  cardTemplate?: CalloutCardTemplate;
  canvasTemplate?: CalloutCanvasTemplate;
};
