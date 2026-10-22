import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ChatThreadView } from './ChatThreadView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ChatThreadView scrolling', () => {
  test('contains overscroll on the message scroller, so scrolling past either end does not scroll the page behind', () => {
    Element.prototype.scrollIntoView = vi.fn();
    render(<ChatThreadView messages={[]} messagesLoading={true} />);
    const scroller = screen.getByRole('status', { name: 'thread.loading' }).parentElement;
    expect(scroller?.className).toContain('overflow-y-auto');
    expect(scroller?.className).toContain('overscroll-contain');
  });
});
