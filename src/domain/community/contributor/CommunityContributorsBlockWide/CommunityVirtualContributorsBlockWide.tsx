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
import { ContributorType } from './CommunityContributorsBlockWideContent';
import Loading from '../../../../core/ui/loading/Loading';
import usePlatformOrigin from '../../../platform/routes/usePlatformOrigin';

interface CommunityContributorsBlockWideProps {
  virtualContributors: VirtualContributorProps[] | undefined;
  isLoading?: boolean;
}

const COMPACT_VIEW_ITEMS_LIMIT = 3 * 8;

const CommunityVirtualContributorsBlockWide = ({
  virtualContributors,
  isLoading,
}: CommunityContributorsBlockWideProps) => {
  const [filter, onFilterChange] = useState<string[]>([]);
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('lg'));
  const columns = useColumns();

  const filterFn = (filter: string[]) => (element: VirtualContributorProps) => {
    return (
      filter.length === 0 ||
      filter.some(
        term =>
          element.profile.displayName.toLowerCase().includes(term.toLowerCase()) ||
          element.profile.tagline.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  const origin = usePlatformOrigin() ?? '';

  return (
    <PageContentBlock>
      <PageContentBlockHeader
        title={''}
        actions={
          <MultipleSelect
            onChange={onFilterChange}
            value={filter}
            minLength={2}
            containerProps={{
              marginLeft: theme => theme.spacing(2),
            }}
            size="xsmall"
            inlineTerms
          />
        }
      />
      <GridProvider columns={isSmallScreen ? columns / 2 : columns}>
        <Gutters row flexWrap="wrap" disablePadding sx={{ overflowY: 'auto' }}>
          {isLoading ? (
            <Loading text={''} />
          ) : (
            virtualContributors
              ?.filter(filterFn(filter))
              .slice(0, COMPACT_VIEW_ITEMS_LIMIT)
              .map(vc => (
                <GridItem key={vc.id} columns={1}>
                  <Box>
                    <ContributorCardSquare
                      avatar={vc.profile.avatar?.uri ?? ''}
                      displayName={vc.profile.displayName}
                      tooltip={{ tags: [] }}
                      url={vc.profile.url.substring(origin.length, vc.profile.url.length) ?? ''}
                      contributorType={ContributorType.Virtuals}
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
