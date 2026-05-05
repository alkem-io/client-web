import { Bot, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { SpaceGridCard, type SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import { Badge } from '@/crd/primitives/badge';
import type { ResourceTabKey } from './UserResourceTabStrip';

export type VirtualContributorCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  type: string;
  href: string;
};

export type UserResourceSectionsProps = {
  activeTab: ResourceTabKey;
  hostedSpaces: SpaceGridCardData[];
  hostedVirtualContributors: VirtualContributorCardItem[];
  /** Pre-rendered membership cards (the integration page wires `useContributionProvider` per item). */
  spacesLeading: ReactNode[];
  /** Pre-rendered membership cards (the integration page wires `useContributionProvider` per item). */
  spacesMember: ReactNode[];
  labels: {
    resourcesHosted: string;
    spacesSubsection: string;
    virtualContributorsSubsection: string;
    spacesLeading: string;
    memberOf: string;
    totalBadge: (count: number) => string;
    emptyLeading: string;
    emptyMembership: string;
  };
};

export function UserResourceSections({
  activeTab,
  hostedSpaces,
  hostedVirtualContributors,
  spacesLeading,
  spacesMember,
  labels,
}: UserResourceSectionsProps) {
  const showHostedRoot =
    activeTab === 'allResources' || activeTab === 'hostedSpaces' || activeTab === 'virtualContributors';
  const showHostedSpaces = activeTab === 'allResources' || activeTab === 'hostedSpaces';
  const showHostedVCs = activeTab === 'allResources' || activeTab === 'virtualContributors';
  const showLeading = activeTab === 'allResources' || activeTab === 'leading';
  const showMemberOf = activeTab === 'allResources' || activeTab === 'memberOf';

  const hostedTotal = hostedSpaces.length + hostedVirtualContributors.length;

  return (
    <div className="space-y-10">
      {showHostedRoot && hostedTotal > 0 && (
        <section>
          {activeTab === 'allResources' && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-page-title">{labels.resourcesHosted}</h2>
              <Badge variant="outline" className="text-muted-foreground">
                {labels.totalBadge(hostedTotal)}
              </Badge>
            </div>
          )}

          {showHostedSpaces && hostedSpaces.length > 0 ? (
            <div className="mb-6">
              {activeTab === 'allResources' && (
                <h3 className="text-label uppercase text-muted-foreground mb-4">{labels.spacesSubsection}</h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hostedSpaces.map(space => (
                  <SpaceGridCard key={space.id} space={space} />
                ))}
              </div>
            </div>
          ) : null}

          {showHostedVCs && hostedVirtualContributors.length > 0 ? (
            <div>
              {activeTab === 'allResources' && (
                <h3 className="text-label uppercase text-muted-foreground mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4" /> {labels.virtualContributorsSubsection}
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hostedVirtualContributors.map(vc => (
                  <a
                    key={vc.id}
                    href={vc.href}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-card-title text-foreground">{vc.displayName}</h4>
                      {vc.description ? <p className="text-body text-muted-foreground mb-2">{vc.description}</p> : null}
                      <Badge variant="secondary" className="text-badge h-5">
                        {vc.type}
                      </Badge>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {activeTab === 'allResources' && hostedTotal > 0 && (spacesLeading.length > 0 || spacesMember.length > 0) ? (
        <div className="h-px bg-border/50" />
      ) : null}

      {showLeading ? (
        <section>
          <h2 className="text-section-title mb-4">{labels.spacesLeading}</h2>
          {spacesLeading.length === 0 ? (
            activeTab === 'leading' ? (
              <p className="text-body text-muted-foreground">{labels.emptyLeading}</p>
            ) : null
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{spacesLeading}</div>
          )}
        </section>
      ) : null}

      {activeTab === 'allResources' && spacesLeading.length > 0 && spacesMember.length > 0 ? (
        <div className="h-px bg-border/50" />
      ) : null}

      {showMemberOf ? (
        <section>
          <h2 className="text-section-title mb-4">{labels.memberOf}</h2>
          {spacesMember.length === 0 ? (
            <p className="text-body text-muted-foreground">{labels.emptyMembership}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{spacesMember}</div>
          )}
        </section>
      ) : null}
    </div>
  );
}
