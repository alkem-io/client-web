import { useTranslation } from 'react-i18next';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildUserAccountUrl } from '@/main/routing/urlBuilders';

/**
 * Sidebar 'Create my own space' (screens-dispositions.tsv:4920 / :16193): the account page when the viewer's account
 * may create a space (AccountSummary.canCreate kind `space`, which aggregates the CREATE_SPACE verdict and an available
 * account-space-* entitlement, client-repoint.md Licensing), else the static page.
 */
export const useCreateSpaceLink = () => {
  const { t } = useTranslation();
  const { userModel, loading, accountCanCreate } = useCurrentUserContext();

  const STATIC_PAGE_LINK = t('pages.home.sections.startingSpace.url');

  const link =
    !loading && accountCanCreate?.some(verdict => verdict.kind === 'space' && verdict.allowed)
      ? buildUserAccountUrl(userModel?.profile?.url)
      : STATIC_PAGE_LINK;

  return { loading, link };
};
