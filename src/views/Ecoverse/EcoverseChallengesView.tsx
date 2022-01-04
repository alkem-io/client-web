import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import MembershipBackdrop from '../../components/composite/common/Backdrops/MembershipBackdrop';
import ChallengeCard from '../../components/composite/entities/Ecoverse/ChallengeCard';
import { Loading } from '../../components/core';
import CardFilter from '../../components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import { CardContainer } from '../../components/core/CardContainer';
import ErrorBlock from '../../components/core/ErrorBlock';
import EcoverseChallengesContainer from '../../containers/ecoverse/EcoverseChallengesContainer';
import { EcoverseContainerEntities, EcoverseContainerState } from '../../containers/ecoverse/EcoversePageContainer';
import { useUserContext } from '../../hooks';
import { buildChallengeUrl } from '../../utils/urlBuilders';

interface EcoverseChallengesViewProps {
  entities: EcoverseContainerEntities;
  state: EcoverseContainerState;
}

export const EcoverseChallengesView: FC<EcoverseChallengesViewProps> = ({ entities }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { ecoverse, permissions } = entities;
  const { challengesReadAccess } = permissions;
  const { nameID: ecoverseNameId = '' } = ecoverse || {};

  return (
    <>
      <Box paddingBottom={2} display="flex" justifyContent="center">
        {t('pages.hub.sections.challenges.description')}
      </Box>
      <MembershipBackdrop show={!challengesReadAccess} blockName={t('pages.hub.sections.challenges.header')}>
        <EcoverseChallengesContainer
          entities={{
            ecoverseNameId,
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
                  <CardContainer>
                    {filteredData.map((challenge, i) => (
                      <ChallengeCard
                        key={i}
                        id={challenge.id}
                        displayName={challenge.displayName}
                        activity={challenge?.activity || []}
                        context={{
                          tagline: challenge?.context?.tagline || '',
                          visual: { background: challenge?.context?.visual?.background || '' },
                        }}
                        isMember={user?.ofChallenge(challenge.id) || false}
                        tags={challenge?.tagset?.tags || []}
                        url={buildChallengeUrl(ecoverseNameId, challenge.nameID)}
                      />
                    ))}
                  </CardContainer>
                )}
              </CardFilter>
            );
          }}
        </EcoverseChallengesContainer>
      </MembershipBackdrop>
    </>
  );
};
export default EcoverseChallengesView;
