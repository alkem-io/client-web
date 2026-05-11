import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SAVED_FLASH_MS } from '@/crd/components/common/FieldFooter';
import { EMAIL_REGEX, isValidUrlOrEmpty } from '../orgProfileMapper';

// ─── Apollo hook mocks ────────────────────────────────────────────────────

const mockRefetch = vi.fn();
const mockUpdateOrganization = vi.fn();
const mockCreateReference = vi.fn();
const mockDeleteReference = vi.fn();
const mockCreateTagset = vi.fn();
const mockUploadVisual = vi.fn();

let mockOrgData: { lookup: { organization: ReturnType<typeof buildOrg> | null } } | undefined;

function buildOrg(overrides: Partial<ReturnType<typeof baseOrgShape>> = {}) {
  return { ...baseOrgShape(), ...overrides };
}

function baseOrgShape() {
  return {
    id: 'org-1',
    nameID: 'alkemio',
    contactEmail: 'hello@alkemio.test',
    domain: 'alkemio.test',
    legalEntityName: 'Alkemio Foundation',
    website: 'https://alkemio.test',
    verification: { id: 'verif-1', status: 'NOT_VERIFIED' },
    profile: {
      id: 'profile-1',
      url: 'https://example.test/organization/alkemio',
      displayName: 'Alkemio',
      tagline: 'Open collaboration',
      description: 'About Alkemio',
      location: { country: 'NL', city: 'Amsterdam' },
      visuals: [
        {
          id: 'visual-avatar',
          name: 'AVATAR',
          uri: 'https://example.test/logo.png',
          alternativeText: null,
          allowedTypes: [],
          aspectRatio: 1,
          maxHeight: 400,
          maxWidth: 400,
          minHeight: 0,
          minWidth: 0,
        },
      ],
      references: [
        { id: 'ref-1', name: 'LinkedIn', uri: 'https://linkedin.com/company/alkemio', description: '' },
        { id: 'ref-2', name: 'Annual report', uri: 'https://alkemio.test/report', description: 'PDF' },
      ],
      tagsets: [
        { id: 'tagset-keywords', name: 'Keywords', tags: ['governance', 'open-source'] },
        { id: 'tagset-capabilities', name: 'Capabilities', tags: ['research', 'facilitation'] },
      ],
    },
  };
}

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useOrganizationProfileInfoQuery: () => ({
    data: mockOrgData,
    loading: false,
    error: undefined,
    refetch: mockRefetch,
  }),
  useUpdateOrganizationMutation: () => [mockUpdateOrganization, { loading: false }],
  useCreateReferenceOnProfileMutation: () => [mockCreateReference, { loading: false }],
  useDeleteReferenceMutation: () => [mockDeleteReference, { loading: false }],
  useCreateTagsetOnProfileMutation: () => [mockCreateTagset, { loading: false }],
  useUploadVisualMutation: () => [mockUploadVisual, { loading: false }],
}));

// Import AFTER the mock so the hook captures the mocked module.
import useOrgProfileTabData from '../useOrgProfileTabData';

// ─── Lifecycle ────────────────────────────────────────────────────────────

beforeEach(() => {
  mockOrgData = { lookup: { organization: buildOrg() } };
  mockRefetch.mockReset().mockResolvedValue({ data: { lookup: { organization: buildOrg() } } });
  mockUpdateOrganization.mockReset().mockResolvedValue({ data: {} });
  mockCreateReference.mockReset().mockResolvedValue({ data: {} });
  mockDeleteReference.mockReset().mockResolvedValue({ data: {} });
  mockCreateTagset.mockReset().mockResolvedValue({ data: {} });
  mockUploadVisual.mockReset().mockResolvedValue({
    data: {
      uploadImageOnVisual: { uri: 'https://example.test/new-logo.png', alternativeText: null },
    },
  });
});

afterEach(() => vi.useRealTimers());

// ─── Tests ────────────────────────────────────────────────────────────────

describe('useOrgProfileTabData — initial state', () => {
  it('seeds the local buffer from the organization query', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    expect(result.current.values?.displayName).toBe('Alkemio');
    expect(result.current.values?.contactEmail).toBe('hello@alkemio.test');
    expect(result.current.values?.domain).toBe('alkemio.test');
    // Initial dirty map: nothing dirty.
    expect(Object.values(result.current.dirtyByField).every(v => v === false)).toBe(true);
  });

  it('extracts Keywords and Capabilities tagsets into separate slots by case-insensitive name', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    expect(result.current.values?.keywords).toEqual({ id: 'tagset-keywords', tags: ['governance', 'open-source'] });
    expect(result.current.values?.capabilities).toEqual({
      id: 'tagset-capabilities',
      tags: ['research', 'facilitation'],
    });
  });

  it('returns null values when organizationId is undefined', () => {
    mockOrgData = { lookup: { organization: null } };
    const { result } = renderHook(() => useOrgProfileTabData(undefined));
    expect(result.current.values).toBeNull();
  });
});

