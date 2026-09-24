import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { SilentErrorBoundary } from './SilentErrorBoundary';

function Explodes(): never {
  throw new Error('render failure');
}

describe('SilentErrorBoundary', () => {
  beforeEach(() => {
    // React logs a caught render error to console.error; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders its children when nothing throws', () => {
    render(
      <SilentErrorBoundary>
        <p>fine</p>
      </SilentErrorBoundary>
    );
    expect(screen.getByText('fine')).toBeInTheDocument();
  });

  test('a throwing child renders nothing by default and does not propagate', () => {
    const { container } = render(
      <div>
        <p>sibling</p>
        <SilentErrorBoundary>
          <Explodes />
        </SilentErrorBoundary>
      </div>
    );
    expect(screen.getByText('sibling')).toBeInTheDocument();
    expect(container.querySelectorAll('p')).toHaveLength(1);
  });

  test('a throwing child renders the fallback when one is given', () => {
    render(
      <SilentErrorBoundary fallback={<span>fallback</span>}>
        <Explodes />
      </SilentErrorBoundary>
    );
    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  test('a caught error is reported through the global error channel, not swallowed', () => {
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    try {
      render(
        <SilentErrorBoundary>
          <Explodes />
        </SilentErrorBoundary>
      );
      expect(reportError).toHaveBeenCalledWith(expect.objectContaining({ message: 'render failure' }));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
