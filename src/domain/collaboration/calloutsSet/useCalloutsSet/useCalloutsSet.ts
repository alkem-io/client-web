import {
  useCalloutDetailsLazyQuery,
  useCalloutsOnCalloutsSetUsingClassificationQuery,
  useUpdateCalloutsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CalloutVisibility,
  CalloutsOnCalloutsSetUsingClassificationQueryVariables,
} from '@/core/apollo/generated/graphql-schema';
import { useCallback, useMemo } from 'react';
import { cloneDeep } from 'lodash';
import { useCalloutsSetAuthorization } from '../authorization/useCalloutsSetAuthorization';
import { ClassificationTagsetModel } from '../Classification/ClassificationTagset.model';
import useSpacePermissionsAndEntitlements from '@/domain/space/hooks/useSpacePermissionsAndEntitlements';
import { CalloutModelLightExtended } from '../../callout/models/CalloutModelLight';
import { classificationTagsetModelToTagsetArgs } from '../Classification/ClassificationTagset.utils';

interface UseCalloutsSetParams {
  calloutsSetId: string | undefined;
  classificationTagsets: ClassificationTagsetModel[];
  includeClassification?: boolean | undefined;
  tagsFilter?: string[] | undefined;
  skip?: boolean;
}

export interface OrderUpdate {
  (relatedCalloutIds: string[]): string[];
}

export interface UseCalloutsSetProvided {
  calloutsSetId: string | undefined;
  calloutsSetAuthorization: { myPrivileges?: AuthorizationPrivilege[] } | undefined;
  callouts: CalloutModelLightExtended[] | undefined;
  canCreateCallout: boolean;
  loading: boolean;
  refetchCallouts: (variables?: Partial<CalloutsOnCalloutsSetUsingClassificationQueryVariables>) => void;
  refetchCallout: (calloutId: string) => void;
  onCalloutsSortOrderUpdate: (movedCalloutId: string) => (update: OrderUpdate) => Promise<unknown>;
}

const useCalloutsSet = ({
  calloutsSetId,
  classificationTagsets,
  includeClassification,
  tagsFilter,
  skip,
}: UseCalloutsSetParams): UseCalloutsSetProvided => {
  const { canCreateCallout, loading: authorizationLoading } = useCalloutsSetAuthorization({ calloutsSetId });

  const withClassificationDetails =
    includeClassification === undefined ? classificationTagsets.length > 0 : includeClassification;

  const variables: CalloutsOnCalloutsSetUsingClassificationQueryVariables = {
    calloutsSetId: calloutsSetId!,
    classificationTagsets: classificationTagsetModelToTagsetArgs(classificationTagsets),
    withClassification: withClassificationDetails,
    tagsFilter,
  } as const;

  const {
    data: calloutsData,
    loading: calloutsLoading,
    refetch: refetchCallouts,
  } = useCalloutsOnCalloutsSetUsingClassificationQuery({
    variables,
    fetchPolicy: 'cache-and-network',
    skip: skip || !calloutsSetId,
  });

  const [getCalloutDetails] = useCalloutDetailsLazyQuery({
    fetchPolicy: 'cache-and-network',
  });

  const refetchCallout = (calloutId: string) => {
    getCalloutDetails({
      variables: {
        calloutId,
        withClassification: withClassificationDetails,
      },
    });
  };

  // If we are not in a space, these will be just empty arrays
  const { permissions, entitlements } = useSpacePermissionsAndEntitlements();
  const calloutsCanBeSavedAsTemplate = permissions.canCreateTemplates && entitlements.entitledToSaveAsTemplate;

  const calloutsSet = calloutsData?.lookup.calloutsSet;

  const callouts = useMemo(
    () =>
      calloutsSet?.callouts
        ?.map(cloneDeep) // Clone to be able to modify the callouts
        .map(({ authorization, ...callout }) => {
          const draft = callout?.settings.visibility === CalloutVisibility.Draft;
          const editable = authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
          const movable = calloutsSet.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

          const classification = callout.classification;

          const result: CalloutModelLightExtended = {
            ...callout,
            calloutsSetId: calloutsSet.id,
            classification,
            framing: {
              profile: callout.framing.profile,
              type: callout.framing.type,
            },
            authorization,
            draft,
            editable,
            movable,
            canBeSavedAsTemplate: calloutsCanBeSavedAsTemplate,
            classificationTagsets,
          };
          return result;
        }),
    [calloutsSet, calloutsCanBeSavedAsTemplate]
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
    calloutsSetAuthorization: calloutsSet?.authorization,
    callouts,
    canCreateCallout,
    loading: calloutsLoading || authorizationLoading,
    refetchCallouts,
    refetchCallout,
    onCalloutsSortOrderUpdate,
  };
};

export default useCalloutsSet;
