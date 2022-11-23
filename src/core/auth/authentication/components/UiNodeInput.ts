import { UiNode } from '@ory/kratos-client';
import { UiNodeInputAttributes } from '@ory/kratos-client/api';

export interface UiNodeInput extends UiNode {
  attributes: UiNodeInputAttributes;
}
