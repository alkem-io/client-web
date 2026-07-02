import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { RenameCollaboraDocumentDialog } from './RenameCollaboraDocumentDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const updateMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateCollaboraDocumentMutation: () => [updateMock, { loading: false }],
}));

const renderDialog = (onClose = vi.fn()) => {
  render(
    <RenameCollaboraDocumentDialog open={true} collaboraDocumentId="doc-1" displayName="Budget" onClose={onClose} />
  );
  return { onClose };
};

beforeEach(() => {
  updateMock.mockReset();
  updateMock.mockResolvedValue({});
});

describe('RenameCollaboraDocumentDialog', () => {
  test('seeds the field with the current name', () => {
    renderDialog();
    expect(screen.getByLabelText('collabora.rename.inputLabel')).toHaveValue('Budget');
  });

  test('valid rename persists and closes', async () => {
    const { onClose } = renderDialog();
    fireEvent.change(screen.getByLabelText('collabora.rename.inputLabel'), { target: { value: 'Q1 Plan' } });
    fireEvent.click(screen.getByRole('button', { name: 'collabora.rename.save' }));
    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith({ variables: { updateData: { ID: 'doc-1', displayName: 'Q1 Plan' } } })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  test('invalid rename is rejected — no mutation, dialog stays open', async () => {
    const { onClose } = renderDialog();
    fireEvent.change(screen.getByLabelText('collabora.rename.inputLabel'), { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'collabora.rename.save' }));
    expect(await screen.findByText('collabora.rename.errors.tooShort')).toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test('cancel closes without saving', () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'collabora.rename.cancel' }));
    expect(onClose).toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });
});
