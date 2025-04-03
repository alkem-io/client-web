import React, { ReactElement, ReactNode, useEffect, useMemo, useRef } from 'react';
import { useCalloutPageCalloutQuery } from '@/core/apollo/generated/apollo-hooks';
import CalloutView from '../callout/CalloutView/CalloutView';
import { AuthorizationPrivilege, CalloutVisibility, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useCalloutEdit } from '../callout/edit/useCalloutEdit/useCalloutEdit';
import { TypedCalloutDetails } from '../calloutsSet/useCalloutsSet/useCalloutsSet';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useLocation } from 'react-router-dom';
import { DialogContent, Theme, useMediaQuery } from '@mui/material';
import Loading from '@/core/ui/loading/Loading';
import { isApolloForbiddenError, isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { NotFoundPageLayout } from '@/domain/space/layout/EntityPageLayout';
import { Error404 } from '@/core/pages/Errors/Error404';
import useBackToPath from '@/core/routing/useBackToPath';
import usePageLayoutByEntity from '@/domain/shared/utils/usePageLayoutByEntity';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Text } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { NavigationState } from '@/core/routing/ScrollToTop';
import { CalloutDeleteType } from '../callout/edit/CalloutEditType';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useSpacePermissionsAndEntitlements from '@/domain/space/hooks/useSpacePermissionsAndEntitlements';

type CalloutLocation = {
  parentPagePath: string;
};

export interface CalloutPageProps {
  renderPage: (position?: number) => ReactElement;
  parentRoute: string | ((position: number | undefined) => string);
  children?: (props: CalloutLocation) => ReactNode;
}

export const LocationStateKeyCachedCallout = 'LocationStateKeyCachedCallout';

export interface LocationStateCachedCallout extends NavigationState {
  [LocationStateKeyCachedCallout]?: TypedCalloutDetails;
}

/**
 *
 * @param parentRoute - defines the page url behind the Callout dialog
 * @param renderPage - defines what page is to be rendered behind the Callout dialog
 * @param children - Typical usage for the children fn is to render nested dialog/routes
 *                   (such as routes for Post/Whiteboard dialogs).
 * @constructor
 */
const CalloutPage = ({ parentRoute, renderPage, children }: CalloutPageProps) => {
  const {
    spaceId,
    levelZeroSpaceId,
    parentSpaceId,
    calloutId,
    spaceLevel,
    journeyPath,
    loading: urlResolverLoading,
  } = useUrlResolver();

  const locationState = (useLocation().state ?? {}) as LocationStateCachedCallout;

  const { t } = useTranslation();

  const {
    data: calloutData,
    loading: isCalloutLoading,
    refetch: refetchCalloutData,
    error,
  } = useCalloutPageCalloutQuery({
    variables: {
      calloutId: calloutId!,
    },
    skip: !calloutId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const { entitlements, permissions } = useSpacePermissionsAndEntitlements();
  const calloutsCanBeSavedAsTemplate = entitlements?.entitledToSaveAsTemplate && permissions.canCreateTemplates;

  const callout = calloutData?.lookup.callout;

  const { handleEdit, handleVisibilityChange, handleDelete } = useCalloutEdit();

  const typedCalloutDetails = useMemo(() => {
    if (!callout) {
      return locationState[LocationStateKeyCachedCallout];
    }

    const draft = callout.visibility === CalloutVisibility.Draft;
    const editable = callout.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

    const result: TypedCalloutDetails = {
      ...callout,
      authorization: {
        myPrivileges: callout.authorization?.myPrivileges,
      },
      draft,
      editable,
      movable: false,
      canBeSavedAsTemplate: calloutsCanBeSavedAsTemplate,
      classificationTagsets: [],
    };
    return result;
  }, [callout, locationState, calloutsCanBeSavedAsTemplate]);

  const backOrElse = useBackToPath();

  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const PageLayout = usePageLayoutByEntity(spaceLevel === SpaceLevel.L0);

  // as the values of the flowState can be changed we use the position of the availableValues
  // and we keep the last saved position as rerenders turns the value to undefined
  const lastPosition = useRef<number>();
  const calloutFlowState = typedCalloutDetails?.classification?.flowState?.tags[0];
  const calloutPosition = typedCalloutDetails?.classification?.flowState?.allowedValues?.findIndex(
    val => val === calloutFlowState
  );
  const currentSection = calloutPosition && calloutPosition > -1 ? { sectionIndex: calloutPosition } : undefined; // Will leave all the tabs unselected

  useEffect(() => {
    if (calloutFlowState) {
      lastPosition.current = calloutPosition;
    }
  }, [calloutPosition]);

  if ((urlResolverLoading || isCalloutLoading) && !typedCalloutDetails) {
    return (
      <PageLayout
        journeyId={spaceId}
        levelZeroSpaceId={levelZeroSpaceId}
        spaceLevel={spaceLevel}
        journeyPath={journeyPath}
        parentSpaceId={parentSpaceId}
        currentSection={currentSection}
      >
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

  const parentPagePath = typeof parentRoute === 'function' ? parentRoute(lastPosition.current) : parentRoute;
  const handleClose = () => {
    backOrElse(parentPagePath);
  };

  const handleDeleteWithClose = async (callout: CalloutDeleteType) => {
    await handleDelete(callout);
    handleClose();
  };

  if (isApolloForbiddenError(error)) {
    return (
      <>
        {renderPage(lastPosition.current)}
        <DialogWithGrid open onClose={handleClose}>
          <DialogHeader title={t('callout.accessForbidden.title')} onClose={handleClose} />
          <DialogContent sx={{ paddingTop: 0 }}>
            <Text>{t('callout.accessForbidden.description')}</Text>
          </DialogContent>
        </DialogWithGrid>
      </>
    );
  }

  if (!typedCalloutDetails) {
    return renderPage();
  }

  return (
    <>
      {renderPage(lastPosition.current)}
      <DialogWithGrid open columns={12} onClose={handleClose} fullScreen={isSmallScreen}>
        <CalloutView
          callout={typedCalloutDetails}
          contributionsCount={typedCalloutDetails.activity}
          onVisibilityChange={handleVisibilityChange}
          onCalloutEdit={handleEdit}
          onCalloutUpdate={refetchCalloutData}
          onCalloutDelete={handleDeleteWithClose}
          onCollapse={handleClose}
          expanded
        />
      </DialogWithGrid>
      {children?.({ parentPagePath })}
    </>
  );
};

export default CalloutPage;
