import { describe, expect, it } from 'vitest';
import { SearchVisibility as GqlSearchVisibility } from '@/core/apollo/generated/graphql-schema';
import type { InnovationPackFormValues } from '@/crd/components/innovationPack/types';
import {
  formValuesToUpdateInnovationPackInput,
  type InnovationPackDetail,
  mapInnovationPackToBasics,
  mapInnovationPackToDetail,
  searchVisibilityToGql,
} from '../innovationPackMapper';

// The mapper is keyed off the generated `AdminInnovationPackQuery` shape, but we only need a small subset
// of it for the unit tests. Cast through `unknown` to avoid maintaining a full fixture mirror of the schema.
type PackFixture = Parameters<typeof mapInnovationPackToDetail>[0];

const buildPack = (over?: Partial<PackFixture>): PackFixture =>
  ({
    id: 'pack-1',
    listedInStore: true,
    searchVisibility: GqlSearchVisibility.Public,
    profile: {
      id: 'profile-1',
      displayName: 'Starter Pack',
      description: 'A small bundle of starter templates.',
      url: '/innovation-packs/starter-pack',
      avatar: { id: 'visual-1', uri: 'https://cdn.example/avatar.png' },
      tagset: { id: 'tagset-1', tags: ['onboarding', 'starter'] },
      references: [
        { id: 'ref-1', name: 'Docs', uri: 'https://docs.example', description: 'main docs' },
        { id: 'ref-2', name: 'Repo', uri: 'https://github.example', description: '' },
      ],
    },
    templatesSet: { id: 'set-1' },
    provider: { profile: { displayName: 'Acme Org' } },
    ...over,
  }) as unknown as PackFixture;

// ---------------------------------------------------------------------------
// mapInnovationPackToBasics
// ---------------------------------------------------------------------------

