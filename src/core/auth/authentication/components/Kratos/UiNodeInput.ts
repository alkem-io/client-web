import { UiNode } from '@ory/kratos-client';
import { UiNodeInputAttributes } from '@ory/kratos-client/api';

// any is in Kratos typings
export interface UiNodeInput<Value = any> extends UiNode {
  attributes: Omit<UiNodeInputAttributes, 'value'> & { value?: Value | null };
}
