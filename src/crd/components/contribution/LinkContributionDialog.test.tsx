import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { FileUploadRejection, type RowFileUpload } from '@/crd/lib/fileSelection';
import { LinkContributionDialog } from './LinkContributionDialog';

vi.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});

// jsdom has no layout; adding a row scrolls it into view.
Element.prototype.scrollIntoView = vi.fn();

type Call = {
  file: File;
  options?: { silent?: boolean };
  resolve: (url: string) => void;
  reject: (e: unknown) => void;
};

const createControlledUpload = () => {
  const calls: Call[] = [];
  const upload = vi.fn<RowFileUpload>(
    (file, options) =>
      new Promise<string | null>((resolve, reject) => {
        calls.push({ file, options, resolve, reject });
      })
  );
  return { upload, calls };
};

const pdf = (name: string) => new File(['x'], name);
const fileInputs = () => Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
const pick = (input: HTMLInputElement, files: File[]) => fireEvent.change(input, { target: { files } });
const urlInputs = () => screen.getAllByLabelText('callout.linkUrlLabel') as HTMLInputElement[];
const nameInputs = () => screen.getAllByLabelText('callout.linkNameLabel') as HTMLInputElement[];
const descriptionInputs = () => screen.getAllByLabelText('callout.linkDescriptionLabel') as HTMLTextAreaElement[];
const createButton = () => screen.getByRole('button', { name: 'callout.linkCreate' });
const paperclips = () => screen.getAllByRole('button', { name: 'contributionSettings.prePopulate.attachFile' });

const renderCreate = (onFileUpload?: RowFileUpload, props: { open?: boolean; saving?: boolean } = {}) => {
  const onOpenChange = vi.fn();
  const onSubmit = vi.fn();
  const element = (open: boolean) => (
    <LinkContributionDialog
      mode="create"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      onFileUpload={onFileUpload}
      saving={props.saving}
    />
  );
  const utils = render(element(props.open ?? true));
  return { ...utils, onOpenChange, onSubmit, rerenderOpen: (open: boolean) => utils.rerender(element(open)) };
};

