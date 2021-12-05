import React, { FC } from 'react';
import Section, { SectionSpacer } from '../../../core/Section/Section';
import SectionHeader from '../../../core/Section/SectionHeader';
import SectionSubHeader from '../../../core/Section/SectionSubheader';

export interface DashboardGenericSectionProps {
  bannerUrl?: string;
  headerText?: string;
  helpText?: string;
  primaryAction?: JSX.Element;
  subHeaderText?: string;
}

const DashboardGenericSection: FC<DashboardGenericSectionProps> = ({
  bannerUrl,
  headerText,
  helpText,
  primaryAction,
  subHeaderText,
  children,
}) => {
  return (
    <Section bannerUrl={bannerUrl}>
      {headerText && (
        <>
          <SectionHeader text={headerText} helpText={helpText}>
            {primaryAction}
          </SectionHeader>
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

export default DashboardGenericSection;
