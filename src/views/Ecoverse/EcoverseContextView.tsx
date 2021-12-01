import { Context } from '@apollo/client';
import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import MembershipBackdrop from '../../components/composite/common/Backdrops/MembershipBackdrop';
import Icon from '../../components/core/Icon';
import Markdown from '../../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import { EcoverseContainerEntities, EcoverseContainerState } from '../../containers/ecoverse/EcoversePageContainer';

interface EcoverseContextViewProps {
  entities: EcoverseContainerEntities;
  state: EcoverseContainerState;
}

export const EcoverseContextView: FC<EcoverseContextViewProps> = ({ entities }) => {
  const { t } = useTranslation();
  const { ecoverse, hideChallenges } = entities;
  const { context } = ecoverse || {};
  const { impact = '', background = '' } = context || ({} as Context);

  return (
    <>
      <MembershipBackdrop show={hideChallenges} blockName={t('pages.ecoverse.sections.challenges.header')}>
        <Section avatar={<Icon component={CompassIcon} color="primary" size="xl" />}>
          <SectionHeader text={t('pages.ecoverse.sections.challenges.header')} />
          <SubHeader>
            <Markdown children={background} />
          </SubHeader>
          <Body>
            <Markdown children={impact} />
          </Body>
        </Section>
      </MembershipBackdrop>
    </>
  );
};
export default EcoverseContextView;
