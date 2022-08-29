import { CalloutFormInput } from '../../../components/composite/aspect/AspectCreationDialog/form/CalloutForm';
import { Callout } from '../../../models/graphql-schema';

export type CalloutEditType = Required<CalloutFormInput> & { id: Callout['id'] };
