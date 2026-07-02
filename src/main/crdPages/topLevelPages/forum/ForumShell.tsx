import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { usePlatformDiscussionsQuery } from '@/core/apollo/generated/apollo-hooks';
import useNavigate from '@/core/routing/useNavigate';
import { ForumBanner } from '@/crd/components/forum/ForumBanner';
import { ForumCategoryNav } from '@/crd/components/forum/ForumCategoryNav';
import { ForumLayout } from '@/crd/components/forum/ForumLayout';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import CrdInnovationHubOutsideRibbon from '@/main/crdPages/innovationHub/components/CrdInnovationHubOutsideRibbon';
import { buildCategoryEntries } from '@/main/crdPages/topLevelPages/forum/forumDataMapper';
import { ALL_SLUG } from '@/main/crdPages/topLevelPages/forum/useCategorySlug';

const FORUM_PREFIX = '/forum';

const deriveActiveSlug = (pathname: string): string => {
  if (!pathname.startsWith(FORUM_PREFIX)) return ALL_SLUG;
  const rest = pathname.slice(FORUM_PREFIX.length).replace(/^\/|\/$/g, '');
  if (!rest) return ALL_SLUG;
  const segments = rest.split('/');
  // /forum/discussion/:nameId — no sidebar category is active by design.
  if (segments[0] === 'discussion') return ALL_SLUG;
  return segments[0];
};

export const ForumShell = () => {
  const { t } = useTranslation('crd-forum');
  const { t: tDefault } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { data } = usePlatformDiscussionsQuery();
  const validCategories = data?.platform.forum.discussionCategories ?? [];
  const categoryEntries = buildCategoryEntries(validCategories, t, tDefault);

  const activeSlug = deriveActiveSlug(pathname);

  const handleCategoryChange = (slug: string) => {
    navigate(slug === ALL_SLUG ? FORUM_PREFIX : `${FORUM_PREFIX}/${slug}`);
  };

  return (
    <StorageConfigContextProvider locationType="platform">
      <ForumLayout
        ribbonNode={<CrdInnovationHubOutsideRibbon label="innovationHub.outsideOfSpace.forum" />}
        bannerNode={
          <ForumBanner
            titleNode={t('banner.title')}
            subtitleNode={t('banner.subtitle')}
            iconNode={<MessageSquare className="size-5 text-white" />}
          />
        }
        sidebarNode={
          <ForumCategoryNav
            entries={categoryEntries}
            activeSlug={activeSlug}
            onCategoryChange={handleCategoryChange}
            sectionLabel={t('categories.sectionLabel')}
            selectAriaLabel={t('categories.selectAriaLabel')}
          />
        }
        mainNode={<Outlet />}
      />
    </StorageConfigContextProvider>
  );
};
