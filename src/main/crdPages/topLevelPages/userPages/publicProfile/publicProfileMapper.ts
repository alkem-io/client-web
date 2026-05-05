import type { SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import type { VirtualContributorCardItem } from '@/crd/components/user/UserResourceSections';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

type AccountResourceProfileLike =
  | {
      id?: string | null;
      displayName: string;
      url: string;
      tagline?: string | null;
      avatar?: { uri: string } | null;
      cardBanner?: { uri: string } | null;
    }
  | null
  | undefined;

export type AccountResourcesShape =
  | {
      spaces?: Array<{
        id: string;
        about?: { profile?: AccountResourceProfileLike; isContentPublic?: boolean };
      }>;
      virtualContributors?: Array<{
        id: string;
        profile?: AccountResourceProfileLike;
      }>;
    }
  | null
  | undefined;

const formatLocation = (
  city: string | null | undefined,
  country: string | null | undefined,
  format: {
    both: (city: string, country: string) => string;
    cityOnly: (city: string) => string;
    countryOnly: (country: string) => string;
  }
): string | null => {
  const c = (city ?? '').trim();
  const co = (country ?? '').trim();
  if (c && co) return format.both(c, co);
  if (c) return format.cityOnly(c);
  if (co) return format.countryOnly(co);
  return null;
};

export type MapHostedSpacesResult = SpaceGridCardData[];

export const mapHostedSpacesToCardData = (
  accountResources: AccountResourcesShape,
  vcType: string
): {
  hostedSpaces: SpaceGridCardData[];
  hostedVirtualContributors: VirtualContributorCardItem[];
} => {
  // PROTOTYPE PARITY: innovation packs and innovation hubs are intentionally
  // dropped from the User profile (FR-016). Only spaces and VCs are surfaced.
  const spacesIn = accountResources?.spaces ?? [];
  const vcsIn = accountResources?.virtualContributors ?? [];

  const hostedSpaces: SpaceGridCardData[] = spacesIn
    .filter(s => Boolean(s.about?.profile))
    .map(s => {
      const profile = s.about!.profile!;
      return {
        id: s.id,
        title: profile.displayName,
        description: profile.tagline ?? null,
        href: profile.url,
        imageUrl: profile.cardBanner?.uri,
        color: pickColorFromId(s.id),
        isPrivate: s.about?.isContentPublic === false,
      };
    });

  const hostedVirtualContributors: VirtualContributorCardItem[] = vcsIn
    .filter(v => Boolean(v.profile))
    .map(v => ({
      id: v.id,
      displayName: v.profile!.displayName,
      description: v.profile!.tagline ?? null,
      type: vcType,
      href: v.profile!.url,
    }));

  return { hostedSpaces, hostedVirtualContributors };
};

export type LocationFormatLabels = {
  format: string;
  cityOnly: string;
  countryOnly: string;
};

export const buildLocationLine = (
  city: string | null | undefined,
  country: string | null | undefined,
  resolveBoth: (vars: { city: string; country: string }) => string,
  resolveCity: (vars: { city: string }) => string,
  resolveCountry: (vars: { country: string }) => string
): string | null =>
  formatLocation(city, country, {
    both: (cityValue, countryValue) => resolveBoth({ city: cityValue, country: countryValue }),
    cityOnly: cityValue => resolveCity({ city: cityValue }),
    countryOnly: countryValue => resolveCountry({ country: countryValue }),
  });
