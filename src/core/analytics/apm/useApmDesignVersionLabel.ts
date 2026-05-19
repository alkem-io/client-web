import { useEffect } from 'react';
import { useApm } from '@/core/analytics/apm/context';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { readDesignVersionFromStorage } from '@/main/crdPages/useCrdEnabled';

const DESIGN_VERSION_LABEL = 'designVersion';

export const useApmDesignVersionLabel = () => {
  const apm = useApm();
  const { designVersion } = useCurrentUserContext();

  useEffect(() => {
    if (!apm) return;
    const value = designVersion ?? readDesignVersionFromStorage() ?? undefined;
    if (value === undefined) return;
    apm.addLabels({ [DESIGN_VERSION_LABEL]: value });
  }, [apm, designVersion]);
};
