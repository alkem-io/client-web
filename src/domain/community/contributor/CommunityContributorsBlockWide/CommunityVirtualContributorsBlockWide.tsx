import { Box, Theme, useMediaQuery } from '@mui/material';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import GridItem from '../../../../core/ui/grid/GridItem';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import Gutters from '../../../../core/ui/grid/Gutters';
import MultipleSelect from '../../../../core/ui/search/MultipleSelect';
import ContributorCardSquare from '../ContributorCardSquare/ContributorCardSquare';
import { useState } from 'react';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import { VirtualContributorProps } from '../../community/VirtualContributorsBlock/VirtualContributorsDialog';
import Loading from '../../../../core/ui/loading/Loading';
import usePlatformOrigin from '../../../platform/routes/usePlatformOrigin';
import { CommunityContributorType } from '../../../../core/apollo/generated/graphql-schema';

interface CommunityContributorsBlockWideProps {
  virtualContributors: VirtualContributorProps[];
  isLoading?: boolean;
}

const DESKTOP_COLUMNS = 8;
const COMPACT_VIEW_ITEMS_LIMIT = 3 * DESKTOP_COLUMNS; // 3 rows on Desktop

const CommunityVirtualContributorsBlockWide = ({
  virtualContributors,
  isLoading,
}: CommunityContributorsBlockWideProps) => {
  const [searchTerm, onSearchTermChange] = useState<string[]>([]);
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));
  const columns = useColumns();

  const matchesNameFilter = (filter: string[]) => (element: VirtualContributorProps) => {
    return (
      filter.length === 0 || filter.some(term => element.profile.displayName.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const origin = usePlatformOrigin() ?? '';

  return (
    <PageContentBlock>
      <PageContentBlockHeader
        title={''}
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
      <GridProvider columns={isSmallScreen ? columns / 2 : DESKTOP_COLUMNS}>
        <Gutters row flexWrap="wrap" disablePadding sx={{ overflowY: 'auto' }}>
          {isLoading ? (
            <Loading text={''} />
          ) : (
            virtualContributors
              ?.filter(matchesNameFilter(searchTerm))
              .slice(0, COMPACT_VIEW_ITEMS_LIMIT)
              .map(vc => (
                <GridItem key={vc.id} columns={1}>
                  <Box>
                    <ContributorCardSquare
                      avatar={vc.profile.avatar?.uri ?? ''}
                      displayName={vc.profile.displayName}
                      tooltip={{ tags: [] }}
                      url={vc.profile.url.substring(origin.length, vc.profile.url.length) ?? ''}
                      contributorType={CommunityContributorType.Virtual}
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

export default CommunityVirtualContributorsBlockWide;
