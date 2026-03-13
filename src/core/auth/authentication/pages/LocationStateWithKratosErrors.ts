import type { UiText } from '@ory/kratos-client/api';

export interface LocationStateWithKratosErrors {
  kratosErrors?: UiText[];
}
