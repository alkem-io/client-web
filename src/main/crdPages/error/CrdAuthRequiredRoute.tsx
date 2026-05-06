import { useTranslation } from 'react-i18next';

import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { PARAM_NAME_RETURN_URL } from '@/core/auth/authentication/constants/authentication.constants';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { CrdAuthRequiredPage } from '@/crd/components/error/CrdAuthRequiredPage';
import { useConfig } from '@/domain/platform/config/useConfig';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { CrdLayoutWrapper } from '@/main/ui/layout/CrdLayoutWrapper';

export function CrdAuthRequiredRoute() {
  useTransactionScope({ type: 'authentication' });

  const { t } = useTranslation('crd-error');
  const returnUrl = useQueryParams().get(PARAM_NAME_RETURN_URL) ?? undefined;
  const { locations } = useConfig();

  const signInHref = buildLoginUrl(returnUrl);
  const domain = locations?.domain ? `https://${locations.domain}` : '';
  const returnAsGuestHref = `${domain}/${TopLevelRoutePath.Home}`;

  usePageTitle(t('authRequired.title'));

  return (
    <CrdLayoutWrapper>
      <CrdAuthRequiredPage
        title={t('authRequired.title')}
        description={t('authRequired.description')}
        descriptionContinued={t('authRequired.descriptionContinued')}
        signInLabel={t('authRequired.actions.signIn')}
        orLabel={t('authRequired.actions.or')}
        returnAsGuestLabel={t('authRequired.actions.returnAsGuest')}
        signInHref={signInHref}
        returnAsGuestHref={returnAsGuestHref}
      />
    </CrdLayoutWrapper>
  );
}
