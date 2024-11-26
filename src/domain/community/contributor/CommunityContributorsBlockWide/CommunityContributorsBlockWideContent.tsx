import { Box, useMediaQuery } from '@mui/material';
import ContributorCardSquare, { ContributorCardSquareProps } from '../ContributorCardSquare/ContributorCardSquare';
import GridItem from '@/core/ui/grid/GridItem';
import Gutters from '@/core/ui/grid/Gutters';
import { Theme } from '@mui/material/styles';
import GridProvider from '@/core/ui/grid/GridProvider';
import { useColumns } from '@/core/ui/grid/GridContext';
import { CommunityContributorType } from '@/core/apollo/generated/graphql-schema';

type CommunityContributorsBlockWideContentProps = {
  users: ContributorCardSquareProps[] | undefined;
  organizations: ContributorCardSquareProps[] | undefined;
  nested?: boolean;
  contributorType: CommunityContributorType;
  filter: string[];
  compactView?: boolean;
};

const COMPACT_VIEW_ROWS = 3;

const filterFn = (filter: string[]) => (element: ContributorCardSquareProps) => {
  return (
    filter.length === 0 ||
    filter.some(
      term =>
        element.displayName.toLowerCase().includes(term.toLowerCase()) ||
        element.tooltip?.tags.map(tag => tag.toLowerCase()).includes(term.toLowerCase())
    )
  );
};

const CommunityContributorsBlockWideContent = ({
  nested = false,
  users,
  organizations,
  contributorType,
  filter,
  compactView = false,
}: CommunityContributorsBlockWideContentProps) => {
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  const columns = useColumns();

  const compactViewItemsLimit = compactView ? columns * COMPACT_VIEW_ROWS : undefined;

  return (
    <GridProvider columns={isSmallScreen ? columns / 2 : columns}>
      <Gutters row flexWrap="wrap" disablePadding={nested} sx={{ overflowY: 'auto' }}>
        {contributorType === CommunityContributorType.User &&
          users
            ?.filter(filterFn(filter))
            .slice(0, compactView ? compactViewItemsLimit : undefined)
            .map(user => (
              <GridItem key={user.id} columns={1}>
                <Box>
                  <ContributorCardSquare {...user} />
                </Box>
              </GridItem>
            ))}
        {contributorType === CommunityContributorType.Organization &&
          organizations
            ?.filter(filterFn(filter))
            .slice(0, compactView ? compactViewItemsLimit : undefined)
            .map(organization => (
              <GridItem key={organization.id} columns={1}>
                <Box>
                  <ContributorCardSquare {...organization} />
                </Box>
              </GridItem>
            ))}
      </Gutters>
    </GridProvider>
  );
};

export default CommunityContributorsBlockWideContent;
