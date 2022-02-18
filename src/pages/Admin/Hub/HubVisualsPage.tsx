import React, { FC, useMemo } from 'react';
import { Box } from '@mui/material';
import { PageProps } from '../../common';
import EditVisualsView from '../../../views/Visuals/EditVisualsView';
import { useHub, useUpdateNavigation } from '../../../hooks';

export interface HubVisualsPageProps extends PageProps {}

const HubVisualsPage: FC<HubVisualsPageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'visuals', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });
  const { hub } = useHub();

  return (
    <Box paddingY={2}>
      <EditVisualsView visuals={hub?.context?.visuals} />
    </Box>
  );
};
export default HubVisualsPage;
