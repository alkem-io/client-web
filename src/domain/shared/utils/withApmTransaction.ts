import * as React from 'react';
import { withTransaction } from '@elastic/apm-rum-react';
import { FC } from 'react';

type WithComponentProps<TProps, TProvided> = TProps & TProvided;
type WithApmTransactionProps = {path: string, component: React.ComponentType}

export const WithApmTransaction: FC<> = (props) =>
  withTransaction(path, 'route-change')(component);