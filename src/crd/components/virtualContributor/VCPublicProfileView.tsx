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
    /** Aria-label for the BoK section's own skeleton when only the auxiliary BoK queries are still in flight. */
    bodyOfKnowledge: string;
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
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
            {loading.sidebar ? (
              <output aria-label={loadingLabels.sidebar}>
                <SidebarSkeleton />
              </output>
            ) : (
              <VCProfileSidebar
                {...sidebar}
                bodyOfKnowledgeLoading={loading.bodyOfKnowledge}
                labels={{ ...sidebar.labels, bodyOfKnowledgeLoading: loadingLabels.bodyOfKnowledge }}
              />
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
  // VC hero schema (FR-009 / FR-030): circular avatar + name line + type-badge
  // pill + Keywords chip row. NO location placeholder (parity with FR-030,
  // which spells out no location field on the VC hero).
  return (
    <div>
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full shrink-0 border-4 border-background shadow-lg" />
          <div className="flex-1 pb-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-5 w-28 rounded-md" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
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
  // FR-009 (redesigned right column): three section blocks so the redesigned
  // right column does not collapse into a single block while loading.
  return (
    <div className="space-y-10">
      {/* Functionality — 3-col grid of 3 card placeholders. */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
      {/* AI Engine — 3-col grid of 6 transparency-card placeholders. */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      </div>
      {/* Monitoring — separator + paragraph. */}
      <div className="space-y-3">
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
