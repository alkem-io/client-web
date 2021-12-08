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
  primaryAction?: React.ReactNode;
  subHeaderText?: string;
  secondaryAction?: React.ReactNode;
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
      <Box paddingY={1}>
        {children}
        {secondaryAction}
      </Box>
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
