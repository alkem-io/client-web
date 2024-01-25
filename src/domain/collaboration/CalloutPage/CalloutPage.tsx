import React, { ReactElement, ReactNode, useMemo } from 'react';
import { useUrlParams } from '../../../core/routing/useUrlParams';
import { useCalloutPageCalloutQuery } from '../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../journey/JourneyTypeName';
import CalloutView from '../callout/CalloutView/CalloutView';
import { AuthorizationPrivilege, CalloutVisibility } from '../../../core/apollo/generated/graphql-schema';
import { useCalloutEdit } from '../callout/edit/useCalloutEdit/useCalloutEdit';
import { TypedCallout } from '../callout/useCallouts/useCallouts';
import DialogWithGrid from '../../../core/ui/dialog/DialogWithGrid';
import { useLocation, useNavigate } from 'react-router-dom';
import { buildCalloutUrl } from '../../../main/routing/urlBuilders';
import useCanGoBack from '../../../core/routing/useCanGoBack';
import { Theme, useMediaQuery } from '@mui/material';
import { getCalloutDisplayLocationValue } from '../callout/utils/getCalloutDisplayLocationValue';
import Loading from '../../../core/ui/loading/Loading';
import { isApolloNotFoundError } from '../../../core/apollo/hooks/useApolloErrorHandler';
import { NotFoundPageLayout } from '../../journey/common/EntityPageLayout';
import { Error404 } from '../../../core/pages/Errors/Error404';
import usePageLayoutByEntity from '../../shared/utils/usePageLayoutByEntity';
import { EntityPageSection } from '../../shared/layout/EntityPageSection';

interface CalloutLocation {
  journeyTypeName: JourneyTypeName;
  parentPagePath: string;
}

export interface CalloutPageProps {
  journeyTypeName: JourneyTypeName;
  renderPage: (calloutDisplayLocation?: string) => ReactElement;
  parentRoute: string | ((calloutGroup: string | undefined) => string);
  children?: (props: CalloutLocation) => ReactNode;
}

export const LocationStateKeyCachedCallout = 'LocationStateKeyCachedCallout';

export interface LocationStateCachedCallout {
  [LocationStateKeyCachedCallout]?: TypedCallout;
}

/**
 *
 * @param journeyTypeName
 * @param parentRoute
 * @param renderPage - defines what page is to be rendered behind the Callout dialog
 * @param children - Typical usage for the children fn is to render nested dialog/routes
 *                   (such as routes for Post/Whiteboard dialogs).
 * @constructor
 */
const CalloutPage = ({ journeyTypeName, parentRoute, renderPage, children }: CalloutPageProps) => {
  const { calloutNameId, spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  const locationState = (useLocation().state ?? {}) as LocationStateCachedCallout;

  if (!spaceNameId) {
    throw new Error('Must be within a Space');
  }

  if (!calloutNameId) {
    throw new Error('Callout ID is missing');
  }

  const {
    data: calloutData,
    loading: isCalloutLoading,
    refetch: refetchCalloutData,
    error,
  } = useCalloutPageCalloutQuery({
    variables: {
      calloutNameId,
      spaceNameId,
      challengeNameId,
      opportunityNameId,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    fetchPolicy: 'cache-first',
  });

  const navigate = useNavigate();

  const [callout] =
    (
      calloutData?.space.opportunity?.collaboration ??
      calloutData?.space.challenge?.collaboration ??
      calloutData?.space.collaboration
    )?.callouts ?? [];

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
      comments: callout.comments ? { ...callout.comments, calloutNameId: callout.nameID } : undefined,
    } as unknown as TypedCallout;
  }, [callout, locationState]);

  const canGoBack = useCanGoBack();

  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const PageLayout = usePageLayoutByEntity(journeyTypeName);

  if (isCalloutLoading) {
    return (
      <PageLayout currentSection={EntityPageSection.Contribute}>
        <Loading />
      </PageLayout>
    );
  }

  if (isApolloNotFoundError(error)) {
    return (
      <NotFoundPageLayout>
        <Error404 />
      </NotFoundPageLayout>
    );
  }

  if (!typedCallout) {
    return renderPage();
  }

  const calloutDisplayLocation = getCalloutDisplayLocationValue(
    typedCallout.framing.profile.displayLocationTagset?.tags
  );

  const parentPagePath = typeof parentRoute === 'function' ? parentRoute(calloutDisplayLocation) : parentRoute;

  const handleClose = () => {
    canGoBack ? navigate(-1) : navigate(parentPagePath);
  };

  const calloutUri = buildCalloutUrl(typedCallout.nameID, {
    spaceNameId,
    challengeNameId,
    opportunityNameId,
  });

  return (
    <>
      {renderPage(calloutDisplayLocation)}
      <DialogWithGrid open columns={12} onClose={handleClose} fullScreen={isSmallScreen}>
        <CalloutView
          callout={typedCallout}
          spaceNameId={spaceNameId}
          challengeNameId={challengeNameId}
          opportunityNameId={opportunityNameId}
          journeyTypeName={journeyTypeName}
          calloutNames={[]}
          contributionsCount={typedCallout.activity}
          onVisibilityChange={handleVisibilityChange}
          onCalloutEdit={handleEdit}
          onCalloutUpdate={refetchCalloutData}
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
