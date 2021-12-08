import { Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactElement } from 'react-markdown';
import Markdown from '../../core/Markdown';
import { SectionSpacer } from '../../core/Section/Section';
import SectionHeader from '../../core/Section/SectionHeader';
import DashboardGenericSection from '../common/sections/DashboardGenericSection';

export interface ContextSectionProps {
  primaryAction?: ReactElement;
  banner?: string;
  displayName?: string;
  tagline?: string;
  vision?: string;
  background?: string;
  impact?: string;
  who?: string;
}

const ContextSection: FC<ContextSectionProps> = ({
  primaryAction,
  banner,
  background,
  displayName,
  tagline,
  vision,
  impact,
  who,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <DashboardGenericSection primaryAction={primaryAction} bannerUrl={banner} headerText={displayName}>
        <Typography component={Markdown} variant="body1" children={tagline}></Typography>
        <SectionHeader text={t('components.contextSegment.vision.title')}></SectionHeader>
        <Typography component={Markdown} variant="body1" children={vision}></Typography>
      </DashboardGenericSection>
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.contextSegment.background.title')}>
        <Typography component={Markdown} variant="body1" children={background}></Typography>
      </DashboardGenericSection>
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.contextSegment.impact.title')}>
        <Typography component={Markdown} variant="body1" children={impact}></Typography>
      </DashboardGenericSection>
      <SectionSpacer />
      <DashboardGenericSection headerText={t('components.contextSegment.who.title')}>
        <Typography component={Markdown} variant="body1" children={who}></Typography>
      </DashboardGenericSection>
    </>
  );
};
export default ContextSection;
