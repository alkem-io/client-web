import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import type { LinkRow } from '@/crd/forms/callout/types';
import type { RowFileUpload } from '@/crd/lib/fileSelection';
import { LinksPrePopulateRows } from './LinksPrePopulateRows';

vi.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});

type Call = { file: File; options?: { silent?: boolean }; resolve: (url: string | null) => void };

const createControlledUpload = () => {
  const calls: Call[] = [];
  const upload = vi.fn<RowFileUpload>(
    (file, options) =>
      new Promise<string | null>(resolve => {
        calls.push({ file, options, resolve });
      })
  );
  return { upload, calls };
};

/** Keeps rows in state and hands the editor a freshly mapped array on every render. */
function Host({ initial, onFileUpload }: { initial: LinkRow[]; onFileUpload: RowFileUpload }) {
  const [rows, setRows] = useState(initial);
  const [, setTick] = useState(0);
  return (
    <>
      <button type="button" onClick={() => setTick(n => n + 1)}>
        rerender
      </button>
      <LinksPrePopulateRows rows={rows.map(r => ({ ...r }))} onChange={setRows} onFileUpload={onFileUpload} />
    </>
  );
}

const emptyRow: LinkRow = { title: '', url: '', description: '' };
const pdf = (name: string) => new File(['x'], name);
const fileInputs = () => Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
const pick = (input: HTMLInputElement, files: File[]) => fireEvent.change(input, { target: { files } });
const titleInputs = () => screen.getAllByLabelText('contributionSettings.prePopulate.titleLabel') as HTMLInputElement[];
const urlInputs = () => screen.getAllByLabelText('contributionSettings.prePopulate.urlLabel') as HTMLInputElement[];
const descriptionInputs = () =>
  screen.getAllByLabelText('contributionSettings.prePopulate.descriptionLabel') as HTMLInputElement[];

describe('LinksPrePopulateRows — several files on one paperclip', () => {
  test('the first result fills the empty clicked row, later ones are appended, uploading files are listed', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf'), pdf('gamma.pdf')]);
    expect(screen.getByText('beta.pdf')).toBeInTheDocument();

    await act(async () => calls[2].resolve('https://cdn/gamma'));
    await act(async () => calls[0].resolve('https://cdn/alpha'));
    await act(async () => calls[1].resolve('https://cdn/beta'));

    expect(urlInputs().map(i => i.value)).toEqual(['https://cdn/gamma', 'https://cdn/alpha', 'https://cdn/beta']);
    expect(titleInputs().map(i => i.value)).toEqual(['gamma', 'alpha', 'beta']);
    expect(descriptionInputs().map(i => i.value)).toEqual(['', '', '']);
    for (const call of calls) expect(call.options).toEqual({ silent: true });
  });

  test('a re-render between pick and completion still fills the clicked row', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.click(screen.getByRole('button', { name: 'rerender' }));
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(urlInputs().map(i => i.value)).toEqual(['https://cdn/alpha']);
  });

  test('a clicked row whose description was edited after the pick is not overwritten', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.type(descriptionInputs()[0], 'Mine');
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(urlInputs().map(i => i.value)).toEqual(['', 'https://cdn/alpha']);
    expect(descriptionInputs()[0]).toHaveValue('Mine');
  });

  test('two results settling in the same act both land', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[{ title: 'Kept', url: 'https://kept', description: '' }]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await act(async () => {
      calls[0].resolve('https://cdn/alpha');
      calls[1].resolve('https://cdn/beta');
    });

    expect(urlInputs().map(i => i.value)).toEqual(['https://kept', 'https://cdn/alpha', 'https://cdn/beta']);
  });

  test('a one-file pick made while a batch from the same row runs keeps every file (a, c, b order)', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf')]);
    pick(fileInputs()[0], [pdf('c.pdf')]);
    expect(calls.map(call => call.file.name)).toEqual(['a.pdf', 'b.pdf', 'c.pdf']);

    await act(async () => calls[0].resolve('https://cdn/a'));
    await act(async () => calls[2].resolve('https://cdn/c'));
    await act(async () => calls[1].resolve('https://cdn/b'));

    expect(urlInputs().map(i => i.value)).toEqual(['https://cdn/c', 'https://cdn/a', 'https://cdn/b']);
    expect(titleInputs().map(i => i.value)).toEqual(['c', 'a', 'b']);
  });

  test('removing a row while uploads run writes every result into its own row (a, b batch on row 1, c on row 2)', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow, { ...emptyRow }]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf')]);
    pick(fileInputs()[1], [pdf('c.pdf')]);
    await user.click(screen.getAllByRole('button', { name: 'contributionSettings.prePopulate.removeRow' })[0]);
    expect(urlInputs()).toHaveLength(1);

    await act(async () => calls[0].resolve('https://cdn/a'));
    await act(async () => calls[1].resolve('https://cdn/b'));
    await act(async () => calls[2].resolve('https://cdn/c'));

    expect(urlInputs().map(i => i.value)).toEqual(['https://cdn/c', 'https://cdn/a', 'https://cdn/b']);
    expect(titleInputs().map(i => i.value)).toEqual(['c', 'a', 'b']);
  });

  test('removing a row above the clicked one still fills the clicked row', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[{ title: 'Gone', url: '', description: '' }, emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[1], [pdf('a.pdf'), pdf('b.pdf')]);
    await user.click(screen.getAllByRole('button', { name: 'contributionSettings.prePopulate.removeRow' })[0]);
    await act(async () => calls[0].resolve('https://cdn/a'));
    await act(async () => calls[1].resolve('https://cdn/b'));

    expect(urlInputs().map(i => i.value)).toEqual(['https://cdn/a', 'https://cdn/b']);
    expect(titleInputs().map(i => i.value)).toEqual(['a', 'b']);
  });

  test('one file picked behaves as today', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf')]);
    expect(calls[0].options).toBeUndefined();
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(urlInputs().map(i => i.value)).toEqual(['https://cdn/alpha']);
    expect(titleInputs()[0]).toHaveValue('alpha');
  });
});

/** Merges rows into a whole form value captured at render. */
function WholeFormHost({ onFileUpload }: { onFileUpload: RowFileUpload }) {
  const [value, setValue] = useState({ title: 'Callout', rows: [emptyRow] });
  return (
    <>
      <input aria-label="title" value={value.title} onChange={e => setValue({ ...value, title: e.target.value })} />
      <LinksPrePopulateRows
        rows={value.rows}
        onChange={rows => setValue({ ...value, rows })}
        onFileUpload={onFileUpload}
      />
    </>
  );
}

describe('LinksPrePopulateRows — a host that merges rows into its whole form value', () => {
  test('a multi-file result landing after another field was edited keeps that edit', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<WholeFormHost onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.type(screen.getByLabelText('title'), ' renamed');
    await act(async () => calls[0].resolve('https://cdn/alpha'));
    await act(async () => calls[1].resolve('https://cdn/beta'));

    expect(screen.getByLabelText('title')).toHaveValue('Callout renamed');
    expect(urlInputs().map(i => i.value)).toEqual(['https://cdn/alpha', 'https://cdn/beta']);
  });
});
