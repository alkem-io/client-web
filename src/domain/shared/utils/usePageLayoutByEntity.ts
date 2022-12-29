import { useMemo } from 'react';
import HubPageLayout from '../../challenge/hub/layout/HubPageLayout';
import ChallengePageLayout from '../../challenge/challenge/layout/ChallengePageLayout';
import OpportunityPageLayout from '../../challenge/opportunity/layout/OpportunityPageLayout';
import { EntityTypeName } from '../layout/LegacyPageLayout/SimplePageLayout';

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
