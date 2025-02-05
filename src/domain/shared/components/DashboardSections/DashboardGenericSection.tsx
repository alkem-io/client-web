import { Caption } from '@/core/ui/typography';
import { Box } from '@mui/material';
import React, { FC } from 'react';
import Section, { SectionSpacer } from '../Section/Section';
import SectionHeader from '../Section/SectionHeader';

export interface DashboardGenericSectionProps {
  bannerUrl?: string;
  alwaysShowBanner?: boolean;
  bannerOverlay?: React.ReactNode;
  headerText?: React.ReactNode;
  headerSpacing?: 'double' | 'none' | 'default';
  primaryAction?: React.ReactNode;
  subHeaderText?: string | React.ReactNode;
}

/**
 * @deprecated - use PageContentBlock instead
 */
const DashboardGenericSection: FC<DashboardGenericSectionProps> = ({
  bannerUrl,
  alwaysShowBanner,
  bannerOverlay,
  headerText,
  subHeaderText,
  headerSpacing = 'default',
  primaryAction,
  children,
}) => {
  return (
    <Section bannerUrl={bannerUrl} alwaysShowBanner={alwaysShowBanner} bannerOverlay={bannerOverlay}>
      {headerText && <SectionHeader text={headerText}>{primaryAction}</SectionHeader>}
      {subHeaderText && typeof subHeaderText === 'string' ? <Caption>{subHeaderText}</Caption> : subHeaderText}
      {(headerText || subHeaderText) && !(headerSpacing === 'none') && (
        <SectionSpacer double={headerSpacing === 'double'} />
      )}
      <Box paddingY={1} maxHeight="auto" textOverflow="ellipsis" overflow="hidden">
        {children}
      </Box>
    </Section>
  );
};

export default DashboardGenericSection;
