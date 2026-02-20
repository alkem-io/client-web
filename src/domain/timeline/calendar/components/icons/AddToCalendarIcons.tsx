import TodayIcon from '@mui/icons-material/Today';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { Suspense } from 'react';

const OutlookLogo = lazyWithGlobalErrorHandler(() => import('./outlook.svg?react'));
const GoogleLogo = lazyWithGlobalErrorHandler(() => import('./google.svg?react'));
const AppleLogo = lazyWithGlobalErrorHandler(() => import('./apple.svg?react'));

export const GoogleCalendarIcon = () => (
  <Suspense fallback={null}>
    <GoogleLogo height="24px" />
  </Suspense>
);

export const OutlookCalendarIcon = () => (
  <Suspense fallback={null}>
    <OutlookLogo height="24px" />
  </Suspense>
);

export const AppleIcon = () => (
  <Suspense fallback={null}>
    <AppleLogo height="24px" />
  </Suspense>
);

export const CalendarIcon = () => <TodayIcon height="24px" />;
