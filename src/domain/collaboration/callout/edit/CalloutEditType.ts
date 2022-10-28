import { Callout } from '../../../../models/graphql-schema';
import { CalloutFormInput } from '../CalloutForm';

export type CalloutEditType = Required<Omit<CalloutFormInput, 'cardTemplate'>> & { id: Callout['id'] };