describe('useOrgProfileTabData — onChange + dirty tracking', () => {
  it('flips dirtyByField for the changed Identity section', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => result.current.onChange({ displayName: 'Alkemio Foundation' }));

    expect(result.current.dirtyByField.displayName).toBe(true);
    expect(result.current.dirtyByField.tagline).toBe(false);
  });

  it('treats city/country edits as the compound location section', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => result.current.onChange({ city: 'The Hague' }));

    expect(result.current.dirtyByField.location).toBe(true);
  });

  it('tracks Contact & Legal fields as independent dirty sections', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => result.current.onChange({ contactEmail: 'press@alkemio.test' }));
    expect(result.current.dirtyByField.contactEmail).toBe(true);
    expect(result.current.dirtyByField.domain).toBe(false);
    expect(result.current.dirtyByField.website).toBe(false);

    act(() => result.current.onChange({ website: 'https://alkemio.test/about' }));
    expect(result.current.dirtyByField.website).toBe(true);
  });
});

describe('useOrgProfileTabData — onSaveSection (idle → saving → saved → idle)', () => {
  it('flashes "Saved" then clears after SAVED_FLASH_MS for Display Name', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => result.current.onChange({ displayName: 'Alkemio Foundation' }));

    let savePromise: Promise<void> = Promise.resolve();
    act(() => {
      savePromise = result.current.onSaveSection('displayName');
    });

    expect(result.current.saveStatusByField.displayName?.kind).toBe('saving');

    await act(async () => {
      await savePromise;
    });

    expect(mockUpdateOrganization).toHaveBeenCalledWith({
      variables: { input: { ID: 'org-1', profileData: { displayName: 'Alkemio Foundation' } } },
    });
    expect(result.current.saveStatusByField.displayName?.kind).toBe('saved');

    act(() => vi.advanceTimersByTime(SAVED_FLASH_MS + 10));
    expect(result.current.saveStatusByField.displayName).toBeUndefined();
  });

  it('fires updateOrganization with `domain` for the domain section (Contact & Legal)', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => result.current.onChange({ domain: 'alkemio.io' }));

    await act(async () => {
      await result.current.onSaveSection('domain');
    });

    expect(mockUpdateOrganization).toHaveBeenCalledWith({
      variables: { input: { ID: 'org-1', domain: 'alkemio.io' } },
    });
  });

  it('fires updateOrganization with `contactEmail` for the contactEmail section', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => result.current.onChange({ contactEmail: 'press@alkemio.test' }));

    await act(async () => {
      await result.current.onSaveSection('contactEmail');
    });

    expect(mockUpdateOrganization).toHaveBeenCalledWith({
      variables: { input: { ID: 'org-1', contactEmail: 'press@alkemio.test' } },
    });
  });
});

describe('useOrgProfileTabData — onSaveSection (saving → error)', () => {
  it('captures an error status when the mutation rejects, preserving the typed value', async () => {
    mockUpdateOrganization.mockRejectedValueOnce(new Error('Network down'));
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => result.current.onChange({ tagline: 'New tagline' }));

    await act(async () => {
      await result.current.onSaveSection('tagline');
    });

    expect(result.current.saveStatusByField.tagline).toEqual({ kind: 'error', message: 'Network down' });
    // Dirty stays — user's typed values preserved.
    expect(result.current.dirtyByField.tagline).toBe(true);
    expect(result.current.values?.tagline).toBe('New tagline');
  });
});

describe('useOrgProfileTabData — error → idle on next edit', () => {
  it('clears the section error when the user edits the same section again', async () => {
    mockUpdateOrganization.mockRejectedValueOnce(new Error('Boom'));
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => result.current.onChange({ description: 'First attempt' }));
    await act(async () => {
      await result.current.onSaveSection('description');
    });
    expect(result.current.saveStatusByField.description?.kind).toBe('error');

    act(() => result.current.onChange({ description: 'Second attempt' }));
    expect(result.current.saveStatusByField.description).toBeUndefined();
  });
});

