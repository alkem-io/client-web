import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SAVED_FLASH_MS } from '@/crd/components/common/FieldFooter';

// ─── Apollo hook mocks ────────────────────────────────────────────────────

const mockRefetch = vi.fn();
const mockUpdateUser = vi.fn();
const mockCreateReference = vi.fn();
const mockDeleteReference = vi.fn();
const mockCreateTagset = vi.fn();
const mockUploadVisual = vi.fn();

let mockUserData: { lookup: { user: ReturnType<typeof buildUser> | null } } | undefined;

function buildUser(overrides: Partial<ReturnType<typeof baseUserShape>> = {}) {
  return { ...baseUserShape(), ...overrides };
}

function baseUserShape() {
  return {
    id: 'user-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.test',
    phone: '5551234567',
    profile: {
      id: 'profile-1',
      displayName: 'Ada',
      tagline: 'Mathematician',
      description: 'Bio',
      location: { country: 'GB', city: 'London' },
      avatar: { id: 'visual-avatar', uri: 'https://example.test/avatar.png', alternativeText: null },
      references: [
        { id: 'ref-1', name: 'LinkedIn', uri: 'https://linkedin.com/in/ada', description: '' },
        { id: 'ref-2', name: 'Personal', uri: 'https://ada.example', description: 'Blog' },
      ],
      tagsets: [
        { id: 'tagset-skills', name: 'Skills', tags: ['typescript', 'react'] },
        { id: 'tagset-keywords', name: 'Keywords', tags: ['math', 'cs'] },
      ],
    },
  };
}

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserQuery: () => ({
    data: mockUserData,
    loading: false,
    error: undefined,
    refetch: mockRefetch,
  }),
  useUpdateUserMutation: () => [mockUpdateUser, { loading: false }],
  useCreateReferenceOnProfileMutation: () => [mockCreateReference, { loading: false }],
  useDeleteReferenceMutation: () => [mockDeleteReference, { loading: false }],
  useCreateTagsetOnProfileMutation: () => [mockCreateTagset, { loading: false }],
  useUploadVisualMutation: () => [mockUploadVisual, { loading: false }],
}));

// Import AFTER the mock so the hook captures the mocked module.
import useUserProfileTabData from '../useUserProfileTabData';

// ─── Lifecycle ────────────────────────────────────────────────────────────

beforeEach(() => {
  mockUserData = { lookup: { user: buildUser() } };
  mockRefetch.mockReset().mockResolvedValue({ data: { lookup: { user: buildUser() } } });
  mockUpdateUser.mockReset().mockResolvedValue({ data: {} });
  mockCreateReference.mockReset().mockResolvedValue({ data: {} });
  mockDeleteReference.mockReset().mockResolvedValue({ data: {} });
  mockCreateTagset.mockReset().mockResolvedValue({ data: {} });
  mockUploadVisual.mockReset().mockResolvedValue({
    data: {
      uploadImageOnVisual: { uri: 'https://example.test/new-avatar.png', alternativeText: null },
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Tests ────────────────────────────────────────────────────────────────

describe('useUserProfileTabData — initial state', () => {
  it('seeds the local buffer from the user query', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));
    expect(result.current.values?.displayName).toBe('Ada');
    expect(result.current.values?.email).toBe('ada@example.test');
    // Initial dirty map: nothing dirty.
    expect(Object.values(result.current.dirtyByField).every(v => v === false)).toBe(true);
  });

  it('returns null values when userId is undefined', () => {
    mockUserData = { lookup: { user: null } };
    const { result } = renderHook(() => useUserProfileTabData(undefined));
    expect(result.current.values).toBeNull();
  });
});

describe('useUserProfileTabData — onChange + dirty tracking', () => {
  it('flips dirtyByField for the changed section', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({ displayName: 'Ada Lovelace' });
    });

    expect(result.current.dirtyByField.displayName).toBe(true);
    expect(result.current.dirtyByField.firstName).toBe(false);
  });

  it('treats city/country edits as the compound location section', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({ city: 'Cambridge' });
    });

    expect(result.current.dirtyByField.location).toBe(true);
  });
});

