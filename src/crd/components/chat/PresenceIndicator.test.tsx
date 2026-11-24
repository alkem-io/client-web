import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PresenceIndicator } from './PresenceIndicator';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('PresenceIndicator', () => {
  test.each([
    ['online', 'bg-emerald-500'],
    ['away', 'bg-amber-500'],
    ['offline', 'border-muted-foreground'],
    ['busy', 'bg-red-500'],
  ] as const)('a %s dot carries its label, so it does not rely on colour alone', (presence, colourClass) => {
    render(<PresenceIndicator presence={presence} />);
    expect(screen.getByRole('img', { name: `presence.${presence}` })).toHaveClass(colourClass);
  });

  test('away is half filled, so it differs from online by shape as well as colour', () => {
    const { rerender } = render(<PresenceIndicator presence="away" />);
    expect(screen.getByRole('img').children).toHaveLength(1);
    rerender(<PresenceIndicator presence="online" />);
    expect(screen.getByRole('img').children).toHaveLength(0);
  });

  test('busy (in a call) is a plain red dot: a bar would read as do not disturb', () => {
    render(<PresenceIndicator presence="busy" />);
    expect(screen.getByRole('img', { name: 'presence.busy' }).children).toHaveLength(0);
  });

  test.each([['unknown' as const], [undefined]])('renders nothing for %s presence, never a fake offline', presence => {
    const { container } = render(<PresenceIndicator presence={presence} />);
    expect(container).toBeEmptyDOMElement();
  });
});
