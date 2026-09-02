import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { ClosestAncestor } from '@/core/40XErrorHandler/40XErrors';
import { UrlType } from '@/core/apollo/generated/graphql-schema';

// ---- Mocks ----

// The CRD dialog is the only thing the dispatcher renders. Stub it to a flat
// node and capture the `closestAncestor` it receives so we assert the prop is
// forwarded unchanged.
const crdDialogSpy = vi.fn();
vi.mock('@/main/crdPages/error/CrdRedirectToAncestorDialog', () => ({
  CrdRedirectToAncestorDialog: (props: { closestAncestor: ClosestAncestor }) => {
    crdDialogSpy(props);
    return <div data-testid="crd-redirect-dialog">CRD dialog</div>;
  },
}));

import { AncestorRedirectDispatcher } from './AncestorRedirectDispatcher';

const ancestor: ClosestAncestor = {
  url: '/welcome-space',
  type: UrlType.Space,
  space: { id: 'space-1' },
};

describe('AncestorRedirectDispatcher', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders the CRD redirect dialog', () => {
    render(<AncestorRedirectDispatcher closestAncestor={ancestor} />);

    expect(screen.getByTestId('crd-redirect-dialog')).toBeInTheDocument();
  });

  test('forwards the closestAncestor prop to the CRD dialog unchanged', () => {
    render(<AncestorRedirectDispatcher closestAncestor={ancestor} />);

    expect(crdDialogSpy).toHaveBeenCalledTimes(1);
    expect(crdDialogSpy).toHaveBeenCalledWith({ closestAncestor: ancestor });
  });

  test('renders the CRD dialog for a non-Space ancestor too', () => {
    const nonSpaceAncestor: ClosestAncestor = {
      url: '/some-user',
      type: UrlType.User,
    };

    render(<AncestorRedirectDispatcher closestAncestor={nonSpaceAncestor} />);

    expect(screen.getByTestId('crd-redirect-dialog')).toBeInTheDocument();
    expect(crdDialogSpy).toHaveBeenCalledWith({ closestAncestor: nonSpaceAncestor });
  });
});
