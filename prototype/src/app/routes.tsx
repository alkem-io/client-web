import { createBrowserRouter, Navigate } from "react-router";
import { RootWrapper } from "./layouts/RootWrapper";
import { MainLayout } from "./layouts/MainLayout";
import { SpaceLayout } from "./layouts/SpaceLayout";
import { SpaceShell } from "./components/space/SpaceShell";
import { Dashboard } from "./pages/Dashboard";
import { SpaceHome } from "./pages/SpaceHome";
import { SpaceCommunity } from "./pages/SpaceCommunity";
import { SpaceSubspaces } from "./pages/SpaceSubspaces";
import { SpaceKnowledgeBase } from "./pages/SpaceKnowledgeBase";
import { SpaceSettingsPage } from "./pages/SpaceSettingsPage";
import SubspacePage from "./pages/SubspacePage";
import SubspaceSettingsPage from "./pages/SubspaceSettingsPage";
import UserProfilePage from "./pages/UserProfilePage";
import UserAccountPage from "./pages/UserAccountPage";
import UserProfileSettingsPage from "./pages/UserProfileSettingsPage";
import UserMembershipPage from "./pages/UserMembershipPage";
import UserOrganizationsPage from "./pages/UserOrganizationsPage";
import UserNotificationsPage from "./pages/UserNotificationsPage";
import UserGenericSettingsPage from "./pages/UserGenericSettingsPage";
import TemplateLibraryPage from "./pages/TemplateLibraryPage";
import TemplatePackDetailPage from "./pages/TemplatePackDetailPage";
import TemplateDetailPage from "./pages/TemplateDetailPage";
import DesignSystemPage from "./pages/DesignSystemPage";
import TypographySystemPage from "./pages/TypographySystemPage";
import TypographyDecisionPage from "./pages/TypographyDecisionPage";
import EcosystemAnalyticsPage from "./pages/analytics/EcosystemAnalyticsPage";
import BrowseSpacesPage from "./pages/BrowseSpacesPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminPage from "./pages/AdminPage";
import OnboardingPage from "./pages/OnboardingPage";
import AuthPage from "./pages/AuthPage";
import AuthPageV2 from "./pages/AuthPageV2";
import AuthPageV3 from "./pages/AuthPageV3";
import PackSettingsPage from "./pages/PackSettingsPage";
import TemplateSettingsPage from "./pages/TemplateSettingsPage";
import VCProfilePage from "./pages/VCProfilePage";
import ForumPage from "./pages/ForumPage";
import InnovationHubPage from "./pages/InnovationHubPage";
import InnovationHubSettingsPage from "./pages/InnovationHubSettingsPage";

export const router = createBrowserRouter([
  {
    /* RootWrapper provides router-dependent overlays (SearchOverlay) */
    Component: RootWrapper,
    children: [
      /* ─── Standalone pages (no layout) ─── */
      { path: "/design-system", Component: DesignSystemPage },
      { path: "/typography", Component: TypographySystemPage },
      { path: "/typography-decisions", Component: TypographyDecisionPage },
      { path: "/analytics", Component: EcosystemAnalyticsPage },
      { path: "/onboarding", Component: OnboardingPage },
      { path: "/sign-in", Component: AuthPage },
      { path: "/sign-up", Component: AuthPage },
      { path: "/password-recovery", Component: AuthPage },
      { path: "/sign-in-v2", Component: AuthPageV2 },
      { path: "/sign-in-v3", Component: AuthPageV3 },

      /* ─── Pages WITH app sidebar (MainLayout) ─── */
      {
        path: "/",
        Component: MainLayout,
        children: [
          { index: true, Component: Dashboard },

          /* Browse Spaces */
          { path: "spaces", Component: BrowseSpacesPage },

          /* Forum */
          { path: "forum", Component: ForumPage },

          /* Template Library */
          { path: "templates", Component: TemplateLibraryPage },
          { path: "templates/:templateId", Component: TemplateDetailPage },
          { path: "templates/:templateId/settings", Component: TemplateSettingsPage },
          { path: "templates/packs/:packSlug", Component: TemplatePackDetailPage },
          { path: "templates/packs/:packSlug/settings", Component: PackSettingsPage },
          { path: "templates/packs/:packSlug/settings/templates/:templateId", Component: TemplateSettingsPage },
          { path: "templates/packs/:packSlug/:templateId", Component: TemplateDetailPage },

          /* Platform Admin */
          { path: "admin", Component: AdminPage },
          { path: "admin/:section", Component: AdminPage },

          /* ─── User Routes ─── */
          { path: "user/:userSlug", Component: UserProfilePage },

          /* ─── Virtual Contributor Routes ─── */
          { path: "vc/:vcSlug", Component: VCProfilePage },
          {
            path: "user/:userSlug/settings",
            element: <Navigate to="profile" replace />,
          },
          { path: "user/:userSlug/settings/profile", Component: UserProfileSettingsPage },
          { path: "user/:userSlug/settings/account", Component: UserAccountPage },
          { path: "user/:userSlug/settings/membership", Component: UserMembershipPage },
          { path: "user/:userSlug/settings/organizations", Component: UserOrganizationsPage },
          { path: "user/:userSlug/settings/notifications", Component: UserNotificationsPage },
          {
            path: "user/:userSlug/settings/general",
            element: <UserGenericSettingsPage title="General Settings" />,
          },
          {
            path: "user/:userSlug/settings/*",
            element: <UserGenericSettingsPage title="Account Settings" />,
          },

          /* 404 catch-all (within MainLayout) */
          { path: "*", Component: NotFoundPage },
        ],
      },

      /* ─── Space pages WITHOUT app sidebar (SpaceLayout — full-width + breadcrumbs) ─── */
      {
        Component: SpaceLayout,
        children: [
          /* Innovation Hub */
          { path: "/innovation-hub/:slug", Component: InnovationHubPage },
          { path: "/innovation-hub/:slug/settings", Component: InnovationHubSettingsPage },
          { path: "/innovation-hub/:slug/settings/:tab", Component: InnovationHubSettingsPage },
          /* Tab pages share SpaceShell (banner + navigation tabs) */
          {
            path: "/space/:spaceSlug",
            Component: SpaceShell,
            children: [
              { index: true, Component: SpaceHome },
              { path: "community", Component: SpaceCommunity },
              { path: "subspaces", Component: SpaceSubspaces },
              { path: "knowledge-base", Component: SpaceKnowledgeBase },
            ],
          },

          /* Settings — no SpaceShell (has its own sidebar layout) */
          { path: "/space/:spaceSlug/settings", Component: SpaceSettingsPage },
          { path: "/space/:spaceSlug/settings/:tab", Component: SpaceSettingsPage },

          /* Subspace pages — dedicated layout with channel tabs & collapsible sidebar */
          { path: "/space/:spaceSlug/subspaces/:subspaceSlug", Component: SubspacePage },

          /* Subspace settings */
          { path: "/space/:spaceSlug/subspaces/:subspaceSlug/settings", Component: SubspaceSettingsPage },
          { path: "/space/:spaceSlug/subspaces/:subspaceSlug/settings/:tab", Component: SubspaceSettingsPage },
        ],
      },
    ],
  },
]);
