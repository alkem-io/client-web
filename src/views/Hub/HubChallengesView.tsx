import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MembershipBackdrop from '../../components/composite/common/Backdrops/MembershipBackdrop';
import ChallengeCard from '../../components/composite/common/cards/ChallengeCard/ChallengeCard';
import CardFilter from '../../components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import ErrorBlock from '../../components/core/ErrorBlock';
import { CardLayoutItem, CardLayoutContainer } from '../../components/core/CardLayoutContainer/CardLayoutContainer';
import { ViewProps } from '../../models/view';
import { Challenge, ChallengeCardFragment } from '../../models/graphql-schema';

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
    <>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.hub.sections.challenges.description')}
      </Box>
      <MembershipBackdrop show={!canReadChallenges} blockName={t('pages.hub.sections.challenges.header')}>
        {state.error && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ErrorBlock blockName={t('pages.hub.sections.challenges.header')} />
            </Grid>
          </Grid>
        )}
        {state.loading ? (
          <CardLayoutContainer>
            <CardLayoutItem>
              <ChallengeCard loading={true} />
            </CardLayoutItem>
            <CardLayoutItem>
              <ChallengeCard loading={true} />
            </CardLayoutItem>
          </CardLayoutContainer>
        ) : (
          <>
            {challenges && !challenges.length ? (
              <Box paddingBottom={2} display="flex" justifyContent="center">
                <Typography>{t('pages.hub.sections.challenges.no-data')}</Typography>
              </Box>
            ) : (
              <CardFilter
                data={challenges as Challenge[]}
                tagsValueGetter={entityTagsValueGetter}
                valueGetter={entityValueGetter}
              >
                {filteredData => (
                  <CardLayoutContainer>
                    {filteredData.map((challenge, i) => (
                      <CardLayoutItem key={i}>
                        <ChallengeCard challenge={challenge} hubNameId={hubNameId} />
                      </CardLayoutItem>
                    ))}
                  </CardLayoutContainer>
                )}
              </CardFilter>
            )}
          </>
        )}
      </MembershipBackdrop>
    </>
  );
};
export default HubChallengesView;
