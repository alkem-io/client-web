import { Grid, Skeleton } from '@mui/material';
import React, { FC } from 'react';
import {
  ContributionCard,
  CONTRIBUTION_CARD_HEIGHT_SPACING,
  CONTRIBUTION_CARD_WIDTH_SPACING,
} from '../../components/composite/common/cards';
import ProfileCard, { ProfileCardProps } from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import ContributionDetailsContainer from '../../containers/ContributionDetails/ContributionDetailsContainer';
import { ContributionItem } from '../../models/entities/contribution';

export interface ContributionViewProps extends ProfileCardProps {
  contributions: ContributionItem[];
  loading?: boolean;
}

const SkeletonItem = () => (
  <Grid item>
    <Skeleton
      variant="rectangular"
      sx={{
        height: theme => theme.spacing(CONTRIBUTION_CARD_HEIGHT_SPACING / 2),
        width: theme => theme.spacing(CONTRIBUTION_CARD_WIDTH_SPACING),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(CONTRIBUTION_CARD_WIDTH_SPACING),
      }}
    />
    <Skeleton
      sx={{
        width: theme => theme.spacing(CONTRIBUTION_CARD_WIDTH_SPACING),
      }}
    />
  </Grid>
);

export const ContributionsView: FC<ContributionViewProps> = ({ contributions, loading, ...rest }) => {
  return (
    <ProfileCard {...rest}>
      <Grid container spacing={2}>
        {loading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}
        {!loading &&
          contributions.map((x, i) => (
            <Grid item key={i}>
              <ContributionDetailsContainer entities={x}>
                {(entities, state) => <ContributionCard details={entities.details} loading={state.loading} />}
              </ContributionDetailsContainer>
            </Grid>
          ))}
      </Grid>
    </ProfileCard>
  );
};
export default ContributionsView;
