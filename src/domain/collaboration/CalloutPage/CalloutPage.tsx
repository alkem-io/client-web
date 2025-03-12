import React, { ReactElement, ReactNode, useMemo } from 'react';
import { useCalloutPageCalloutQuery } from '@/core/apollo/generated/apollo-hooks';
import CalloutView from '../callout/CalloutView/CalloutView';
import { AuthorizationPrivilege, CalloutVisibility, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useCalloutEdit } from '../callout/edit/useCalloutEdit/useCalloutEdit';
import { TypedCalloutDetails } from '../calloutsSet/useCallouts/useCallouts';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useLocation } from 'react-router-dom';
import { DialogContent, Theme, useMediaQuery } from '@mui/material';
import Loading from '@/core/ui/loading/Loading';
import { isApolloForbiddenError, isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { NotFoundPageLayout } from '@/domain/journey/common/EntityPageLayout';
import { Error404 } from '@/core/pages/Errors/Error404';
import useBackToPath from '@/core/routing/useBackToPath';
import usePageLayoutByEntity from '@/domain/shared/utils/usePageLayoutByEntity';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Text } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { NavigationState } from '@/core/routing/ScrollToTop';
import { getCalloutGroupNameValue } from '../callout/utils/getCalloutGroupValue';
import { CalloutDeleteType } from '../callout/edit/CalloutEditType';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

type CalloutLocation = {
  parentPagePath: string;
};

export interface CalloutPageProps {
  renderPage: (calloutGroupName?: string) => ReactElement;
  parentRoute: string | ((calloutGroup: string | undefined) => string);
  children?: (props: CalloutLocation) => ReactNode;
}

export const LocationStateKeyCachedCallout = 'LocationStateKeyCachedCallout';

export interface LocationStateCachedCallout extends NavigationState {
  [LocationStateKeyCachedCallout]?: TypedCalloutDetails;
}

/**
 *
 * @param parentRoute
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
      canSaveAsTemplate: false,
      entitledToSaveAsTemplate: false,
      flowStates: [],
      groupName: getCalloutGroupNameValue(
        callout.framing.profile.tagsets?.find(tagset => tagset.name === 'callout-group')?.tags
      ),
    };
    return result;
  }, [callout, locationState]);

  const backOrElse = useBackToPath();

  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const PageLayout = usePageLayoutByEntity(spaceLevel === SpaceLevel.L0);

  if ((urlResolverLoading || isCalloutLoading) && !typedCalloutDetails) {
    return (
      <PageLayout
        journeyId={spaceId}
        levelZeroSpaceId={levelZeroSpaceId}
        spaceLevel={spaceLevel}
        journeyPath={journeyPath}
        parentSpaceId={parentSpaceId}
        currentSection={EntityPageSection.Contribute}
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

  const calloutGroupName = typedCalloutDetails && typedCalloutDetails.groupName;

  const parentPagePath = typeof parentRoute === 'function' ? parentRoute(calloutGroupName) : parentRoute;

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
        {renderPage(calloutGroupName)}
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
      {renderPage(calloutGroupName)}
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
