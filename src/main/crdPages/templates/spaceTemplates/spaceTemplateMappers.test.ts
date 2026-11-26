import { describe, expect, it } from 'vitest';
import type { CreateSpacePickerCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import {
  accountOwnerLabel,
  type LibraryTemplate,
  mapSpaceTemplateCard,
  mapSpaceTemplateContent,
  type NativeSpaceTemplate,
  platformOwnerLabel,
  spaceTemplatePrefill,
} from './spaceTemplateMappers';

const file = (url: string) => ({ __typename: 'FileRef' as const, file: { __typename: 'File' as const, url } });

const card = (overrides: Partial<CreateSpacePickerCardFragment> = {}): CreateSpacePickerCardFragment => ({
  __typename: 'Template',
  id: 'tpl-1',
  kind: 'SPACE',
  url: '/templates/tpl-1',
  tags: ['a', 'b'],
  about: { __typename: 'About', displayName: 'Template', description: 'Desc', card: file('/template-card') },
  body: { __typename: 'Space', id: 'body', about: { __typename: 'About', card: file('/body-card') } },
  ...overrides,
});

const libraryTemplate = (
  scope: LibraryTemplate['scope'],
  provider: LibraryTemplate['provider'] = null
): LibraryTemplate => ({ ...card(), scope, provider });

describe('mapSpaceTemplateCard', () => {
  it('maps the native card fields onto TemplateCardData with the body card as banner', () => {
    expect(mapSpaceTemplateCard(card(), 'Pack')).toEqual({
      id: 'tpl-1',
      type: 'space',
      name: 'Template',
      description: 'Desc',
      tags: ['a', 'b'],
      bannerUrl: '/body-card',
      color: pickColorFromId('tpl-1'),
      url: '/templates/tpl-1',
      ownerLabel: 'Pack',
      classification: undefined,
    });
  });

  it('falls back to the template card, then to no banner', () => {
    const bodyWithoutCard = card({
      body: { __typename: 'Space', id: 'body', about: { __typename: 'About', card: null } },
    });
    expect(mapSpaceTemplateCard(bodyWithoutCard).bannerUrl).toBe('/template-card');
    expect(mapSpaceTemplateCard(card({ body: null })).bannerUrl).toBe('/template-card');
    expect(
      mapSpaceTemplateCard(card({ body: null, about: { __typename: 'About', displayName: 'T', card: null } }))
    ).toMatchObject({ bannerUrl: undefined, description: '', ownerLabel: undefined });
  });

  it('refuses a template of another kind', () => {
    expect(() => mapSpaceTemplateCard(card({ kind: 'POST' }))).toThrow(/POST/);
  });
});

describe('owner labels', () => {
  const pack = {
    __typename: 'InnovationPack' as const,
    id: 'pack',
    about: { __typename: 'About' as const, displayName: 'Pack' },
  };
  const provider = {
    __typename: 'Organization' as const,
    id: 'org',
    about: { __typename: 'About' as const, displayName: 'Org' },
  };

  it('labels an account template with its pack name', () => {
    expect(accountOwnerLabel(libraryTemplate(pack, provider))).toBe('Pack');
    expect(accountOwnerLabel(libraryTemplate({ __typename: 'Space', id: 'space' }))).toBeUndefined();
  });

  it('labels a platform template with its provider, else its pack', () => {
    expect(platformOwnerLabel(libraryTemplate(pack, provider))).toBe('Org');
    expect(platformOwnerLabel(libraryTemplate(pack, null))).toBe('Pack');
    expect(platformOwnerLabel(libraryTemplate(pack, { __typename: 'GenericActor', id: 'actor', about: null }))).toBe(
      'Pack'
    );
  });
});

type Node = NativeSpaceTemplate['nodes'][number];
const space = (id: string, overrides: Record<string, unknown> = {}): Node => ({
  __typename: 'Space',
  id,
  entityType: 'space',
  tags: [],
  isContentPublic: true,
  about: { __typename: 'About', displayName: id, tagline: null, description: null, card: null },
  stages: [],
  ...overrides,
});
const post = (id: string, sortOrder: number, contentKind: string, stage: string | null): Node => ({
  __typename: 'Post',
  id,
  entityType: 'post',
  contentKind,
  sortOrder,
  about: { __typename: 'About', displayName: id, description: `${id} text` },
  stage: stage ? { __typename: 'Stage', name: stage } : null,
});
const template = (overrides: Partial<NativeSpaceTemplate['template']> = {}): NativeSpaceTemplate['template'] => ({
  __typename: 'Template',
  id: 'tpl',
  tags: ['template-tag'],
  about: { __typename: 'About', displayName: 'Template name', description: 'Template description' },
  body: { __typename: 'Space', id: 'body' },
  ...overrides,
});

describe('mapSpaceTemplateContent', () => {
  it('reads the body by id, other spaces as tiles and posts as starter callouts', () => {
    const native: NativeSpaceTemplate = {
      template: template(),
      nodes: [
        space('child-a', {
          isContentPublic: false,
          about: { __typename: 'About', displayName: 'A', card: file('/a') },
        }),
        post('second', 2, 'gallery', 'Explore'),
        space('body', {
          stages: [
            { __typename: 'Stage', name: 'Act', description: null, sortOrder: 3 },
            { __typename: 'Stage', name: 'Explore', description: 'Look around', sortOrder: 1 },
          ],
        }),
        post('first', 1, 'text', 'Act'),
        post('third', 3, 'document', null),
        space('child-b'),
      ],
    };
    expect(mapSpaceTemplateContent(native)).toEqual({
      type: 'space',
      phases: [
        { name: 'Explore', description: 'Look around' },
        { name: 'Act', description: undefined },
      ],
      starterCallouts: [
        { name: 'first', framingKind: 'none', flowStateName: 'Act', description: 'first text' },
        { name: 'second', framingKind: 'image', flowStateName: 'Explore', description: 'second text' },
        { name: 'third', framingKind: 'document', flowStateName: undefined, description: 'third text' },
      ],
      subspaceTemplates: [
        { id: 'child-a', name: 'A', bannerUrl: '/a', isPrivate: true },
        { id: 'child-b', name: 'child-b', bannerUrl: undefined, isPrivate: false },
      ],
    });
  });

  it('maps every callout framing kind of the native correspondence', () => {
    const kinds = ['text', 'document', 'cta', 'gallery', 'poll', 'contributors', 'spaces', 'form'];
    const native: NativeSpaceTemplate = {
      template: template(),
      nodes: kinds.map((kind, index) => post(kind, index, kind, null)),
    };
    expect(mapSpaceTemplateContent(native).starterCallouts.map(callout => callout.framingKind)).toEqual([
      'none',
      'document',
      'cta',
      'image',
      'poll',
      'contributors',
      'none', // spaces: legacy shows 'none' (no signed change)
      'form',
    ]);
  });
});

describe('spaceTemplatePrefill', () => {
  it('prefers the body values', () => {
    const native: NativeSpaceTemplate = {
      template: template(),
      nodes: [
        space('body', {
          tags: ['body-tag'],
          about: {
            __typename: 'About',
            displayName: 'Body name',
            tagline: 'Body tagline',
            description: 'Body description',
            card: null,
          },
        }),
      ],
    };
    expect(spaceTemplatePrefill(native)).toEqual({
      templateName: 'Template name',
      displayName: 'Body name',
      tagline: 'Body tagline',
      description: 'Body description',
      tags: ['body-tag'],
    });
  });

  it("falls back to the template's own values when the body's are empty", () => {
    const native: NativeSpaceTemplate = {
      template: template(),
      nodes: [
        space('body', { about: { __typename: 'About', displayName: '', tagline: '', description: '', card: null } }),
      ],
    };
    expect(spaceTemplatePrefill(native)).toEqual({
      templateName: 'Template name',
      displayName: 'Template name',
      tagline: '',
      description: 'Template description',
      tags: ['template-tag'],
    });
  });
});
