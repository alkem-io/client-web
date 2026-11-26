import { TagsetReservedName } from '@/core/apollo/generated/graphql-schema';
import type { ClassificationTagsetModel } from '@/domain/collaboration/calloutsSet/Classification/ClassificationTagset.model';
import type { InnovationFlowStateModel } from '@/domain/collaboration/InnovationFlow/models/InnovationFlowStateModel';
import type { UrlResolverContextValue } from '@/main/routing/urlResolver/UrlResolverProvider';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import type { SpaceAboutLightModel } from '../../about/model/spaceAboutLight.model';
import { useSpace } from '../../context/useSpace';
import { orderedStages, useSpacePageData } from '../../hooks/useSpacePage';

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

/**
 * 021 F028: the tab's stage from the D2 Space document the layout loaded; natively there is no calloutsSet or
 * innovation-flow wrapper, so the set id is the space id. Stage settings (sidebar, visibility) and the stage
 * editing capability are not served yet (S01): the sidebar is unknown and the flow is not editable.
 */
const useSpaceTabProvider = ({ tabPosition, skip }: useSpaceTabProviderParams): SpaceTabProvided => {
  const urlInfo = useUrlResolver();
  const {
    space: { id: spaceId },
  } = useSpace();
  const node = useSpacePageData(skip ? undefined : spaceId || undefined, 'space')?.node;
  const stages = node && 'stages' in node ? orderedStages(node.stages) : undefined;
  const innovationFlowStates = stages?.map(stage => ({
    id: stage.id,
    displayName: stage.name,
    description: stage.description ?? undefined,
    settings: { allowNewCallouts: true },
    sortOrder: stage.sortOrder,
  }));
  const flowState = innovationFlowStates?.[tabPosition];

  return {
    urlInfo,
    innovationFlowStates,
    flowStateForNewCallouts: flowState,
    about: undefined,
    classificationTagsets: flowState ? [{ name: TagsetReservedName.FlowState, tags: [flowState.displayName] }] : [],
    calloutsSetId: node?.id,
    tabDescription: flowState?.description ?? '',
    canEditInnovationFlow: false,
    refetch: () => Promise.resolve(),
    loading: !skip && !node,
    updating: false,
  };
};

export default useSpaceTabProvider;
