import { ApolloError } from '@apollo/client';
import Box from '@mui/material/Box';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { AspectCardFragment } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';
import AspectsView from '../aspect/AspectsView/AspectsView';

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
  const { t } = useTranslation();
  const { canReadAspects, canCreateAspects } = options;
  const { loading } = state;
  const { context } = entities;

  const contextId = context?.id;

  const aspects = entities?.aspects;

  return (
    <>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.hub.sections.contribute.description')}
      </Box>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.hub.sections.contribute.description2')}
      </Box>
      <AspectsView
        contextId={contextId}
        aspects={aspects}
        aspectsLoading={loading}
        canReadAspects={canReadAspects}
        canCreateAspects={canCreateAspects}
      />
    </>
  );
};

export default ContributeView;
