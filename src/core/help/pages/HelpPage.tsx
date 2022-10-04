import React, { FC, useMemo } from 'react';
import { useUpdateNavigation } from '../../../hooks';
import { Path } from '../../../context/NavigationProvider';
import { useFetchMd } from '../hooks/useFetchMd';
import HelpView from '../views/HelpView';

interface HelpPageProps {
  paths?: Path[];
}

const EMPTY_PATHS = [];

const HelpPage: FC<HelpPageProps> = ({ paths = EMPTY_PATHS }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'help', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { data, loading, error } = useFetchMd('/help/help.md');

  return <HelpView helpTextMd={data} isLoading={loading} error={error} />;
};

export default HelpPage;
