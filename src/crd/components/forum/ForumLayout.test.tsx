import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ForumCategoryNav } from './ForumCategoryNav';
import { ForumLayout } from './ForumLayout';

// jsdom does not evaluate Tailwind's media queries, so these tests cannot
// observe real visibility at a given viewport. They pin the class contract
// instead: a bare `hidden` hides an element at every width, while a prefixed
// one (`md:hidden`) only applies from that breakpoint up.
const classTokens = (element: Element): string[] => element.className.split(/\s+/).filter(Boolean);

const renderForum = () =>
  render(
    <ForumLayout
      bannerNode={<div>banner</div>}
      sidebarNode={
        <ForumCategoryNav
          entries={[
            { slug: 'all', label: 'Show all', iconNode: null },
            { slug: 'help', label: 'Help', iconNode: null },
          ]}
          activeSlug="all"
          onCategoryChange={vi.fn()}
          sectionLabel="Categories"
          selectAriaLabel="Filter by category"
        />
      }
      mainNode={<div data-testid="forum-main">main</div>}
    />
  );

describe('ForumLayout — category navigation on phones', () => {
  test('the phone category dropdown has no ancestor that is hidden at every width', () => {
    const { container } = renderForum();

    const dropdown = screen.getByRole('combobox', { name: 'Filter by category' });

    for (let node: Element | null = dropdown; node && node !== container; node = node.parentElement) {
      expect(classTokens(node)).not.toContain('hidden');
    }
  });

  test('the sidebar slot spans the full grid below md and keeps its column spans from md up', () => {
    renderForum();

    const sidebarSlot = screen.getByRole('navigation', { name: 'Categories', hidden: true }).parentElement as Element;

    expect(classTokens(sidebarSlot)).toEqual(
      expect.arrayContaining(['col-span-12', 'md:col-span-3', 'lg:col-span-2', 'lg:col-start-2'])
    );
  });

  test('the sidebar slot comes before the discussion list, so the dropdown sits above it', () => {
    renderForum();

    const dropdown = screen.getByRole('combobox', { name: 'Filter by category' });
    const main = screen.getByTestId('forum-main');

    expect(dropdown.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
