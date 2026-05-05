import { Skeleton } from '@/crd/primitives/skeleton';
import { VCContentView, type VCContentViewProps } from './VCContentView';
import { VCPageHero, type VCPageHeroProps } from './VCPageHero';
import { VCProfileSidebar, type VCProfileSidebarProps } from './VCProfileSidebar';

export type VCPublicProfileViewProps = {
  hero: VCPageHeroProps;
  sidebar: VCProfileSidebarProps;
  contentView: VCContentViewProps;
  loading: {
    hero: boolean;
    sidebar: boolean;
    bodyOfKnowledge: boolean;
    contentView: boolean;
  };
};

export function VCPublicProfileView({ hero, sidebar, contentView, loading }: VCPublicProfileViewProps) {
  return (
    <div className="min-h-screen bg-background pb-12">
      {loading.hero ? <HeroSkeleton /> : <VCPageHero {...hero} />}

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3 space-y-8">
            {loading.sidebar ? <SidebarSkeleton /> : <VCProfileSidebar {...sidebar} />}
          </div>
          <div className="md:col-span-9 flex flex-col min-w-0">
            {loading.contentView ? <ContentSkeleton /> : <VCContentView {...contentView} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  // VC hero schema: banner + circular avatar + name line ONLY (no location — FR-030 / FR-009).
  return (
    <div className="relative mb-20 md:mb-24">
      <Skeleton className="h-64 md:h-80 w-full" />
      <div className="absolute -bottom-16 left-0 right-0 px-4 md:px-8">
        <div className="container mx-auto flex items-end gap-6">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background" />
          <div className="flex-1 space-y-2 pb-2">
            <Skeleton className="h-8 w-1/2" />
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

function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
