import {
  ProfileResourceTabStrip,
  type ProfileResourceTabStripProps,
} from '@/crd/components/common/ProfileResourceTabStrip';
import { Skeleton } from '@/crd/primitives/skeleton';
import { UserPageHero, type UserPageHeroProps } from './UserPageHero';
import { UserProfileSidebar, type UserProfileSidebarProps } from './UserProfileSidebar';
import { UserResourceSections, type UserResourceSectionsProps } from './UserResourceSections';

export type UserPublicProfileViewProps = {
  hero: UserPageHeroProps;
  sidebar: UserProfileSidebarProps;
  tabStrip: ProfileResourceTabStripProps;
  sections: UserResourceSectionsProps;
  loading: {
    hero: boolean;
    organizations: boolean;
    hostedResources: boolean;
    memberships: boolean;
  };
  /** i18n-resolved aria-labels for the per-region skeleton status containers (FR-009 / WCAG 2.1 AA). */
  loadingLabels: {
    hero: string;
    organizations: string;
    hostedResources: string;
    memberships: string;
  };
};

export function UserPublicProfileView({
  hero,
  sidebar,
  tabStrip,
  sections,
  loading,
  loadingLabels,
}: UserPublicProfileViewProps) {
  const sectionsLoading = sections.activeTab === 'resourcesHosted' ? loading.hostedResources : loading.memberships;
  const sectionsLabel =
    sections.activeTab === 'resourcesHosted' ? loadingLabels.hostedResources : loadingLabels.memberships;

  return (
    <div className="min-h-screen bg-background pb-12">
      {loading.hero ? (
        <output aria-label={loadingLabels.hero}>
          <HeroSkeleton />
        </output>
      ) : (
        <UserPageHero {...hero} />
      )}

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-8 lg:sticky lg:top-24 self-start">
            {loading.organizations ? (
              <output aria-label={loadingLabels.organizations}>
                <SidebarSkeleton />
              </output>
            ) : (
              <UserProfileSidebar {...sidebar} />
            )}
          </div>

          <div className="lg:col-span-9 flex flex-col min-w-0">
            <ProfileResourceTabStrip {...tabStrip} />
            {sectionsLoading ? (
              <output aria-label={sectionsLabel}>
                <SectionsSkeleton />
              </output>
            ) : (
              <UserResourceSections {...sections} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div>
      <div className="container mx-auto px-4 md:px-8 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <Skeleton className="w-28 h-28 md:w-32 md:h-32 rounded-full shrink-0 border-4 border-background shadow-lg" />
          <div className="flex-1 space-y-2 pb-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

function SectionsSkeleton() {
  return (
    <div className="space-y-10">
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
