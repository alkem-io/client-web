import { useMemo } from 'react';
import SpacePageLayout from '../../journey/space/layout/SpacePageLayout';
import SubspacePageLayout from '../../journey/subspace/layout/SubspacePageLayout';
import OpportunityPageLayout from '../../journey/opportunity/layout/OpportunityPageLayout';
import { EntityTypeName } from '../../platform/constants/EntityTypeName';

const usePageLayoutByEntity = (entityTypeName: EntityTypeName) =>
  useMemo(() => {
    switch (entityTypeName) {
      case 'space':
        return SpacePageLayout;
      case 'challenge':
        return SubspacePageLayout;
      case 'opportunity':
        return OpportunityPageLayout;
    }
    throw new TypeError(`Unknown entity ${entityTypeName}`);
  }, [entityTypeName]);

export default usePageLayoutByEntity;
