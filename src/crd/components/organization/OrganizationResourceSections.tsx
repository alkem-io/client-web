import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { SpaceGridCard, type SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardHeader } from '@/crd/primitives/card';

const VISIBLE_SPACE_LIMIT = 6;

export type SimpleResourceCardItem = {
  id: string;
  displayName: string;
  description: string | null;
  href: string;
  avatarImageUrl: string | null;
};

export type AccountResourcesGroup = {
  spaces: SpaceGridCardData[];
  innovationPacks: SimpleResourceCardItem[];
  innovationHubs: SimpleResourceCardItem[];
};

export type OrganizationResourceSectionsProps = {
  accountResources: AccountResourcesGroup | null;
  /** Pre-rendered Lead Spaces tiles. */
  leadSpaces: ReactNode[];
  /** Pre-rendered All Memberships tiles. */
  memberOf: ReactNode[];
  labels: {
    accountResourcesTitle: string;
    accountResourcesSpacesSubtitle: string;
    accountResourcesInnovationPacksSubtitle: string;
    accountResourcesInnovationHubsSubtitle: string;
    accountResourcesShowAll: string;
    leadSpacesTitle: string;
    memberOfTitle: string;
    memberOfEmpty: string;
  };
};

export function OrganizationResourceSections({
  accountResources,
  leadSpaces,
  memberOf,
  labels,
}: OrganizationResourceSectionsProps) {
  return (
    <div className="space-y-10">
      {accountResources ? <AccountResourcesView accountResources={accountResources} labels={labels} /> : null}

      {leadSpaces.length > 0 ? (
        <section>
          <h2 className="text-section-title mb-4">{labels.leadSpacesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{leadSpaces}</div>
        </section>
      ) : null}

      <section>
        <h2 className="text-section-title mb-4">{labels.memberOfTitle}</h2>
        {memberOf.length === 0 ? (
          <p className="text-body text-muted-foreground">{labels.memberOfEmpty}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{memberOf}</div>
        )}
      </section>
    </div>
  );
}

type AccountResourcesViewProps = {
  accountResources: AccountResourcesGroup;
  labels: OrganizationResourceSectionsProps['labels'];
};

function AccountResourcesView({ accountResources, labels }: AccountResourcesViewProps) {
  const [visibleSpacesCount, setVisibleSpacesCount] = useState(VISIBLE_SPACE_LIMIT);
  const showSpaceMoreButton =
    accountResources.spaces.length > VISIBLE_SPACE_LIMIT && visibleSpacesCount === VISIBLE_SPACE_LIMIT;
  const visibleSpaces = accountResources.spaces.slice(0, visibleSpacesCount);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-section-title">{labels.accountResourcesTitle}</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {accountResources.spaces.length > 0 ? (
          <div>
            <div className="text-label uppercase text-muted-foreground mb-3">
              {labels.accountResourcesSpacesSubtitle}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleSpaces.map(s => (
                <SpaceGridCard key={s.id} space={s} />
              ))}
            </div>
            {showSpaceMoreButton ? (
              <div className="flex justify-end mt-3">
                <Button variant="ghost" size="sm" onClick={() => setVisibleSpacesCount(accountResources.spaces.length)}>
                  <ChevronDown className="w-4 h-4" />
                  {labels.accountResourcesShowAll}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {accountResources.innovationPacks.length > 0 ? (
          <div>
            <div className="text-label uppercase text-muted-foreground mb-3">
              {labels.accountResourcesInnovationPacksSubtitle}
            </div>
            <ul className="space-y-2">
              {accountResources.innovationPacks.map(p => (
                <li key={p.id}>
                  <a href={p.href} className="text-body-emphasis text-primary hover:underline">
                    {p.displayName}
                  </a>
                  {p.description ? <p className="text-caption text-muted-foreground">{p.description}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {accountResources.innovationHubs.length > 0 ? (
          <div>
            <div className="text-label uppercase text-muted-foreground mb-3">
              {labels.accountResourcesInnovationHubsSubtitle}
            </div>
            <ul className="space-y-2">
              {accountResources.innovationHubs.map(h => (
                <li key={h.id}>
                  <a href={h.href} className="text-body-emphasis text-primary hover:underline">
                    {h.displayName}
                  </a>
                  {h.description ? <p className="text-caption text-muted-foreground">{h.description}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
