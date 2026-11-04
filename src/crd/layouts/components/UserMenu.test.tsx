import { fireEvent, render, screen, within } from '@testing-library/react';
import { Compass, Lightbulb } from 'lucide-react';
import { describe, expect, test } from 'vitest';
import { Header } from '@/crd/layouts/Header';
import type { CrdNavigationHrefs, CrdPlatformNavigationItem } from '@/crd/layouts/types';

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
 * screens keep the two menus separate: `md:hidden` is what keeps the desktop
 * profile menu unchanged, and jsdom applies no CSS, so that class is asserted.
 */
describe('UserMenu apps items', () => {
  test('lists the items the header gives the apps menu, as links', () => {
    renderHeader(platformNavigationItems);

    const menu = openProfileMenu();

    expect(within(menu).getByRole('menuitem', { name: 'Template Library' })).toHaveAttribute(
      'href',
      '/innovation-library'
    );
    expect(within(menu).getByRole('menuitem', { name: 'Explore Spaces' })).toHaveAttribute('href', '/spaces');
  });

  test('shows them below the md breakpoint only', () => {
    renderHeader(platformNavigationItems);

    const menu = openProfileMenu();

    const group = within(menu).getByRole('menuitem', { name: 'Template Library' }).parentElement;
    expect(group).toHaveClass('md:hidden');
    expect(group).toContainElement(within(menu).getByRole('menuitem', { name: 'Explore Spaces' }));
  });

  test('keeps Log out as the last row, below the apps items', () => {
    renderHeader(platformNavigationItems);

    const rows = within(openProfileMenu()).getAllByRole('menuitem');

    expect(rows.at(-1)).toHaveTextContent('header.logout');
    expect(rows.at(-2)).toHaveTextContent('Explore Spaces');
  });

  test('adds no empty section when there are no apps items', () => {
    renderHeader([]);

    const menu = openProfileMenu();

    expect(within(menu).getAllByRole('menuitem').at(-1)).toHaveTextContent('header.logout');
    expect(menu.querySelector('.md\\:hidden')).toBeNull();
  });
});
