import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import useNavigate from '@/core/routing/useNavigate';
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import { Button } from '@/crd/primitives/button';
import useSpaceExplorer from '@/main/crdPages/spaces/useSpaceExplorer';

export default function DashboardUnauthenticated() {
  const { t } = useTranslation('crd-dashboard');
  const navigate = useNavigate();

  const { spaces, loading, hasMore, fetchMore } = useSpaceExplorer();

  return (
    <>
      <SpaceExplorer
        spaces={spaces ?? []}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={fetchMore}
        onParentClick={parent => navigate(parent.href)}
      />

      <div className="flex justify-center px-4 pb-8">
        <Button size="lg" className="gap-2" asChild={true}>
          <a href={AUTH_SIGN_UP_PATH}>
            <UserPlus className="h-5 w-5" aria-hidden="true" />
            {t('unauthenticated.signUp')}
          </a>
        </Button>
      </div>
    </>
  );
}