describe('mapInnovationPackToBasics', () => {
  it('extracts the chrome fields (page title, templates set id, profile basics)', () => {
    expect(mapInnovationPackToBasics(buildPack())).toEqual({
      id: 'pack-1',
      templatesSetId: 'set-1',
      displayName: 'Starter Pack',
      description: 'A small bundle of starter templates.',
      avatarUrl: 'https://cdn.example/avatar.png',
      tags: ['onboarding', 'starter'],
      url: '/innovation-packs/starter-pack',
    });
  });

  it('falls back to empty strings/arrays when optional fields are absent', () => {
    const pack = buildPack({
      profile: {
        id: 'p',
        displayName: 'Bare',
        url: '/p',
      },
      templatesSet: null,
    } as unknown as Partial<PackFixture>);
    const basics = mapInnovationPackToBasics(pack);
    expect(basics).toMatchObject({ id: 'pack-1', description: '', tags: [], avatarUrl: undefined });
    expect(basics.templatesSetId).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// searchVisibilityToGql / mapInnovationPackToDetail
// ---------------------------------------------------------------------------

describe('searchVisibilityToGql', () => {
  it('maps the form-level union to the GraphQL enum (legacy: Hidden = account-only)', () => {
    expect(searchVisibilityToGql('public')).toBe(GqlSearchVisibility.Public);
    expect(searchVisibilityToGql('authenticated')).toBe(GqlSearchVisibility.Account);
    expect(searchVisibilityToGql('account')).toBe(GqlSearchVisibility.Hidden);
  });
});

describe('mapInnovationPackToDetail', () => {
  it('produces the form values + the ids needed by the update mutation', () => {
    const detail = mapInnovationPackToDetail(buildPack());
    expect(detail).toMatchObject({
      id: 'pack-1',
      profileId: 'profile-1',
      templatesSetId: 'set-1',
      tagsetId: 'tagset-1',
      avatarVisualId: 'visual-1',
      url: '/innovation-packs/starter-pack',
      providerName: 'Acme Org',
    });
    expect(detail.formValues).toMatchObject({
      name: 'Starter Pack',
      description: 'A small bundle of starter templates.',
      tags: ['onboarding', 'starter'],
      avatarFile: undefined,
      listedInStore: true,
      searchVisibility: 'public',
    });
    expect(detail.formValues.references).toEqual([
      { id: 'ref-1', name: 'Docs', uri: 'https://docs.example', description: 'main docs' },
      { id: 'ref-2', name: 'Repo', uri: 'https://github.example', description: '' },
    ]);
  });

  it('shows the provider as empty string when no provider is set (legacy form is a read-only TextField)', () => {
    expect(
      mapInnovationPackToDetail(buildPack({ provider: null } as unknown as Partial<PackFixture>)).providerName
    ).toBe('');
  });

  it('round-trips searchVisibility through the form-level union', () => {
    const cases: Array<[GqlSearchVisibility, 'public' | 'authenticated' | 'account']> = [
      [GqlSearchVisibility.Public, 'public'],
      [GqlSearchVisibility.Account, 'authenticated'],
      [GqlSearchVisibility.Hidden, 'account'],
    ];
    for (const [gql, formValue] of cases) {
      const detail = mapInnovationPackToDetail(buildPack({ searchVisibility: gql } as unknown as Partial<PackFixture>));
      expect(detail.formValues.searchVisibility).toBe(formValue);
    }
  });
});

// ---------------------------------------------------------------------------
// formValuesToUpdateInnovationPackInput
// ---------------------------------------------------------------------------

describe('formValuesToUpdateInnovationPackInput', () => {
  const baseDetail: InnovationPackDetail = {
    id: 'pack-1',
    profileId: 'profile-1',
    templatesSetId: 'set-1',
    tagsetId: 'tagset-1',
    avatarVisualId: 'visual-1',
    avatarVisual: undefined,
    url: '/pack-1',
    providerName: 'Acme Org',
    formValues: {} as InnovationPackFormValues,
  };

  const formValues = (over?: Partial<InnovationPackFormValues>): InnovationPackFormValues => ({
    name: 'Updated Name',
    description: 'Updated description',
    tags: ['a', 'b'],
    avatarFile: undefined,
    references: [{ id: 'ref-1', name: 'Docs', uri: 'https://docs.example', description: 'main docs' }],
    listedInStore: false,
    searchVisibility: 'authenticated',
    ...over,
  });

  it('threads displayName / description / listedInStore / searchVisibility through the mutation input', () => {
    const input = formValuesToUpdateInnovationPackInput(baseDetail, formValues());
    expect(input.ID).toBe('pack-1');
    expect(input.listedInStore).toBe(false);
    expect(input.searchVisibility).toBe(GqlSearchVisibility.Account);
    expect(input.profileData?.displayName).toBe('Updated Name');
    expect(input.profileData?.description).toBe('Updated description');
  });

  it('forwards an existing tags edit only when the profile has a tagset id', () => {
    const withTagset = formValuesToUpdateInnovationPackInput(baseDetail, formValues());
    expect(withTagset.profileData?.tagsets).toEqual([{ ID: 'tagset-1', tags: ['a', 'b'] }]);

    const withoutTagset = formValuesToUpdateInnovationPackInput({ ...baseDetail, tagsetId: undefined }, formValues());
    expect(withoutTagset.profileData?.tagsets).toBeUndefined();
  });

  it('drops new (id-less) references — they go through createReferenceOnProfile in a separate call', () => {
    const input = formValuesToUpdateInnovationPackInput(
      baseDetail,
      formValues({
        references: [
          { id: 'ref-1', name: 'Docs', uri: 'https://docs.example', description: 'main docs' },
          { name: 'Brand new row', uri: 'https://new.example', description: 'no id yet' },
        ],
      })
    );
    expect(input.profileData?.references).toEqual([
      { ID: 'ref-1', name: 'Docs', uri: 'https://docs.example', description: 'main docs' },
    ]);
  });
});
