import type { InnovationLibraryQuery } from '@/core/apollo/generated/graphql-schema';
import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

type GqlLibraryPack = InnovationLibraryQuery['platform']['library']['innovationPacks'][number];

/** Sum of `templatesSet.*Count` (the InnovationLibrary query exposes counts, not full template lists). */
export function packTemplateCount(pack: GqlLibraryPack): number {
  const ts = pack.templatesSet;
  if (!ts) return 0;
  return (
    (ts.calloutTemplatesCount ?? 0) +
    (ts.spaceTemplatesCount ?? 0) +
    (ts.communityGuidelinesTemplatesCount ?? 0) +
    (ts.postTemplatesCount ?? 0) +
    (ts.whiteboardTemplatesCount ?? 0)
  );
}

export function mapPackToInnovationPackCardData(pack: GqlLibraryPack): InnovationPackCardData {
  const profile = pack.profile;
  const provider = pack.provider;
  return {
    id: pack.id,
    name: profile.displayName,
    description: profile.description ?? '',
    tags: profile.tagset?.tags ?? [],
    // The library query doesn't fetch a banner visual on the pack — the card renders the colour gradient.
    bannerUrl: undefined,
    color: pickColorFromId(pack.id),
    templateCount: packTemplateCount(pack),
    url: profile.url,
    providerName: provider?.profile?.displayName,
    providerAvatarUrl: provider?.profile?.avatar?.uri || undefined,
    providerUrl: provider?.profile?.url,
  };
}
