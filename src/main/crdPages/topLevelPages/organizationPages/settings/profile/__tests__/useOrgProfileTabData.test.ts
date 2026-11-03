import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    expect(result.current.unsaved.count).toBe(0);
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

describe('useOrgProfileTabData — unsaved changes', () => {
  it('counts one change per changed field across Identity, About and Contact & Legal', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    act(() => result.current.onChange({ tagline: 'New tagline', city: 'Utrecht', domain: 'alkemio.org' }));
    expect(result.current.unsaved.count).toBe(3);
  });

  it('cannot save with an empty Display Name, a malformed contact email or website', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    expect(result.current.unsaved.canSave).toBe(true);

    act(() => result.current.onChange({ displayName: '' }));
    expect(result.current.unsaved.canSave).toBe(false);

    act(() => result.current.onChange({ displayName: 'Alkemio', contactEmail: 'press.alkemio.test' }));
    expect(result.current.unsaved.canSave).toBe(false);

    act(() => result.current.onChange({ contactEmail: 'press@alkemio.test', website: 'alkemio test' }));
    expect(result.current.unsaved.canSave).toBe(false);
  });

  it('reset puts every field back to its saved value', () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    act(() => result.current.onChange({ legalEntityName: 'Other', keywords: { id: 'tagset-keywords', tags: [] } }));
    act(() => result.current.unsaved.reset());
    expect(result.current.values?.legalEntityName).toBe('Alkemio Foundation');
    expect(result.current.unsaved.count).toBe(0);
  });
});

describe('useOrgProfileTabData — saveAll', () => {
  it('sends organization and profile fields in ONE updateOrganization call', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    act(() =>
      result.current.onChange({
        displayName: 'Alkemio B.V.',
        contactEmail: 'press@alkemio.test',
        domain: 'alkemio.org',
      })
    );

    let ok = false;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(true);
    expect(mockUpdateOrganization).toHaveBeenCalledTimes(1);
    expect(mockUpdateOrganization).toHaveBeenCalledWith({
      variables: {
        input: {
          ID: 'org-1',
          contactEmail: 'press@alkemio.test',
          domain: 'alkemio.org',
          profileData: { displayName: 'Alkemio B.V.' },
        },
      },
    });
  });

  it('keeps the typed values and reports the error when the update fails', async () => {
    mockUpdateOrganization.mockRejectedValueOnce(new Error('Server says no'));
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    act(() => result.current.onChange({ website: 'https://alkemio.org' }));

    let ok = true;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toBe('Server says no');
    expect(result.current.values?.website).toBe('https://alkemio.org');
    expect(result.current.unsaved.count).toBe(1);
  });

  it('patches only the changed tagset, leaving the other one alone', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    act(() => result.current.onChange({ capabilities: { id: 'tagset-capabilities', tags: ['research'] } }));

    await act(async () => {
      await result.current.unsaved.saveAll();
    });

    expect(mockUpdateOrganization).toHaveBeenCalledWith({
      variables: {
        input: { ID: 'org-1', profileData: { tagsets: [{ ID: 'tagset-capabilities', tags: ['research'] }] } },
      },
    });
  });

  it('lazy-creates the Capabilities tagset when the profile has none', async () => {
    mockOrgData = {
      lookup: {
        organization: {
          ...buildOrg(),
          profile: { ...buildOrg().profile, tagsets: [buildOrg().profile.tagsets[0]] },
        },
      },
    };
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    act(() => result.current.onChange({ capabilities: { tags: ['training'] } }));

    await act(async () => {
      await result.current.unsaved.saveAll();
    });

    expect(mockCreateTagset).toHaveBeenCalledWith({
      variables: { input: { profileID: 'profile-1', name: 'CAPABILITIES', tags: ['training'] } },
    });
    expect(mockUpdateOrganization).not.toHaveBeenCalled();
  });

  it('reports the Save as failed when the refresh afterwards fails, so a retry cannot create the references twice', async () => {
    mockRefetch.mockRejectedValueOnce(new Error('Network down'));
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    act(() => result.current.onReferencesChange([{ name: 'Blog', uri: 'https://blog.test', description: '' }]));

    let ok = true;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(mockCreateReference).toHaveBeenCalledTimes(1);
    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toBe('Network down');
  });

  it('patches edited references and creates and deletes the others', async () => {
    const { result } = renderHook(() => useOrgProfileTabData('org-1'));
    act(() => {
      result.current.onUpdateRecognizedReference('linkedin', 'https://linkedin.com/company/alkemio-io');
      result.current.onReferencesChange([{ name: 'Press kit', uri: 'https://alkemio.test/press', description: '' }]);
    });

    await act(async () => {
      await result.current.unsaved.saveAll();
    });

    expect(mockUpdateOrganization).toHaveBeenCalledWith({
      variables: {
        input: {
          ID: 'org-1',
          profileData: {
            references: [
              { ID: 'ref-1', name: 'LinkedIn', uri: 'https://linkedin.com/company/alkemio-io', description: '' },
            ],
          },
        },
      },
    });
    expect(mockCreateReference).toHaveBeenCalledWith({
      variables: {
        input: { profileID: 'profile-1', name: 'Press kit', uri: 'https://alkemio.test/press', description: '' },
      },
    });
    expect(mockDeleteReference).toHaveBeenCalledWith({ variables: { input: { ID: 'ref-2' } } });
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

describe('orgProfileMapper — EMAIL_REGEX', () => {
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

describe('orgProfileMapper — isValidUrlOrEmpty', () => {
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
