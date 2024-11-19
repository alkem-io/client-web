import { Grid } from '@mui/material';
import { WithId } from '@/core/utils/WithId';
import {
  ContributorCardSquare,
  ContributorCardSquareProps,
} from '@/domain/community/contributor/ContributorCardSquare/ContributorCardSquare';

const DashboardContributingOrganizations = ({
  organizations,
}: {
  organizations: WithId<ContributorCardSquareProps>[] | undefined;
}) => (
  <Grid container spacing={2}>
    {organizations?.map(org => (
      <Grid key={org.id} item xs={3}>
        <ContributorCardSquare key={org.id} {...org} />
      </Grid>
    ))}
  </Grid>
);

export default DashboardContributingOrganizations;
