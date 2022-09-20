import React, { FC, useMemo } from 'react';
import HelpContainer from '../../containers/help/HelpContainer';
import helpHttpApi from '../../core/help/api/HelpHttpApi';
import HelpView from '../../core/help/views/HelpView';
import { useUpdateNavigation } from '../../hooks';
import { Path } from '../../context/NavigationProvider';

interface HelpPageProps {
  paths?: Path[];
}

const EMPTY_PATHS = [];

const HelpPage: FC<HelpPageProps> = ({ paths = EMPTY_PATHS }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'help', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <HelpContainer helpApi={helpHttpApi} component={HelpView} />;
};

export default HelpPage;
