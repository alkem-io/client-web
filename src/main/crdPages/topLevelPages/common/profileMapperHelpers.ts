import type { ReferenceLink, TagsetGroup } from '@/crd/components/common/profileTypes';

export type RawReference = {
  id: string;
  name: string;
  uri: string;
  description?: string | null;
};

export const normaliseReferences = (references: RawReference[]): ReferenceLink[] =>
  references.map(ref => ({
    id: ref.id,
    name: ref.name,
    uri: ref.uri,
    description: ref.description ?? null,
  }));

export const buildTagsetGroups = (groups: Array<{ key: string; name: string; tags: string[] }>): TagsetGroup[] =>
  groups.filter(g => g.tags.length > 0);
