import type { V2DashboardSpaceCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { mapMembershipsToPanelItems } from './dashboardDataMappers';

/** One flat SpaceMembership (User.memberships; client-repoint.md Membership: flat records, presentation derived). */
type DashboardMembership = {
  roles: string[];
  space: V2DashboardSpaceCardFragment & { parent?: { id: string } | null };
};

// fed85 dashboardDataMappers.tsx:437–499 owns role priority, card images and nesting presentation.
export const mapDashboardMemberships = (memberships: readonly DashboardMembership[]) => {
  type Entry = Parameters<typeof mapMembershipsToPanelItems>[0][number];
  const entries = new Map<string, Entry>(
    memberships.map(({ space, roles }) => [
      space.id,
      {
        space: {
          id: space.id,
          about: {
            isContentPublic: space.isContentPublic,
            profile: {
              displayName: space.about.displayName,
              tagline: space.about.tagline ?? undefined,
              url: space.url ?? undefined,
              avatar: space.about.avatar ? { uri: space.about.avatar.file.url } : undefined,
              cardBanner: space.about.card ? { uri: space.about.card.file.url } : undefined,
            },
          },
          community: { roleSet: { myRoles: roles } },
        },
        childMemberships: [],
      },
    ])
  );
  const roots: Entry[] = [];
  for (const { space } of memberships) {
    const entry = entries.get(space.id);
    if (!entry) continue;
    const parent = space.parent ? entries.get(space.parent.id) : undefined;
    if (parent) parent.childMemberships?.push(entry);
    else roots.push(entry);
  }
  return mapMembershipsToPanelItems(roots);
};
