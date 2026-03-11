import { withTransaction } from '@elastic/apm-rum-react';
import type React from 'react';
import type { FC } from 'react';

type Props = { path: string; children: React.ReactElement };

export const WithApmTransaction: FC<Props> = ({ path, children }) => {
  const Component = withTransaction(path, 'route-change')(children.type);

  return <Component {...(children.props || {})} />;
};
