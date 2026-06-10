import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { RoleMembersEditor } from '../roles/RoleMembersEditor';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const baseProps = {
  roleLabel: 'Global Admin',
  members: [{ id: 'u1', displayName: 'Alice', email: 'alice@x.io' }],
  availableUsers: [{ id: 'u2', displayName: 'Bob', email: 'bob@x.io' }],
  searchTerm: '',
  onSearchTermChange: vi.fn(),
  onAdd: vi.fn(),
  onRemove: vi.fn(),
};

describe('RoleMembersEditor', () => {
  test('renders current members and available users', () => {
    render(<RoleMembersEditor {...baseProps} />);
    expect(screen.getByText('Alice (alice@x.io)')).toBeInTheDocument();
    expect(screen.getByText('Bob (bob@x.io)')).toBeInTheDocument();
  });

  test('adding an available user fires onAdd', async () => {
    const onAdd = vi.fn();
    render(<RoleMembersEditor {...baseProps} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole('button', { name: 'roleMembers.add' }));
    expect(onAdd).toHaveBeenCalledWith('u2');
  });

  test('removing a member requires confirmation then fires onRemove', async () => {
    const onRemove = vi.fn();
    render(<RoleMembersEditor {...baseProps} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'roleMembers.remove' }));
    expect(onRemove).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'roleMembers.remove' }));
    expect(onRemove).toHaveBeenCalledWith('u1');
  });

  test('search input fires onSearchTermChange', async () => {
    const onSearchTermChange = vi.fn();
    render(<RoleMembersEditor {...baseProps} onSearchTermChange={onSearchTermChange} />);
    await userEvent.type(screen.getByRole('searchbox'), 'b');
    expect(onSearchTermChange).toHaveBeenCalledWith('b');
  });

  test('shows empty states when there are no members / no results', () => {
    render(<RoleMembersEditor {...baseProps} members={[]} availableUsers={[]} />);
    expect(screen.getByText('roleMembers.noMembers')).toBeInTheDocument();
    expect(screen.getByText('roleMembers.noResults')).toBeInTheDocument();
  });
});