describe('useOrgProfileTabData — Keywords / Capabilities independence', () => {
  it('tracks keywords and capabilities dirty flags independently', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => {
      result.current.onChange({
        keywords: { ...result.current.values?.keywords, tags: ['governance', 'open-source', 'climate'] },
      });
    });

    expect(result.current.dirtyByField.keywords).toBe(true);
    expect(result.current.dirtyByField.capabilities).toBe(false);
  });

  it('saves Keywords with a patch targeting ONLY the Keywords tagset id', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => {
      result.current.onChange({
        keywords: { ...result.current.values?.keywords, tags: ['governance', 'open-source', 'climate'] },
      });
    });

    await act(async () => {
      await result.current.onSaveSection('keywords');
    });

    expect(mockUpdateOrganization).toHaveBeenCalledTimes(1);
    expect(mockUpdateOrganization).toHaveBeenCalledWith({
      variables: {
        input: {
          ID: 'org-1',
          profileData: { tagsets: [{ ID: 'tagset-keywords', tags: ['governance', 'open-source', 'climate'] }] },
        },
      },
    });
    expect(mockCreateTagset).not.toHaveBeenCalled();
  });

  it('saves Capabilities without touching the Keywords tagset', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => {
      result.current.onChange({
        capabilities: { ...result.current.values?.capabilities, tags: ['research', 'training'] },
      });
    });

    await act(async () => {
      await result.current.onSaveSection('capabilities');
    });

    expect(mockUpdateOrganization).toHaveBeenCalledTimes(1);
    expect(mockUpdateOrganization).toHaveBeenCalledWith({
      variables: {
        input: {
          ID: 'org-1',
          profileData: { tagsets: [{ ID: 'tagset-capabilities', tags: ['research', 'training'] }] },
        },
      },
    });
  });

  it('lazy-creates the Capabilities tagset on first save when the profile has none', async () => {
    const orgWithoutTagsets = {
      ...buildOrg(),
      profile: { ...buildOrg().profile, tagsets: [] },
    };
    mockOrgData = { lookup: { organization: orgWithoutTagsets } };

    mockCreateTagset.mockResolvedValueOnce({
      data: { createTagsetOnProfile: { id: 'tagset-capabilities-new' } },
    });
    mockRefetch.mockResolvedValueOnce({
      data: {
        lookup: {
          organization: {
            ...orgWithoutTagsets,
            profile: {
              ...orgWithoutTagsets.profile,
              tagsets: [{ id: 'tagset-capabilities-new', name: 'Capabilities', tags: ['research'] }],
            },
          },
        },
      },
    });

    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => {
      result.current.onChange({
        capabilities: { ...result.current.values?.capabilities, tags: ['research'] },
      });
    });

    await act(async () => {
      await result.current.onSaveSection('capabilities');
    });

    expect(mockCreateTagset).toHaveBeenCalledWith({
      variables: { input: { profileID: 'profile-1', name: 'CAPABILITIES', tags: ['research'] } },
    });
    // updateOrganization must NOT be called when lazy-creating — the create
    // mutation already persists the initial tags in one round-trip.
    expect(mockUpdateOrganization).not.toHaveBeenCalled();
    // After the post-save refetch, the buffer reflects the newly-created id.
    expect(result.current.values?.capabilities.id).toBe('tagset-capabilities-new');
  });
});

describe('useOrgProfileTabData — references batch', () => {
  it('patches existing rows + creates new ones via the References-section Save', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    // 1) Edit the existing arbitrary "Annual report" row.
    act(() => {
      result.current.onUpdateReference('ref-2', { uri: 'https://alkemio.test/report-2026' });
    });

    // 2) Add a new arbitrary row.
    act(() => result.current.onAddReference());
    const tempId = result.current.values?.references.find(r => r.id.startsWith('temp-'))?.id;
    expect(tempId).toBeDefined();
    act(() => {
      // biome-ignore lint/style/noNonNullAssertion: asserted defined above
      result.current.onUpdateReference(tempId!, { name: 'Bluesky', uri: 'https://bsky.app/profile/alkemio' });
    });

    // 3) Edit the recognized LinkedIn row's URI.
    act(() => {
      result.current.onUpdateRecognizedReference('linkedin', 'https://linkedin.com/company/alkemio-foundation');
    });

    await act(async () => {
      await result.current.onSaveSection('references');
    });

    // updateOrganization fires once with all existing-row patches.
    expect(mockUpdateOrganization).toHaveBeenCalledTimes(1);
    const updateCall = mockUpdateOrganization.mock.calls[0][0];
    expect(updateCall.variables.input.ID).toBe('org-1');
    expect(updateCall.variables.input.profileData.references).toHaveLength(2);

    // createReference fires once for the new arbitrary row.
    expect(mockCreateReference).toHaveBeenCalledTimes(1);
    expect(mockCreateReference).toHaveBeenCalledWith({
      variables: {
        input: {
          profileID: 'profile-1',
          name: 'Bluesky',
          uri: 'https://bsky.app/profile/alkemio',
          description: '',
        },
      },
    });

    expect(mockDeleteReference).not.toHaveBeenCalled();
  });

  it('fires deleteReference for an existing row removed via Confirm in the dialog', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    act(() => result.current.onRequestRemoveReference('ref-2'));
    expect(result.current.pendingReferenceDelete?.id).toBe('ref-2');

    act(() => result.current.onConfirmRemoveReference());
    expect(result.current.pendingReferenceDelete).toBeNull();
    // Locally, the row is gone from the buffer immediately.
    expect(result.current.values?.references.find(r => r.id === 'ref-2')).toBeUndefined();

    await act(async () => {
      await result.current.onSaveSection('references');
    });

    expect(mockDeleteReference).toHaveBeenCalledWith({ variables: { input: { ID: 'ref-2' } } });
  });
});

