import { Grid, Skeleton } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ContributionCardV2,
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
  const { t } = useTranslation();
  return (
    <ProfileCard {...rest}>
      <Grid container spacing={1} justifyContent="space-between" alignItems="stretch">
        {loading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}
        {!loading &&
          contributions.map((x, i) => (
            <Grid item key={i} flexGrow={1} flexBasis={'50%'}>
              <ContributionDetailsContainer entities={x}>
                {({ details }, state) => <ContributionCardV2 details={details} loading={state.loading} />}
              </ContributionDetailsContainer>
            </Grid>
          ))}
        {!contributions.length && (
          <Grid item flexGrow={1} flexBasis={'50%'}>
            {t('contributions-view.no-data', { name: rest.title })}
          </Grid>
        )}
      </Grid>
    </ProfileCard>
  );
};
export default ContributionsView;
