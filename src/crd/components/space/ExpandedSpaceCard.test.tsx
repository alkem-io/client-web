import { render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key.replace(/^crd-space:/, '') }),
}));

const mockUseElementWidth = vi.fn();
vi.mock('@/crd/hooks/useElementWidth', () => ({
  useElementWidth: () => mockUseElementWidth(),
}));

import { ExpandedSpaceCard } from './ExpandedSpaceCard';
import type { SpaceCardData } from './SpaceCard';

const baseFixture: SpaceCardData = {
  id: 'space-1',
  name: 'Alpha Subspace',
  description: 'Tagline',
  initials: 'AS',
  avatarColor: '#42a5f5',
  isPrivate: false,
  tags: [],
  leads: [{ name: 'Lead One', avatarUrl: '', type: 'person' }],
  href: '/space/alpha',
  what: 'The What excerpt text.',
  why: 'The Why excerpt text.',
  who: 'The Who excerpt text.',
};

function setWidth(width: number | undefined) {
  mockUseElementWidth.mockReturnValue([width, vi.fn()]);
}

describe('ExpandedSpaceCard', () => {
  function contentColumn(container: HTMLElement) {
    return container.querySelector('.flex-1.min-w-0.flex.flex-col.gap-5') as HTMLElement;
  }

  test('renders all three sections in order What, Why, Who', () => {
    setWidth(800);
    const { container } = render(<ExpandedSpaceCard space={baseFixture} />);
    const labels = Array.from(contentColumn(container).querySelectorAll('span.uppercase')).map(el => el.textContent);
    expect(labels).toEqual(['subspaces.expandedCard.what', 'subspaces.expandedCard.why', 'subspaces.expandedCard.who']);
  });

  test('a partial subspace renders only the filled sections, no stray label', () => {
    setWidth(800);
    const { container } = render(<ExpandedSpaceCard space={{ ...baseFixture, why: undefined, who: undefined }} />);
    const labels = Array.from(contentColumn(container).querySelectorAll('span.uppercase')).map(el => el.textContent);
    expect(labels).toEqual(['subspaces.expandedCard.what']);
  });

  test('clamp classes are 3 for What, 2 for Why and Who', () => {
    setWidth(800);
    const { container } = render(<ExpandedSpaceCard space={baseFixture} />);
    const excerpts = container.querySelectorAll('.text-body.text-muted-foreground.break-words');
    expect(excerpts).toHaveLength(3);
    expect(excerpts[0].className).toContain('line-clamp-3');
    expect(excerpts[1].className).toContain('line-clamp-2');
    expect(excerpts[2].className).toContain('line-clamp-2');
  });

  test('exactly one <a> in the card, accessible name is the subspace name', () => {
    setWidth(800);
    render(<ExpandedSpaceCard space={baseFixture} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Alpha Subspace');
  });

  test('excerpt text is present as content outside the link name', () => {
    setWidth(800);
    const { container } = render(<ExpandedSpaceCard space={baseFixture} />);
    expect(container.textContent).toContain('The What excerpt text.');
  });

  test('the call-to-action is aria-hidden (a visual cue, not a second link)', () => {
    setWidth(800);
    const { container } = render(<ExpandedSpaceCard space={baseFixture} />);
    const cta = container.querySelector('[aria-hidden="true"].bg-primary');
    expect(cta).not.toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  test('no leads → the footer still renders, with no "leads" label', () => {
    setWidth(800);
    render(<ExpandedSpaceCard space={{ ...baseFixture, leads: [] }} />);
    expect(screen.queryByText('crd-common:leads')).toBeNull();
    // The CTA is still present — the footer itself is not omitted.
    expect(screen.getByText('subspaces.expandedCard.open')).toBeInTheDocument();
  });

  test('width 800 lays out as a row (side-by-side identity)', () => {
    setWidth(800);
    const { container } = render(<ExpandedSpaceCard space={baseFixture} />);
    expect(container.querySelector('.w-\\[300px\\]')).not.toBeNull();
  });

  test.each([400, undefined])('width %s stacks (identity full width, bottom border)', width => {
    setWidth(width);
    const { container } = render(<ExpandedSpaceCard space={baseFixture} />);
    expect(container.querySelector('.w-\\[300px\\]')).toBeNull();
    expect(container.querySelector('.border-b.border-border')).not.toBeNull();
  });

  test('a hostile fixed-position "what" renders with no styled descendant', () => {
    setWidth(800);
    const hostile =
      '<div style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999">PWNED</div> a sentence.';
    const { container } = render(<ExpandedSpaceCard space={{ ...baseFixture, what: hostile }} />);
    expect(contentColumn(container).querySelector('[style]')).toBeNull();
  });

  test('a 500-character unbroken token keeps break-words on the excerpt', () => {
    setWidth(800);
    const token = 'x'.repeat(500);
    const { container } = render(<ExpandedSpaceCard space={{ ...baseFixture, what: token }} />);
    const excerpt = container.querySelector('.text-body.text-muted-foreground.break-words');
    expect(excerpt?.className).toContain('break-words');
    expect(excerpt?.textContent).toContain(token);
  });

  test('a maximum-length what renders the same structure as a short one', () => {
    setWidth(800);
    const maxLength = 'Lorem ipsum dolor sit amet, consectetur. '.repeat(1600); // ~65k chars
    const { container } = render(<ExpandedSpaceCard space={{ ...baseFixture, what: maxLength }} />);
    const excerpts = container.querySelectorAll('.text-body.text-muted-foreground.break-words');
    expect(excerpts).toHaveLength(3);
    expect(excerpts[0].className).toContain('line-clamp-3');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  test('a deeply-nested "what" (thousands of blockquote levels) renders instead of crashing the page', () => {
    setWidth(800);
    const deeplyNested = `${'> '.repeat(8000)}x`;
    expect(() => render(<ExpandedSpaceCard space={{ ...baseFixture, what: deeplyNested }} />)).not.toThrow();
  });

  test('each section carries a stable test id, scoped away from the identity block', () => {
    setWidth(800);
    render(<ExpandedSpaceCard space={baseFixture} />);
    expect(screen.getByTestId('excerpt-what')).toHaveTextContent('The What excerpt text.');
    expect(screen.getByTestId('excerpt-why')).toHaveTextContent('The Why excerpt text.');
    expect(screen.getByTestId('excerpt-who')).toHaveTextContent('The Who excerpt text.');
  });

  test('the article is a hover group so the reused banner zoom works here too', () => {
    setWidth(800);
    const { container } = render(<ExpandedSpaceCard space={baseFixture} />);
    expect(container.querySelector('article')?.className.split(' ')).toContain('group');
  });

  test('the call-to-action cue sits at the right edge even when no leads render', () => {
    setWidth(800);
    const { container } = render(<ExpandedSpaceCard space={{ ...baseFixture, leads: [] }} />);
    const cue = container.querySelector('[aria-hidden="true"].ml-auto');
    expect(cue).not.toBeNull();
    expect(cue).toHaveTextContent('subspaces.expandedCard.open');
  });

  test('in the row layout the banner squares the corner that meets the divider', () => {
    setWidth(800);
    const { container: row } = render(<ExpandedSpaceCard space={baseFixture} />);
    expect(row.querySelector('.aspect-video')?.className).toContain('rounded-tr-none');
    setWidth(390);
    const { container: stacked } = render(<ExpandedSpaceCard space={baseFixture} />);
    expect(stacked.querySelector('.aspect-video')?.className).not.toContain('rounded-tr-none');
  });

  test('visibility decided by the data mapper is used as-is', () => {
    setWidth(800);
    const decided = { ...baseFixture, sectionVisibility: { what: true, why: false, who: false } };
    render(<ExpandedSpaceCard space={decided} />);
    expect(screen.getByTestId('excerpt-what')).toBeInTheDocument();
    expect(screen.queryByTestId('excerpt-why')).toBeNull();
    expect(screen.queryByTestId('excerpt-who')).toBeNull();
  });

  test('all three fields empty → no section rendered', () => {
    setWidth(800);
    const { container } = render(
      <ExpandedSpaceCard space={{ ...baseFixture, what: undefined, why: undefined, who: undefined }} />
    );
    expect(contentColumn(container).querySelectorAll('span.uppercase')).toHaveLength(0);
  });

  test('onClick intercepts navigation like SpaceCard', () => {
    setWidth(800);
    const onClick = vi.fn();
    render(<ExpandedSpaceCard space={baseFixture} onClick={onClick} />);
    const link = screen.getByRole('link');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(onClick).toHaveBeenCalledWith(baseFixture);
  });

  test('leads render inside the footer when present', () => {
    setWidth(800);
    render(<ExpandedSpaceCard space={baseFixture} />);
    expect(
      within(screen.getByText('crd-common:leads').parentElement as HTMLElement).getByText('crd-common:leads')
    ).toBeInTheDocument();
  });
});
