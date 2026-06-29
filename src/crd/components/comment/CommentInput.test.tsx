import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CommentInput } from './CommentInput';
import type { ComposerAttachment } from './types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { name?: string }) => (opts?.name ? `${key}:${opts.name}` : key),
  }),
}));

const ready: ComposerAttachment = { id: 'a1', name: 'photo.png', status: 'ready', mimeType: 'image/png' };
const uploading: ComposerAttachment = { id: 'a2', name: 'big.pdf', status: 'uploading', mimeType: 'application/pdf' };

describe('CommentInput attachments', () => {
  test('does not render the attach affordance unless attachments are enabled', () => {
    render(<CommentInput onSubmit={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'comments.attachments.attach' })).not.toBeInTheDocument();
  });

  test('picking files reports them to onAttachFiles', () => {
    const onAttachFiles = vi.fn();
    const { container } = render(
      <CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} onAttachFiles={onAttachFiles} />
    );
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'a.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onAttachFiles).toHaveBeenCalledWith([file]);
  });

  test('renders a chip per staged attachment and removes on click', async () => {
    const onRemoveAttachment = vi.fn();
    render(
      <CommentInput
        onSubmit={vi.fn()}
        attachmentsEnabled={true}
        attachments={[ready]}
        onRemoveAttachment={onRemoveAttachment}
      />
    );
    expect(screen.getByText('photo.png')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'comments.attachments.removeAttachment:photo.png' }));
    expect(onRemoveAttachment).toHaveBeenCalledWith('a1');
  });

  test('send is enabled for an attachment-only message (no text) once ready', async () => {
    const onSubmit = vi.fn();
    render(<CommentInput onSubmit={onSubmit} attachmentsEnabled={true} attachments={[ready]} />);
    const send = screen.getByRole('button', { name: 'comments.send' });
    expect(send).toBeEnabled();
    await userEvent.click(send);
    expect(onSubmit).toHaveBeenCalledWith('');
  });

  test('send is blocked while an attachment is still uploading', () => {
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} attachments={[uploading]} />);
    expect(screen.getByRole('button', { name: 'comments.send' })).toBeDisabled();
  });

  test('surfaces a validation/upload error as an alert', () => {
    render(<CommentInput onSubmit={vi.fn()} attachmentsEnabled={true} attachmentError="Too big" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Too big');
  });
});
