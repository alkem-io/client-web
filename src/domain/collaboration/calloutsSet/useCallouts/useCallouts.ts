import {
  useCalloutsOnCalloutsSetLazyQuery,
  useCalloutsOnCalloutsSetQuery,
  useUpdateCalloutsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  Callout,
  CalloutsOnCalloutsSetQueryVariables,
  CalloutType,
  CalloutVisibility,
  WhiteboardDetailsFragment,
  CommentsWithMessagesFragment,
  CalloutContributionPolicy,
  CalloutContribution,
} from '@/core/apollo/generated/graphql-schema';
import { useCallback, useMemo } from 'react';
import { cloneDeep, groupBy } from 'lodash';
import { Tagset } from '@/domain/common/profile/Profile';
import { useCalloutsSetAuthorization } from '../authorization/useCalloutsSetAuthorization';
import useInnovationFlowStates from '../../InnovationFlow/InnovationFlowStates/useInnovationFlowStates';

export type TypedCallout = Pick<Callout, 'id' | 'activity' | 'sortOrder'> & {
  authorization:
    | {
        myPrivileges?: AuthorizationPrivilege[];
      }
    | undefined;
  framing: {
    profile: {
      id: string;
      url: string;
      displayName: string;
    };
  };
  type: CalloutType;
  draft: boolean;
  editable: boolean;
  movable: boolean;
  canSaveAsTemplate: boolean;
  entitledToSaveAsTemplate: boolean;
  flowStates: string[] | undefined;
  groupName: string;
};

export type TypedCalloutDetails = TypedCallout &
  Pick<Callout, 'contributionDefaults'> & {
    framing: {
      profile: {
        id: string;
        displayName: string;
        description?: string;
        tagset?: Tagset;
        storageBucket: {
          id: string;
        };
      };
      whiteboard?: WhiteboardDetailsFragment;
    };
    groupName: string;
    contribution?: Pick<CalloutContribution, 'link' | 'post' | 'whiteboard'>;
    contributionPolicy: Pick<CalloutContributionPolicy, 'state'>;
    comments?: CommentsWithMessagesFragment | undefined;
  };

interface UseCalloutsParams {
  calloutsSetId: string | undefined;
  includeClassification: boolean;
  collaborationId?: string; // Do not leave this, this is a hack
  groupNames?: string[];
  canSaveAsTemplate: boolean;
  entitledToSaveAsTemplate: boolean;
}

export interface OrderUpdate {
  (relatedCalloutIds: string[]): string[];
}

export interface UseCalloutsProvided {
  callouts: TypedCallout[] | undefined;
  groupedCallouts: Record<string, TypedCallout[] | undefined>;
  canCreateCallout: boolean;
  canReadCalloutsSet: boolean;
  loading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsOnCalloutsSetQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
}

const UNGROUPED_CALLOUTS_GROUP = Symbol('undefined');

/**
 * If you need Callouts without a group, don't specify groupNames at all.
 */

const useCallouts = ({
  calloutsSetId,
  collaborationId,
  includeClassification,
  canSaveAsTemplate,
  entitledToSaveAsTemplate,
}: UseCalloutsParams): UseCalloutsProvided => {
  const {
    canCreateCallout,
    canReadCalloutsSet,
    loading: authorizationLoading,
  } = useCalloutsSetAuthorization({ calloutsSetId });

  const { innovationFlowStates } = useInnovationFlowStates({ collaborationId });

  const variables: CalloutsOnCalloutsSetQueryVariables = {
    calloutsSetId: calloutsSetId!,
    includeClassification,
  } as const;

  const {
    data: calloutsData,
    loading: calloutsLoading,
    refetch: refetchCallouts,
  } = useCalloutsOnCalloutsSetQuery({
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !canReadCalloutsSet || !calloutsSetId,
  });

  const [getCallouts] = useCalloutsOnCalloutsSetLazyQuery({
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const refetchCallout = (calloutId: string) => {
    getCallouts({
      variables: {
        ...variables,
        calloutIds: [calloutId],
      },
    });
  };

  const calloutsSet = calloutsData?.lookup.calloutsSet;
  const validStates = innovationFlowStates?.map(state => state.displayName) || [];

  const callouts = useMemo(
    () =>
      calloutsSet?.callouts
        ?.map(cloneDeep) // Clone to be able to modify the callouts
        .filter(callout => {
          if (!innovationFlowStates) {
            return false;
          }

          // Get the flow-state of the callout
          // TODOXX: what should this be doing??!!
          const [calloutFlowState] = callout.classification?.flowState?.tags ?? [];
          if (calloutFlowState) {
            return true;
          }
          return false;
        })

        .map(({ authorization, ...callout }) => {
          const draft = callout?.visibility === CalloutVisibility.Draft;
          const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
          const movable = calloutsSet.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
          const innovationFlowTagset = callout.classification?.flowState;
          const flowStates = innovationFlowTagset?.tags;

          const result: TypedCallout = {
            ...callout,
            framing: {
              profile: callout.framing.profile,
            },
            authorization,
            draft,
            editable,
            movable,
            canSaveAsTemplate,
            entitledToSaveAsTemplate,
            flowStates,
            groupName: innovationFlowTagset?.tags[0] || validStates[0],
          };
          return result;
        }),
    [calloutsSet, canSaveAsTemplate, entitledToSaveAsTemplate, innovationFlowStates]
  );

  const submitCalloutsSortOrder = useCallback(
    (calloutIds: string[]) => {
      if (!calloutsSet) {
        throw new Error('CalloutsSet is not loaded yet.');
      }
      return updateCalloutsSortOrderMutation({
        variables: {
          calloutsSetID: calloutsSet.id,
          calloutIds,
        },
      });
    },
    [calloutsSet]
  );

  const sortedCallouts = useMemo(() => callouts?.sort((a, b) => a.sortOrder - b.sortOrder), [callouts]);

  const onCalloutsSortOrderUpdate = useCallback(
    (movedCalloutId: string) => {
      const flowState = callouts?.find(callout => callout.id === movedCalloutId)?.flowStates?.[0];
      const groupName = callouts?.find(callout => callout.id === movedCalloutId)?.groupName;
      const relatedCallouts = callouts?.filter(
        callout => (!flowState || callout.flowStates?.includes(flowState)) && callout.groupName === groupName
      );
      const relatedCalloutIds = relatedCallouts?.map(callout => callout.id) ?? [];
      return (update: OrderUpdate) => {
        const nextIds = update(relatedCalloutIds);
        return submitCalloutsSortOrder(nextIds);
      };
    },
    [submitCalloutsSortOrder]
  );

  const groupedCallouts = useMemo(() => {
    return groupBy(sortedCallouts, callout => callout.groupName) as Record<
      string | typeof UNGROUPED_CALLOUTS_GROUP,
      TypedCallout[] | undefined
    >;
  }, [sortedCallouts]);

  const [updateCalloutsSortOrderMutation] = useUpdateCalloutsSortOrderMutation();

  return {
    callouts,
    groupedCallouts,
    canCreateCallout,
    canReadCalloutsSet,
    loading: calloutsLoading || authorizationLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  };
};

export default useCallouts;
