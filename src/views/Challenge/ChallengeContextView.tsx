import React, { FC } from 'react';
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import Icon from '../../components/core/Icon';
import { ReactComponent as GemIcon } from 'bootstrap-icons/icons/gem.svg';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import Markdown from '../../components/core/Markdown';
import { useTranslation } from 'react-i18next';
import { Context } from '@apollo/client';

interface ChallengeContextViewProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

export const ChallengeContextView: FC<ChallengeContextViewProps> = ({ entities }) => {
  const { t } = useTranslation();
  const { challenge } = entities;
  const { context } = challenge || {};
  const { impact = '', background = '' } = context || ({} as Context);
  return (
    <Section avatar={<Icon component={GemIcon} color="primary" size="xl" />}>
      <SectionHeader text={t('pages.challenge.sections.opportunities.subheader')} />
      <SubHeader>
        <Markdown children={background} />
      </SubHeader>
      <Body>
        <Markdown children={impact} />
      </Body>
    </Section>
  );
};
