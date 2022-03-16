import { ApolloError } from '@apollo/client';
import React, { FC } from 'react';
import { AspectCardFragment } from '../../../../models/graphql-schema';
import { ViewProps } from '../../../../models/view';
import AspectsView from '../../aspect/AspectsView/AspectsView';

interface ContextIdHolder {
  id: string;
}

export interface ContributeViewEntities {
  context?: ContextIdHolder;
  aspects?: AspectCardFragment[];
}

export interface ContributeViewActions {}

export interface ContributeViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface ContributeViewOptions {
  canReadAspects: boolean;
  canCreateAspects: boolean;
}

export interface ContributeViewProps
  extends ViewProps<ContributeViewEntities, ContributeViewActions, ContributeViewState, ContributeViewOptions> {}

const ContributeView: FC<ContributeViewProps> = ({ entities, options, state }) => {
  const { canReadAspects, canCreateAspects } = options;
  const { loading } = state;
  const { context } = entities;

  const contextId = context?.id;

  const aspects = entities?.aspects;

  return (
    <AspectsView
      contextId={contextId}
      aspects={aspects}
      aspectsLoading={loading}
      canReadAspects={canReadAspects}
      canCreateAspects={canCreateAspects}
    />
  );
};

export default ContributeView;
