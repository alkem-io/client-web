import { useLayoutEffect } from 'react';
import useLandingUrl from '@/main/landing/useLandingUrl';

const RedirectToWelcomeSite = () => {
  const landingUrl = useLandingUrl();

  useLayoutEffect(() => {
    if (landingUrl) {
      window.location.replace(landingUrl);
    }
  }, [landingUrl]);

  return null;
};

export default RedirectToWelcomeSite;
