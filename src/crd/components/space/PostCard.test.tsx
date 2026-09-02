import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PostCardData } from './PostCard';
import { PostCard } from './PostCard';

const basePost: PostCardData = {
  id: 'c1',
  type: 'text',
  title: 'My Post',
  author: {
    name: 'Alice',
    avatarUrl: 'https://example.com/alice.jpg',
  },
  timestamp: '2 hours ago',
};

describe('PostCard showPublishDetails', () => {
  it('shows author, avatar, and timestamp by default (showPublishDetails undefined)', () => {
    render(<PostCard post={basePost} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
    // Avatar fallback is always rendered (Radix Avatar shows initials in jsdom)
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows author, avatar, and timestamp when showPublishDetails=true', () => {
    render(<PostCard post={{ ...basePost, showPublishDetails: true }} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
    // Avatar fallback initial
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('hides author name when showPublishDetails=false', () => {
    render(<PostCard post={{ ...basePost, showPublishDetails: false }} />);
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('hides avatar when showPublishDetails=false', () => {
    render(<PostCard post={{ ...basePost, showPublishDetails: false }} />);
    // Avatar fallback initial should not appear
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('hides timestamp when showPublishDetails=false', () => {
    render(<PostCard post={{ ...basePost, showPublishDetails: false }} />);
    expect(screen.queryByText(/2 hours ago/)).not.toBeInTheDocument();
  });

  it('hides the post type treatment (icon + label) when showPublishDetails=false', () => {
    // Meta off → the whole type chrome is suppressed on every type (Post, Contributors, Subspaces, …).
    render(<PostCard post={{ ...basePost, type: 'contributors', title: 'Hello', showPublishDetails: false }} />);
    expect(screen.queryByText(/contributors/i)).not.toBeInTheDocument();
  });

  it('repositions the title into the card header when showPublishDetails=false (FR-005/US2-AS2)', () => {
    const { container } = render(<PostCard post={{ ...basePost, showPublishDetails: false }} />);
    // The title must be inside the CardHeader (the first [data-slot="card-header"] / header element),
    // NOT in the CardContent body. This is the positional assertion for US2-AS2.
    const header = container.querySelector('[data-slot="card-header"]');
    expect(header).toBeTruthy();
    // Title link is present inside the header
    const titleInHeader = header?.querySelector('h3 a');
    expect(titleInHeader).toBeTruthy();
    expect(titleInHeader?.textContent).toBe('My Post');
    // Title must NOT also appear in the CardContent body (no duplicate rendering)
    const content = container.querySelector('[data-slot="card-content"]');
    const titleInContent = content?.querySelector('h3');
    expect(titleInContent).toBeFalsy();
  });

  it('renders the title in card body (not header) when showPublishDetails=true', () => {
    const { container } = render(<PostCard post={{ ...basePost, showPublishDetails: true }} />);
    const content = container.querySelector('[data-slot="card-content"]');
    const titleInContent = content?.querySelector('h3 a');
    expect(titleInContent).toBeTruthy();
    expect(titleInContent?.textContent).toBe('My Post');
  });

  it('shows draft badge when showPublishDetails=false', () => {
    render(<PostCard post={{ ...basePost, isDraft: true, showPublishDetails: false }} />);
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it('shows draft badge when showPublishDetails=true', () => {
    render(<PostCard post={{ ...basePost, isDraft: true, showPublishDetails: true }} />);
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it('no author prop + showPublishDetails=false renders just the title (no author, no type label)', () => {
    const noAuthor: PostCardData = { id: 'c2', type: 'contributors', title: 'No Author' };
    render(<PostCard post={{ ...noAuthor, showPublishDetails: false }} />);
    // Title is still there
    expect(screen.getByText('No Author')).toBeInTheDocument();
    // No author block renders (no img, no name)
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // Type treatment is suppressed too
    expect(screen.queryByText(/contributors/i)).not.toBeInTheDocument();
  });

  it('leaves the card body empty (empty:hidden collapses it) when meta hidden + no body content', () => {
    // Contributors/subspaces posts render their preview via `children` (outside CardContent).
    // With meta off, the title moves to the header and CardContent has nothing — it must be
    // genuinely empty so `empty:hidden` removes it and no gap-6 whitespace is left behind.
    const framingOnly: PostCardData = { id: 'c3', type: 'contributors', title: 'Team' };
    const { container } = render(<PostCard post={{ ...framingOnly, showPublishDetails: false }} />);
    const content = container.querySelector('[data-slot="card-content"]');
    expect(content).toBeTruthy();
    expect(content).toHaveClass('empty:hidden');
    expect(content?.childNodes.length).toBe(0);
  });
});

describe('PostCard reactionsSlot placement', () => {
  const reactions = <div data-testid="reactions">R</div>;

  it('renders reactions inside the footer, right-aligned, in the non-collapsible branch', () => {
    // No commentsSlot → non-collapsible footer (comments Button + reactions).
    const { container } = render(<PostCard post={basePost} reactionsSlot={reactions} />);
    const footer = container.querySelector('[data-slot="card-footer"]');
    expect(footer).toBeTruthy();
    const reactionsNode = screen.getByTestId('reactions');
    // Reactions live inside the footer (not in a standalone block above it).
    expect(footer?.contains(reactionsNode)).toBe(true);
    // Right-aligned via ml-auto on its wrapper.
    expect(reactionsNode.parentElement).toHaveClass('ml-auto');
    // It is the last child of the footer (sits after the comments button).
    expect(footer?.lastElementChild).toBe(reactionsNode.parentElement);
  });

  it('renders reactions as a sibling of (not nested inside) the collapsible comments trigger', () => {
    const { container } = render(
      <PostCard post={basePost} reactionsSlot={reactions} commentsSlot={<div>thread</div>} />
    );
    const footer = container.querySelector('[data-slot="card-footer"]');
    const reactionsNode = screen.getByTestId('reactions');
    const trigger = screen.getByRole('button', { name: /expandComments|collapseComments/i });
    expect(footer?.contains(reactionsNode)).toBe(true);
    // The reactions must NOT be inside the trigger button — invalid HTML + a
    // reaction click would toggle the collapsible and swallow its popover.
    expect(trigger.contains(reactionsNode)).toBe(false);
    // Trigger and the reactions wrapper share the same flex row wrapper:
    // trigger.parent === reactionsWrapper.parent === the row.
    expect(reactionsNode.parentElement?.parentElement).toBe(trigger.parentElement);
  });

  it('renders no footer and no reactions when comments are turned off and none exist yet', () => {
    // Reactions follow the comments switch: with commenting off and no existing
    // messages, the card falls back to its pre-reactions look — no footer row at all.
    const { container } = render(
      <PostCard post={{ ...basePost, commentsEnabled: false, commentCount: 0 }} reactionsSlot={reactions} />
    );
    expect(container.querySelector('[data-slot="card-footer"]')).toBeNull();
    expect(screen.queryByTestId('reactions')).not.toBeInTheDocument();
  });

  it('hides reactions but keeps the read-only comments footer when comments are turned off with existing messages', () => {
    const { container } = render(
      <PostCard
        post={{ ...basePost, commentsEnabled: false, commentCount: 3 }}
        reactionsSlot={reactions}
        commentsSlot={<div>thread</div>}
      />
    );
    // The existing thread stays reachable, so the footer survives...
    expect(container.querySelector('[data-slot="card-footer"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: /expandComments|collapseComments/i })).toBeInTheDocument();
    // ...but the reactions surface is gone with the comments switch.
    expect(screen.queryByTestId('reactions')).not.toBeInTheDocument();
  });

  it('renders reactions when comments are explicitly enabled', () => {
    render(<PostCard post={{ ...basePost, commentsEnabled: true, commentCount: 0 }} reactionsSlot={reactions} />);
    expect(screen.getByTestId('reactions')).toBeInTheDocument();
  });

  it('renders no footer at all when comments are suppressed and there is no reactions slot', () => {
    const { container } = render(<PostCard post={{ ...basePost, commentsEnabled: false, commentCount: 0 }} />);
    expect(container.querySelector('[data-slot="card-footer"]')).toBeNull();
  });

  it('does not render a standalone reactions block above the footer', () => {
    // Regression guard for the old `px-6 pb-2` standalone block that was removed —
    // the only reactions node must be the one inside the footer.
    const { container } = render(<PostCard post={basePost} reactionsSlot={reactions} />);
    const footer = container.querySelector('[data-slot="card-footer"]');
    const allReactions = screen.getAllByTestId('reactions');
    expect(allReactions).toHaveLength(1);
    expect(footer?.contains(allReactions[0])).toBe(true);
  });
});
