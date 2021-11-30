import { ApolloError } from '@apollo/client';
import { Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import { ReactComponent as StopWatch } from 'bootstrap-icons/icons/stopwatch.svg';
import React, { FC, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from '../../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { OpportunityPageFragment, Reference } from '../../models/graphql-schema';
import { ViewProps } from '../../models/view';

const useStyles = makeStyles(_theme => ({
  tagline: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
}));

export interface OpportunityContextViewEntities {
  opportunity: OpportunityPageFragment;
  meme?: Reference;
}

export interface OpportunityContextViewActions {
  onMemeError: () => void;
}

export interface OpportunityContextViewState {
  loading: boolean;
  error?: ApolloError;
}

export interface OpportunityContextViewOptions {
  hideMeme: boolean;
}

export interface OpportunityContextViewProps
  extends ViewProps<
    OpportunityContextViewEntities,
    OpportunityContextViewActions,
    OpportunityContextViewState,
    OpportunityContextViewOptions
  > {}

const OpportunityContextView: FC<OpportunityContextViewProps> = ({ entities, actions, options }) => {
  const { t } = useTranslation();
  const styles = useStyles();

  const opportunity = entities.opportunity;
  const { context } = opportunity;

  const { background = '', tagline = '', who = '', impact = '', vision = '' } = context ?? {};

  return (
    <>
      <Container maxWidth="xl" className={'p-4'}>
        <Grid container spacing={2}>
          {tagline && (
            <Grid item md={12}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SubHeader text={tagline} className={styles.tagline} />
              </Section>
            </Grid>
          )}
          <Grid container spacing={2}>
            <Grid item sm={12} md={6}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SectionHeader text={t('pages.opportunity.sections.problem.header')} />
                <Body>
                  <Markdown children={background} />
                </Body>
              </Section>
            </Grid>
            <Grid item sm={12} md={6}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SectionHeader text={t('pages.opportunity.sections.long-term-vision.header')} icon={<StopWatch />} />
                <Body>
                  <Markdown children={vision} />
                </Body>
              </Section>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item sm={12} md={6}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SectionHeader text={t('pages.opportunity.sections.who.header')} />
                <Body>
                  <Markdown children={who} />
                </Body>
              </Section>
            </Grid>
            <Grid item sm={12} md={6}>
              <Section hideAvatar hideDetails gutters={{ content: true }}>
                <SectionHeader text={t('pages.opportunity.sections.impact.header')} />
                <Body>
                  <Markdown children={impact} />
                </Body>
              </Section>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item sm={12} md={6} />
            {!options.hideMeme && (
              <Grid item sm={12} md={6}>
                <Section hideAvatar hideDetails gutters={{ content: true }}>
                  <Body>
                    {entities.meme && (
                      <div>
                        <img
                          src={entities.meme.uri}
                          alt={entities.meme.description}
                          onError={(ev: SyntheticEvent<HTMLImageElement, Event>) => {
                            ev.currentTarget.style.display = 'none';
                            actions.onMemeError();
                          }}
                          height={240}
                        />
                      </div>
                    )}
                  </Body>
                </Section>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
export default OpportunityContextView;
