import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityLogBaseView } from './ActivityLogBaseView';
import { ActivityLogViewProps } from './ActivityLogViewProps';
import { useCalloutsNameIdsByIdsQuery } from '../../../../../hooks/generated/graphql';
import { CalloutsNameIdsByIdsQuery } from '../../../../../models/graphql-schema';
import { buildCalloutUrl } from '../../../../../common/utils/urlBuilders';
import { GraphQLErrorsExtensionCodes, useApolloErrorHandler } from '../../../../../hooks';

export interface ActivityLogDiscussionCommentCreatedViewProps extends ActivityLogViewProps {}

type CalloutInfo = {
  id: string;
  nameID: string;
  hubNameId: string;
  challengeNameId?: string;
  opportunityNameId?: string;
};

function flatMapAllCallouts(data: CalloutsNameIdsByIdsQuery | undefined) {
  const callouts: CalloutInfo[] = [];

  data?.hubs.forEach(h => {
    h.collaboration?.callouts?.map(c => callouts.push({ ...c, hubNameId: h.nameID }));
    h.challenges?.forEach(ch => {
      ch.collaboration?.callouts?.map(c => callouts.push({ ...c, hubNameId: h.nameID, challengeNameId: ch.nameID }));
      h.challenges?.forEach(opp => {
        opp.collaboration?.callouts?.map(c =>
          callouts.push({ ...c, hubNameId: h.nameID, challengeNameId: ch.nameID, opportunityNameId: opp.nameID })
        );
      });
    });
  });
  return callouts;
}

export const ActivityLogDiscussionCommentCreatedView: FC<ActivityLogDiscussionCommentCreatedViewProps> = props => {
  const { t } = useTranslation();
  const handleError = useApolloErrorHandler({
    ignoreGraphQLErrors: [GraphQLErrorsExtensionCodes.FORBIDDEN, GraphQLErrorsExtensionCodes.ENTITY_NOT_FOUND],
  });
  const action = t('components.activity-log-view.actions.callout-published');

  // Callouts information
  const { data, loading } = useCalloutsNameIdsByIdsQuery({
    onError: handleError,
    // variables: { ids: [props.resourceId] },
    skip: !props.resourceId,
    errorPolicy: 'all',
  });

  const calloutUrl = useMemo(() => {
    const callouts = flatMapAllCallouts(data);
    const callout = callouts.find(c => c.id === props.resourceId);
    return callout ? buildCalloutUrl(callout.nameID, callout.hubNameId, callout.opportunityNameId) : undefined;
  }, [data, loading, props.resourceId]);

  return <ActivityLogBaseView action={action} {...props} url={calloutUrl} />;
};
