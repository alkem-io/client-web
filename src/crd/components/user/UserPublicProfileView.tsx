import { Skeleton } from '@/crd/primitives/skeleton';
import { UserPageHero, type UserPageHeroProps } from './UserPageHero';
import { UserProfileSidebar, type UserProfileSidebarProps } from './UserProfileSidebar';
import { UserResourceSections, type UserResourceSectionsProps } from './UserResourceSections';
import { UserResourceTabStrip, type UserResourceTabStripProps } from './UserResourceTabStrip';

export type UserPublicProfileViewProps = {
  hero: UserPageHeroProps;
  sidebar: UserProfileSidebarProps;
  tabStrip: UserResourceTabStripProps;
  sections: UserResourceSectionsProps;
  loading: {
    hero: boolean;
    organizations: boolean;
    hostedResources: boolean;
    memberships: boolean;
  };
};

export function UserPublicProfileView({ hero, sidebar, tabStrip, sections, loading }: UserPublicProfileViewProps) {
  return (
    <div className="min-h-screen bg-background pb-12">
      {loading.hero ? <HeroSkeleton /> : <UserPageHero {...hero} />}

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
            {loading.organizations ? <SidebarSkeleton /> : <UserProfileSidebar {...sidebar} />}
          </div>

          <div className="lg:col-span-8 flex flex-col min-w-0">
            <UserResourceTabStrip {...tabStrip} />
            {loading.hostedResources || loading.memberships ? (
              <SectionsSkeleton />
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
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0 border-4 border-background shadow-lg" />
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
