import { UiNode } from '@ory/kratos-client';
import { UiNodeAnchorAttributes, UiNodeInputAttributes } from '@ory/kratos-client/api';

// any is in Kratos typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UiNodeInput<Value = any> extends UiNode {
  attributes: Omit<UiNodeInputAttributes, 'value'> & { value?: Value | null };
}

export interface UiNodeAnchor extends UiNode {
  attributes: UiNodeAnchorAttributes;
}
