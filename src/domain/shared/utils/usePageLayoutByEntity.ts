import { useMemo } from 'react';
import HubPageLayout from '../../hub/layout/HubPageLayout';
import ChallengePageLayout from '../../challenge/layout/ChallengePageLayout';
import OpportunityPageLayout from '../../opportunity/layout/OpportunityPageLayout';
import { EntityTypeName } from '../layout/PageLayout/SimplePageLayout';

const usePageLayoutByEntity = (entityTypeName: EntityTypeName) =>
  useMemo(() => {
    switch (entityTypeName) {
      case 'hub':
        return HubPageLayout;
      case 'challenge':
        return ChallengePageLayout;
      case 'opportunity':
        return OpportunityPageLayout;
    }
    throw new TypeError(`Unknown entity ${entityTypeName}`);
  }, [entityTypeName]);

export default usePageLayoutByEntity;
