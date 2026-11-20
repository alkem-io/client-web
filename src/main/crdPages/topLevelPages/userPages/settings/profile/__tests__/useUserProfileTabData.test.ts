import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  it('seeds the local buffer from the user query with nothing to save', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));
    expect(result.current.values?.displayName).toBe('Ada');
    expect(result.current.values?.email).toBe('ada@example.test');
    expect(result.current.unsaved.count).toBe(0);
  });

  it('returns null values when userId is undefined', () => {
    mockUserData = { lookup: { user: null } };
    const { result } = renderHook(() => useUserProfileTabData(undefined));
    expect(result.current.values).toBeNull();
  });
});

describe('useUserProfileTabData — unsaved changes', () => {
  it('counts one change per changed field, and none once a field is back to its saved value', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => result.current.onChange({ displayName: 'Ada L.', city: 'Paris', country: 'FR' }));
    expect(result.current.unsaved.count).toBe(3);

    act(() => result.current.onChange({ displayName: 'Ada' }));
    expect(result.current.unsaved.count).toBe(2);
  });

  it('counts each tagset, social link and reference change once', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onChange({ skills: { id: 'tagset-skills', tags: ['typescript'] } });
      result.current.onUpdateRecognizedReference('github', 'https://github.com/ada');
      result.current.onReferencesChange([{ name: 'Twitter', uri: 'https://x.com/ada', description: '' }]);
    });
    // Skills + new GitHub link + new Twitter row + removed "Personal" row.
    expect(result.current.unsaved.count).toBe(4);
  });

  it('cannot save while a required name is empty or the phone is malformed', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));
    expect(result.current.unsaved.canSave).toBe(true);
    expect(result.current.unsaved.saveBlockedReason).toBeUndefined();

    act(() => result.current.onChange({ lastName: ' ' }));
    expect(result.current.unsaved.canSave).toBe(false);
    expect(result.current.unsaved.saveBlockedReason).toBe('user.profile.identity.lastName.required');

    act(() => result.current.onChange({ lastName: 'Lovelace', phone: 'not a phone' }));
    expect(result.current.unsaved.canSave).toBe(false);
    expect(result.current.unsaved.saveBlockedReason).toBe('user.profile.socialLinks.phoneInvalidSaveBlocked');
  });

  it('reset puts every field back to its saved value', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));
    act(() => result.current.onChange({ tagline: 'Poet', bio: 'New bio' }));
    act(() => result.current.unsaved.reset());
    expect(result.current.values?.tagline).toBe('Mathematician');
    expect(result.current.unsaved.count).toBe(0);
  });
});

