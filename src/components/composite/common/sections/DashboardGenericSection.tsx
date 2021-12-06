import React, { FC } from 'react';
import Section, { SectionSpacer } from '../../../core/Section/Section';
import SectionHeader from '../../../core/Section/SectionHeader';
import SectionSubHeader from '../../../core/Section/SectionSubheader';
import { Box, Link } from '@mui/material';
import { RouterLink } from '../../../core/RouterLink';

export interface DashboardGenericSectionProps {
  bannerUrl?: string;
  headerText?: string;
  helpText?: string;
  primaryAction?: JSX.Element;
  subHeaderText?: string;
  secondaryAction?: JSX.Element;
  navText?: string;
  navLink?: string;
}

const DashboardGenericSection: FC<DashboardGenericSectionProps> = ({
  bannerUrl,
  headerText,
  subHeaderText,
  helpText,
  primaryAction,
  secondaryAction,
  navText,
  navLink,
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
      {secondaryAction}
      {navText && navLink && (
        <Box display="flex" justifyContent="end">
          <Link component={RouterLink} to={navLink}>
            {navText}
          </Link>
        </Box>
      )}
    </Section>
  );
};

export default DashboardGenericSection;
