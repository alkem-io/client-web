import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { isSessionStoreUnavailable } from '@/core/apollo/v2/isSessionStoreUnavailable';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import { useNativeFoundation } from '@/core/foundation/NativeFoundationProvider';
import { CrdLayout } from '@/crd/layouts/CrdLayout';
import { getInitials } from '@/crd/lib/getInitials';
import { Button } from '@/crd/primitives/button';
import { useCrdNavigation } from '@/main/ui/layout/useCrdNavigation';

export function CrdLayoutWrapper({ children }: { children?: ReactNode } = {}) {
  const { t } = useTranslation();
  const foundation = useNativeFoundation();
  const viewer = !foundation.loading && !foundation.error ? foundation.data?.viewer : undefined;
  const actor = viewer?.actor;
  const user = actor?.about
    ? { name: actor.about.displayName, initials: getInitials(actor.about.displayName) }
    : undefined;
  const {
    navigationHrefs,
    footerLinks,
    languages,
    currentLanguage,
    currentPath,
    handleLanguageChange,
    platformNavigationItems,
  } = useCrdNavigation();
  return (
    <CrdLayout
      authenticated={foundation.loading ? 'loading' : !viewer ? 'unavailable' : viewer.session.authenticated}
      user={user}
      onLogout={() => window.location.assign(AUTH_LOGOUT_PATH)}
      topBanner={
        !foundation.loading && !viewer && isSessionStoreUnavailable(foundation.error) ? (
          <div role="alert" className="flex items-center justify-center gap-2 p-3">
            <p>{t('apollo.errors.network.session_store_unavailable')}</p>
            <Button variant="outline" onClick={() => void foundation.refetch().catch(() => undefined)}>
              {t('apollo.errors.network.retry')}
            </Button>
          </div>
        ) : undefined
      }
      navigationHrefs={{
        ...navigationHrefs,
        profile: actor?.url ?? undefined,
        account: undefined,
        messages: undefined,
        notifications: undefined,
      }}
      footerLinks={footerLinks}
      platformNavigationItems={platformNavigationItems}
      currentPath={currentPath}
      languages={languages}
      currentLanguage={currentLanguage}
      onLanguageChange={handleLanguageChange}
    >
      {children ?? <Outlet />}
    </CrdLayout>
  );
}