describe('useOrgProfileTabData — pendingReferenceDelete state machine (Rule #9 / FR-025 / FR-092)', () => {
  it('does NOT remove the row when the user cancels the dialog', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    const beforeCount = result.current.values?.references.length ?? 0;

    act(() => result.current.onRequestRemoveReference('ref-2'));
    expect(result.current.pendingReferenceDelete?.id).toBe('ref-2');

    act(() => result.current.onCancelRemoveReference());

    expect(result.current.pendingReferenceDelete).toBeNull();
    expect(result.current.values?.references.length).toBe(beforeCount);
  });

  it('uses the URI as the dialog body label when the row name is blank', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    act(() => result.current.onAddReference());
    const tempId = result.current.values?.references.find(r => r.id.startsWith('temp-'))?.id;
    expect(tempId).toBeDefined();
    act(() => {
      // biome-ignore lint/style/noNonNullAssertion: asserted defined above
      result.current.onUpdateReference(tempId!, { uri: 'https://blank-name.example' });
    });
    // biome-ignore lint/style/noNonNullAssertion: asserted defined above
    act(() => result.current.onRequestRemoveReference(tempId!));
    expect(result.current.pendingReferenceDelete?.name).toBe('https://blank-name.example');
  });
});

describe('useOrgProfileTabData — logo upload (FR-093, crop-then-commit)', () => {
  it('opens the crop dialog on file pick — does NOT fire uploadVisual immediately', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    const file = new File(['logo-bytes'], 'logo.png', { type: 'image/png' });
    act(() => result.current.onUploadAvatar(file));

    expect(result.current.pendingAvatarCrop?.file).toBe(file);
    expect(result.current.pendingAvatarCrop?.config.aspectRatio).toBeGreaterThan(0);
    expect(mockUploadVisual).not.toHaveBeenCalled();
  });

  it('cancel clears pendingAvatarCrop and fires no upload', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    const file = new File(['logo-bytes'], 'logo.png', { type: 'image/png' });
    act(() => result.current.onUploadAvatar(file));
    act(() => result.current.onAvatarCropCancel());

    expect(result.current.pendingAvatarCrop).toBeNull();
    expect(mockUploadVisual).not.toHaveBeenCalled();
  });

  it('crop save fires uploadVisual with the cropped file + alt text and updates the buffer', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));

    const original = new File(['logo-bytes'], 'logo.png', { type: 'image/png' });
    act(() => result.current.onUploadAvatar(original));

    const cropped = new File(['cropped-bytes'], 'logo.png', { type: 'image/png' });
    await act(async () => {
      result.current.onAvatarCropComplete(cropped, 'Org logo');
      await waitFor(() => expect(result.current.uploadingAvatar).toBe(false));
    });

    expect(result.current.pendingAvatarCrop).toBeNull();
    expect(mockUploadVisual).toHaveBeenCalledWith({
      variables: {
        file: cropped,
        uploadData: { visualID: 'visual-avatar', alternativeText: 'Org logo' },
      },
    });
    expect(result.current.values?.avatar.uri).toBe('https://example.test/new-logo.png');
  });
});

// ─── Format validators (pure helpers from orgProfileMapper) ───────────────

describe('orgProfileMapper — EMAIL_REGEX (live validation)', () => {
  it('accepts a typical address', () => {
    expect(EMAIL_REGEX.test('press@alkemio.test')).toBe(true);
  });

  it('rejects a value without `@`', () => {
    expect(EMAIL_REGEX.test('press.alkemio.test')).toBe(false);
  });

  it('rejects a value without a TLD', () => {
    expect(EMAIL_REGEX.test('press@alkemio')).toBe(false);
  });

  it('rejects a value with embedded whitespace', () => {
    expect(EMAIL_REGEX.test('press @alkemio.test')).toBe(false);
  });
});

describe('orgProfileMapper — isValidUrlOrEmpty (live validation, Website section)', () => {
  it('accepts an empty string (Website is optional)', () => {
    expect(isValidUrlOrEmpty('')).toBe(true);
  });

  it('accepts a fully-qualified https URL', () => {
    expect(isValidUrlOrEmpty('https://alkemio.test/about')).toBe(true);
  });

  it('rejects a domain-only value (the section requires a protocol)', () => {
    expect(isValidUrlOrEmpty('alkemio.test')).toBe(false);
  });

  it('rejects a value with embedded whitespace', () => {
    expect(isValidUrlOrEmpty('https://alkemio test')).toBe(false);
  });
});