describe('useUserProfileTabData — onSaveSection (idle → saving → saved → idle)', () => {
  it('flashes "Saved" then clears after SAVED_FLASH_MS', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({ displayName: 'Ada L.' });
    });

    let savePromise: Promise<void> = Promise.resolve();
    act(() => {
      savePromise = result.current.onSaveSection('displayName');
    });

    // Synchronously, the section is in `saving`.
    expect(result.current.saveStatusByField.displayName?.kind).toBe('saving');

    await act(async () => {
      await savePromise;
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      variables: { input: { ID: 'user-1', profileData: { displayName: 'Ada L.' } } },
    });
    expect(result.current.saveStatusByField.displayName?.kind).toBe('saved');

    // Advance past the flash window — the saved indicator clears.
    act(() => {
      vi.advanceTimersByTime(SAVED_FLASH_MS + 10);
    });
    expect(result.current.saveStatusByField.displayName).toBeUndefined();
  });
});

describe('useUserProfileTabData — onSaveSection (saving → error)', () => {
  it('captures an error status when the mutation rejects', async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error('Network down'));
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({ firstName: 'Augusta' });
    });

    await act(async () => {
      await result.current.onSaveSection('firstName');
    });

    expect(result.current.saveStatusByField.firstName).toEqual({
      kind: 'error',
      message: 'Network down',
    });
    // Dirty stays — user's typed values preserved.
    expect(result.current.dirtyByField.firstName).toBe(true);
    expect(result.current.values?.firstName).toBe('Augusta');
  });
});

describe('useUserProfileTabData — error → idle on next edit', () => {
  it('clears the section error when the user edits the same section again', async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error('Boom'));
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({ firstName: 'Augusta' });
    });
    await act(async () => {
      await result.current.onSaveSection('firstName');
    });
    expect(result.current.saveStatusByField.firstName?.kind).toBe('error');

    act(() => {
      result.current.onChange({ firstName: 'Augusta Ada' });
    });

    expect(result.current.saveStatusByField.firstName).toBeUndefined();
  });
});

describe('useUserProfileTabData — references batch', () => {
  it('combines patch existing + create new + delete pending into ONE Save call', async () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    // Capture the saved snapshot's "Personal" id before edits.
    const personalId = result.current.values?.references[0].id;

    // 1) Edit the existing arbitrary "Personal" row.
    act(() => {
      result.current.onUpdateReference(personalId ?? '', { uri: 'https://ada.io' });
    });

    // 2) Add a new arbitrary row.
    act(() => {
      result.current.onAddReference();
    });
    const tempId = result.current.values?.references.find(r => r.id.startsWith('temp-'))?.id;
    act(() => {
      result.current.onUpdateReference(tempId ?? '', { name: 'Twitter', uri: 'https://x.com/ada' });
    });

    // 3) Edit the recognized LinkedIn row's URI.
    act(() => {
      result.current.onUpdateRecognizedReference('linkedin', 'https://linkedin.com/in/lovelace');
    });

    await act(async () => {
      await result.current.onSaveSection('references');
    });

    // updateUser fires once with all existing-row patches (recognized LinkedIn + arbitrary Personal).
    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
    const updateCall = mockUpdateUser.mock.calls[0][0];
    expect(updateCall.variables.input.ID).toBe('user-1');
    expect(updateCall.variables.input.profileData.references).toHaveLength(2);

    // createReference fires once for the new arbitrary row.
    expect(mockCreateReference).toHaveBeenCalledTimes(1);
    expect(mockCreateReference).toHaveBeenCalledWith({
      variables: {
        input: {
          profileID: 'profile-1',
          name: 'Twitter',
          uri: 'https://x.com/ada',
          description: '',
        },
      },
    });

    // No deletes queued — never called.
    expect(mockDeleteReference).not.toHaveBeenCalled();
  });

  it('fires deleteReference for every arbitrary row removed via Confirm in the dialog', async () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    // Request removal of the arbitrary "Personal" row.
    act(() => {
      result.current.onRequestRemoveReference('ref-2');
    });
    expect(result.current.pendingReferenceDelete?.id).toBe('ref-2');

    act(() => {
      result.current.onConfirmRemoveReference();
    });
    expect(result.current.pendingReferenceDelete).toBeNull();
    // Locally, the row is gone from the buffer immediately.
    expect(result.current.values?.references.find(r => r.id === 'ref-2')).toBeUndefined();

    await act(async () => {
      await result.current.onSaveSection('references');
    });

    expect(mockDeleteReference).toHaveBeenCalledWith({ variables: { input: { ID: 'ref-2' } } });
  });
});

