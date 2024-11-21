import { useMemo } from 'react';
import SpacePageLayout from '@/domain/journey/space/layout/SpacePageLayout';
import SubspacePageLayout from '@/domain/journey/subspace/layout/SubspacePageLayout';
import { EntityTypeName } from '@/domain/platform/constants/EntityTypeName';

const usePageLayoutByEntity = (entityTypeName: EntityTypeName) =>
  useMemo(() => {
    switch (entityTypeName) {
      case 'space':
        return SpacePageLayout;
      case 'subspace':
      case 'subsubspace':
        return SubspacePageLayout;
    }
    throw new TypeError(`Unknown entity ${entityTypeName}`);
  }, [entityTypeName]);

export default usePageLayoutByEntity;
