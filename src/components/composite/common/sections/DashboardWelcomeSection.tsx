import React, { FC } from 'react';
import Section, { SectionSpacer } from '../../../core/Section/Section';
import SectionHeader from '../../../core/Section/SectionHeader';
import SectionSubHeader from '../../../core/Section/SectionSubheader';

interface DashboardBannerSectionProps {
  bannerUrl?: string;
  headerText?: string;
  primaryAction?: JSX.Element;
  subHeaderText?: string;
}

const DashboardBannerSection: FC<DashboardBannerSectionProps> = ({
  bannerUrl,
  headerText,
  primaryAction,
  subHeaderText,
  children,
}) => {
  return (
    <Section bannerUrl={bannerUrl}>
      {headerText && (
        <>
          <SectionHeader text={headerText}>{primaryAction && primaryAction}</SectionHeader>
          <SectionSpacer />
        </>
      )}
      {subHeaderText && (
        <>
          <SectionSubHeader text={subHeaderText} />
          <SectionSpacer />
        </>
      )}
      {children}
    </Section>
  );
};

export default DashboardBannerSection;