describe('useUserProfileTabData — pendingReferenceDelete state machine (Rule #9 / FR-025)', () => {
  it('does NOT remove the row when the user cancels the dialog', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    const beforeCount = result.current.values?.references.length ?? 0;

    act(() => {
      result.current.onRequestRemoveReference('ref-2');
    });
    expect(result.current.pendingReferenceDelete?.id).toBe('ref-2');

    act(() => {
      result.current.onCancelRemoveReference();
    });

    expect(result.current.pendingReferenceDelete).toBeNull();
    expect(result.current.values?.references.length).toBe(beforeCount);
  });

  it('uses the URI as the dialog body label when the row name is blank', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));
    act(() => {
      result.current.onAddReference();
    });
    const tempId = result.current.values?.references.find(r => r.id.startsWith('temp-'))?.id;
    act(() => {
      result.current.onUpdateReference(tempId ?? '', { uri: 'https://blank-name.example' });
    });
    act(() => {
      result.current.onRequestRemoveReference(tempId ?? '');
    });
    expect(result.current.pendingReferenceDelete?.name).toBe('https://blank-name.example');
  });
});

describe('useUserProfileTabData — avatar (FR-024 immediate commit)', () => {
  it('fires uploadVisual immediately on file select (no Save click)', async () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    const file = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });
    await act(async () => {
      result.current.onUploadAvatar(file);
      await waitFor(() => expect(result.current.uploadingAvatar).toBe(false));
    });

    expect(mockUploadVisual).toHaveBeenCalledWith({
      variables: {
        file,
        uploadData: { visualID: 'visual-avatar', alternativeText: undefined },
      },
    });
    // Buffer reflects the freshly-uploaded URI.
    expect(result.current.values?.avatar.uri).toBe('https://example.test/new-avatar.png');
  });
});

describe('useUserProfileTabData — Skills / Keywords independence', () => {
  it('tracks skills and keywords dirty flags independently', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({
        skills: { ...result.current.values?.skills, tags: ['typescript', 'react', 'node'] },
      });
    });

    expect(result.current.dirtyByField.skills).toBe(true);
    expect(result.current.dirtyByField.keywords).toBe(false);
  });

  it('saves Skills with a patch targeting ONLY the Skills tagset id', async () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({
        skills: { ...result.current.values?.skills, tags: ['typescript', 'react', 'node'] },
      });
    });

    await act(async () => {
      await result.current.onSaveSection('skills');
    });

    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateUser).toHaveBeenCalledWith({
      variables: {
        input: {
          ID: 'user-1',
          profileData: { tagsets: [{ ID: 'tagset-skills', tags: ['typescript', 'react', 'node'] }] },
        },
      },
    });
    // Keywords tagset id is NOT mentioned in the patch.
    expect(mockCreateTagset).not.toHaveBeenCalled();
  });

  it('saves Keywords without touching the Skills tagset', async () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({
        keywords: { ...result.current.values?.keywords, tags: ['governance'] },
      });
    });

    await act(async () => {
      await result.current.onSaveSection('keywords');
    });

    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateUser).toHaveBeenCalledWith({
      variables: {
        input: {
          ID: 'user-1',
          profileData: { tagsets: [{ ID: 'tagset-keywords', tags: ['governance'] }] },
        },
      },
    });
  });

  it('lazy-creates the Skills tagset on first save when the profile has none', async () => {
    // Server returns a user whose profile has no tagsets at all initially.
    const userWithoutTagsets = {
      ...buildUser(),
      profile: { ...buildUser().profile, tagsets: [] },
    };
    mockUserData = { lookup: { user: userWithoutTagsets } };

    // After createTagsetOnProfile fires, refetch sees the newly-created
    // tagset on the profile.
    mockCreateTagset.mockResolvedValueOnce({ data: { createTagsetOnProfile: { id: 'tagset-skills-new' } } });
    mockRefetch.mockResolvedValueOnce({
      data: {
        lookup: {
          user: {
            ...userWithoutTagsets,
            profile: {
              ...userWithoutTagsets.profile,
              tagsets: [{ id: 'tagset-skills-new', name: 'Skills', tags: ['typescript'] }],
            },
          },
        },
      },
    });

    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({
        skills: { ...result.current.values?.skills, tags: ['typescript'] },
      });
    });

    await act(async () => {
      await result.current.onSaveSection('skills');
    });

    expect(mockCreateTagset).toHaveBeenCalledWith({
      variables: { input: { profileID: 'profile-1', name: 'SKILLS', tags: ['typescript'] } },
    });
    // updateUser MUST NOT be called when lazy-creating — the create mutation
    // already persists the initial tags in one round-trip.
    expect(mockUpdateUser).not.toHaveBeenCalled();
    // After the post-save refetch, the buffer reflects the newly-created
    // tagset id (so a subsequent save patches via updateUser, not create).
    expect(result.current.values?.skills.id).toBe('tagset-skills-new');
  });
});
