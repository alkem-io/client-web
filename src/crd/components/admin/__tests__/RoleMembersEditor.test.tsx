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
  memberSearchTerm: '',
  onMemberSearchTermChange: vi.fn(),
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

  test('available-users search input fires onSearchTermChange', async () => {
    const onSearchTermChange = vi.fn();
    render(<RoleMembersEditor {...baseProps} onSearchTermChange={onSearchTermChange} />);
    await userEvent.type(screen.getByPlaceholderText('roleMembers.searchPlaceholder'), 'b');
    expect(onSearchTermChange).toHaveBeenCalledWith('b');
  });

  test('members filter input fires onMemberSearchTermChange', async () => {
    const onMemberSearchTermChange = vi.fn();
    render(<RoleMembersEditor {...baseProps} onMemberSearchTermChange={onMemberSearchTermChange} />);
    await userEvent.type(screen.getByPlaceholderText('roleMembers.filterMembersPlaceholder'), 'a');
    expect(onMemberSearchTermChange).toHaveBeenCalledWith('a');
  });

  test('hides the members filter when there are no members and no active search', () => {
    render(<RoleMembersEditor {...baseProps} members={[]} />);
    expect(screen.queryByPlaceholderText('roleMembers.filterMembersPlaceholder')).toBeNull();
  });

  test('keeps the members filter visible when a search matches nothing', () => {
    render(<RoleMembersEditor {...baseProps} members={[]} memberSearchTerm="zzz" />);
    expect(screen.getByPlaceholderText('roleMembers.filterMembersPlaceholder')).toBeInTheDocument();
    // The members column shows "no results", not "no members".
    expect(screen.getByText('roleMembers.noResults')).toBeInTheDocument();
  });

  test('shows empty states when there are no members / no results', () => {
    render(<RoleMembersEditor {...baseProps} members={[]} availableUsers={[]} />);
    expect(screen.getByText('roleMembers.noMembers')).toBeInTheDocument();
    expect(screen.getByText('roleMembers.noResults')).toBeInTheDocument();
  });

  // sec-client-web-2: "holder read denied/unreachable" must render distinctly
  // from a genuine "no holders" result.
  test('shows an explicit unavailable message instead of noMembers when holdersUnavailable', () => {
    render(<RoleMembersEditor {...baseProps} members={[]} holdersUnavailable={true} />);
    expect(screen.getByRole('alert')).toHaveTextContent('roleMembers.holdersUnavailable');
    expect(screen.queryByText('roleMembers.noMembers')).toBeNull();
  });

  test('does not show the unavailable message when there are members', () => {
    render(<RoleMembersEditor {...baseProps} holdersUnavailable={true} />);
    expect(screen.queryByText('roleMembers.holdersUnavailable')).toBeNull();
  });

  // qual-clientweb-2: FR-012's verbatim server-rejection surfacing has no
  // coverage at any level — pin the one thing this component is responsible
  // for: rendering whatever `errorMessage` it is given, visibly, via role="alert".
  test('renders a server rejection message verbatim when errorMessage is set', () => {
    render(<RoleMembersEditor {...baseProps} errorMessage="Assigner capability: you may not grant this role." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Assigner capability: you may not grant this role.');
  });

  test('renders no alert when errorMessage is unset', () => {
    render(<RoleMembersEditor {...baseProps} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
