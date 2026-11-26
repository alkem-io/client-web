/**
 * An About's declared extensions are its facets (model About.facets, `{ namespace, name, value }`, namespace the first
 * path level and name the rest; ReadMeta serves every declared one, a configured one without a value as null, USER via
 * spaces 2026-11-26): core/purpose is the why/who, core/link_role.<role> that role's links (the legacy references) and
 * core/classification the classification sets. Space.links and Space.classifications are not served, so the About's
 * slots read these.
 */
export type AboutFacet = { namespace: string; name: string; value?: unknown }; // served AboutFacet.value is nullable JSON

type Facets = readonly AboutFacet[] | null | undefined;

export type FacetPurpose = { why?: string | null; who?: string | null };

export type FacetLink = {
  id: string;
  role?: string;
  uri: string;
  title?: string | null;
  description?: string | null;
  sortOrder?: number;
};

/**
 * One classification set (A4.3 ChoiceSetRef with its choices), its instance settings (A4.2: the display label, the
 * shown/hidden flag, the order and the selection cardinality) and the selected choices' ids.
 */
export type FacetClassification = {
  choiceSet: {
    id: string;
    namespace?: string;
    name?: string;
    mode?: string;
    settings?: {
      display_label?: string | null;
      visible?: boolean | null;
      order?: number | null;
      selection?: 'one' | 'many' | null;
      max?: number | null;
    } | null;
    values: Array<{ id: string; value: string; description?: string | null; sortOrder?: number; settings?: unknown }>;
  };
  selected?: string[] | null;
};

const LINK_ROLE = 'link_role.';
/** Link roles that are not the profile's references: a post's call to action, a guidelines block's, a collection's. */
const NOT_REFERENCES = new Set(['cta', 'guidelines', 'item']);

/** The values of the core facets with this name, each facet's list entries (or its single value). */
const coreEntries = (facets: Facets, match: (name: string) => boolean): unknown[] =>
  (facets ?? [])
    .filter(facet => facet.namespace === 'core' && match(facet.name))
    .flatMap(facet => (Array.isArray(facet.value) ? facet.value : [facet.value]))
    .filter(value => value !== null && value !== undefined);

/** core/purpose (A4.1): the why and who, absent when the About holds none. */
export const facetPurpose = (facets: Facets) =>
  coreEntries(facets, name => name === 'purpose')[0] as FacetPurpose | undefined;

/** The About's references: the links of its reference roles, in their designed order (sortOrder, then as served). */
export const facetLinks = (facets: Facets): FacetLink[] =>
  coreEntries(facets, name => name.startsWith(LINK_ROLE) && !NOT_REFERENCES.has(name.slice(LINK_ROLE.length)))
    .filter((value): value is FacetLink => typeof (value as FacetLink).uri === 'string')
    .map((link, index) => ({ link, index }))
    .sort((a, b) => (a.link.sortOrder ?? a.index) - (b.link.sortOrder ?? b.index) || a.index - b.index)
    .map(({ link }) => link);

/** The About's classification sets (core/classification, A4.2/A4.3), in their served order. */
export const facetClassifications = (facets: Facets): FacetClassification[] =>
  coreEntries(facets, name => name === 'classification').filter(
    (value): value is FacetClassification =>
      typeof (value as FacetClassification).choiceSet?.id === 'string' &&
      Array.isArray((value as FacetClassification).choiceSet.values)
  );
