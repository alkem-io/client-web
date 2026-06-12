import 'i18next';
import { defaultNS } from '@/core/i18n/config';
import type enTranslation from '@/core/i18n/en/translation.en.json';
import type crdLayoutTranslation from '@/crd/i18n/layout/layout.en.json';
import type crdCommonTranslation from '@/crd/i18n/common/common.en.json';
import type crdExploreSpacesTranslation from '@/crd/i18n/exploreSpaces/exploreSpaces.en.json';
import type crdNotificationsTranslation from '@/crd/i18n/notifications/notifications.en.json';
import type crdDashboardTranslation from '@/crd/i18n/dashboard/dashboard.en.json';
import type crdSpaceTranslation from '@/crd/i18n/space/space.en.json';
import type crdErrorTranslation from '@/crd/i18n/error/error.en.json';
import type crdAuthTranslation from '@/crd/i18n/auth/auth.en.json';
import type crdSearchTranslation from '@/crd/i18n/search/search.en.json';
import type crdMarkdownTranslation from '@/crd/i18n/markdown/markdown.en.json';
import type crdSpaceSettingsTranslation from '@/crd/i18n/spaceSettings/spaceSettings.en.json';
import type crdSubspaceTranslation from '@/crd/i18n/subspace/subspace.en.json';
import type crdCreateSpaceTranslation from '@/crd/i18n/createSpace/createSpace.en.json';
import type crdWhiteboardTranslation from '@/crd/i18n/whiteboard/whiteboard.en.json';
import type crdForumTranslation from '@/crd/i18n/forum/forum.en.json';
import type crdDocumentationTranslation from '@/crd/i18n/documentation/documentation.en.json';
import type crdProfilePagesTranslation from '@/crd/i18n/profilePages/profilePages.en.json';
import type crdContributorSettingsTranslation from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import type crdCommunityTranslation from '@/crd/i18n/community/community.en.json';
import type crdTemplatesTranslation from '@/crd/i18n/templates/templates.en.json';
import type crdInnovationHubTranslation from '@/crd/i18n/innovationHub/innovationHub.en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: {
      translation: typeof enTranslation;
      'crd-layout': typeof crdLayoutTranslation;
      'crd-common': typeof crdCommonTranslation;
      'crd-exploreSpaces': typeof crdExploreSpacesTranslation;
      'crd-notifications': typeof crdNotificationsTranslation;
      'crd-dashboard': typeof crdDashboardTranslation;
      'crd-space': typeof crdSpaceTranslation;
      'crd-search': typeof crdSearchTranslation;
      'crd-error': typeof crdErrorTranslation;
      'crd-auth': typeof crdAuthTranslation;
      'crd-markdown': typeof crdMarkdownTranslation;
      'crd-spaceSettings': typeof crdSpaceSettingsTranslation;
      'crd-subspace': typeof crdSubspaceTranslation;
      'crd-createSpace': typeof crdCreateSpaceTranslation;
      'crd-whiteboard': typeof crdWhiteboardTranslation;
      'crd-forum': typeof crdForumTranslation;
      'crd-documentation': typeof crdDocumentationTranslation;
      'crd-profilePages': typeof crdProfilePagesTranslation;
      'crd-contributorSettings': typeof crdContributorSettingsTranslation;
      'crd-community': typeof crdCommunityTranslation;
      'crd-templates': typeof crdTemplatesTranslation;
      'crd-innovationHub': typeof crdInnovationHubTranslation;
    };
  }
}
