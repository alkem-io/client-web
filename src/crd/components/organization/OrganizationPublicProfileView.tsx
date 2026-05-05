import { Skeleton } from '@/crd/primitives/skeleton';
import { OrganizationPageHero, type OrganizationPageHeroProps } from './OrganizationPageHero';
import { OrganizationProfileSidebar, type OrganizationProfileSidebarProps } from './OrganizationProfileSidebar';
import { OrganizationResourceSections, type OrganizationResourceSectionsProps } from './OrganizationResourceSections';

export type OrganizationPublicProfileViewProps = {
  hero: OrganizationPageHeroProps;
  sidebar: OrganizationProfileSidebarProps;
  rightColumn: OrganizationResourceSectionsProps;
  loading: {
    hero: boolean;
    sidebar: boolean;
    accountResources: boolean;
    memberships: boolean;
  };
};

export function OrganizationPublicProfileView({
  hero,
  sidebar,
  rightColumn,
  loading,
}: OrganizationPublicProfileViewProps) {
  return (
    <div className="min-h-screen bg-background pb-12">
      {loading.hero ? <HeroSkeleton /> : <OrganizationPageHero {...hero} />}

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3 space-y-8">
            {loading.sidebar ? <SidebarSkeleton /> : <OrganizationProfileSidebar {...sidebar} />}
          </div>
          <div className="md:col-span-9 flex flex-col min-w-0">
            {loading.accountResources || loading.memberships ? (
              <SectionsSkeleton />
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
    <div className="relative mb-20 md:mb-24">
      <Skeleton className="h-64 md:h-80 w-full" />
      <div className="absolute -bottom-16 left-0 right-0 px-4 md:px-8">
        <div className="container mx-auto flex items-end gap-6">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-background" />
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
