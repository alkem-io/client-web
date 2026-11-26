import { Compass } from 'lucide-react';
import { createElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { OIDC_LOGIN_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { supportedLngs } from '@/core/i18n/config';
import { useConfig } from '@/domain/platform/config/useConfig';
import { ROUTE_HOME, ROUTE_USER_ME } from '@/domain/platform/routes/constants';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { buildUserAccountUrl } from '@/main/routing/urlBuilders';

export function useCrdNavigation() {
  const { t, i18n } = useTranslation();
  const { pathname, search, hash } = useLocation();
  const { language, locations } = useConfig();
  const returnTo = new URLSearchParams({ returnTo: pathname + search + hash }).toString();
  const navigationHrefs = {
    home: ROUTE_HOME,
    spaces: `/${TopLevelRoutePath.Spaces}`,
    messages: ROUTE_HOME,
    notifications: ROUTE_HOME,
    profile: ROUTE_USER_ME,
    account: buildUserAccountUrl(ROUTE_USER_ME),
    admin: `/${TopLevelRoutePath.Admin}`,
    login: `${OIDC_LOGIN_PATH}?${returnTo}`,
  };
  const languages = (language?.eligible ?? []).map(code => {
    const supported = supportedLngs.find(language => language === code);
    if (!supported || supported === 'inContextTool')
      throw new Error(`The configured language ${code} has no client translations`);
    return { code, label: t(`languages.${supported}`) };
  });
  return {
    navigationHrefs,
    footerLinks: {
      terms: locations?.terms,
      privacy: locations?.privacy,
      security: locations?.security,
      about: locations?.about,
    },
    languages,
    currentLanguage: i18n.language,
    currentPath: pathname,
    handleLanguageChange: (code: string) => {
      void i18n.changeLanguage(code);
    },
    platformNavigationItems: [
      {
        icon: createElement(Compass, { className: 'h-4 w-4' }),
        label: t('pages.exploreSpaces.fullName'),
        href: navigationHrefs.spaces,
      },
    ],
  };
}
