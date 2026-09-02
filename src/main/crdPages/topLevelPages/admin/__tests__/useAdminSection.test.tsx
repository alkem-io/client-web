import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { useAdminSection } from '../useAdminSection';

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({
  default: () => navigateMock,
}));

const wrapperAt =
  (path: string) =>
  ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;

const activeSectionAt = (path: string) =>
  renderHook(() => useAdminSection(), { wrapper: wrapperAt(path) }).result.current.activeSection;

describe('useAdminSection', () => {
  test('derives the active section from the URL segment after /admin', () => {
    expect(activeSectionAt('/admin/users')).toBe('users');
    expect(activeSectionAt('/admin/organizations')).toBe('organizations');
  });

  test('handles hyphenated path quirks (virtual-contributors, authorization-policies)', () => {
    expect(activeSectionAt('/admin/virtual-contributors')).toBe('virtual-contributors');
    expect(activeSectionAt('/admin/authorization-policies')).toBe('authorization-policies');
  });

  test('derives the section from deep links (detail / sub-routes)', () => {
    expect(activeSectionAt('/admin/users/jdoe/edit')).toBe('users');
  });

  test('falls back to spaces for the bare /admin path or an unknown section', () => {
    expect(activeSectionAt('/admin')).toBe('spaces');
    expect(activeSectionAt('/admin/not-a-section')).toBe('spaces');
  });

  test('onSectionChange navigates to the canonical section path', () => {
    navigateMock.mockClear();
    const { result } = renderHook(() => useAdminSection(), { wrapper: wrapperAt('/admin/spaces') });
    result.current.onSectionChange('transfer');
    expect(navigateMock).toHaveBeenCalledWith('/admin/transfer');
  });
});
