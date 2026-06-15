import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NAMEID_MAX_LENGTH } from '@/core/ui/forms/validator/nameIdValidator';
import createNameId from '@/core/utils/nameId/createNameId';

// The Create Space slug field auto-derives its `nameID` with the canonical
// `createNameId` helper (the same routine the server uses), replicating the MUI
// `NameIdField`. These cases pin the behavior the dialog relies on.
describe('Create Space slug derivation (createNameId)', () => {
  it('lowercases and strips spaces (no hyphenation between words)', () => {
    expect(createNameId('Climate Innovation Hub')).toBe('climateinnovationhub');
  });

  it('folds accented characters to their base letters', () => {
    expect(createNameId('Café Münch')).toBe('cafemunch');
  });

  it('keeps existing hyphens and digits', () => {
    expect(createNameId('my-space-2026')).toBe('my-space-2026');
  });

  it('removes punctuation and other disallowed characters', () => {
    expect(createNameId('Hello, World! & Co.')).toBe('helloworldco');
  });

  it('is always lowercase', () => {
    expect(createNameId('UPPER Case Name')).toBe(createNameId('UPPER Case Name').toLowerCase());
  });

  it('produces output matching the nameId format rule [a-z0-9-]', () => {
    expect(createNameId('My Awesome Space!')).toMatch(/^[a-z0-9-]*$/);
  });

  it(`caps the slug at NAMEID_MAX_LENGTH (${NAMEID_MAX_LENGTH}) characters`, () => {
    expect(createNameId('a'.repeat(NAMEID_MAX_LENGTH + 20)).length).toBeLessThanOrEqual(NAMEID_MAX_LENGTH);
  });

  it('returns an empty string when no allowed characters remain', () => {
    expect(createNameId('!!!   ')).toBe('');
  });
});

// ---- useCreateSpace hook ----
// The hook is the only GraphQL<->props seam; its domain/Apollo dependencies are
// mocked so the tests exercise the hook's own logic (slug lock, plan gating,
// crop alt-text capture, submit mapping) in isolation.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/apollo/generated/graphql-schema', () => ({
  VisualType: { Banner: 'BANNER', Card: 'CARD', Avatar: 'AVATAR' },
}));

const CONSTRAINTS = { aspectRatio: 3, maxWidth: 1920, maxHeight: 640, minWidth: 384, minHeight: 128 };
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useDefaultVisualTypeConstraintsQuery: () => ({
    data: { platform: { configuration: { defaultVisualTypeConstraints: CONSTRAINTS } } },
  }),
  useTemplateContentLazyQuery: () => [getTemplateContentMock],
}));

const getTemplateContentMock = vi.fn();

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigateMock }));

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));

const infoMock = vi.fn();
vi.mock('@/core/logging/sentry/log', () => ({
  info: (...args: unknown[]) => infoMock(...args),
  TagCategoryValues: { SPACE_CREATION: 'SPACE_CREATION' },
}));

const addSpaceWelcomeCacheMock = vi.fn();
vi.mock('@/domain/space/components/CreateSpace/utils', () => ({
  addSpaceWelcomeCache: (id: string) => addSpaceWelcomeCacheMock(id),
}));

const createSpaceMock = vi.fn();
vi.mock('@/domain/space/components/CreateSpace/hooks/useSpaceCreation/useSpaceCreation', () => ({
  useSpaceCreation: () => ({ createSpace: createSpaceMock, loading: false }),
}));

let availablePlans: { id: string }[] = [{ id: 'plan-1' }];
vi.mock('@/domain/space/components/CreateSpace/hooks/spacePlans/useSpacePlans', () => ({
  useSpacePlans: () => ({ availablePlans, loading: false }),
}));

vi.mock('@/main/topLevelPages/myDashboard/DashboardWithMemberships/DashboardSpaces/useDashboardSpaces', () => ({
  useDashboardSpaces: () => ({ refetchSpaces: vi.fn() }),
}));

vi.mock('@/main/crdPages/templates/templateContentMapper', () => ({
  mapTemplateContent: () => ({ type: 'space', phases: [] }),
}));

const clearSelectionMock = vi.fn();
vi.mock('@/main/crdPages/templates/useTemplatePicker', () => ({
  useTemplatePicker: () => ({
    selectedTemplateId: null,
    pickerProps: {},
    openPicker: vi.fn(),
    clearSelection: clearSelectionMock,
  }),
}));

import { useCreateSpace } from './useCreateSpace';

const ACCOUNT_ID = 'account-1';

