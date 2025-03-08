import {
  useCalloutDetailsLazyQuery,
  useCalloutsOnCalloutsSetUsingClassificationQuery,
  useUpdateCalloutsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  Callout,
  CalloutType,
  CalloutVisibility,
  WhiteboardDetailsFragment,
  CommentsWithMessagesFragment,
  CalloutContributionPolicy,
  CalloutContribution,
  CalloutsOnCalloutsSetUsingClassificationQueryVariables,
} from '@/core/apollo/generated/graphql-schema';
import { useCallback, useMemo } from 'react';
import { cloneDeep } from 'lodash';
import { Tagset } from '@/domain/common/profile/Profile';
import { useCalloutsSetAuthorization } from '../authorization/useCalloutsSetAuthorization';
import { ClassificationTagsetModel } from '../ClassificationTagset.model';

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
    contribution?: Pick<CalloutContribution, 'link' | 'post' | 'whiteboard'>;
    contributionPolicy: Pick<CalloutContributionPolicy, 'state'>;
    comments?: CommentsWithMessagesFragment | undefined;
  };

interface UseCalloutsSetParams {
  calloutsSetId: string | undefined;
  includeClassification: boolean;
  classificationTagsets: ClassificationTagsetModel[];
  canSaveAsTemplate: boolean;
  entitledToSaveAsTemplate: boolean;
}

export interface OrderUpdate {
  (relatedCalloutIds: string[]): string[];
}

export interface UseCalloutsSetProvided {
  calloutsSetId: string | undefined;
  callouts: TypedCallout[] | undefined;
  canCreateCallout: boolean;
  loading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsOnCalloutsSetUsingClassificationQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
}

const useCalloutsSet = ({
  calloutsSetId,
  includeClassification,
  classificationTagsets,
  canSaveAsTemplate,
  entitledToSaveAsTemplate,
}: UseCalloutsSetParams): UseCalloutsSetProvided => {
  const { canCreateCallout, loading: authorizationLoading } = useCalloutsSetAuthorization({ calloutsSetId });

  const variables: CalloutsOnCalloutsSetUsingClassificationQueryVariables = {
    calloutsSetId: calloutsSetId!,
    classificationByFlowStateEnabled: includeClassification,
    classificationTagsets,
  } as const;
  const {
    data: calloutsData,
    loading: calloutsLoading,
    refetch: refetchCallouts,
  } = useCalloutsOnCalloutsSetUsingClassificationQuery({
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !calloutsSetId,
  });

  const [getCalloutDetails] = useCalloutDetailsLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const refetchCallout = (calloutId: string) => {
    getCalloutDetails({
      variables: {
        calloutId,
      },
    });
  };

  const calloutsSet = calloutsData?.lookup.calloutsSet;

  const callouts = useMemo(
    () =>
      calloutsSet?.callouts
        ?.map(cloneDeep) // Clone to be able to modify the callouts
        .map(({ authorization, ...callout }) => {
          const draft = callout?.visibility === CalloutVisibility.Draft;
          const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
          const movable = calloutsSet.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

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
          };
          return result;
        }),
    [calloutsSet, canSaveAsTemplate, entitledToSaveAsTemplate]
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

  const onCalloutsSortOrderUpdate = useCallback(() => {
    const relatedCalloutIds = sortedCallouts?.map(callout => callout.id) ?? [];
    return (update: OrderUpdate) => {
      const nextIds = update(relatedCalloutIds);
      return submitCalloutsSortOrder(nextIds);
    };
  }, [submitCalloutsSortOrder]);

  const [updateCalloutsSortOrderMutation] = useUpdateCalloutsSortOrderMutation();

  return {
    calloutsSetId,
    callouts,
    canCreateCallout,
    loading: calloutsLoading || authorizationLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  };
};

export default useCalloutsSet;
