import { useEffect, useRef } from 'react';
import { useSpaceTabQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, type SpaceTabQuery, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import type { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import type { InnovationFlowStateModel } from '@/domain/collaboration/InnovationFlow/models/InnovationFlowStateModel';
import type { UrlResolverContextValue } from '@/main/routing/urlResolver/UrlResolverProvider';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import type { SpaceAboutLightModel } from '../../about/model/spaceAboutLight.model';
import { useSpace } from '../../context/useSpace';

interface SpaceTabProvided {
  urlInfo: UrlResolverContextValue;
  innovationFlowStates: InnovationFlowStateModel[] | undefined;
  flowStateForNewCallouts: InnovationFlowStateModel | undefined;
  about: SpaceAboutLightModel | undefined;
  classificationTagsets: ClassificationTagsetModel[];
  calloutsSetId: string | undefined;
  tabDescription: string;
  canEditInnovationFlow: boolean;
  refetch: () => Promise<unknown>;
  loading: boolean;
  updating: boolean;
}

type useSpaceTabProviderParams = {
  tabPosition: number;
  skip?: boolean;
};

const useSpaceTabProvider = ({ tabPosition, skip }: useSpaceTabProviderParams): SpaceTabProvided => {
  const urlInfo = useUrlResolver();
  const {
    space: { id: spaceId },
  } = useSpace();
  const lastQueriedIdRef = useRef<string | null>(null);
  const lastSpaceTabDataRef = useRef<SpaceTabQuery | undefined>(undefined);
  const shouldSkip = skip || !spaceId || lastQueriedIdRef.current === spaceId;

  const {
    data: spaceTabData,
    loading: loadingSpaceTab,
    refetch: refetchSpaceTab,
  } = useSpaceTabQuery({
    variables: { spaceId: spaceId },
    skip: shouldSkip,
  });

  useEffect(() => {
    if (spaceId && !loadingSpaceTab && !skip) {
      lastQueriedIdRef.current = spaceId;
      lastSpaceTabDataRef.current = spaceTabData;
    }
  }, [spaceId, loadingSpaceTab, skip]);

  const dataToUse = spaceTabData || lastSpaceTabDataRef.current;

  const memoizedData = (() => {
    const space = dataToUse?.lookup.space;

    const myPrivileges = space?.authorization?.myPrivileges;
    const canReadSpace = myPrivileges?.includes(AuthorizationPrivilege.Read) ?? false;
    const innovationFlow = space?.collaboration.innovationFlow;
    const innovationFlowStates = innovationFlow?.states;
    const canEditInnovationFlow =
      innovationFlow?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.UpdateInnovationFlow) ?? false;
    const about: SpaceAboutLightModel | undefined = space?.about;
    const calloutsSetId = space?.collaboration.calloutsSet.id;

    let flowState: InnovationFlowStateModel | undefined;
    if (innovationFlowStates && innovationFlowStates?.length >= tabPosition) {
      flowState = innovationFlowStates[tabPosition];
    }

    let classificationTagsets: ClassificationTagsetModel[] = [];
    if (flowState) {
      classificationTagsets = [
        {
          name: TagsetReservedName.FlowState,
          tags: [flowState.displayName],
        },
      ];
    }

    const tabDescription = space?.collaboration.innovationFlow.states[tabPosition]?.description ?? '';

    return {
      canReadSpace,
      innovationFlowStates,
      flowStateForNewCallouts: flowState,
      about,
      tabDescription,
      calloutsSetId,
      classificationTagsets,
      canEditInnovationFlow,
    };
  })();

  return {
    urlInfo,
    refetch: refetchSpaceTab,
    loading: loadingSpaceTab,
    updating: false,
    ...memoizedData,
  };
};

export default useSpaceTabProvider;
