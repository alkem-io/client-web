import React, { ReactNode, useMemo } from 'react';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { useCalloutPageCalloutQuery } from '../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../challenge/JourneyTypeName';
import CalloutView from '../callout/CalloutView/CalloutView';
import useSubscribeOnCommentCallouts from '../callout/useSubscribeOnCommentCallouts';
import { AuthorizationPrivilege, CalloutType, CalloutVisibility } from '../../../core/apollo/generated/graphql-schema';
import { useCalloutEdit } from '../callout/edit/useCalloutEdit/useCalloutEdit';
import { TypedCallout } from '../callout/useCallouts/useCallouts';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildCalloutUrl } from '../../../common/utils/urlBuilders';
import useCanGoBack from '../../../core/routing/useCanGoBack';

interface CalloutLocation {
  journeyTypeName: JourneyTypeName;
  parentPagePath: string;
}

export interface CalloutPageProps {
  journeyTypeName: JourneyTypeName;
  renderPage: (calloutGroup: string | undefined) => ReactNode;
  parentRoute: string | ((calloutGroup: string | undefined) => string);
  children?: (props: CalloutLocation) => ReactNode;
}

export const LocationStateKeyCachedCallout = 'LocationStateKeyCachedCallout';

export interface LocationStateCachedCallout {
  [LocationStateKeyCachedCallout]?: TypedCallout;
}

const CalloutPage = ({ journeyTypeName, parentRoute, renderPage, children }: CalloutPageProps) => {
  const { calloutNameId, hubNameId, challengeNameId, opportunityNameId } = useUrlParams();

  const locationState = (useLocation().state ?? {}) as LocationStateCachedCallout;

  if (!hubNameId) {
    throw new Error('Must be within a Hub');
  }

  if (!calloutNameId) {
    throw new Error('Callout ID is missing');
  }

  const { data: calloutData } = useCalloutPageCalloutQuery({
    variables: {
      calloutNameId,
      hubNameId,
      challengeNameId,
      opportunityNameId,
      includeHub: journeyTypeName === 'hub',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    fetchPolicy: 'cache-first',
  });

  const navigate = useNavigate();

  const [callout] =
    (
      calloutData?.hub.opportunity?.collaboration ??
      calloutData?.hub.challenge?.collaboration ??
      calloutData?.hub.collaboration
    )?.callouts ?? [];

  const isCommentsCallout = callout?.type === CalloutType.Comments;

  const isSubscribedToComments = useSubscribeOnCommentCallouts(isCommentsCallout ? [callout.id] : []);

  const { handleEdit, handleVisibilityChange, handleDelete } = useCalloutEdit();

  const typedCallout = useMemo(() => {
    if (!callout) {
      return locationState[LocationStateKeyCachedCallout];
    }

    const draft = callout.visibility === CalloutVisibility.Draft;
    const editable = callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update);

    return {
      ...callout,
      draft,
      editable,
      canvases: callout.canvases?.map(canvas => ({ ...canvas, calloutNameId: callout.nameID })),
      comments: { ...callout.comments, calloutNameId: callout.nameID },
    } as unknown as TypedCallout;
  }, [callout, locationState]);

  const canGoBack = useCanGoBack();

  if (!typedCallout) {
    return null;
  }

  const calloutGroup = typedCallout.group;

  const parentPagePath = typeof parentRoute === 'function' ? parentRoute(calloutGroup) : parentRoute;

  const handleClose = () => {
    canGoBack ? navigate(-1) : navigate(parentPagePath);
  };

  const calloutUri = buildCalloutUrl(typedCallout.nameID, {
    hubNameId,
    challengeNameId,
    opportunityNameId,
  });

  return (
    <>
      {renderPage(calloutGroup)}
      <DialogWithGrid open columns={12} onClose={handleClose}>
        <CalloutView
          callout={typedCallout}
          hubNameId={hubNameId}
          challengeNameId={challengeNameId}
          opportunityNameId={opportunityNameId}
          isSubscribedToComments={isSubscribedToComments}
          calloutNames={[]}
          contributionsCount={typedCallout.activity}
          onVisibilityChange={handleVisibilityChange}
          onCalloutEdit={handleEdit}
          onCalloutDelete={handleDelete}
          onClose={handleClose}
          calloutUri={calloutUri}
          expanded
        />
      </DialogWithGrid>
      {children?.({ parentPagePath, journeyTypeName })}
    </>
  );
};

export default CalloutPage;
