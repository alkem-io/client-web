import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip } from '@mui/material';
import EcoverseChallengesContainer from '../../containers/ecoverse/EcoverseChallengesContainer';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ChallengeCardContainer } from '../../containers/challenge/ChallengeCardContainer';
import ChallengeCard, { ChallengeCardProps } from '../../components/composite/entities/Ecoverse/ChallengeCard';
import { useUserContext } from '../../hooks';
import { buildChallengeUrl } from '../../utils/urlBuilders';
import { Accordion } from '../../components/composite/common/Accordion/Accordion';
import { CardContainer } from '../../components/core/CardContainer';
import ProfileCard from '../../components/composite/common/cards/ProfileCard/ProfileCard';
import CardFilter from '../../components/core/card-filter/CardFilter';
import { ValueType } from '../../components/core/card-filter/filterFn';

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

const tagsValueGetter = (props: ChallengeCardProps) => props.tags;
const valueGetter = (props: ChallengeCardProps): ValueType => ({
  id: props.id,
  values: [
    props?.displayName ?? '',
    props.context?.tagline ?? '',
  ]
});

export const ChallengesOverviewView: FC<ChallengesOverviewViewProps> = ({ myChallenges, hubs }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const [filterTerms, setFilterTerms] = useState<string[]>([]);
  const handleChange = (e, value: string[]) => {
    const trimmedValues = value.map(x => x.trim().toLowerCase());
    setFilterTerms(trimmedValues);
  };

  return (
    <Box paddingY={2}>
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          <ProfileCard
            title={t('pages.challenges-overview.filter.title')}
            subtitle={t('pages.challenges-overview.filter.subtitle')}
          >
            <Autocomplete
              aria-label="Filter"
              id="challenge-filter"
              multiple
              fullWidth
              freeSolo
              disableCloseOnSelect
              options={[]}
              onChange={handleChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip color="primary" variant="outlined" label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={params => (
                <TextField
                  {...params}
                  size={'small'}
                  variant="outlined"
                  placeholder={'Search'}
                />
              )}
            />
          </ProfileCard>
        </Grid>
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
                      <CardFilter
                        data={[]}
                        tagsValueGetter={tagsValueGetter}
                        valueGetter={valueGetter}
                      >
                        {filteredData => (
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
                        )}
                      </CardFilter>
                    )
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
              {(cEntities) => {
                return (
                  <Grid item xs={12}>
                    <Accordion
                      title={t('pages.challenges-overview.hubs.title', { count: cEntities.challenges.length, name: hubName })}
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
                )
              }}
            </EcoverseChallengesContainer>
          );
        })}
      </Grid>
    </Box>
  );
};
