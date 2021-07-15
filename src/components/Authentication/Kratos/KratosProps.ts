import { UiNode } from '@ory/kratos-client';

export interface KratosProps {
  node: UiNode;
}

export interface KratosInputExtraProps {
  autoComplete?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
}
