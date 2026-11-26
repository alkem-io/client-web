import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WithApmTransaction } from './WithApmTransaction';

describe('WithApmTransaction', () => {
  it('renders its route when the APM agent never started', () => {
    // No ApmProvider: the agent is undefined, as for a visitor without analysis consent.
    const { unmount } = render(
      <WithApmTransaction path="/home">
        <span>route</span>
      </WithApmTransaction>
    );

    expect(screen.getByText('route')).toBeInTheDocument();
    unmount();
  });
});
