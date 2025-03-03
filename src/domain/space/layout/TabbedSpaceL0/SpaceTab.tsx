import { useSpaceTabQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { UrlResolverContextValue } from '@/main/routing/urlResolver/UrlResolverProvider';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceAboutLightModel } from '../../about/model/spaceAboutLight.model';
import useCalloutsOnCollaboration from '@/domain/collaboration/useCalloutsOnCollaboration';
import { UseCalloutsProvided } from '@/domain/collaboration/calloutsSet/useCallouts/useCallouts';

type InnovationFlowState = {
  displayName: string;
  description: string;
};

interface SpaceTabProvided {
  urlInfo: UrlResolverContextValue;
  myPrivileges: AuthorizationPrivilege[] | undefined;
  canReadSpace: boolean;
  innovationFlowStates: InnovationFlowState[] | undefined;
  currentFlowState: InnovationFlowState | undefined;
  flowStateForTab: InnovationFlowState | undefined;
  about: SpaceAboutLightModel | undefined;
  collaborationId: string | undefined;
  callouts: UseCalloutsProvided;

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
  const { spaceId } = urlInfo;

  const {
    data: spaceTabData,
    loading: loadingSpaceTab,
    refetch: refetchSpaceTab,
  } = useSpaceTabQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: skip || !spaceId,
  });
  const myPrivileges = spaceTabData?.lookup.space?.authorization?.myPrivileges;

  // By definition must have ReadAbout
  const canReadSpace = myPrivileges?.includes(AuthorizationPrivilege.Read);

  const innovationFlow = spaceTabData?.lookup.space?.collaboration.innovationFlow;
  const innovationFlowStates = innovationFlow?.states;
  const currentFlowState = innovationFlow?.currentState;
  const about: SpaceAboutLightModel | undefined = spaceTabData?.lookup.space?.about;
  const collaborationId = spaceTabData?.lookup.space?.collaboration.id;

  let flowState: InnovationFlowState | undefined = undefined;
  if (innovationFlowStates && innovationFlowStates?.length >= tabPosition) {
    flowState = innovationFlowStates[tabPosition];
  }

  const callouts = useCalloutsOnCollaboration({
    collaborationId,
    flowStateNames: [flowState?.displayName || ''],
  });

  return {
    myPrivileges,
    canReadSpace: canReadSpace || false,
    innovationFlowStates,
    currentFlowState,
    about,
    urlInfo,
    collaborationId,
    callouts,
    flowStateForTab: flowState,
    refetch: refetchSpaceTab,
    loading: loadingSpaceTab,
    updating: false,
  };
};

export default useSpaceTabProvider;
