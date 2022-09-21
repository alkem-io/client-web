import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MembershipBackdrop from '../../../../common/components/composite/common/Backdrops/MembershipBackdrop';
import ChallengeCard from '../../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import CardFilter from '../../../../common/components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../../../common/components/core/card-filter/value-getters/entity-value-getter';
import ErrorBlock from '../../../../common/components/core/ErrorBlock';
import CardsLayout from '../../../shared/layout/CardsLayout/CardsLayout';
import { ViewProps } from '../../../../models/view';
import { Challenge, ChallengeCardFragment } from '../../../../models/graphql-schema';

interface Permissions {
  canReadChallenges: boolean;
}

interface HubChallengesViewEntities {
  challenges: ChallengeCardFragment[];
  hubNameId: string;
  permissions: Permissions;
}

export interface HubChallengesViewActions {}

export interface HubChallengesViewOptions {}

export interface HubChallengesViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface HubChallengesViewProps
  extends ViewProps<
    HubChallengesViewEntities,
    HubChallengesViewActions,
    HubChallengesViewState,
    HubChallengesViewOptions
  > {}

const HubChallengesView: FC<HubChallengesViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();
  const { challenges, permissions, hubNameId } = entities;
  const { canReadChallenges } = permissions;

  return (
    <MembershipBackdrop show={!canReadChallenges} blockName={t('pages.hub.sections.challenges.header')}>
      {state.error && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ErrorBlock blockName={t('pages.hub.sections.challenges.header')} />
          </Grid>
        </Grid>
      )}
      {!state.loading && !challenges.length ? (
        <Box paddingBottom={2} display="flex" justifyContent="center">
          <Typography>{t('pages.hub.sections.challenges.no-data')}</Typography>
        </Box>
      ) : (
        <CardFilter
          data={challenges as Challenge[] /* TODO remove type casting */}
          tagsValueGetter={entityTagsValueGetter}
          valueGetter={entityValueGetter}
        >
          {filteredData => (
            <CardsLayout items={state.loading ? [undefined, undefined] : filteredData} deps={[hubNameId]}>
              {challenge => <ChallengeCard challenge={challenge} hubNameId={hubNameId} loading={!challenge} />}
            </CardsLayout>
          )}
        </CardFilter>
      )}
    </MembershipBackdrop>
  );
};
export default HubChallengesView;
