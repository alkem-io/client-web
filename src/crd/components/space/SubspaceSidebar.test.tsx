import { render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SubspaceSidebar, type SubspaceSidebarProps } from './SubspaceSidebar';
import type { SidebarWidgetId } from './settings/SpaceSettingsLayoutView.types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

// The server's subspace first-phase default — the previously hard-coded sidebar.
const DEFAULT_WIDGETS: SidebarWidgetId[] = [
  'intent',
  'about',
  'createPost',
  'community',
  'events',
  'activity',
  'index',
  'subspaceLinks',
  'virtualContributors',
  'updates',
];

const baseProps = (widgets: readonly SidebarWidgetId[]): SubspaceSidebarProps => ({
  widgets,
  description: 'Subspace intent',
  leads: [],
  onAboutClick: vi.fn(),
  onQuickActionClick: vi.fn(),
  activityEnabled: true,
  actionsSlot: <button type="button">add-post</button>,
  collapsedActionsSlot: <button type="button">add-post-icon</button>,
  subspaces: [{ name: 'Nested', initials: 'N', href: '/nested' }],
  updatesSlot: <section>latest-update</section>,
  onToggleCollapse: vi.fn(),
});

const searchProps = {
  text: '',
  onTextChange: vi.fn(),
  appliedText: '',
  allTags: [],
  selectedTags: [],
  onToggleTag: vi.fn(),
  onClear: vi.fn(),
};

/** A compact label per top-level child of the expanded sidebar, in DOM order. */
const expandedOutline = () => {
  const aside = screen.getByRole('complementary');
  return Array.from(aside.children).map(child => {
    if (child.tagName === 'NAV') {
      return `quickActions[${within(child as HTMLElement)
        .getAllByRole('listitem')
        .map(item => item.textContent)
        .join(',')}]`;
    }
    return child.textContent?.trim() ?? '';
  });
};

describe('SubspaceSidebar (expanded)', () => {
  test('the default list reproduces the previous fixed sidebar order', () => {
    render(<SubspaceSidebar {...baseProps(DEFAULT_WIDGETS)} />);
    const outline = expandedOutline();
    expect(outline[0]).toContain('Subspace intent');
    expect(outline.slice(1)).toEqual([
      'sidebar.about',
      'add-post',
      'sidebar.collapse',
      'quickActions[sidebar.quickActions.community,sidebar.quickActions.events,sidebar.quickActions.activity,sidebar.quickActions.index]',
      expect.stringContaining('Nested'),
      'latest-update',
    ]);
    expect(screen.getAllByRole('navigation')).toHaveLength(1);
  });

  test('quick actions split into two groups around a non-quick-action widget', () => {
    render(<SubspaceSidebar {...baseProps(['community', 'search', 'index'])} search={searchProps} />);
    const groups = screen.getAllByRole('navigation');
    expect(groups).toHaveLength(2);
    expect(within(groups[0]).getByText('sidebar.quickActions.community')).toBeInTheDocument();
    expect(within(groups[1]).getByText('sidebar.quickActions.index')).toBeInTheDocument();
    expect(screen.getByLabelText('knowledge.searchLabel')).toBeInTheDocument();
  });

  test('hides Recent Activity when activity is not enabled for the viewer', () => {
    render(<SubspaceSidebar {...baseProps(DEFAULT_WIDGETS)} activityEnabled={false} />);
    expect(screen.queryByText('sidebar.quickActions.activity')).not.toBeInTheDocument();
    expect(screen.getByText('sidebar.quickActions.community')).toBeInTheDocument();
  });

  test('places Collapse before the first widget below the identity block', () => {
    render(<SubspaceSidebar {...baseProps(['intent', 'search'])} search={searchProps} />);
    const outline = expandedOutline();
    expect(outline[1]).toBe('sidebar.collapse');
    expect(outline).toHaveLength(3);
  });

  test('an empty list renders only the Collapse control', () => {
    render(<SubspaceSidebar {...baseProps([])} />);
    expect(expandedOutline()).toEqual(['sidebar.collapse']);
  });

  test('gated widgets render nothing without their handler or data', () => {
    render(
      <SubspaceSidebar
        {...baseProps(['addUser', 'createSubspace', 'search', 'createPost'])}
        actionsSlot={undefined}
        onInviteClick={undefined}
        onCreateSubspace={undefined}
        search={undefined}
      />
    );
    expect(expandedOutline()).toEqual(['sidebar.collapse']);
  });

  test('renders Invite and Create Subspace when their handlers are present', () => {
    const onInviteClick = vi.fn();
    const onCreateSubspace = vi.fn();
    render(
      <SubspaceSidebar
        {...baseProps(['addUser', 'createSubspace'])}
        onInviteClick={onInviteClick}
        onCreateSubspace={onCreateSubspace}
      />
    );
    screen.getByText('sidebar.invite').click();
    screen.getByText('subspaces.createSubspace').click();
    expect(onInviteClick).toHaveBeenCalled();
    expect(onCreateSubspace).toHaveBeenCalled();
  });
});

describe('SubspaceSidebar (collapsed rail)', () => {
  test('shows only the configured quick-action icons, in order, and nothing for expanded-only widgets', () => {
    render(<SubspaceSidebar {...baseProps(['community', 'index', 'search'])} search={searchProps} collapsed={true} />);
    const buttons = screen.getAllByRole('button').map(button => button.getAttribute('aria-label'));
    expect(buttons).toEqual(['sidebar.expand', 'sidebar.quickActions.community', 'sidebar.quickActions.index']);
    expect(screen.queryByText('add-post-icon')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nested')).not.toBeInTheDocument();
  });

  test('the default list keeps Add Post, the four quick actions and the nested subspace tiles', () => {
    render(<SubspaceSidebar {...baseProps(DEFAULT_WIDGETS)} collapsed={true} />);
    expect(screen.getByText('add-post-icon')).toBeInTheDocument();
    expect(screen.getByLabelText('sidebar.quickActions.activity')).toBeInTheDocument();
    expect(screen.getByLabelText('Nested')).toBeInTheDocument();
  });

  test('hides the activity icon when activity is not enabled', () => {
    render(<SubspaceSidebar {...baseProps(DEFAULT_WIDGETS)} activityEnabled={false} collapsed={true} />);
    expect(screen.queryByLabelText('sidebar.quickActions.activity')).not.toBeInTheDocument();
  });

  test('an empty list shows only the expand control', () => {
    render(<SubspaceSidebar {...baseProps([])} collapsed={true} />);
    expect(screen.getAllByRole('button').map(button => button.getAttribute('aria-label'))).toEqual(['sidebar.expand']);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
