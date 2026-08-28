/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WhiteboardCollabFooter } from './WhiteboardCollabFooter';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

describe('WhiteboardCollabFooter recovery', () => {
  it('keeps transient recovery non-blocking and offers one retry action', () => {
    const onRestart = vi.fn();
    render(<WhiteboardCollabFooter recovering={true} onRestart={onRestart} />);

    expect(screen.getByRole('status')).toHaveTextContent('footer.recovering');
    fireEvent.click(screen.getByRole('button', { name: 'footer.retryNow' }));
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('warns when a frozen scene still has unconfirmed edits so the existing export action can be used', () => {
    render(<WhiteboardCollabFooter hasUnconfirmedChanges={true} />);

    expect(screen.getByRole('alert')).toHaveTextContent('footer.unconfirmedChanges');
  });
});
