import { Bot, LayoutDashboard, Package, Sparkles } from 'lucide-react';
import { isValidElement, type Key, type ReactNode } from 'react';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';
import type { SimpleResourceCardItem, VirtualContributorCardItem } from '@/crd/components/common/profileTypes';
import { SpaceGridCard, type SpaceGridCardData, type SpaceGridCardLabels } from '@/crd/components/user/SpaceGridCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';

function asListItems(nodes: ReactNode[]) {
  return nodes.map((node, idx) => {
    const fallbackKey: Key = idx;
    const key: Key = isValidElement(node) && node.key != null ? node.key : fallbackKey;
    return <li key={key}>{node}</li>;
  });
}

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
    /** sr-only labels for the SpaceGridCard privacy chip (WCAG 2.1 AA). */
    spacePrivacy: SpaceGridCardLabels;
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
            {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
            {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
            <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none p-0 m-0">
              {hostedSpaces.map(space => (
                <li key={space.id}>
                  <SpaceGridCard space={space} labels={labels.spacePrivacy} />
                </li>
              ))}
            </ul>
          </SubSection>
        ) : null}

        {hostedVirtualContributors.length > 0 ? (
          <SubSection
            label={labels.virtualContributorsSubsection}
            icon={<Bot className="w-4 h-4" aria-hidden="true" />}
          >
            {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
            {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
            <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none p-0 m-0">
              {hostedVirtualContributors.map(vc => (
                <li key={vc.id}>
                  <a
                    href={vc.href}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Avatar className="size-9 rounded-md shrink-0">
                      {vc.avatarImageUrl ? <AvatarImage src={vc.avatarImageUrl} alt="" /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary rounded-md">
                        <Sparkles className="w-5 h-5" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-card-title text-foreground">{vc.displayName}</h4>
                      {vc.description ? <p className="text-body text-muted-foreground mb-2">{vc.description}</p> : null}
                      <Badge variant="secondary" className="text-badge h-5">
                        {vc.type}
                      </Badge>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </SubSection>
        ) : null}

        {hostedInnovationPacks.length > 0 ? (
          <SubSection label={labels.templatePacksSubsection} icon={<Package className="w-4 h-4" aria-hidden="true" />}>
            <SimpleResourceGrid
              items={hostedInnovationPacks}
              icon={<Package className="w-5 h-5" aria-hidden="true" />}
            />
          </SubSection>
        ) : null}

        {hostedInnovationHubs.length > 0 ? (
          <SubSection
            label={labels.customHomepagesSubsection}
            icon={<LayoutDashboard className="w-4 h-4" aria-hidden="true" />}
          >
            <SimpleResourceGrid
              items={hostedInnovationHubs}
              icon={<LayoutDashboard className="w-5 h-5" aria-hidden="true" />}
            />
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
          /* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */
          /* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */
          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
            {asListItems(spacesLeading)}
          </ul>
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
        /* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */
        /* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */
        <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
          {asListItems(spacesMember)}
        </ul>
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
    /* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */
    /* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */
    <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-4 list-none p-0 m-0">
      {items.map(item => (
        <li key={item.id}>
          <a
            href={item.href}
            className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Avatar className="size-9 rounded-md shrink-0">
              {item.avatarImageUrl ? <AvatarImage src={item.avatarImageUrl} alt="" /> : null}
              <AvatarFallback className="bg-primary/10 text-primary rounded-md">{icon}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-card-title text-foreground">{item.displayName}</h4>
              {item.description ? <p className="text-body text-muted-foreground">{item.description}</p> : null}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
