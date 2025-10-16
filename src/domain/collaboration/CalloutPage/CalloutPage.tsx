import { ReactElement, ReactNode, useEffect, useRef } from 'react';
import CalloutView from '../callout/CalloutView/CalloutView';
import { useCalloutManager } from '../callout/utils/useCalloutManager';
import { CalloutDetailsModelExtended } from '../callout/models/CalloutDetailsModel';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useSearchParams } from 'react-router-dom';
import { DialogContent } from '@mui/material';
import Loading from '@/core/ui/loading/Loading';
import { isApolloForbiddenError, isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { Error404 } from '@/core/pages/Errors/Error404';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Text } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { NavigationState } from '@/core/routing/ScrollToTop';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { useScreenSize } from '@/core/ui/grid/constants';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { Identifiable } from '@/core/utils/Identifiable';
import useNavigate from '@/core/routing/useNavigate';
import useCalloutDetails from '../callout/useCalloutDetails/useCalloutDetails';

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
  [LocationStateKeyCachedCallout]?: CalloutDetailsModelExtended;
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
  const { calloutsSetId, calloutId, contributionId, loading: urlResolverLoading } = useUrlResolver();

  const { t } = useTranslation();

  const navigate = useNavigate();

  const { changeCalloutVisibility, deleteCallout } = useCalloutManager();

  const {
    callout,
    loading: calloutLoading,
    error: calloutError,
    refetch,
  } = useCalloutDetails({
    calloutId,
    calloutsSetId,
    withClassification: !disableCalloutsClassification,
    skip: !calloutId,
    overrideCalloutSettings: {
      movable: true,
    },
  });

  const { isSmallScreen } = useScreenSize();

  const calloutFlowState = callout?.classification?.flowState?.tags[0];
  const calloutPosition = callout?.classification?.flowState?.allowedValues?.findIndex(val => val === calloutFlowState);

  const calloutSection = calloutPosition && calloutPosition > -1 ? calloutPosition : -1;

  let [searchParams, setSearchParams] = useSearchParams();
  const currentSection = parseInt(searchParams.get('tab') || '-1') + 1;

  // Track previous contributionId to detect when we're navigating between contributions
  const prevContributionIdRef = useRef<string | undefined>(contributionId);

  useEffect(() => {
    const isNavigatingBetweenContributions = prevContributionIdRef.current !== contributionId;
    prevContributionIdRef.current = contributionId;

    // Don't update search params if we're viewing a specific contribution (post, whiteboard, etc.)
    // UNLESS we're navigating from one contribution to another
    // This prevents navigation loops when users click activity links to contributions
    if (contributionId && !isNavigatingBetweenContributions) {
      return;
    }

    if (calloutSection < 0) {
      return;
    }

    if (currentSection !== calloutSection) {
      setSearchParams({ tab: `${calloutSection + 1}` }, { replace: true });
    }
  }, [calloutSection, currentSection, contributionId, setSearchParams]);

  if ((urlResolverLoading || calloutLoading) && !callout) {
    return <Loading />;
  }

  if (isApolloNotFoundError(calloutError)) {
    return (
      <TopLevelLayout>
        <Error404 />
      </TopLevelLayout>
    );
  }

  const parentPagePath = typeof parentRoute === 'function' ? parentRoute(calloutPosition) : parentRoute;

  const handleClose = () => {
    refetch();
    navigate(parentPagePath, {
      state: { keepScroll: true },
      replace: true,
    });
  };

  const handleDeleteWithClose = async (callout: Identifiable) => {
    await deleteCallout(callout);
    handleClose();
  };

  if (isApolloForbiddenError(calloutError)) {
    return (
      <>
        {renderPage(calloutPosition)}
        <DialogWithGrid open onClose={handleClose} aria-labelledby="callout-access-forbidden-dialog-title">
          <DialogHeader
            title={t('callout.accessForbidden.title')}
            id="callout-access-forbidden-dialog-title"
            onClose={handleClose}
          />
          <DialogContent sx={{ paddingTop: 0 }}>
            <Text>{t('callout.accessForbidden.description')}</Text>
          </DialogContent>
        </DialogWithGrid>
      </>
    );
  }

  if (!callout) {
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
        fullHeight
        aria-labelledby="callout-title"
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
            callout={callout}
            contributionId={contributionId}
            contributionsCount={callout.activity}
            onVisibilityChange={changeCalloutVisibility}
            onCalloutUpdate={refetch}
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