describe('useCreateSpace', () => {
  beforeEach(() => {
    availablePlans = [{ id: 'plan-1' }];
    createSpaceMock.mockReset();
    navigateMock.mockReset();
    notifyMock.mockReset();
    infoMock.mockReset();
    addSpaceWelcomeCacheMock.mockReset();
    clearSelectionMock.mockReset();
    getTemplateContentMock.mockReset();
  });

  afterEach(() => vi.clearAllMocks());

  const setup = (onClose = vi.fn(), onSpaceCreated?: (s: unknown) => void) =>
    renderHook(() => useCreateSpace({ open: true, accountId: ACCOUNT_ID, onClose, onSpaceCreated } as never));

  it('auto-derives the slug from the name until the user edits it', () => {
    const { result } = setup();
    act(() => result.current.onChange({ displayName: 'Climate Innovation Hub' }));
    expect(result.current.values.nameId).toBe('climateinnovationhub');
  });

  it('locks the slug once the user edits it, so later name changes leave it alone', () => {
    const { result } = setup();
    act(() => result.current.onChange({ nameId: 'my-custom-slug' }));
    act(() => result.current.onChange({ displayName: 'A Totally Different Name' }));
    expect(result.current.values.nameId).toBe('my-custom-slug');
  });

  it('blocks submission and reports no available plan when the account has none', () => {
    availablePlans = [];
    const { result } = setup();
    act(() => result.current.onChange({ displayName: 'Valid Name', acceptedTerms: true }));
    expect(result.current.noPlanAvailable).toBe(true);
    expect(result.current.canSubmit).toBe(false);
  });

  it('enables submit only for a valid, terms-accepted form with an available plan', () => {
    const { result } = setup();
    expect(result.current.canSubmit).toBe(false); // empty form
    act(() => result.current.onChange({ displayName: 'Valid Name' }));
    expect(result.current.canSubmit).toBe(false); // terms not accepted
    act(() => result.current.onChange({ acceptedTerms: true }));
    expect(result.current.canSubmit).toBe(true);
  });

  it('routes a freshly picked banner image through the crop dialog and captures its alt text', () => {
    const { result } = setup();
    const picked = new File(['x'], 'banner.png', { type: 'image/png' });
    act(() => result.current.onChange({ bannerFile: picked }));
    // The raw pick does not land in form state — it opens the crop dialog instead.
    expect(result.current.values.bannerFile).toBeNull();
    expect(result.current.pendingCrop?.key).toBe('bannerFile');

    const cropped = new File(['y'], 'banner-cropped.png', { type: 'image/png' });
    act(() => result.current.onCropComplete(cropped, 'A blue banner'));
    expect(result.current.values.bannerFile).toBe(cropped);
    expect(result.current.pendingCrop).toBeNull();
  });

  it('maps trimmed values, the license plan, and cropped visual alt text into createSpace, then navigates', async () => {
    createSpaceMock.mockResolvedValue({ id: 'space-1', about: { profile: { url: '/space/climate' } } });
    const onClose = vi.fn();
    const { result } = setup(onClose);

    act(() => result.current.onChange({ displayName: '  Climate Hub  ', tagline: '  Tagline  ', acceptedTerms: true }));
    const picked = new File(['x'], 'banner.png', { type: 'image/png' });
    act(() => result.current.onChange({ bannerFile: picked }));
    const cropped = new File(['y'], 'banner-cropped.png', { type: 'image/png' });
    act(() => result.current.onCropComplete(cropped, 'A blue banner'));

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(createSpaceMock).toHaveBeenCalledTimes(1);
    const arg = createSpaceMock.mock.calls[0][0];
    expect(arg.accountId).toBe(ACCOUNT_ID);
    expect(arg.licensePlanId).toBe('plan-1');
    expect(arg.nameId).toBe('climatehub');
    expect(arg.about.profile.displayName).toBe('Climate Hub');
    expect(arg.about.profile.tagline).toBe('Tagline');
    expect(arg.about.profile.visuals.banner).toEqual({ file: cropped, altText: 'A blue banner' });
    expect(addSpaceWelcomeCacheMock).toHaveBeenCalledWith('space-1');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/space/climate');
  });

  it('keeps the dialog open (no navigation) when the create mutation rejects', async () => {
    createSpaceMock.mockRejectedValue(new Error('server boom'));
    const onClose = vi.fn();
    const { result } = setup(onClose);

    act(() => result.current.onChange({ displayName: 'Climate Hub', acceptedTerms: true }));
    await act(async () => {
      await result.current.onSubmit();
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
