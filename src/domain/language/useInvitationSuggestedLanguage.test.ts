/**
 * T012 paired tests — useInvitationSuggestedLanguage (DL-7 / R-6 determinism).
 *
 * Covers:
 *  - skip for unauthenticated users
 *  - skip when account already has a language set
 *  - skip when account languageOfferAnswered = true
 *  - no invitations → null
 *  - single eligible suggestion returned
 *  - two eligible suggestions: latest createdDate wins (DL-7)
 *  - latest invitation ineligible (null suggestedLanguage) → next-latest eligible wins
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// ── mocks ────────────────────────────────────────────────────────────────────

const mockUseCurrentUserContext = vi.fn();
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => mockUseCurrentUserContext(),
}));

const mockUseUserPendingMembershipsQuery = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserPendingMembershipsQuery: (opts: unknown) => mockUseUserPendingMembershipsQuery(opts),
}));

// ── helpers ──────────────────────────────────────────────────────────────────

type MinimalUser = {
  settings?: {
    language?: string | null;
    languageOfferAnswered?: boolean;
  };
};

const makeUserCtx = (overrides: { isAuthenticated?: boolean; user?: MinimalUser } = {}) => ({
  isAuthenticated: overrides.isAuthenticated ?? true,
  userModel: overrides.user ?? { settings: { language: null, languageOfferAnswered: false } },
});

const makeInvitation = (suggestedLanguage: string | null, createdDate: string) => ({
  id: `inv-${createdDate}`,
  invitation: {
    id: `inv-${createdDate}`,
    suggestedLanguage,
    createdDate,
  },
});

// ── tests ────────────────────────────────────────────────────────────────────

describe('useInvitationSuggestedLanguage', () => {
  it('returns null for unauthenticated users (skip=true)', async () => {
    mockUseCurrentUserContext.mockReturnValue(makeUserCtx({ isAuthenticated: false }));
    mockUseUserPendingMembershipsQuery.mockReturnValue({ data: undefined });

    const { useInvitationSuggestedLanguage } = await import('./useInvitationSuggestedLanguage');
    const { result } = renderHook(() => useInvitationSuggestedLanguage());

    expect(result.current).toBeNull();
    // Query must have been called with skip=true
    expect(mockUseUserPendingMembershipsQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
  });

  it('returns null when account already has language set (skip=true)', async () => {
    mockUseCurrentUserContext.mockReturnValue(
      makeUserCtx({ user: { settings: { language: 'nl', languageOfferAnswered: false } } })
    );
    mockUseUserPendingMembershipsQuery.mockReturnValue({ data: undefined });

    const { useInvitationSuggestedLanguage } = await import('./useInvitationSuggestedLanguage');
    const { result } = renderHook(() => useInvitationSuggestedLanguage());

    expect(result.current).toBeNull();
    expect(mockUseUserPendingMembershipsQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
  });

  it('returns null when languageOfferAnswered=true (skip=true)', async () => {
    mockUseCurrentUserContext.mockReturnValue(
      makeUserCtx({ user: { settings: { language: null, languageOfferAnswered: true } } })
    );
    mockUseUserPendingMembershipsQuery.mockReturnValue({ data: undefined });

    const { useInvitationSuggestedLanguage } = await import('./useInvitationSuggestedLanguage');
    const { result } = renderHook(() => useInvitationSuggestedLanguage());

    expect(result.current).toBeNull();
  });

  it('returns null when no pending invitations', async () => {
    mockUseCurrentUserContext.mockReturnValue(makeUserCtx());
    mockUseUserPendingMembershipsQuery.mockReturnValue({
      data: { me: { communityInvitations: [] } },
    });

    const { useInvitationSuggestedLanguage } = await import('./useInvitationSuggestedLanguage');
    const { result } = renderHook(() => useInvitationSuggestedLanguage());

    expect(result.current).toBeNull();
  });

  it('returns the single eligible suggestion', async () => {
    mockUseCurrentUserContext.mockReturnValue(makeUserCtx());
    mockUseUserPendingMembershipsQuery.mockReturnValue({
      data: {
        me: {
          communityInvitations: [makeInvitation('nl', '2024-01-10T10:00:00Z')],
        },
      },
    });

    const { useInvitationSuggestedLanguage } = await import('./useInvitationSuggestedLanguage');
    const { result } = renderHook(() => useInvitationSuggestedLanguage());

    expect(result.current).toBe('nl');
  });

  it('returns latest-created suggestion when two eligible invitations exist (DL-7 determinism)', async () => {
    mockUseCurrentUserContext.mockReturnValue(makeUserCtx());
    mockUseUserPendingMembershipsQuery.mockReturnValue({
      data: {
        me: {
          communityInvitations: [
            // Older invitation comes FIRST in array — but latest must win.
            makeInvitation('nl', '2024-01-05T08:00:00Z'),
            makeInvitation('de', '2024-01-10T15:00:00Z'),
          ],
        },
      },
    });

    const { useInvitationSuggestedLanguage } = await import('./useInvitationSuggestedLanguage');
    const { result } = renderHook(() => useInvitationSuggestedLanguage());

    // 'de' has a later createdDate, so it should win regardless of array order.
    expect(result.current).toBe('de');
  });

  it('skips ineligible (null suggestedLanguage) invitations and returns next-latest eligible', async () => {
    mockUseCurrentUserContext.mockReturnValue(makeUserCtx());
    mockUseUserPendingMembershipsQuery.mockReturnValue({
      data: {
        me: {
          communityInvitations: [
            // Latest has no suggestion — should be skipped.
            makeInvitation(null, '2024-02-01T12:00:00Z'),
            makeInvitation('es', '2024-01-15T09:00:00Z'),
            makeInvitation('nl', '2024-01-01T00:00:00Z'),
          ],
        },
      },
    });

    const { useInvitationSuggestedLanguage } = await import('./useInvitationSuggestedLanguage');
    const { result } = renderHook(() => useInvitationSuggestedLanguage());

    // null invitation skipped; 'es' has the later eligible createdDate.
    expect(result.current).toBe('es');
  });
});
