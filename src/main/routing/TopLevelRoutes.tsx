import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import App from '../ui/layout/topLevelWrappers/App';
import { CommunityContextProvider } from '../../domain/community/community/CommunityContext';
import { SpaceContextProvider } from '../../domain/journey/space/SpaceContext/SpaceContext';
import HomePage from '../topLevelPages/Home/HomePage';
import AboutPage from '../topLevelPages/About';
import { Error404 } from '../../core/pages/Errors/Error404';
import ContributorsPage from '../../domain/community/user/ContributorsPage';
import { AdminRoute } from '../../domain/platform/admin/routing/AdminRoute';
import OrganizationRoute from '../../domain/community/contributor/organization/routing/OrganizationRoute';
import ProfileRoute from '../../domain/community/profile/routing/ProfileRoute';
import { Restricted } from '../../core/routing/Restricted';
import NoIdentityRedirect from '../../core/routing/NoIdentityRedirect';
import { nameOfUrl } from './urlParams';
import UserRoute from '../../domain/community/user/routing/UserRoute';
import { SpaceRoute } from '../../domain/journey/space/routing/SpaceRoute';
import { SpaceExplorerPage } from '../topLevelPages/topLevelSpaces/SpaceExplorerPage';
import { IdentityRoute } from '../../core/auth/authentication/routing/IdentityRoute';
import { WithApmTransaction } from '../../domain/shared/components';
import devRoute from '../../dev/routes';
import RedirectToLanding from '../../domain/platform/routes/RedirectToLanding';
import ForumRoute from '../../domain/communication/discussion/routing/ForumRoute';
import InnovationLibraryPage from '../topLevelPages/InnovationLibraryPage/InnovationLibraryPage';
import InnovationPackRoute from '../../domain/collaboration/InnovationPack/InnovationPackRoute';
import NonIdentity from '../../domain/platform/routes/NonIdentity';
import useRedirectToIdentityDomain from '../../core/auth/authentication/routing/useRedirectToIdentityDomain';
import { EntityPageLayoutHolder, NotFoundPageLayout, RenderPoint } from '../../domain/journey/common/EntityPageLayout';
import RedirectToWelcomeSite from '../../domain/platform/routes/RedirectToWelcomeSite';
import CreateSpaceDialog from '../../domain/journey/space/createSpace/CreateSpaceDialog';
import VCRoute from '../../domain/community/virtualContributor/VCRoute';
import { TopLevelRoutePath } from './TopLevelRoutePath';
import DocumentationPage from '../../domain/documentation/DocumentationPage';

export const TopLevelRoutes: FC = () => {
  useRedirectToIdentityDomain();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <WithApmTransaction path="/">
            <App />
          </WithApmTransaction>
        }
      >
        <Route index element={<RedirectToLanding />} />
        <Route path={TopLevelRoutePath._Landing} element={<RedirectToWelcomeSite />} />
        <Route
          path={TopLevelRoutePath.CreateSpace}
          element={
            <NonIdentity>
              <WithApmTransaction path={TopLevelRoutePath.CreateSpace}>
                <>
                  <HomePage />
                  <CreateSpaceDialog />
                </>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={TopLevelRoutePath.Home}
          element={
            <NonIdentity>
              <WithApmTransaction path={TopLevelRoutePath.Home}>
                <HomePage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`:${nameOfUrl.spaceNameId}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.spaceNameId}/*`}>
                <SpaceContextProvider>
                  <CommunityContextProvider>
                    <EntityPageLayoutHolder>
                      <SpaceRoute />
                      <RenderPoint />
                    </EntityPageLayoutHolder>
                  </CommunityContextProvider>
                </SpaceContextProvider>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Admin}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path="/admin/*">
                <AdminRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        {IdentityRoute()}
        <Route
          path={`/${TopLevelRoutePath.User}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.userNameId}/*`}>
                <NoIdentityRedirect>
                  <UserRoute />
                </NoIdentityRedirect>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.VirtualContributor}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.vcNameId}/*`}>
                <NoIdentityRedirect>
                  <VCRoute />
                </NoIdentityRedirect>
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Organization}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`:${nameOfUrl.organizationNameId}/*`}>
                <OrganizationRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.InnovationLibrary}`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.InnovationLibrary}`}>
                <InnovationLibraryPage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`${TopLevelRoutePath.InnovationPacks}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={TopLevelRoutePath.InnovationPacks}>
                <InnovationPackRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route
          path={`/${TopLevelRoutePath.Spaces}`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.Spaces}`}>
                <SpaceExplorerPage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Contributors}`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.Contributors}`}>
                <ContributorsPage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Forum}/*`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.Forum}`}>
                <ForumRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.About}`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.About}`}>
                <AboutPage />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Profile}`}
          element={
            <NonIdentity>
              <WithApmTransaction path={`/${TopLevelRoutePath.Profile}`}>
                <ProfileRoute />
              </WithApmTransaction>
            </NonIdentity>
          }
        />
        <Route
          path={`/${TopLevelRoutePath.Restricted}`}
          element={
            <WithApmTransaction path={`/${TopLevelRoutePath.Restricted}`}>
              <Restricted />
            </WithApmTransaction>
          }
        />
        <Route
          path="*"
          element={
            <WithApmTransaction path="*">
              <NotFoundPageLayout>
                <Error404 />
              </NotFoundPageLayout>
            </WithApmTransaction>
          }
        />
        {devRoute()}
      </Route>
    </Routes>
  );
};
