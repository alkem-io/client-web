import { useMemo } from 'react';
import SpacePageLayout from '@/domain/space/layout/tabbedLayout/layout/SpacePageLayout';
import SubspacePageLayout from '@/domain/space/layout/flowLayout/SubspacePageLayout';

const usePageLayoutByEntity = (isL0Space: boolean) =>
  useMemo(() => {
    if (isL0Space) {
      return SpacePageLayout;
    }
    return SubspacePageLayout;
  }, [isL0Space]);

export default usePageLayoutByEntity;
