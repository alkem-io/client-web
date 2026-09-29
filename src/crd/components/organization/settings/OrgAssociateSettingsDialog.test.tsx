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

describe('OrgAssociateSettingsDialog — role editing', () => {
  test('lets an administrator remove the Admin role from their own row', async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog();
    // Nothing about the editor is scoped to who is signed in: an administrator
    // can demote themselves here, the same way they can demote anyone else.
    expect(adminToggle()).toBeEnabled();
    expect(removeButton()).toBeEnabled();

    await user.click(adminToggle());
    await user.click(screen.getByRole('button', { name: 'org.associates.editor.save' }));
    expect(onSave).toHaveBeenCalledWith({ isAssociate: true, isAdmin: false, isOwner: false });
  });

  test('turning Admin on also turns Associate on, since Admin requires the entry role', async () => {
    const user = userEvent.setup();
    const { onSave } = renderDialog({ subject: subject({ isAssociate: false, isAdmin: false }) });
    await user.click(adminToggle());
    await user.click(screen.getByRole('button', { name: 'org.associates.editor.save' }));
    expect(onSave).toHaveBeenCalledWith({ isAssociate: true, isAdmin: true, isOwner: false });
  });
});
