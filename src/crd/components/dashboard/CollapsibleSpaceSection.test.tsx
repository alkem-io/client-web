import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { CollapsibleSpaceSection } from './CollapsibleSpaceSection';
import type { CompactSpaceCardData } from './CompactSpaceCard';

const card = (id: string): CompactSpaceCardData => ({
  id,
  name: `Space ${id}`,
  href: `/space/${id}`,
  isPrivate: false,
  isHomeSpace: false,
});

describe('CollapsibleSpaceSection', () => {
  it('renders the title and, when expanded by default, its items', () => {
    render(<CollapsibleSpaceSection title="My Section" items={[card('a'), card('b')]} />);

    expect(screen.getByText('My Section')).toBeInTheDocument();
    expect(screen.getByText('Space a')).toBeInTheDocument();
    expect(screen.getByText('Space b')).toBeInTheDocument();
  });

  it('shows no count badge on a capped section with no "show more"', () => {
    render(
      <CollapsibleSpaceSection
        title="Pinned"
        items={[card('a'), card('b')]}
        emptyPinSlot={{ settingsHref: '/settings/membership' }}
      />
    );
    // No showMore → no count (nothing hidden the user can reach)
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('puts no numeric badge in the header — the count lives in the "show more" button', () => {
    render(
      <CollapsibleSpaceSection
        title="Lead & Admin"
        items={[card('a'), card('b'), card('c'), card('d'), card('e')]}
        maxVisible={4}
        showMore={{ onShowMore: vi.fn() }}
      />
    );
    // No standalone header count (prototype puts "Show More: N Spaces" in the button)
    expect(screen.queryByText('5')).not.toBeInTheDocument();
    expect(screen.getByText('nonActivity.showMore')).toBeInTheDocument();
  });

  it('caps visible items and shows a "show more" trigger that calls onShowMore', () => {
    const onShowMore = vi.fn();
    render(
      <CollapsibleSpaceSection
        title="Lead & Admin"
        items={[card('a'), card('b'), card('c'), card('d'), card('e')]}
        maxVisible={4}
        showMore={{ onShowMore }}
      />
    );

    // 5th item is not rendered inline
    expect(screen.queryByText('Space e')).not.toBeInTheDocument();

    const trigger = screen.getByText('nonActivity.showMore');
    fireEvent.click(trigger);
    expect(onShowMore).toHaveBeenCalledTimes(1);
  });

  it('does not show "show more" when items fit within maxVisible', () => {
    render(
      <CollapsibleSpaceSection
        title="Host"
        items={[card('a'), card('b')]}
        maxVisible={4}
        showMore={{ onShowMore: vi.fn() }}
      />
    );
    expect(screen.queryByText('nonActivity.showMore')).not.toBeInTheDocument();
  });
});
