import { BookOpen, Compass, Lightbulb, MessageCircle } from 'lucide-react';
import { createElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { supportedLngs } from '@/core/i18n/config';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ROUTE_HOME, ROUTE_USER_ME } from '@/domain/platform/routes/constants';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { buildLoginUrl, buildUserAccountUrl } from '@/main/routing/urlBuilders';

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

  const navigationHrefs = { ...STATIC_NAVIGATION_HREFS, login: buildLoginUrl(pathname, search) };

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
      href: `/${TopLevelRoutePath.InnovationLibrary}`,
    },
    {
      icon: createElement(MessageCircle, { className: 'h-4 w-4' }),
      label: t('pages.forum.fullName'),
      href: `/${TopLevelRoutePath.Forum}`,
    },
    {
      icon: createElement(Compass, { className: 'h-4 w-4' }),
      label: t('pages.exploreSpaces.fullName'),
      href: `/${TopLevelRoutePath.Spaces}`,
    },
    {
      icon: createElement(BookOpen, { className: 'h-4 w-4' }),
      label: t('pages.documentation.title'),
      href: `/${TopLevelRoutePath.Docs}`,
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
