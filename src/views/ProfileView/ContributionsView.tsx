import { Grid } from '@material-ui/core';
import React, { FC } from 'react';
import { ContributionCard } from '../../components/composite/common/cards';
import ProfileCard, { ProfileCardProps } from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import ContributionDetailsContainer from '../../containers/ContributionDetails/ContributionDetailsContainer';
import { ContributionItem } from '../../models/entities/contribution';

export interface ContributionViewProps extends ProfileCardProps {
  contributions: ContributionItem[];
}

export const ContributionsView: FC<ContributionViewProps> = ({ contributions, ...rest }) => {
  return (
    <ProfileCard {...rest}>
      <Grid container spacing={2}>
        {contributions.map((x, i) => (
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
