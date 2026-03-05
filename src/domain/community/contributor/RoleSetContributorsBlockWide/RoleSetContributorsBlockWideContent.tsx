import { Box } from '@mui/material';
import ContributorCardSquare, { ContributorCardSquareProps } from '../ContributorCardSquare/ContributorCardSquare';
import GridItem from '@/core/ui/grid/GridItem';
import Gutters from '@/core/ui/grid/Gutters';
import { useScreenSize } from '@/core/ui/grid/constants';
import GridProvider from '@/core/ui/grid/GridProvider';
import { useColumns } from '@/core/ui/grid/GridContext';
import { ActorType } from '@/core/apollo/generated/graphql-schema';

type ActorTypesBlockWideContentProps = {
  users: ContributorCardSquareProps[] | undefined;
  organizations: ContributorCardSquareProps[] | undefined;
  nested?: boolean;
  contributorType: ActorType;
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

const ActorTypesBlockWideContent = ({
  nested = false,
  users,
  organizations,
  contributorType,
  filter,
  compactView = false,
}: ActorTypesBlockWideContentProps) => {
  const { isMediumSmallScreen } = useScreenSize();

  const columns = useColumns();

  const compactViewItemsLimit = compactView ? columns * COMPACT_VIEW_ROWS : undefined;

  return (
    <GridProvider columns={isMediumSmallScreen ? columns / 2 : columns}>
      <Gutters row flexWrap="wrap" disablePadding={nested} sx={{ overflowY: 'auto' }}>
        {contributorType === ActorType.User &&
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
        {contributorType === ActorType.Organization &&
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

export default ActorTypesBlockWideContent;
