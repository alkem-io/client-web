import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { readDesignVersionFromStorage } from '@/main/crdPages/useCrdEnabled';

const DESIGN_VERSION_TAG = 'designVersion';

export const useSentryDesignVersionTag = () => {
  const { designVersion } = useCurrentUserContext();

  useEffect(() => {
    const value = designVersion ?? readDesignVersionFromStorage() ?? undefined;
    Sentry.setTag(DESIGN_VERSION_TAG, value);
  }, [designVersion]);
};
