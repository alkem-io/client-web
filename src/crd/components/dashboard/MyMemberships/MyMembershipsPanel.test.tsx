import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { MyMembershipsPanel } from './MyMembershipsPanel';
import type { MembershipItem, MembershipRole } from './types';

const item = (id: string, roles: MembershipRole[], children?: MembershipItem[]): MembershipItem => ({
  id,
  name: `Space ${id}`,
  href: `/space/${id}`,
  isPrivate: false,
  roles,
  initials: id.toUpperCase(),
  color: '#42a5f5',
  children,
});

describe('MyMembershipsPanel', () => {
  const base = {
    onClose: vi.fn(),
    onNavigate: vi.fn(),
    browseAllHref: '/spaces',
  };

  // Regression: the restrictToRoles path derived a fresh array each render and the
  // auto-expand effect depended on it → "Maximum update depth exceeded". Rendering
  // it here would blow the update-depth limit if the loop returned.
  it('renders a role-scoped nested tree without looping (restrictToRoles)', () => {
    const items = [
      item('p1', ['lead', 'admin'], [item('s1', ['lead']), item('s2', ['admin'])]),
      item('p2', ['member']), // filtered out by the role scope
    ];

    render(
      <MyMembershipsPanel
        {...base}
        open={true}
        items={items}
        title="I Lead & Administer"
        restrictToRoles={['admin', 'lead']}
      />
    );

    expect(screen.getByText('Space p1')).toBeInTheDocument();
    expect(screen.getByText('Space s1')).toBeInTheDocument(); // nested child rendered
    expect(screen.queryByText('Space p2')).not.toBeInTheDocument(); // member-only scoped out
  });

  it('renders a flat unscoped list (host-style reuse)', () => {
    render(<MyMembershipsPanel {...base} open={true} items={[item('h1', []), item('h2', [])]} title="I Host" />);
    expect(screen.getByText('Space h1')).toBeInTheDocument();
    expect(screen.getByText('Space h2')).toBeInTheDocument();
  });
});
