import React, { FC } from 'react';
import Section, { SectionProps, SectionSpacer } from '../../../core/Section/Section';
import SectionHeader from '../../../core/Section/SectionHeader';
import SectionSubHeader from '../../../core/Section/SectionSubheader';
import { Box, Link } from '@mui/material';
import { RouterLink } from '../../../core/RouterLink';

export interface DashboardGenericSectionProps {
  bannerUrl?: string;
  headerText?: string;
  helpText?: string;
  headerSpacing?: 'double' | 'none' | 'default';
  primaryAction?: React.ReactNode;
  subHeaderText?: string;
  secondaryAction?: React.ReactNode;
  navText?: string;
  navLink?: string;
  classes?: SectionProps['classes'];
}

const relativeLinkRegex = /^\.+\//;
const relativeStepBackRoute = '../';

const DashboardGenericSection: FC<DashboardGenericSectionProps> = ({
  bannerUrl,
  headerText,
  subHeaderText,
  helpText,
  headerSpacing = 'default',
  primaryAction,
  secondaryAction,
  navText,
  navLink,
  classes,
  children,
}) => {
  const navLinkIsRelative = navLink && navLink.search(relativeLinkRegex) > -1;
  const cleanNavLink = navLink && !navLinkIsRelative ? navLink.replace(relativeLinkRegex, '') : navLink;
  const routerNavLink = cleanNavLink && relativeStepBackRoute.concat(cleanNavLink);
  return (
    <Section bannerUrl={bannerUrl} classes={classes}>
      {headerText && (
        <>
          <SectionHeader text={headerText} helpText={helpText}>
            {primaryAction}
          </SectionHeader>
        </>
      )}
      {subHeaderText && (
        <>
          <SectionSpacer />
          <SectionSubHeader text={subHeaderText} />
        </>
      )}
      {(headerText || subHeaderText) && !(headerSpacing === 'none') && (
        <SectionSpacer double={headerSpacing === 'double'} />
      )}
      <Box paddingY={1}>
        {children}
        {secondaryAction}
      </Box>
      {navText && routerNavLink && (
        <Box display="flex" justifyContent="end">
          <Link component={RouterLink} to={routerNavLink}>
            {navText}
          </Link>
        </Box>
      )}
    </Section>
  );
};

export default DashboardGenericSection;
