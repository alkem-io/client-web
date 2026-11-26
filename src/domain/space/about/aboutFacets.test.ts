import { describe, expect, test } from 'vitest';
import { facetClassifications, facetLinks, facetPurpose } from './aboutFacets';

const link = (id: string, role: string, sortOrder?: number) => ({
  id,
  role,
  uri: `https://${id}`,
  title: id.toUpperCase(),
  description: null,
  sortOrder,
});
const set = (id: string, selected: string[]) => ({
  choiceSet: {
    id,
    namespace: 'core',
    name: 'classification',
    mode: 'closed',
    values: [{ id: `${id}-1`, value: 'One', description: null, sortOrder: 0, settings: null }],
  },
  selected,
});

describe('About facets (model About.facets as ReadMeta serves them)', () => {
  test('core/purpose is the why and who; absent when the About holds none (null)', () => {
    expect(facetPurpose([{ namespace: 'core', name: 'purpose', value: { why: 'Why', who: 'Who' } }])).toEqual({
      why: 'Why',
      who: 'Who',
    });
    expect(facetPurpose([{ namespace: 'core', name: 'purpose', value: null }])).toBeUndefined();
    expect(facetPurpose([])).toBeUndefined();
  });

  test("the references are the reference roles' links in their designed order; cta, guidelines and item are not", () => {
    const facets = [
      { namespace: 'core', name: 'link_role.reference', value: [link('b', 'reference', 2), link('a', 'reference', 0)] },
      { namespace: 'core', name: 'link_role.website', value: [link('c', 'website', 1)] },
      { namespace: 'core', name: 'link_role.cta', value: [link('cta', 'cta', 0)] },
      { namespace: 'core', name: 'link_role.guidelines', value: [link('g', 'guidelines', 0)] },
      { namespace: 'core', name: 'link_role.item', value: [link('i', 'item', 0)] },
      { namespace: 'core', name: 'link_role.github', value: null },
      { namespace: 'core', name: 'purpose', value: { why: 'x', who: 'y' } },
    ];
    expect(facetLinks(facets).map(each => each.id)).toEqual(['a', 'c', 'b']);
  });

  test('every core/classification set with its selections; tags and other namespaces are not classifications', () => {
    const facets = [
      { namespace: 'core', name: 'classification', value: [set('sector', ['sector-1']), set('region', [])] },
      { namespace: 'core', name: 'tags', value: [set('tags', [])] },
      { namespace: 'custom', name: 'classification', value: [set('foreign', [])] },
      { namespace: 'core', name: 'classification', value: null },
    ];
    expect(facetClassifications(facets).map(each => [each.choiceSet.id, each.selected])).toEqual([
      ['sector', ['sector-1']],
      ['region', []],
    ]);
  });

  test('no facets read as none', () => {
    expect(facetLinks(undefined)).toEqual([]);
    expect(facetClassifications(null)).toEqual([]);
  });
});
