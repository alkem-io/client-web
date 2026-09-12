import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import {
  OrgAssociateSettingsDialog,
  type OrgAssociateSettingsDialogProps,
  type OrgAssociateSettingsSubject,
} from './OrgAssociateSettingsDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const subject = (overrides: Partial<OrgAssociateSettingsSubject> = {}): OrgAssociateSettingsSubject => ({
  id: 'user-1',
  displayName: 'Ada Lovelace',
  color: '#42a5f5',
  isAssociate: true,
  isAdmin: true,
  isOwner: false,
  ...overrides,
});

const renderDialog = (overrides: Partial<OrgAssociateSettingsDialogProps> = {}) => {
  const props: OrgAssociateSettingsDialogProps = {
    open: true,
    onOpenChange: vi.fn(),
    subject: subject(),
    saving: false,
    onSave: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  };
  render(<OrgAssociateSettingsDialog {...props} />);
  return props;
};

const adminToggle = () => screen.getByLabelText('org.associates.editor.adminLabel');
const removeButton = () => screen.getByRole('button', { name: 'org.associates.editor.remove' });

describe('OrgAssociateSettingsDialog — accessibility', () => {
  test('gives the dialog an accessible description, not just a title', () => {
    renderDialog();
    // Radix warns (and screen-reader users get nothing) when DialogContent has no
    // aria-describedby. The description is sr-only, so assert the wiring, not the pixels.
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('org.associates.editor.description');
  });
});

describe('OrgAssociateSettingsDialog — self-admin guard (R43 / FR-019a)', () => {
  test('locks the Admin toggle and says why when an admin edits their own row', () => {
    renderDialog({ isSelf: true });
    expect(adminToggle()).toBeDisabled();
    expect(screen.getByText('org.associates.editor.selfAdminLocked')).toBeInTheDocument();
  });

  test('also blocks Remove from organisation on one’s own admin row', () => {
    renderDialog({ isSelf: true });
    // Remove would strip the Admin role along with everything else, so the guard
    // has to cover it too — otherwise the toggle is a speed bump with a door beside it.
    expect(removeButton()).toBeDisabled();
  });

  test('saves the Admin role unchanged when an admin edits their own row', async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog({ isSelf: true });
    await user.click(screen.getByRole('button', { name: 'org.associates.editor.save' }));
    expect(onSave).toHaveBeenCalledWith({ isAssociate: true, isAdmin: true, isOwner: false });
  });

  test('leaves another administrator’s row fully editable', async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog({ isSelf: false });
    expect(adminToggle()).toBeEnabled();
    expect(removeButton()).toBeEnabled();
    expect(screen.queryByText('org.associates.editor.selfAdminLocked')).not.toBeInTheDocument();

    await user.click(adminToggle());
    await user.click(screen.getByRole('button', { name: 'org.associates.editor.save' }));
    expect(onSave).toHaveBeenCalledWith({ isAssociate: true, isAdmin: false, isOwner: false });
  });

  test('leaves one’s own row editable when one is not an admin of the organisation', () => {
    renderDialog({ isSelf: true, subject: subject({ isAdmin: false }) });
    expect(adminToggle()).toBeEnabled();
    expect(removeButton()).toBeEnabled();
    expect(screen.queryByText('org.associates.editor.selfAdminLocked')).not.toBeInTheDocument();
  });
});