describe('useUserProfileTabData — saveAll', () => {
  it('sends every changed field in ONE updateUser call', async () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));
    act(() => result.current.onChange({ firstName: 'Augusta', tagline: 'Poet', city: 'Paris' }));

    let ok = false;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(true);
    expect(mockUpdateUser).toHaveBeenCalledTimes(1);
    expect(mockUpdateUser).toHaveBeenCalledWith({
      variables: {
        input: {
          ID: 'user-1',
          firstName: 'Augusta',
          profileData: { tagline: 'Poet', location: { city: 'Paris', country: 'GB' } },
        },
      },
    });
    expect(result.current.unsaved.error).toBeNull();
  });

  it('keeps the typed values and reports the error when the update fails', async () => {
    mockUpdateUser.mockRejectedValueOnce(new Error('Server says no'));
    const { result } = renderHook(() => useUserProfileTabData('user-1'));
    act(() => result.current.onChange({ displayName: 'Ada L.' }));

    let ok = true;
    await act(async () => {
      ok = await result.current.unsaved.saveAll();
    });

    expect(ok).toBe(false);
    expect(result.current.unsaved.error).toBe('Server says no');
    expect(result.current.values?.displayName).toBe('Ada L.');
    expect(result.current.unsaved.count).toBe(1);
  });

  it('reports the Save as failed when the refresh afterwards fails, so a retry cannot create the references twice', async () => {
    mockRefetch.mockRejectedValueOnce(new Error('Network down'));
    const { result } = renderHook(() => useUserProfileTabData('user-1'));
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
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    act(() => {
      result.current.onUpdateRecognizedReference('linkedin', 'https://linkedin.com/in/lovelace');
      result.current.onUpdateRecognizedReference('github', 'https://github.com/ada');
      // The shared editor emits the full arbitrary list: "Personal" removed, "Twitter" added.
      result.current.onReferencesChange([{ name: 'Twitter', uri: 'https://x.com/ada', description: '' }]);
    });

    await act(async () => {
      await result.current.unsaved.saveAll();
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      variables: {
        input: {
          ID: 'user-1',
          profileData: {
            references: [{ ID: 'ref-1', name: 'LinkedIn', uri: 'https://linkedin.com/in/lovelace', description: '' }],
          },
        },
      },
    });
    expect(mockCreateReference).toHaveBeenCalledTimes(2);
    expect(mockCreateReference).toHaveBeenCalledWith({
      variables: { input: { profileID: 'profile-1', name: 'Twitter', uri: 'https://x.com/ada', description: '' } },
    });
    expect(mockCreateReference).toHaveBeenCalledWith({
      variables: { input: { profileID: 'profile-1', name: 'github', uri: 'https://github.com/ada', description: '' } },
    });
    expect(mockDeleteReference).toHaveBeenCalledWith({ variables: { input: { ID: 'ref-2' } } });
  });

  it('patches only the changed tagset', async () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));
    act(() => result.current.onChange({ keywords: { id: 'tagset-keywords', tags: ['math'] } }));

    await act(async () => {
      await result.current.unsaved.saveAll();
    });

    expect(mockUpdateUser).toHaveBeenCalledWith({
      variables: { input: { ID: 'user-1', profileData: { tagsets: [{ ID: 'tagset-keywords', tags: ['math'] }] } } },
    });
  });

  it('lazy-creates the Skills tagset when the profile has none', async () => {
    const userWithoutTagsets = { ...buildUser(), profile: { ...buildUser().profile, tagsets: [] } };
    const userWithSkills = {
      ...userWithoutTagsets,
      profile: {
        ...userWithoutTagsets.profile,
        tagsets: [{ id: 'tagset-skills-new', name: 'Skills', tags: ['typescript'] }],
      },
    };
    mockUserData = { lookup: { user: userWithoutTagsets } };
    mockRefetch.mockImplementationOnce(async () => {
      mockUserData = { lookup: { user: userWithSkills } };
      return { data: mockUserData };
    });

    const { result, rerender } = renderHook(() => useUserProfileTabData('user-1'));
    act(() => result.current.onChange({ skills: { tags: ['typescript'] } }));

    await act(async () => {
      await result.current.unsaved.saveAll();
    });
    rerender();

    expect(mockCreateTagset).toHaveBeenCalledWith({
      variables: { input: { profileID: 'profile-1', name: 'SKILLS', tags: ['typescript'] } },
    });
    // The create persists the tags itself; no updateUser is needed.
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(result.current.values?.skills.id).toBe('tagset-skills-new');
    expect(result.current.unsaved.count).toBe(0);
  });
});

describe('useUserProfileTabData — avatar (FR-024, crop-then-commit)', () => {
  it('opens the crop dialog on file pick — does NOT fire uploadVisual immediately', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    const file = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });
    act(() => result.current.onUploadAvatar(file));

    expect(result.current.pendingAvatarCrop?.file).toBe(file);
    expect(result.current.pendingAvatarCrop?.config.aspectRatio).toBeGreaterThan(0);
    expect(mockUploadVisual).not.toHaveBeenCalled();
  });

  it('cancel clears pendingAvatarCrop and fires no upload', () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    const file = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });
    act(() => result.current.onUploadAvatar(file));
    act(() => result.current.onAvatarCropCancel());

    expect(result.current.pendingAvatarCrop).toBeNull();
    expect(mockUploadVisual).not.toHaveBeenCalled();
  });

  it('crop save fires uploadVisual with the cropped file + alt text and updates the buffer', async () => {
    const { result } = renderHook(() => useUserProfileTabData('user-1'));

    const original = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });
    act(() => result.current.onUploadAvatar(original));

    const cropped = new File(['cropped-bytes'], 'avatar.png', { type: 'image/png' });
    await act(async () => {
      result.current.onAvatarCropComplete(cropped, 'My avatar');
      await waitFor(() => expect(result.current.uploadingAvatar).toBe(false));
    });

    expect(result.current.pendingAvatarCrop).toBeNull();
    expect(mockUploadVisual).toHaveBeenCalledWith({
      variables: {
        file: cropped,
        uploadData: { visualID: 'visual-avatar', alternativeText: 'My avatar' },
      },
    });
    expect(result.current.values?.avatar.uri).toBe('https://example.test/new-avatar.png');
  });
});
