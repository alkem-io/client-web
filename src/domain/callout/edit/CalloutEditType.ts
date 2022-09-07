import { Callout } from '../../../models/graphql-schema';
import { CalloutFormInput } from '../CalloutForm';

export type CalloutEditType = Required<CalloutFormInput> & { id: Callout['id'] };
