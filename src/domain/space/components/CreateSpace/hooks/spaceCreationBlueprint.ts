import type { BlueprintOmission } from '@/core/apollo/generated-v2/graphql-schema';

export type SpaceCreationProfile = {
  displayName: string;
  tagline: string;
  description?: string;
  tags: string[];
};

export type CreatedSpace = {
  id: string;
  url: string | undefined;
  omissions: Pick<BlueprintOmission, 'path' | 'code'>[];
};

type CreateSpaceResultShape = {
  node: { id: string; url?: string | null };
  omissions: Pick<BlueprintOmission, 'path' | 'code'>[];
};

/** The v1 envelope of 023 FR-003: one root space overlaid with the dialog's profile and its tags as core.tags labels. */
export const spaceCreationBlueprint = ({ displayName, tagline, description, tags }: SpaceCreationProfile) => ({
  v: 1,
  root: 's',
  nodes: [
    {
      key: 's',
      parent: null,
      type: 'space',
      profile: { display_name: displayName, tagline, ...(description ? { description } : {}) },
    },
  ],
  labels: tags.map((value_text, sort_order) => ({
    owner: 's',
    type: 'core.tags',
    name: 'tags',
    value_text,
    sort_order,
  })),
});

/** The result mapping both create submits share (023 FR-020). */
export const mapCreatedSpace = (result: CreateSpaceResultShape | undefined): CreatedSpace | undefined =>
  result && {
    id: result.node.id,
    url: result.node.url ?? undefined,
    omissions: result.omissions.map(({ path, code }) => ({ path, code })),
  };
