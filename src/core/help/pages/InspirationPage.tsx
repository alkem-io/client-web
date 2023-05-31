import React, { FC, useMemo } from 'react';
import { Path } from '../../routing/NavigationProvider';
import { useFetchMd } from '../hooks/useFetchMd';
import HelpView from '../views/HelpView';
import { useUpdateNavigation } from '../../routing/useNavigation';
import TopLevelDesktopLayout from '../../../domain/platform/ui/PageLayout/TopLevelDesktopLayout';
import PageContentBlock from '../../ui/content/PageContentBlock';
import { gutters } from '../../ui/grid/utils';

interface InspirationPageProps {
  paths?: Path[];
}

const EMPTY_PATHS = [];

const InspirationPage: FC<InspirationPageProps> = ({ paths = EMPTY_PATHS }) => {
  const currentPaths = useMemo(() => [...paths, { value: '', name: 'inspiration', real: true }], [paths]);
  useUpdateNavigation({ currentPaths });

  const { data, loading, error } = useFetchMd('/help/callout-inspiration.md');

  return (
    <TopLevelDesktopLayout>
      <PageContentBlock sx={{ paddingBottom: gutters(5) }}>
        <HelpView helpTextMd={data} isLoading={loading} error={error} />
      </PageContentBlock>
    </TopLevelDesktopLayout>
  );
};

export default InspirationPage;
