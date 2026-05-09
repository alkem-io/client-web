import {
  ProfileResourceTabStrip,
  type ProfileResourceTabStripProps,
} from '@/crd/components/common/ProfileResourceTabStrip';
import { Skeleton } from '@/crd/primitives/skeleton';
import { OrganizationPageHero, type OrganizationPageHeroProps } from './OrganizationPageHero';
import { OrganizationProfileSidebar, type OrganizationProfileSidebarProps } from './OrganizationProfileSidebar';
import { OrganizationResourceSections, type OrganizationResourceSectionsProps } from './OrganizationResourceSections';

export type OrganizationPublicProfileViewProps = {
  hero: OrganizationPageHeroProps;
  sidebar: OrganizationProfileSidebarProps;
  tabStrip: ProfileResourceTabStripProps;
  rightColumn: OrganizationResourceSectionsProps;
  loading: {
    hero: boolean;
    sidebar: boolean;
    hostedResources: boolean;
    memberships: boolean;
  };
  /** i18n-resolved aria-labels for the per-region skeleton status containers (FR-009 / WCAG 2.1 AA). */
  loadingLabels: {
    hero: string;
    sidebar: string;
    hostedResources: string;
    memberships: string;
  };
};

export function OrganizationPublicProfileView({
  hero,
  sidebar,
  tabStrip,
  rightColumn,
  loading,
  loadingLabels,
}: OrganizationPublicProfileViewProps) {
  const sectionsLoading = rightColumn.activeTab === 'resourcesHosted' ? loading.hostedResources : loading.memberships;
  const sectionsLabel =
    rightColumn.activeTab === 'resourcesHosted' ? loadingLabels.hostedResources : loadingLabels.memberships;

  return (
    <div className="min-h-screen bg-background pb-12">
      {loading.hero ? (
        <output aria-label={loadingLabels.hero}>
          <HeroSkeleton />
        </output>
      ) : (
        <OrganizationPageHero {...hero} />
      )}

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-8">
            {loading.sidebar ? (
              <output aria-label={loadingLabels.sidebar}>
                <SidebarSkeleton />
              </output>
            ) : (
              <OrganizationProfileSidebar {...sidebar} />
            )}
          </div>
          <div className="lg:col-span-9 flex flex-col min-w-0">
            <ProfileResourceTabStrip {...tabStrip} />
            {sectionsLoading ? (
              <output aria-label={sectionsLabel}>
                <SectionsSkeleton />
              </output>
            ) : (
              <OrganizationResourceSections {...rightColumn} />
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
          <Skeleton className="w-28 h-28 md:w-32 md:h-32 rounded-2xl shrink-0 border-4 border-background shadow-lg" />
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
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}

function SectionsSkeleton() {
  return (
    <div className="space-y-10">
      {[0, 1].map(i => (
        <div key={i}>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map(j => (
              <Skeleton key={j} className="h-48 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
