import { BookOpen, Compass, Lightbulb, MessageCircle } from 'lucide-react';
import { createElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { supportedLngs } from '@/core/i18n/config';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ROUTE_HOME, ROUTE_USER_ME } from '@/domain/platform/routes/constants';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { absolutiseToMainDomain, buildLoginUrl, buildUserAccountUrl } from '@/main/routing/urlBuilders';

const STATIC_NAVIGATION_HREFS = {
  home: ROUTE_HOME,
  spaces: `/${TopLevelRoutePath.Spaces}`,
  messages: ROUTE_HOME,
  notifications: ROUTE_HOME,
  profile: ROUTE_USER_ME,
  account: buildUserAccountUrl(ROUTE_USER_ME),
  admin: `/${TopLevelRoutePath.Admin}`,
};

export function useCrdNavigation() {
  const { t, i18n } = useTranslation();
  const { pathname, search } = useLocation();
  const { locations } = useConfig();
  const canonicalDomain = locations?.domain;

  // When the visitor is on a hub subdomain (e.g. `acme.alkemio.org`), every
  // top-nav / platform link must hop them off the subdomain back to the main
  // domain. `absolutiseToMainDomain` is a no-op on dev and on the canonical
  // host — it only prepends `<protocol>//<canonical-domain>` when we're on a
  // sub-host of the canonical domain in production.
  const absolutise = (path: string) => absolutiseToMainDomain(path, canonicalDomain);

  const navigationHrefs = {
    home: absolutise(STATIC_NAVIGATION_HREFS.home),
    spaces: absolutise(STATIC_NAVIGATION_HREFS.spaces),
    messages: absolutise(STATIC_NAVIGATION_HREFS.messages),
    notifications: absolutise(STATIC_NAVIGATION_HREFS.notifications),
    profile: absolutise(STATIC_NAVIGATION_HREFS.profile),
    account: absolutise(STATIC_NAVIGATION_HREFS.account),
    admin: absolutise(STATIC_NAVIGATION_HREFS.admin),
    login: absolutise(buildLoginUrl(pathname, search)),
  };

  const footerLinks = locations
    ? { terms: locations.terms, privacy: locations.privacy, security: locations.security, about: locations.about }
    : undefined;

  const languages = supportedLngs
    .filter(lng => lng !== 'inContextTool')
    .map(lng => ({ code: lng, label: t(`languages.${lng}`) }));

  const handleLanguageChange = (code: string) => i18n.changeLanguage(code);

  const platformNavigationItems = [
    {
      icon: createElement(Lightbulb, { className: 'h-4 w-4' }),
      label: t('pages.innovationLibrary.fullName'),
      href: absolutise(`/${TopLevelRoutePath.InnovationLibrary}`),
    },
    {
      icon: createElement(MessageCircle, { className: 'h-4 w-4' }),
      label: t('pages.forum.fullName'),
      href: absolutise(`/${TopLevelRoutePath.Forum}`),
    },
    {
      icon: createElement(Compass, { className: 'h-4 w-4' }),
      label: t('pages.exploreSpaces.fullName'),
      href: absolutise(`/${TopLevelRoutePath.Spaces}`),
    },
    {
      icon: createElement(BookOpen, { className: 'h-4 w-4' }),
      label: t('pages.documentation.title'),
      href: absolutise(`/${TopLevelRoutePath.Docs}`),
    },
  ];

  return {
    navigationHrefs,
    footerLinks,
    languages,
    currentLanguage: i18n.language,
    currentPath: pathname,
    handleLanguageChange,
    platformNavigationItems,
  };
}
