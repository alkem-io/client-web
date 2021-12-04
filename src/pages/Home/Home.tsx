import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Globe } from 'bootstrap-icons/icons/globe2.svg';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import Icon from '../../components/core/Icon';
import { useUpdateNavigation } from '../../hooks';
import EcoversesSection from './EcoversesSection';
import WelcomeSection from './WelcomeSection';

export const HomePage = () => {
  const { t } = useTranslation();

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  return (
    <>
      <WelcomeSection />
      <Section avatar={<Icon component={Globe} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.home.sections.ecoverse.header')} />
        <SubHeader text={t('pages.home.sections.ecoverse.subheader')} />
        <Body text={t('pages.home.sections.ecoverse.body')} />
      </Section>
      <EcoversesSection />
    </>
  );
};

export default HomePage;
