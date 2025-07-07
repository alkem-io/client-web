import { ReactElement, ReactNode, useEffect, useMemo } from 'react';
import { useCalloutPageCalloutQuery } from '@/core/apollo/generated/apollo-hooks';
import CalloutView from '../callout/CalloutView/CalloutView';
import { AuthorizationPrivilege, CalloutVisibility } from '@/core/apollo/generated/graphql-schema';
import { useCalloutManager } from '../callout/utils/useCalloutManager';
import { TypedCalloutDetails } from '../callout/models/TypedCallout';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useLocation, useSearchParams } from 'react-router-dom';
import { DialogContent } from '@mui/material';
import Loading from '@/core/ui/loading/Loading';
import { isApolloForbiddenError, isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { Error404 } from '@/core/pages/Errors/Error404';
import useBackToPath from '@/core/routing/useBackToPath';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Text } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { NavigationState } from '@/core/routing/ScrollToTop';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useSpacePermissionsAndEntitlements from '@/domain/space/hooks/useSpacePermissionsAndEntitlements';
import { useScreenSize } from '@/core/ui/grid/constants';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { Identifiable } from '@/core/utils/Identifiable';

type CalloutLocation = {
  parentPagePath: string;
};

export interface CalloutPageProps {
  renderPage: (position?: number) => ReactElement | undefined;
  parentRoute: string | ((position: number | undefined) => string);
  disableCalloutsClassification?: boolean;
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
const CalloutPage = ({ parentRoute, renderPage, disableCalloutsClassification, children }: CalloutPageProps) => {
  const { calloutId, loading: urlResolverLoading } = useUrlResolver();

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
      includeClassification: !disableCalloutsClassification,
    },
    skip: !calloutId,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const { entitlements, permissions } = useSpacePermissionsAndEntitlements();
  const calloutsCanBeSavedAsTemplate = entitlements?.entitledToSaveAsTemplate && permissions.canCreateTemplates;

  const callout = calloutData?.lookup.callout;

  const { changeCalloutVisibility, deleteCallout } = useCalloutManager();

  const typedCalloutDetails = useMemo(() => {
    if (!callout) {
      return locationState[LocationStateKeyCachedCallout];
    }

    const draft = callout.settings.visibility === CalloutVisibility.Draft;
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

  const { isSmallScreen } = useScreenSize();

  const calloutFlowState = typedCalloutDetails?.classification?.flowState?.tags[0];
  const calloutPosition = typedCalloutDetails?.classification?.flowState?.allowedValues?.findIndex(
    val => val === calloutFlowState
  );

  const calloutSection = calloutPosition && calloutPosition > -1 ? calloutPosition : -1;

  let [searchParams, setSearchParams] = useSearchParams();
  const currentSection = parseInt(searchParams.get('tab') || '-1') + 1;

  useEffect(() => {
    if (calloutSection < 0) {
      return;
    }

    if (currentSection !== calloutSection) {
      setSearchParams({ tab: `${calloutSection + 1}` });
    }
  }, [calloutSection, currentSection]);

  if ((urlResolverLoading || isCalloutLoading) && !typedCalloutDetails) {
    return <Loading />;
  }

  if (isApolloNotFoundError(error)) {
    return (
      <TopLevelLayout>
        <Error404 />
      </TopLevelLayout>
    );
  }

  const parentPagePath = typeof parentRoute === 'function' ? parentRoute(calloutPosition) : parentRoute;

  const handleClose = () => {
    backOrElse(parentPagePath);
  };

  const handleDeleteWithClose = async (callout: Identifiable) => {
    await deleteCallout(callout);
    handleClose();
  };

  if (isApolloForbiddenError(error)) {
    return (
      <>
        {renderPage(calloutPosition)}
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
      {renderPage(calloutPosition)}
      <DialogWithGrid
        open
        columns={12}
        onClose={handleClose}
        fullScreen={isSmallScreen}
        sx={{
          '.MuiDialog-paper': {
            // copied from DialogWithGrid as it will be overridden here
            maxWidth: '100vw',
            maxHeight: isSmallScreen ? '100vh' : '80vh',
            height: 'auto',
            minHeight: 'auto', // Allows dialog to be smaller when content is minimal
          },
        }}
      >
        <DialogContent
          dividers
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            // Allow content to determine height, with max constraint
            flexGrow: 1, // Take up available space
            height: 'auto',
            overflow: 'hidden', // Prevent dialog from scrolling
          }}
        >
          <CalloutView
            callout={typedCalloutDetails}
            contributionsCount={typedCalloutDetails.activity}
            onVisibilityChange={changeCalloutVisibility}
            onCalloutUpdate={refetchCalloutData}
            onCalloutDelete={handleDeleteWithClose}
            onCollapse={handleClose}
            expanded
          />
        </DialogContent>
      </DialogWithGrid>
      {children?.({ parentPagePath })}
    </>
  );
};

export default CalloutPage;
