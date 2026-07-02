import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { CollaboraDocumentDisplayName } from './CollaboraDocumentDisplayName';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('CollaboraDocumentDisplayName', () => {
  test('read-only shows the name and no rename affordance', () => {
    render(<CollaboraDocumentDisplayName displayName="Budget" readOnly={true} />);
    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.queryByLabelText('collabora.rename.edit')).not.toBeInTheDocument();
  });

  test('shows a pencil that triggers onEdit', () => {
    const onEdit = vi.fn();
    render(<CollaboraDocumentDisplayName displayName="Budget" onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText('collabora.rename.edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test('editing: typing calls onChange; Save/Enter call onSave; Cancel/Escape call onCancel', () => {
    const onChange = vi.fn();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <CollaboraDocumentDisplayName
        displayName="Budget"
        value="Budget 2026"
        editing={true}
        onChange={onChange}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
    const input = screen.getByLabelText('collabora.rename.inputLabel');
    fireEvent.change(input, { target: { value: 'Q1' } });
    expect(onChange).toHaveBeenCalledWith('Q1');

    fireEvent.click(screen.getByLabelText('collabora.rename.save'));
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByLabelText('collabora.rename.cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  test('renders a validation error while editing', () => {
    render(
      <CollaboraDocumentDisplayName
        displayName="Budget"
        value="ab"
        editing={true}
        error="collabora.rename.errors.tooShort"
      />
    );
    expect(screen.getByText('collabora.rename.errors.tooShort')).toBeInTheDocument();
  });

  test('does not save/cancel via keyboard while saving', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <CollaboraDocumentDisplayName
        displayName="Budget"
        value="Q1 plan"
        editing={true}
        saving={true}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
    const input = screen.getByLabelText('collabora.rename.inputLabel');
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onSave).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
