import { useMemo } from 'react';
import SpacePageLayout from '../../challenge/space/layout/SpacePageLayout';
import ChallengePageLayout from '../../challenge/challenge/layout/ChallengePageLayout';
import OpportunityPageLayout from '../../challenge/opportunity/layout/OpportunityPageLayout';
import { EntityTypeName } from '../../platform/constants/EntityTypeName';

const usePageLayoutByEntity = (entityTypeName: EntityTypeName) =>
  useMemo(() => {
    switch (entityTypeName) {
      case 'space':
        return SpacePageLayout;
      case 'challenge':
        return ChallengePageLayout;
      case 'opportunity':
        return OpportunityPageLayout;
    }
    throw new TypeError(`Unknown entity ${entityTypeName}`);
  }, [entityTypeName]);

export default usePageLayoutByEntity;
