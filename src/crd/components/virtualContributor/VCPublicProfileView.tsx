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
  /** i18n-resolved aria-labels for the per-region skeleton status containers (FR-009 / WCAG 2.1 AA). */
  loadingLabels: {
    hero: string;
    sidebar: string;
    contentView: string;
  };
};

export function VCPublicProfileView({ hero, sidebar, contentView, loading, loadingLabels }: VCPublicProfileViewProps) {
  return (
    <div className="min-h-screen bg-background pb-12">
      {loading.hero ? (
        <output aria-label={loadingLabels.hero}>
          <HeroSkeleton />
        </output>
      ) : (
        <VCPageHero {...hero} />
      )}

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            {loading.sidebar ? (
              <output aria-label={loadingLabels.sidebar}>
                <SidebarSkeleton />
              </output>
            ) : (
              <VCProfileSidebar {...sidebar} />
            )}
          </div>
          <div className="lg:col-span-8 flex flex-col min-w-0">
            {loading.contentView ? (
              <output aria-label={loadingLabels.contentView}>
                <ContentSkeleton />
              </output>
            ) : (
              <VCContentView {...contentView} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  // VC hero schema: circular avatar + name line ONLY (no location — FR-030 / FR-009).
  return (
    <div>
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0 border-4 border-background shadow-lg" />
          <div className="flex-1 pb-2">
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
