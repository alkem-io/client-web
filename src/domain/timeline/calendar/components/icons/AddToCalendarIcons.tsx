import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Suspense } from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';

const ICON_SIZE = 24;
const OutlookLogo = lazyWithGlobalErrorHandler(() => import('./outlook.svg?react'));
const GoogleLogo = lazyWithGlobalErrorHandler(() => import('./google.svg?react'));
const ExportIcon = lazyWithGlobalErrorHandler(() => import('./download-calendar.svg?react'));

export const GoogleCalendarIcon = () => {
  const theme = useTheme();
  return (
    <Box height={`${ICON_SIZE}px`} width={`${ICON_SIZE}px`} textAlign="center">
      <Suspense fallback={<Skeleton variant="rectangular" width="100%" height="100%" />}>
        <GoogleLogo height="100%" fill={theme.palette.primary.main} />
      </Suspense>
    </Box>
  );
};

export const OutlookCalendarIcon = () => {
  const theme = useTheme();
  return (
    <Box height={`${ICON_SIZE}px`} width={`${ICON_SIZE}px`} textAlign="center">
      <Suspense fallback={null}>
        <OutlookLogo height="100%" fill={theme.palette.primary.main} />
      </Suspense>
    </Box>
  );
};

export const IcsDownloadIcon = () => {
  return <CalendarMonthIcon height={ICON_SIZE} color="primary" />;
};

export const ExportCalendarEventIcon = () => {
  const theme = useTheme();
  return (
    <Box height={`${ICON_SIZE}px`} width={`${ICON_SIZE}px`} textAlign="center">
      <Suspense fallback={null}>
        <ExportIcon height="100%" fill={theme.palette.primary.main} />
      </Suspense>
    </Box>
  );
};
