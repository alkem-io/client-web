import { Box } from '@mui/material';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import GridItem from '@/core/ui/grid/GridItem';
import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import ContributorCardSquare from '../ContributorCardSquare/ContributorCardSquare';
import { useState, ReactNode, useMemo } from 'react';
import { useColumns } from '@/core/ui/grid/GridContext';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import Loading from '@/core/ui/loading/Loading';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { useScreenSize } from '@/core/ui/grid/constants';

type RoleSetContributorTypesBlockWideProps = {
  virtualContributors: VirtualContributorProps[];
  title?: ReactNode;
  loading?: boolean;
  compactView?: boolean;
};

const COMPACT_VIEW_ROWS = 3;

const RoleSetVirtualContributorsBlockWide = ({
  title,
  virtualContributors,
  loading,
  compactView = false,
}: RoleSetContributorTypesBlockWideProps) => {
  const [searchTerm, onSearchTermChange] = useState<string[]>([]);
  const { isMediumSmallScreen } = useScreenSize();
  const columns = useColumns();

  const matchesNameFilter = (filter: string[]) => (element: VirtualContributorProps) => {
    return (
      filter.length === 0 || filter.some(term => element.profile.displayName.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const origin = usePlatformOrigin() ?? '';

  const compactViewItemsLimit = compactView ? columns * COMPACT_VIEW_ROWS : undefined;

  const visibleVCs = useMemo(
    () =>
      (virtualContributors ?? [])
        .filter(matchesNameFilter(searchTerm))
        .slice(0, compactView ? compactViewItemsLimit : undefined),
    [virtualContributors, searchTerm, compactViewItemsLimit]
  );

  return (
    <PageContentBlock>
      <PageContentBlockHeader
        title={title ?? ''}
        actions={
          <MultipleSelect
            onChange={onSearchTermChange}
            value={searchTerm}
            minLength={2}
            containerProps={{
              marginLeft: theme => theme.spacing(2),
            }}
            size="xsmall"
            inlineTerms
          />
        }
      />
      <GridProvider columns={isMediumSmallScreen ? columns / 2 : columns}>
        <Gutters row flexWrap="wrap" disablePadding sx={{ overflowY: 'auto' }}>
          {loading ? (
            <Loading text={''} />
          ) : (
            visibleVCs.map(vc => (
              <GridItem key={vc.id} columns={1}>
                <Box>
                  <ContributorCardSquare
                    avatar={vc.profile.avatar?.uri ?? ''}
                    displayName={vc.profile.displayName}
                    tooltip={{ tags: [] }}
                    url={vc.profile.url.substring(origin.length, vc.profile.url.length) ?? ''}
                    contributorType={RoleSetContributorType.Virtual}
                    isContactable={false}
                    {...vc}
                  />
                </Box>
              </GridItem>
            ))
          )}
        </Gutters>
      </GridProvider>
    </PageContentBlock>
  );
};

export default RoleSetVirtualContributorsBlockWide;
