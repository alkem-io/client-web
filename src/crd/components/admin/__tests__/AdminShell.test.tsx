import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Boxes, Users } from 'lucide-react';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { AdminShell, type AdminShellSection } from '../AdminShell';

// SettingsTabStrip auto-scrolls the active tab into view on mount; jsdom has no
// scrollIntoView, so stub it to keep the render from throwing.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const sections: AdminShellSection[] = [
  { id: 'spaces', label: 'Spaces', icon: Boxes },
  { id: 'users', label: 'Users', icon: Users },
];

describe('AdminShell', () => {
  test('renders the title, a tablist of sections, and the active body', () => {
    render(
      <AdminShell title="Administration" sections={sections} activeSection="spaces" onSectionChange={vi.fn()}>
        <div>section body</div>
      </AdminShell>
    );

    expect(screen.getByRole('heading', { name: 'Administration' })).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByText('section body')).toBeInTheDocument();
  });

  test('marks the active section as selected', () => {
    render(
      <AdminShell title="Administration" sections={sections} activeSection="users" onSectionChange={vi.fn()}>
        <div />
      </AdminShell>
    );

    expect(screen.getByRole('tab', { name: /Users/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Spaces/ })).toHaveAttribute('aria-selected', 'false');
  });

  test('clicking a section fires onSectionChange with its id', async () => {
    const onSectionChange = vi.fn();
    render(
      <AdminShell title="Administration" sections={sections} activeSection="spaces" onSectionChange={onSectionChange}>
        <div />
      </AdminShell>
    );

    await userEvent.click(screen.getByRole('tab', { name: /Users/ }));
    expect(onSectionChange).toHaveBeenCalledWith('users');
  });
});
