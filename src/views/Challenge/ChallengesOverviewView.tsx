import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import EcoverseChallengesContainer from '../../containers/ecoverse/EcoverseChallengesContainer';
import Grid from '@mui/material/Grid';
import { ChallengeCardContainer } from '../../containers/challenge/ChallengeCardContainer';
import ChallengeCard from '../../components/composite/entities/Ecoverse/ChallengeCard';
import { useUserContext } from '../../hooks';
import { buildChallengeUrl } from '../../utils/urlBuilders';
import { Accordion } from '../../components/composite/common/Accordion/Accordion';
import { CardContainer } from '../../components/core/CardContainer';

export interface HubOverview {
  ecoverseID: string;
  nameID: string;
  displayName: string;
}

interface ChallengeOverview {
  id: string;
  ecoverseId: string;
}

export interface ChallengesOverviewViewProps {
  myChallenges: ChallengeOverview[];
  hubs: HubOverview[];
}

export const ChallengesOverviewView: FC<ChallengesOverviewViewProps> = ({ myChallenges, hubs }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  return (
    <Box paddingY={2}>
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <Accordion
            title={t('pages.challenges-overview.my.title', { count: myChallenges.length })}
            subtitle={t('pages.challenges-overview.my.subtitle')}
            helpText={t('pages.challenges-overview.my.help-text')}
            ariaKey="my"
          >
            <CardContainer>
              {myChallenges.map(({ ecoverseId, id: challengeId }, i) => (
                <ChallengeCardContainer key={i} ecoverseNameId={ecoverseId} challengeNameId={challengeId}>
                  {({ cardProps }) => {
                    if (!cardProps) {
                      return null;
                    }

                    return (
                      <ChallengeCard
                        key={i}
                        id={cardProps.id}
                        displayName={cardProps.displayName}
                        activity={cardProps.activity}
                        context={cardProps.context}
                        isMember={cardProps.isMember}
                        tags={cardProps.tags}
                        url={cardProps.url}
                      />
                    );
                  }}
                </ChallengeCardContainer>
              ))}
            </CardContainer>
          </Accordion>
        </Grid>
        {hubs.map(({ displayName: hubName, nameID: hubNameId }, i) => {
          return (
            <EcoverseChallengesContainer
              key={i}
              entities={{
                ecoverseNameId: hubNameId,
              }}
            >
              {cEntities => {
                return (
                  <Grid item xs={12}>
                    <Accordion
                      title={t('pages.challenges-overview.hubs.title', {
                        count: cEntities.challenges.length,
                        name: hubName,
                      })}
                      subtitle={t('pages.challenges-overview.hubs.subtitle', { name: hubName })}
                      helpText={t('pages.challenges-overview.hubs.help-text')}
                      ariaKey={hubName}
                    >
                      <CardContainer>
                        {cEntities.challenges.map(({ id, nameID, displayName, context, activity, tagset }, i) => (
                          <ChallengeCard
                            key={i}
                            id={id}
                            displayName={displayName}
                            activity={activity || []}
                            context={{
                              tagline: context?.tagline ?? '',
                              visual: {
                                background: context?.visual?.background ?? '',
                              },
                            }}
                            isMember={user?.ofChallenge(id) ?? false}
                            tags={tagset?.tags ?? []}
                            url={buildChallengeUrl(hubNameId, nameID)}
                          />
                        ))}
                      </CardContainer>
                    </Accordion>
                  </Grid>
                );
              }}
            </EcoverseChallengesContainer>
          );
        })}
      </Grid>
    </Box>
  );
};
