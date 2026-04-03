import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import useNavigate from '@/core/routing/useNavigate';
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import { Button } from '@/crd/primitives/button';
import { mapSpacesToCardDataList } from '@/main/crdPages/spaces/spaceCardDataMapper';
import useSpaceExplorer from '@/main/crdPages/spaces/useSpaceExplorer';

export default function DashboardUnauthenticated() {
  const { t } = useTranslation('crd-dashboard');
  const navigate = useNavigate();

  const {
    spaces,
    searchTerms,
    setSearchTerms,
    loading,
    hasMore,
    fetchMore,
    membershipFilter,
    onMembershipFilterChange,
    authenticated,
  } = useSpaceExplorer();

  const cardData = mapSpacesToCardDataList(spaces, authenticated);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      <SpaceExplorer
        spaces={cardData}
        loading={loading}
        hasMore={hasMore}
        searchTerms={searchTerms}
        membershipFilter={membershipFilter}
        authenticated={authenticated}
        onLoadMore={fetchMore}
        onSearchTermsChange={setSearchTerms}
        onMembershipFilterChange={onMembershipFilterChange}
        onParentClick={parent => navigate(parent.href)}
      />

      <div className="flex justify-center pt-4">
        <a href={AUTH_SIGN_UP_PATH}>
          <Button size="lg" className="gap-2">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            {t('unauthenticated.signUp')}
          </Button>
        </a>
      </div>
    </div>
  );
}