describe('LinkContributionDialog — create mode', () => {
  test('a one-file pick sets that row URL and its title to the full file name', async () => {
    const { upload, calls } = createControlledUpload();
    renderCreate(upload);

    pick(fileInputs()[0], [pdf('report.pdf')]);
    await act(async () => calls[0].resolve('https://cdn/report'));

    expect(calls[0].options).toBeUndefined();
    expect(urlInputs()[0]).toHaveValue('https://cdn/report');
    expect(nameInputs()[0]).toHaveValue('report.pdf');
  });

  test('a four-file pick fills the empty row and appends one row per later result, in completion order', async () => {
    const { upload, calls } = createControlledUpload();
    renderCreate(upload);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf'), pdf('d.pdf')]);
    expect(screen.getByText('a.pdf')).toBeInTheDocument();
    expect(screen.getByText('d.pdf')).toBeInTheDocument();

    await act(async () => calls[1].resolve('https://cdn/b'));
    expect(urlInputs()).toHaveLength(1);
    expect(urlInputs()[0]).toHaveValue('https://cdn/b');
    expect(nameInputs()[0]).toHaveValue('b.pdf');

    await act(async () => calls[0].resolve('https://cdn/a'));
    await act(async () => calls[2].resolve('https://cdn/c'));
    await act(async () => calls[3].resolve('https://cdn/d'));

    expect(urlInputs().map(i => i.value)).toEqual(['https://cdn/b', 'https://cdn/a', 'https://cdn/c', 'https://cdn/d']);
    expect(nameInputs().map(i => i.value)).toEqual(['b.pdf', 'a.pdf', 'c.pdf', 'd.pdf']);
    expect(descriptionInputs().map(i => i.value)).toEqual(['', '', '', '']);
    for (const call of calls) expect(call.options).toEqual({ silent: true });
  });

  test('a clicked row edited after the pick is not overwritten; the result is appended', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    renderCreate(upload);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf')]);
    await user.type(descriptionInputs()[0], 'mine');
    await act(async () => calls[0].resolve('https://cdn/a'));

    expect(urlInputs().map(i => i.value)).toEqual(['', 'https://cdn/a']);
    expect(descriptionInputs()[0]).toHaveValue('mine');
  });

  test('an oversized file is named in the notice while the others fill rows', async () => {
    const { upload, calls } = createControlledUpload();
    renderCreate(upload);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('big.pdf'), pdf('c.pdf')]);
    await act(async () => calls[0].resolve('https://cdn/a'));
    await act(async () => calls[1].reject(new FileUploadRejection({ kind: 'size', maxBytes: 1024 })));
    await act(async () => calls[2].resolve('https://cdn/c'));

    expect(urlInputs().map(i => i.value)).toEqual(['https://cdn/a', 'https://cdn/c']);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('big.pdf');
    expect(notice).toHaveTextContent('fileSelection.reason.size');
  });

  test('every paperclip is disabled while a multi pick uploads, enabled when the last settles', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    renderCreate(upload);
    await user.click(screen.getByRole('button', { name: 'callout.linkAddAnother' }));

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf')]);
    for (const clip of paperclips()) expect(clip).toBeDisabled();
    await act(async () => calls[0].resolve('https://cdn/a'));
    for (const clip of paperclips()) expect(clip).toBeDisabled();
    await act(async () => calls[1].resolve('https://cdn/b'));

    for (const clip of paperclips()) expect(clip).toBeEnabled();
  });

  test('every paperclip is disabled while a one-file pick uploads, enabled when it settles', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    renderCreate(upload);
    await user.click(screen.getByRole('button', { name: 'callout.linkAddAnother' }));

    pick(fileInputs()[1], [pdf('a.pdf')]);
    for (const clip of paperclips()) expect(clip).toBeDisabled();
    await act(async () => calls[0].resolve('https://cdn/a'));

    for (const clip of paperclips()) expect(clip).toBeEnabled();
  });

  test('with saving, every paperclip is disabled', () => {
    const { upload } = createControlledUpload();
    renderCreate(upload, { saving: true });

    for (const clip of paperclips()) expect(clip).toBeDisabled();
  });

  test('a one-file upload cancelled before it settles keeps the paperclips and Create disabled in the reopened dialog, then changes no row', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    const { onOpenChange, rerenderOpen } = renderCreate(upload);

    pick(fileInputs()[0], [pdf('a.pdf')]);
    await user.click(screen.getByRole('button', { name: 'dialogs.cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerenderOpen(false);
    rerenderOpen(true);

    for (const clip of paperclips()) expect(clip).toBeDisabled();
    expect(createButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'dialogs.cancel' })).toBeEnabled();

    await act(async () => calls[0].resolve('https://cdn/a'));

    expect(urlInputs().map(i => i.value)).toEqual(['']);
    expect(nameInputs()[0]).toHaveValue('callout.linkDefaultName');
    for (const clip of paperclips()) expect(clip).toBeEnabled();
    expect(createButton()).toBeEnabled();
  });

  test('a multi pick cancelled before it settles keeps Create disabled in the reopened dialog, a valid link notwithstanding', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    const { rerenderOpen } = renderCreate(upload);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]);
    await user.click(screen.getByRole('button', { name: 'dialogs.cancel' }));
    rerenderOpen(false);
    rerenderOpen(true);
    await user.type(urlInputs()[0], 'https://example.org');

    expect(createButton()).toBeDisabled();
    for (const clip of paperclips()) expect(clip).toBeDisabled();
    expect(screen.getByRole('button', { name: 'dialogs.cancel' })).toBeEnabled();

    await act(async () => calls[0].resolve('https://cdn/a'));
    await act(async () => calls[1].resolve('https://cdn/b'));
    expect(createButton()).toBeDisabled();
    await act(async () => calls[2].resolve('https://cdn/c'));

    expect(urlInputs().map(i => i.value)).toEqual(['https://example.org']);
    expect(createButton()).toBeEnabled();
    for (const clip of paperclips()) expect(clip).toBeEnabled();
  });

  test('Create is withheld while uploads run and Cancel stays enabled', async () => {
    const { upload, calls } = createControlledUpload();
    renderCreate(upload);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf')]);
    expect(createButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'dialogs.cancel' })).toBeEnabled();

    await act(async () => calls[0].resolve('https://cdn/a'));
    expect(createButton()).toBeDisabled();
    await act(async () => calls[1].resolve('https://cdn/b'));
    expect(createButton()).toBeEnabled();
  });

  test('Create is withheld while a one-file upload runs', async () => {
    const { upload, calls } = createControlledUpload();
    renderCreate(upload);

    pick(fileInputs()[0], [pdf('a.pdf')]);
    expect(createButton()).toBeDisabled();
    await act(async () => calls[0].resolve('https://cdn/a'));
    expect(createButton()).toBeEnabled();
  });

  test('after cancel, queued files never upload and a late result adds nothing to the reopened dialog', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    const { onOpenChange, rerenderOpen } = renderCreate(upload);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf'), pdf('d.pdf'), pdf('e.pdf')]);
    expect(upload).toHaveBeenCalledTimes(3);
    await user.click(screen.getByRole('button', { name: 'dialogs.cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerenderOpen(false);
    rerenderOpen(true);
    await act(async () => {
      for (const call of calls) call.resolve(`https://cdn/${call.file.name}`);
    });

    expect(upload).toHaveBeenCalledTimes(3);
    expect(urlInputs()).toHaveLength(1);
    expect(urlInputs()[0]).toHaveValue('');
    expect(screen.queryByText('a.pdf')).not.toBeInTheDocument();
  });

  test('no paperclip without an upload callback', () => {
    renderCreate(undefined);
    expect(fileInputs()).toHaveLength(0);
    expect(
      screen.queryByRole('button', { name: 'contributionSettings.prePopulate.attachFile' })
    ).not.toBeInTheDocument();
  });

  test('two failing files of a multi-file pick are named once each in the notice', async () => {
    const { upload, calls } = createControlledUpload();
    renderCreate(upload);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf')]);
    await act(async () => calls[0].reject(new FileUploadRejection({ kind: 'failed' })));
    await act(async () => calls[1].reject(new Error('boom')));

    const notice = screen.getByRole('status');
    expect(notice.textContent?.match(/a\.pdf/g)).toHaveLength(1);
    expect(notice.textContent?.match(/b\.pdf/g)).toHaveLength(1);
    for (const call of calls) expect(call.options).toEqual({ silent: true });
  });
});

