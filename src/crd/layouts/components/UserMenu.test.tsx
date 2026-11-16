import { fireEvent, render, screen, within } from '@testing-library/react';
import { Compass, Lightbulb } from 'lucide-react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Header } from '@/crd/layouts/Header';
import type { CrdNavigationHrefs, CrdPlatformNavigationItem } from '@/crd/layouts/types';

const viewport = vi.hoisted(() => ({ isDesktop: false }));

vi.mock('@/crd/hooks/useMediaQuery', async importOriginal => ({
  ...(await importOriginal<typeof import('@/crd/hooks/useMediaQuery')>()),
  useMediaQuery: () => viewport.isDesktop,
}));

const navigationHrefs: CrdNavigationHrefs = {
  home: '/home',
  spaces: '/spaces',
  messages: '/messages',
  notifications: '/notifications',
  profile: '/profile',
  account: '/account',
  admin: '/admin',
  login: '/login',
};

const platformNavigationItems: CrdPlatformNavigationItem[] = [
  { icon: <Lightbulb />, label: 'Template Library', href: '/innovation-library' },
  { icon: <Compass />, label: 'Explore Spaces', href: '/spaces' },
];

const renderHeader = (items?: CrdPlatformNavigationItem[]) =>
  render(
    <Header
      authenticated={true}
      user={{ name: 'Ada Lovelace', initials: 'AL' }}
      navigationHrefs={navigationHrefs}
      platformNavigationItems={items}
      onHelpClick={() => undefined}
      onLogout={() => undefined}
    />
  );

const openProfileMenu = () => {
  fireEvent.click(screen.getByRole('button', { name: 'AL' }));
  return screen.getByRole('menu');
};

/**
 * On phones the profile menu is the one place a thumb can reach every personal
 * and platform destination, so it also lists the apps (grid) menu items. Larger
 * screens keep the two menus separate, and the items are not rendered at all
 * there: a CSS-hidden row would stay in Radix's typeahead list and swallow keys.
 */
describe('UserMenu apps items', () => {
  beforeEach(() => {
    viewport.isDesktop = false;
  });

  test('lists the items the header gives the apps menu, as links', () => {
    renderHeader(platformNavigationItems);

    const menu = openProfileMenu();

    expect(within(menu).getByRole('menuitem', { name: 'Template Library' })).toHaveAttribute(
      'href',
      '/innovation-library'
    );
    expect(within(menu).getByRole('menuitem', { name: 'Explore Spaces' })).toHaveAttribute('href', '/spaces');
  });

  test('does not render them from the md breakpoint up', () => {
    viewport.isDesktop = true;
    renderHeader(platformNavigationItems);

    const menu = openProfileMenu();

    expect(within(menu).queryByRole('menuitem', { name: 'Template Library' })).toBeNull();
    expect(within(menu).queryByRole('menuitem', { name: 'Explore Spaces' })).toBeNull();
  });

  test('keeps Log out as the last row, below the apps items', () => {
    renderHeader(platformNavigationItems);

    const rows = within(openProfileMenu()).getAllByRole('menuitem');

    expect(rows.at(-1)).toHaveTextContent('header.logout');
    expect(rows.at(-2)).toHaveTextContent('Explore Spaces');
  });

  test('adds no empty section when there are no apps items', () => {
    const { unmount } = renderHeader(platformNavigationItems);
    const separatorsWithItems = within(openProfileMenu()).getAllByRole('separator').length;
    unmount();

    renderHeader([]);

    const menu = openProfileMenu();

    expect(within(menu).getAllByRole('menuitem').at(-1)).toHaveTextContent('header.logout');
    expect(within(menu).getAllByRole('separator')).toHaveLength(separatorsWithItems - 1);
  });

  describe('apps (grid) icon', () => {
    const gridIcon = () => screen.queryByRole('button', { name: 'header.platformNavigation' });

    test('is gone on phones when signed in, since the profile menu carries the items', () => {
      renderHeader(platformNavigationItems);

      expect(gridIcon()).toBeNull();
    });

    test('stays from the md breakpoint up', () => {
      viewport.isDesktop = true;
      renderHeader(platformNavigationItems);

      expect(gridIcon()).toBeInTheDocument();
    });

    test('stays on phones when signed out, since there is no profile menu', () => {
      render(
        <Header
          authenticated={false}
          navigationHrefs={navigationHrefs}
          platformNavigationItems={platformNavigationItems}
        />
      );

      expect(gridIcon()).toBeInTheDocument();
    });
  });
});
