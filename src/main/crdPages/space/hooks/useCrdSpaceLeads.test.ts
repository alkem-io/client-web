import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { LeadItem } from '@/crd/components/space/sidebar/InfoBlock';

const mockContactability = vi.fn();
let mockUserId: string | undefined = 'me';

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceAboutDetailsQuery: () => ({
    loading: false,
    data: {
      lookup: {
        space: {
          about: {
            membership: {
              leadUsers: [
                { id: 'u-on', profile: { displayName: 'Open', url: '/u/open' } },
                { id: 'u-off', profile: { displayName: 'Closed', url: '/u/closed' } },
              ],
              leadOrganizations: [],
            },
          },
        },
      },
    },
  }),
  useUsersContactabilityQuery: (options: unknown) => mockContactability(options),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: mockUserId ? { id: mockUserId } : undefined }),
}));

const { useCrdSpaceLeads } = await import('./useCrdSpaceLeads');

const canMessage = (leads: LeadItem[], id: string) => leads.find(lead => lead.id === id)?.preview?.canMessage;

describe('useCrdSpaceLeads contactability', () => {
  beforeEach(() => {
    mockUserId = 'me';
    mockContactability.mockReset();
  });

  test('only a lead who accepts messages keeps the Message action', () => {
    mockContactability.mockReturnValue({
      data: {
        users: [
          { id: 'u-on', isContactable: true },
          { id: 'u-off', isContactable: false },
        ],
      },
    });
    const { result } = renderHook(() => useCrdSpaceLeads('space-1'));
    expect(canMessage(result.current.leads, 'u-on')).toBe(true);
    expect(canMessage(result.current.leads, 'u-off')).toBe(false);
    expect(mockContactability).toHaveBeenCalledWith({ variables: { ids: ['u-off', 'u-on'] }, skip: false });
  });

  test('no lead offers Message until the answer arrives', () => {
    mockContactability.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useCrdSpaceLeads('space-1'));
    expect(canMessage(result.current.leads, 'u-on')).toBe(false);
  });

  test('a signed-out viewer never sends the query', () => {
    mockUserId = undefined;
    mockContactability.mockReturnValue({ data: undefined });
    renderHook(() => useCrdSpaceLeads('space-1'));
    expect(mockContactability).not.toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
  });
});
