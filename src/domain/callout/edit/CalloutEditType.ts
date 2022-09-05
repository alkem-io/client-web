import { Callout } from '../../../models/graphql-schema';
import { CalloutFormInput } from '../creation-dialog/steps/CalloutInfoStep/CalloutForm';

export type CalloutEditType = Required<CalloutFormInput> & { id: Callout['id'] };