describe('LinkContributionDialog — edit mode', () => {
  const renderEdit = (
    onFileUpload: RowFileUpload,
    initialValues: { url: string; displayName: string },
    saving?: boolean
  ) => {
    const element = (open: boolean, values: { url: string; displayName: string }) => (
      <LinkContributionDialog
        mode="edit"
        open={open}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        initialValues={{ ...values, description: '' }}
        onFileUpload={onFileUpload}
        saving={saving}
      />
    );
    const utils = render(element(true, initialValues));
    return {
      rerenderWith: (open: boolean, values: { url: string; displayName: string }) =>
        utils.rerender(element(open, values)),
    };
  };

  test('the paperclip takes one file and replaces the URL and title', async () => {
    const { upload, calls } = createControlledUpload();
    renderEdit(upload, { url: 'https://old', displayName: 'Old' });

    expect(fileInputs()[0]).not.toHaveAttribute('multiple');
    pick(fileInputs()[0], [pdf('new.pdf')]);
    await act(async () => calls[0].resolve('https://cdn/new'));

    expect(screen.getByLabelText('callout.linkUrlLabel')).toHaveValue('https://cdn/new');
    expect(screen.getByLabelText('callout.linkNameLabel')).toHaveValue('new.pdf');
  });

  test('an upload started for link A that resolves after link B was opened writes nothing into B', async () => {
    const { upload, calls } = createControlledUpload();
    const linkA = { url: 'https://a', displayName: 'A' };
    const linkB = { url: 'https://b', displayName: 'B' };
    const { rerenderWith } = renderEdit(upload, linkA);

    pick(fileInputs()[0], [pdf('for-a.pdf')]);
    rerenderWith(false, linkA);
    rerenderWith(true, linkB);
    await act(async () => calls[0].resolve('https://cdn/for-a'));

    expect(screen.getByLabelText('callout.linkUrlLabel')).toHaveValue('https://b');
    expect(screen.getByLabelText('callout.linkNameLabel')).toHaveValue('B');
  });

  const saveButton = () => screen.getByRole('button', { name: 'callout.linkSave' });
  const paperclip = () => screen.getByRole('button', { name: 'contributionSettings.prePopulate.attachFile' });

  test('while the upload runs, Save and the paperclip are disabled and Cancel is enabled', async () => {
    const { upload, calls } = createControlledUpload();
    renderEdit(upload, { url: 'https://old', displayName: 'Old' });

    pick(fileInputs()[0], [pdf('new.pdf')]);
    expect(saveButton()).toBeDisabled();
    expect(paperclip()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'dialogs.cancel' })).toBeEnabled();

    await act(async () => calls[0].resolve('https://cdn/new'));
    expect(screen.getByLabelText('callout.linkUrlLabel')).toHaveValue('https://cdn/new');
    expect(screen.getByLabelText('callout.linkNameLabel')).toHaveValue('new.pdf');
    expect(saveButton()).toBeEnabled();
  });

  test('after a cancel and reopen during the upload, Save and the paperclip stay disabled until it settles', async () => {
    const { upload, calls } = createControlledUpload();
    const link = { url: 'https://old', displayName: 'Old' };
    const { rerenderWith } = renderEdit(upload, link);

    pick(fileInputs()[0], [pdf('new.pdf')]);
    rerenderWith(false, link);
    rerenderWith(true, link);
    expect(saveButton()).toBeDisabled();
    expect(paperclip()).toBeDisabled();

    await act(async () => calls[0].resolve('https://cdn/new'));
    expect(saveButton()).toBeEnabled();
    expect(paperclip()).toBeEnabled();
  });

  test('with saving, the paperclip is disabled', () => {
    const { upload } = createControlledUpload();
    renderEdit(upload, { url: 'https://old', displayName: 'Old' }, true);

    expect(paperclip()).toBeDisabled();
  });
});
