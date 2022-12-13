import { UiNode } from '@ory/kratos-client';
import { UiNodeInputAttributes } from '@ory/kratos-client/api';

// any is in Kratos typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UiNodeInput<Value = any> extends UiNode {
  attributes: Omit<UiNodeInputAttributes, 'value'> & { value?: Value | null };
}
