import type { ReferenceLink, TagsetGroup } from '@/crd/components/organization/OrganizationProfileSidebar';

export type RawReference = {
  id: string;
  name: string;
  uri: string;
  description?: string | null;
};

/**
 * Pass-through normaliser for the references array. The social/non-social
 * split (and brand resolution for the social subset) lives entirely inside
 * the shared `SocialLinks` primitive at `@/crd/components/common/SocialLinks`
 * — this helper just hands the raw refs through with `description: null`
 * defaulted so the consumer sees a stable shape.
 */
export const normaliseReferences = (references: RawReference[]): ReferenceLink[] =>
  references.map(ref => ({
    id: ref.id,
    name: ref.name,
    uri: ref.uri,
    description: ref.description ?? null,
  }));

export const buildTagsetGroups = (groups: Array<{ key: string; name: string; tags: string[] }>): TagsetGroup[] =>
  groups.filter(g => g.tags.length > 0);

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
