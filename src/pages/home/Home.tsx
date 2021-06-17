import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Globe } from 'bootstrap-icons/icons/globe2.svg';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import Icon from '../../components/core/Icon';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import EcoversesSection from './EcoversesSection';

const HomePage = () => {
  const { t } = useTranslation();

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  return (
    <React.Fragment>
      <Section avatar={<Icon component={Globe} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.home.sections.ecoverse.header')} />
        <SubHeader text={t('pages.home.sections.ecoverse.subheader')} />
        <Body text={t('pages.home.sections.ecoverse.body')} />
      </Section>
      <EcoversesSection />
    </React.Fragment>
  );
};

export default HomePage;
