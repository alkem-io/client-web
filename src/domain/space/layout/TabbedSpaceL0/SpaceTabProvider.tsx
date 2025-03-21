import { useSpaceTabQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import { UrlResolverContextValue } from '@/main/routing/urlResolver/UrlResolverProvider';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { SpaceAboutLightModel } from '../../about/model/spaceAboutLight.model';
import { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/ClassificationTagset.model';

type InnovationFlowState = {
  displayName: string;
  description: string;
};

interface SpaceTabProvided {
  urlInfo: UrlResolverContextValue;
  canReadSpace: boolean;
  innovationFlowStates: InnovationFlowState[] | undefined;
  innovationFlowCurrentState: InnovationFlowState | undefined;
  flowStateForNewCallouts: InnovationFlowState | undefined;
  about: SpaceAboutLightModel | undefined;
  classificationTagsets: ClassificationTagsetModel[];
  calloutsSetId: string | undefined;
  tabDescription: string;
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

  const canReadSpace = myPrivileges?.includes(AuthorizationPrivilege.Read);

  const innovationFlow = spaceTabData?.lookup.space?.collaboration.innovationFlow;
  const innovationFlowStates = innovationFlow?.states;
  const innovationFlowCurrentState = innovationFlow?.currentState;
  const about: SpaceAboutLightModel | undefined = spaceTabData?.lookup.space?.about;
  const calloutsSetId = spaceTabData?.lookup.space?.collaboration.calloutsSet.id;

  let flowState: InnovationFlowState | undefined = undefined;
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

  const tabDescription =
    spaceTabData?.lookup.space?.collaboration.innovationFlow.states[tabPosition]?.description ?? '';

  return {
    canReadSpace: canReadSpace || false,
    innovationFlowStates,
    innovationFlowCurrentState: innovationFlowCurrentState,
    about,
    urlInfo,
    tabDescription,
    calloutsSetId,
    classificationTagsets,
    flowStateForNewCallouts: flowState,
    refetch: refetchSpaceTab,
    loading: loadingSpaceTab,
    updating: false,
  };
};

export default useSpaceTabProvider;
