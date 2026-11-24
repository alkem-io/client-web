import { render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { GroupSettingsDialog } from './GroupSettingsDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/crd/primitives/avatar');

const renderDialog = () =>
  render(
    <GroupSettingsDialog
      open={true}
      onOpenChange={vi.fn()}
      displayName="Team"
      members={[
        { id: 'me', name: 'Me', isCurrentUser: true, presence: 'online', statusMessage: 'Focusing' },
        { id: 'ann', name: 'Ann', presence: 'busy', statusMessage: 'Back at 3' },
        { id: 'bob', name: 'Bob', presence: 'unknown' },
      ]}
      searchQuery=""
      onSearchChange={vi.fn()}
      searchResults={[]}
      onAddMember={vi.fn()}
      onRemoveMember={vi.fn()}
      onLeaveGroup={vi.fn()}
      onSave={vi.fn()}
    />
  );

const rowOf = (name: string) => screen.getByText(name).closest('li') as HTMLElement;

describe('GroupSettingsDialog members', () => {
  test("each member's avatar carries their availability dot, and a set status message sits under the name", () => {
    renderDialog();
    const ann = rowOf('Ann');
    expect(within(ann).getByRole('img', { name: 'presence.busy' })).toBeInTheDocument();
    expect(within(ann).getByText('Back at 3')).toHaveAttribute('title', 'Back at 3');
  });

  test('your own row shows your status too', () => {
    renderDialog();
    const me = rowOf('Me');
    expect(within(me).getByRole('img', { name: 'presence.online' })).toBeInTheDocument();
    expect(within(me).getByText('Focusing')).toBeInTheDocument();
  });

  test('a member with unknown availability and no status message gets neither', () => {
    renderDialog();
    expect(within(rowOf('Bob')).queryByRole('img')).not.toBeInTheDocument();
    // The name column holds the name line alone.
    expect(screen.getByText('Bob').parentElement?.children).toHaveLength(1);
  });
});
