import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CrdSubspaceAboutPage from './CrdSubspaceAboutPage';

const navigate = vi.fn();
let onClose: (() => void) | undefined;
let canRead = false;
let closestReadable: { id: string } | null = null;
let root: { id: string; url: string } | undefined = { id: 'root', url: '/root' };

vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigate }));
vi.mock('./CrdSubspaceAbout', () => ({
  CrdSubspaceAbout: (props: { onClose: () => void }) => {
    onClose = props.onClose;
    return null;
  },
}));
vi.mock('@/domain/space/hooks/useSubSpace', () => ({
  useSubSpace: () => ({ subspace: { about: { profile: { url: '/root/challenges/l1' } } }, permissions: { canRead } }),
}));
vi.mock('@/main/routing/urlResolver/native/useNativeRouteSpace', () => ({ useNativeRouteSpace: () => ({ root }) }));
vi.mock('@/core/apollo/generated-v2/apollo-hooks', () => ({
  useNativeRouteResolutionQuery: () => ({ data: { resolve: { closestReadable } } }),
}));

const close = () => {
  render(
    <MemoryRouter initialEntries={['/root/challenges/l1/about']}>
      <CrdSubspaceAboutPage />
    </MemoryRouter>
  );
  onClose?.();
};

describe('CrdSubspaceAboutPage close (021 T021)', () => {
  beforeEach(() => {
    navigate.mockClear();
    canRead = false;
    closestReadable = null;
    root = { id: 'root', url: '/root' };
  });

  test('goes to the subspace when the viewer reads it', () => {
    canRead = true;
    close();
    expect(navigate).toHaveBeenCalledWith('/root/challenges/l1');
  });

  test('else to the root when the root is the closest readable space', () => {
    closestReadable = { id: 'root' };
    close();
    expect(navigate).toHaveBeenCalledWith('/root');
  });

  test('else home, also when no depth-0 ancestor is returned', () => {
    close();
    expect(navigate).toHaveBeenCalledWith('/home');
    navigate.mockClear();
    root = undefined;
    closestReadable = { id: 'root' };
    close();
    expect(navigate).toHaveBeenCalledWith('/home');
  });
});
