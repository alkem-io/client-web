import { format, type Locale, parseISO } from 'date-fns';
import type { ContributorCollectionByTypeQuery } from '@/core/apollo/generated/graphql-schema';
import type { ContributorCardData } from '@/crd/components/callout/ContributorCollection/ContributorCard';
import { contributorTypeFromServer } from '@/main/crdPages/space/callout/contributorCollectionMapper';

type ContributorItem = NonNullable<
  ContributorCollectionByTypeQuery['lookup']['callout']
>['framing']['contributors'][number];

/**
 * What the hook stores and the connector decorates at render time: every
 * `ContributorCardData` field except the two the connector derives
 * (`joinedMonthLabel`, `canMessage`), plus the raw ISO join date those are
 * derived from. Kept locale-free and viewer-free so the mapper stays pure.
 */
export type ContributorCardModel = Omit<ContributorCardData, 'joinedMonthLabel' | 'canMessage'> & {
  joinedDate?: string;
};

/**
 * Maps a server `ContributorCollectionItem` to the plain CRD `ContributorCardModel`.
 * Mirrors the existing member-card shape; location carries the precise
 * coordinates only when `hasValidCoordinates` is true, so the map plots
 * exactly the locatable subset and the rest fall into "no location data".
 *
 * Pure and locale-free: no i18n, no current-user, no formatting. `joinedDate`
 * is passed through untouched (the connector turns it into a localised month
 * label at render time); `associatesCount` keeps `0` as a real value (never
 * coalesced away by `||`).
 */
export function mapContributorItemToCard(item: ContributorItem): ContributorCardModel {
  const city = item.location?.city ?? undefined;
  const country = item.location?.country ?? undefined;
  const locationLabel = [city, country].filter(Boolean).join(', ') || undefined;
  const hasValidCoordinates = item.location?.hasValidCoordinates ?? false;

  // Display role: only `lead` and `member` ever surface. The server already
  // resolves this (a lead — including a lead who is also an admin — is labelled
  // `lead`; admins who are not leads are labelled `member`); this is a defensive
  // normalisation so any non-`lead` label still renders as `member`.
  const roleLabel = item.roleLabel == null ? undefined : item.roleLabel === 'lead' ? 'lead' : 'member';

  return {
    id: item.id,
    type: contributorTypeFromServer(item.type),
    name: item.displayName,
    avatarUrl: item.avatarUrl ?? undefined,
    roleLabel,
    href: item.url ?? undefined,
    locationLabel,
    // Coordinates only when valid; city/country alone => no map plot.
    latitude: hasValidCoordinates ? (item.location?.latitude ?? undefined) : undefined,
    longitude: hasValidCoordinates ? (item.location?.longitude ?? undefined) : undefined,
    hasValidCoordinates,
    tagline: item.tagline ?? undefined,
    tags: item.tags ?? [],
    // `0` is a real value, not absence — never `item.associatesCount || undefined`.
    associatesCount: item.associatesCount ?? undefined,
    websiteUrl: item.website ?? undefined,
    // Codegen maps the `DateTime` scalar to `Date`; kept as an ISO string on
    // the model so `formatJoinedMonth` (and the cache-identity test) work
    // against a plain, serialisable value.
    joinedDate: item.joinedDate ? item.joinedDate.toISOString() : undefined,
  };
}

/**
 * Formats the raw ISO `joinedDate` into a ready "Oct 2023"-style label, in the
 * given locale. The server truncates every value to the first day of the
 * month at 00:00 UTC, so it always sits on a month boundary — formatting the
 * *local* calendar day of that instant would read as the previous month for
 * every viewer whose device is west of UTC. Reading the UTC year/month
 * directly (and building a new, local-midnight `Date` from them) sidesteps
 * that entirely: the label is the same in every timezone.
 *
 * Returns `undefined` for an unparsable value rather than throwing, so a
 * malformed date never turns into a broken row (or the literal text
 * "Invalid Date").
 */
export function formatJoinedMonth(iso: string, locale: Locale | undefined): string | undefined {
  const parsed = parseISO(iso);
  if (Number.isNaN(parsed.getTime())) return undefined;
  const monthStart = new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1);
  return format(monthStart, 'MMM yyyy', { locale });
}
