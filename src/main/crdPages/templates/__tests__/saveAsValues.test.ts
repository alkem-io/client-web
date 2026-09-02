import { describe, expect, it } from 'vitest';
import { toSaveAsValues } from '../useSaveAsTemplate';

// ---------------------------------------------------------------------------
// toSaveAsValues — the pure pre-fill helper used by "save X as a template" (US9 / FR-032)
// ---------------------------------------------------------------------------

describe('toSaveAsValues — community-guidelines source', () => {
  it('pre-fills the Community Guidelines template form with title + body + references', () => {
    const values = toSaveAsValues({
      kind: 'communityGuidelines',
      title: 'House Rules',
      bodyMarkdown: '# Be kind\n\nNo spam.',
      references: [
        { id: 'r1', name: 'Charter', uri: 'https://example/charter', description: '' },
        { id: 'r2', name: 'Help', uri: 'https://example/help' },
      ],
    });
    expect(values).toEqual({
      type: 'communityGuidelines',
      // The template's own display name defaults to the guidelines title — the user can edit it in the dialog.
      name: 'House Rules',
      description: '',
      tags: [],
      title: 'House Rules',
      guidelinesMarkdown: '# Be kind\n\nNo spam.',
      references: [
        { id: 'r1', name: 'Charter', uri: 'https://example/charter', description: '' },
        { id: 'r2', name: 'Help', uri: 'https://example/help' },
      ],
    });
  });

  it('falls back to a sensible default template-name when the guidelines have no title', () => {
    const values = toSaveAsValues({
      kind: 'communityGuidelines',
      title: '',
      bodyMarkdown: '',
      references: [],
    });
    if (values.type !== 'communityGuidelines') throw new Error('expected communityGuidelines');
    expect(values.name).toBe('Community guidelines');
    expect(values.title).toBe('');
    expect(values.guidelinesMarkdown).toBe('');
    expect(values.references).toEqual([]);
  });
});

describe('toSaveAsValues — subspace source', () => {
  it('pre-fills the Space template form with sourceSpaceId + recursive=true (capture nested subspaces)', () => {
    const values = toSaveAsValues({
      kind: 'subspace',
      subspaceId: 'subspace-42',
      name: 'Innovation Track',
      description: 'A six-week innovation track.',
      tags: ['workshop'],
    });
    expect(values).toEqual({
      type: 'space',
      name: 'Innovation Track',
      description: 'A six-week innovation track.',
      tags: ['workshop'],
      recursive: true,
      sourceSpaceId: 'subspace-42',
    });
  });

  it('uses empty defaults for optional description / tags', () => {
    const values = toSaveAsValues({
      kind: 'subspace',
      subspaceId: 'sub-1',
      name: 'Quick capture',
    });
    if (values.type !== 'space') throw new Error('expected space');
    expect(values.description).toBe('');
    expect(values.tags).toEqual([]);
    expect(values.recursive).toBe(true);
    expect(values.sourceSpaceId).toBe('sub-1');
  });
});
