import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import MembershipBackdrop from '../../components/composite/common/Backdrops/MembershipBackdrop';
import ChallengeCard from '../../components/composite/common/cards/ChallengeCard/ChallengeCard';
import { Loading } from '../../components/core';
import CardFilter from '../../components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import ErrorBlock from '../../components/core/ErrorBlock';
import HubChallengesContainer from '../../containers/hub/HubChallengesContainer';
import { HubContainerEntities, HubContainerState } from '../../containers/hub/HubPageContainer';
import { CardLayoutItem, CardLayoutContainer } from '../../components/core/CardLayoutContainer/CardLayoutContainer';

interface HubChallengesViewProps {
  entities: HubContainerEntities;
  state: HubContainerState;
}

export const HubChallengesView: FC<HubChallengesViewProps> = ({ entities }) => {
  const { t } = useTranslation();
  const { hub, permissions } = entities;
  const { challengesReadAccess } = permissions;
  const { nameID: hubNameId = '' } = hub || {};

  return (
    <>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.hub.sections.challenges.description')}
      </Box>
      <MembershipBackdrop show={!challengesReadAccess} blockName={t('pages.hub.sections.challenges.header')}>
        <HubChallengesContainer
          entities={{
            hubNameId,
          }}
        >
          {(cEntities, cState) => {
            /* TODO: Move in separate component with its own loading logic */
            if (cState?.loading)
              return (
                <Loading
                  text={t('components.loading.message', {
                    blockName: t('pages.hub.sections.challenges.header'),
                  })}
                />
              );
            if (cState?.error)
              return (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ErrorBlock blockName={t('pages.hub.sections.challenges.header')} />
                  </Grid>
                </Grid>
              );
            if (cEntities?.challenges && cEntities?.challenges.length === 0) {
              return (
                <Box paddingBottom={2} display="flex" justifyContent="center">
                  <Typography>{t('pages.hub.sections.challenges.no-data')}</Typography>
                </Box>
              );
            }
            return (
              <CardFilter
                data={cEntities?.challenges || []}
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
            );
          }}
        </HubChallengesContainer>
      </MembershipBackdrop>
    </>
  );
};
export default HubChallengesView;
