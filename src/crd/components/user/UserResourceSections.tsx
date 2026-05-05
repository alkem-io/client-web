import { Bot, LayoutDashboard, Package, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SimpleResourceCardItem } from '@/crd/components/organization/OrganizationResourceSections';
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
  /** Backend field: `account.innovationPacks`. UI label: "Template Packs". */
  hostedInnovationPacks: SimpleResourceCardItem[];
  /** Backend field: `account.innovationHubs`. UI label: "Custom Homepages". */
  hostedInnovationHubs: SimpleResourceCardItem[];
  /** Pre-rendered membership cards (the integration page wires `useContributionProvider` per item). */
  spacesLeading: ReactNode[];
  /** Pre-rendered membership cards (the integration page wires `useContributionProvider` per item). */
  spacesMember: ReactNode[];
  labels: {
    spacesSubsection: string;
    virtualContributorsSubsection: string;
    /** "Template Packs" — reused from `common.innovation-packs` per FR-102. */
    templatePacksSubsection: string;
    /** "Custom Homepages" — reused from `common.customHomepages` per FR-102. */
    customHomepagesSubsection: string;
    spacesLeading: string;
    memberOf: string;
    emptyLeading: string;
    emptyMembership: string;
  };
};

export function UserResourceSections({
  activeTab,
  hostedSpaces,
  hostedVirtualContributors,
  hostedInnovationPacks,
  hostedInnovationHubs,
  spacesLeading,
  spacesMember,
  labels,
}: UserResourceSectionsProps) {
  if (activeTab === 'resourcesHosted') {
    return (
      <div className="space-y-10">
        {hostedSpaces.length > 0 ? (
          <SubSection label={labels.spacesSubsection}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hostedSpaces.map(space => (
                <SpaceGridCard key={space.id} space={space} />
              ))}
            </div>
          </SubSection>
        ) : null}

        {hostedVirtualContributors.length > 0 ? (
          <SubSection label={labels.virtualContributorsSubsection} icon={<Bot className="w-4 h-4" />}>
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
          </SubSection>
        ) : null}

        {hostedInnovationPacks.length > 0 ? (
          <SubSection label={labels.templatePacksSubsection} icon={<Package className="w-4 h-4" />}>
            <SimpleResourceGrid items={hostedInnovationPacks} icon={<Package className="w-5 h-5" />} />
          </SubSection>
        ) : null}

        {hostedInnovationHubs.length > 0 ? (
          <SubSection label={labels.customHomepagesSubsection} icon={<LayoutDashboard className="w-4 h-4" />}>
            <SimpleResourceGrid items={hostedInnovationHubs} icon={<LayoutDashboard className="w-5 h-5" />} />
          </SubSection>
        ) : null}
      </div>
    );
  }

  if (activeTab === 'leading') {
    return (
      <section>
        {spacesLeading.length === 0 ? (
          <p className="text-body text-muted-foreground">{labels.emptyLeading}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{spacesLeading}</div>
        )}
      </section>
    );
  }

  // memberOf
  return (
    <section>
      {spacesMember.length === 0 ? (
        <p className="text-body text-muted-foreground">{labels.emptyMembership}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{spacesMember}</div>
      )}
    </section>
  );
}

type SubSectionProps = {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
};

function SubSection({ label, icon, children }: SubSectionProps) {
  return (
    <section>
      <h3 className="text-label uppercase text-muted-foreground mb-4 flex items-center gap-2">
        {icon ?? null}
        {label}
      </h3>
      {children}
    </section>
  );
}

type SimpleResourceGridProps = {
  items: SimpleResourceCardItem[];
  icon: ReactNode;
};

function SimpleResourceGrid({ items, icon }: SimpleResourceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map(item => (
        <a
          key={item.id}
          href={item.href}
          className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
        >
          <div className="p-2 bg-primary/10 rounded-md text-primary">{icon}</div>
          <div>
            <h4 className="text-card-title text-foreground">{item.displayName}</h4>
            {item.description ? <p className="text-body text-muted-foreground">{item.description}</p> : null}
          </div>
        </a>
      ))}
    </div>
  );
}
