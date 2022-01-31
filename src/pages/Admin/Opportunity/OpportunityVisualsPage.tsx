import React, { FC, useMemo } from 'react';
import { PageProps } from '../../common';
import EditVisualsView from '../../../views/Visuals/EditVisualsView';
import { useOpportunity, useUpdateNavigation } from '../../../hooks';

export interface OpportunityVisualsPageProps extends PageProps {}

const OpportunityVisualsPage: FC<OpportunityVisualsPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'visuals', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { opportunity } = useOpportunity();

  return <EditVisualsView visuals={opportunity?.context?.visuals} />;
};
export default OpportunityVisualsPage;
