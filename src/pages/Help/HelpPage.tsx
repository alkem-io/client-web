import React, { FC, useMemo } from 'react';
import HelpContainer from '../../containers/help/HelpContainer';
import helpHttpApi from '../../api/HelpHttpApi';
import HelpView from '../../views/Help/HelpView';
import { useUpdateNavigation } from '../../hooks';
import { PageProps } from '../common';

const HelpPage: FC<PageProps> = ({ paths }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'help', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  return <HelpContainer helpApi={helpHttpApi} component={HelpView} />;
};

export default HelpPage;
