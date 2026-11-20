import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key.replace(/^crd-space:/, '') }),
}));

vi.mock('@/crd/hooks/useElementWidth', () => ({
  useElementWidth: () => [800, vi.fn()],
}));

// A renderer that fails on one specific field — the shape of any future
// rendering defect: the card must not let it out of that field's section.
vi.mock('@/crd/components/common/InlineMarkdown', () => ({
  InlineMarkdown: ({ content }: { content: string }) => {
    if (content.includes('EXPLODE')) throw new Error('renderer failure');
    return <p>{content}</p>;
  },
}));

import { ExpandedSpaceCard } from './ExpandedSpaceCard';
import type { SpaceCardData } from './SpaceCard';

const fixture: SpaceCardData = {
  id: 'space-1',
  name: 'Alpha Subspace',
  description: 'Tagline',
  initials: 'AS',
  avatarColor: '#42a5f5',
  isPrivate: false,
  tags: [],
  leads: [],
  href: '/space/alpha',
  what: 'The What text.',
  why: 'EXPLODE',
  who: 'The Who text.',
};

describe('ExpandedSpaceCard — a failing excerpt is contained to its own section', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('the other sections, the identity block and the link still render', () => {
    const { container } = render(
      <div>
        <p>host page content</p>
        <ExpandedSpaceCard space={fixture} />
      </div>
    );
    expect(screen.getByText('host page content')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Alpha Subspace' })).toBeInTheDocument();
    expect(screen.getByTestId('excerpt-what')).toHaveTextContent('The What text.');
    expect(screen.getByTestId('excerpt-who')).toHaveTextContent('The Who text.');
    // The failed section is gone entirely — label included — never a label over nothing.
    expect(container.querySelector('[data-testid="excerpt-why"]')).toBeNull();
    expect(container.textContent).not.toContain('subspaces.expandedCard.why');
  });
});
