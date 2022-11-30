import { UiNode } from '@ory/kratos-client';

const isAcceptTermsCheckbox = (node: UiNode) => node.attributes['name'] === 'traits.accepted_terms';

export default isAcceptTermsCheckbox;
