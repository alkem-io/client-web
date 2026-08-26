import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MatrixCallbackHandler from './MatrixCallbackHandler';

const harness = vi.hoisted(() => ({
  navigate: vi.fn(),
  outcome: { value: { ok: false, error: 'exchange failed' } as { ok: boolean; error?: string } },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => harness.navigate,
}));

vi.mock('./matrixCallback', () => ({
  handleMatrixCallback: vi.fn(async () => harness.outcome.value),
}));

describe('MatrixCallbackHandler', () => {
  beforeEach(() => {
    harness.navigate.mockClear();
  });

  it('navigates home when the callback fails, instead of stranding the user', async () => {
    harness.outcome.value = { ok: false, error: 'exchange failed' };
    render(<MatrixCallbackHandler />);
    await vi.waitFor(() => {
      expect(harness.navigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('does not fire the fallback navigation on success', async () => {
    harness.outcome.value = { ok: true };
    render(<MatrixCallbackHandler />);
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(harness.navigate).not.toHaveBeenCalledWith('/', { replace: true });
  });
});
