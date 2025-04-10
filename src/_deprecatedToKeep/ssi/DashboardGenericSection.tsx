import { Caption } from '@/core/ui/typography';
import { Box, Paper } from '@mui/material';
import React, { FC, PropsWithChildren } from 'react';
import SectionHeader from '@/domain/shared/components/Section/SectionHeader';

export interface DashboardGenericSectionProps extends PropsWithChildren {
  headerText?: React.ReactNode;
  primaryAction?: React.ReactNode;
  subHeaderText?: string | React.ReactNode;
}

/**
 * @deprecated - use PageContentBlock instead
 * used only for the setting/credentials page, todo: remove?
 */
const DashboardGenericSection: FC<DashboardGenericSectionProps> = ({
  headerText,
  subHeaderText,
  primaryAction,
  children,
}) => {
  return (
    <Paper sx={{ padding: 2 }} variant="outlined">
      {headerText && <SectionHeader text={headerText}>{primaryAction}</SectionHeader>}
      {subHeaderText && typeof subHeaderText === 'string' ? <Caption>{subHeaderText}</Caption> : subHeaderText}
      <Box paddingY={1} maxHeight="auto" textOverflow="ellipsis" overflow="hidden">
        {children}
      </Box>
    </Paper>
  );
};

export default DashboardGenericSection;
