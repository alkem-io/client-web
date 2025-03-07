import { Route, Routes } from 'react-router';
import { Navigate } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import SubspaceProvider from '../context/SubspaceProvider';
import { NotFoundPageLayout } from '@/domain/journey/common/EntityPageLayout';
import { routes } from './challengeRoutes';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import SubspaceAboutPage from '../../../space/about/SubspaceAboutPage';
import SubspaceHomePage from '../../../space/layout/SubspaceFlow/SubspaceHomePage';
import Redirect from '@/core/routing/Redirect';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import SubspaceCalloutPage from '../subspaceCalloutPage/SubspaceCalloutPage';
import { SubspaceDialog } from '../layout/SubspaceDialog';
import SubspaceSettingsRoute from './settings/SubspaceSettingsRoute';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

const SubspaceRoute = () => {
  const { spaceId, spaceLevel, loading } = useUrlResolver();

  // This avoids race conditions when the url has just changed from space to a subspace,
  // react router gets to execute this but the urlResolver is not yet done resolving
  // TODO: revise this, we should not be delaying the route loading
  if (spaceLevel === SpaceLevel.L0 || loading) {
    return null; // with loading spinner the entire page is shifted down
  }

  return (
    <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
      <Routes>
        <Route index element={<SubspaceHomePage />} />
        <Route path={SubspaceDialog.Index} element={<SubspaceHomePage dialog={SubspaceDialog.Index} />} />
        <Route path={SubspaceDialog.Outline} element={<SubspaceHomePage dialog={SubspaceDialog.Outline} />} />
        <Route path={SubspaceDialog.Subspaces} element={<SubspaceHomePage dialog={SubspaceDialog.Subspaces} />} />
        <Route path={SubspaceDialog.Contributors} element={<SubspaceHomePage dialog={SubspaceDialog.Contributors} />} />
        <Route path={SubspaceDialog.Activity} element={<SubspaceHomePage dialog={SubspaceDialog.Activity} />} />
        <Route path={SubspaceDialog.Timeline} element={<SubspaceHomePage dialog={SubspaceDialog.Timeline} />} />
        <Route path={SubspaceDialog.Share} element={<SubspaceHomePage dialog={SubspaceDialog.Share} />} />
        <Route path={SubspaceDialog.ManageFlow} element={<SubspaceHomePage dialog={SubspaceDialog.ManageFlow} />} />
        <Route path={SubspaceDialog.About} element={<SubspaceAboutPage />} />
        <Route path={SubspaceDialog.Updates} element={<SubspaceHomePage dialog={SubspaceDialog.Updates} />} />
        <Route
          path={`${SubspaceDialog.Timeline}/:${nameOfUrl.calendarEventNameId}`}
          element={<SubspaceHomePage dialog={SubspaceDialog.Timeline} />}
        />
        {/* Redirecting legacy dashboard links to Subspace Home */}
        <Route path={routes.Dashboard} element={<Navigate replace to="/" />} />
        <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SubspaceCalloutPage />} />
        <Route
          path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
          element={<SubspaceCalloutPage>{props => <CalloutRoute {...props} />}</SubspaceCalloutPage>}
        />
        <Route path={`${SubspaceDialog.Settings}/*`} element={<SubspaceSettingsRoute />} />
        <Route
          path="*"
          element={
            <NotFoundPageLayout>
              <Error404 />
            </NotFoundPageLayout>
          }
        />
        <Route
          path={`opportunities/:${nameOfUrl.subsubspaceNameId}/*`}
          element={
            <SubspaceProvider>
              <SubspaceRoute />
            </SubspaceProvider>
          }
        />
        <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default SubspaceRoute;
