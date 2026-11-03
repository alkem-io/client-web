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

const onChangeSpy = vi.fn();

/** Keeps rows in state and hands the editor a freshly mapped array on every render. */
function Host({
  initial,
  onFileUpload,
  disabled,
}: {
  initial: LinkRow[];
  onFileUpload: RowFileUpload;
  disabled?: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const [, setTick] = useState(0);
  return (
    <>
      <button type="button" onClick={() => setTick(n => n + 1)}>
        rerender
      </button>
      <LinksPrePopulateRows
        rows={rows.map(r => ({ ...r }))}
        onChange={next => {
          onChangeSpy(next);
          setRows(next);
        }}
        onFileUpload={onFileUpload}
        disabled={disabled}
      />
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
const paperclips = () => screen.getAllByRole('button', { name: 'contributionSettings.prePopulate.attachFile' });

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

  test('removing an earlier row during the uploads appends every result and leaves the clicked row as authored', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(
      <Host
        initial={[
          { title: 'A', url: 'https://a', description: '' },
          { title: 'B', url: '', description: 'about B' },
        ]}
        onFileUpload={upload}
      />
    );

    pick(fileInputs()[1], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.click(screen.getAllByRole('button', { name: 'contributionSettings.prePopulate.removeRow' })[0]);
    await act(async () => {
      calls[0].resolve('https://cdn/alpha');
      calls[1].resolve('https://cdn/beta');
    });

    expect(titleInputs().map(i => i.value)).toEqual(['B', 'alpha', 'beta']);
    expect(urlInputs().map(i => i.value)).toEqual(['', 'https://cdn/alpha', 'https://cdn/beta']);
    expect(descriptionInputs()[0]).toHaveValue('about B');
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

  test('after unmount, late multi-file results call no onChange and queued files never start', async () => {
    const { upload, calls } = createControlledUpload();
    const { unmount } = render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf'), pdf('d.pdf')]);
    onChangeSpy.mockClear();
    unmount();
    await act(async () => {
      for (const call of [...calls]) call.resolve(`https://cdn/${call.file.name}`);
    });

    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(upload).toHaveBeenCalledTimes(3);
  });

  test('after unmount, a late one-file result calls no onChange', async () => {
    const { upload, calls } = createControlledUpload();
    const { unmount } = render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf')]);
    onChangeSpy.mockClear();
    unmount();
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});

describe('LinksPrePopulateRows — one pick at a time', () => {
  test('while a multi-file pick uploads, every paperclip is disabled until the last settles', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow, { ...emptyRow }]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf')]);
    for (const clip of paperclips()) expect(clip).toBeDisabled();
    await act(async () => calls[0].resolve('https://cdn/a'));
    for (const clip of paperclips()) expect(clip).toBeDisabled();
    await act(async () => calls[1].resolve('https://cdn/b'));

    for (const clip of paperclips()) expect(clip).toBeEnabled();
  });

  test('while a one-file pick uploads, every paperclip is disabled until it settles', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow, { ...emptyRow }]} onFileUpload={upload} />);

    pick(fileInputs()[1], [pdf('a.pdf')]);
    for (const clip of paperclips()) expect(clip).toBeDisabled();
    await act(async () => calls[0].resolve('https://cdn/a'));

    for (const clip of paperclips()) expect(clip).toBeEnabled();
  });

  test('with disabled, every paperclip is disabled', () => {
    const { upload } = createControlledUpload();
    render(<Host initial={[emptyRow, { ...emptyRow }]} onFileUpload={upload} disabled={true} />);

    for (const clip of paperclips()) expect(clip).toBeDisabled();
  });
});

describe('LinksPrePopulateRows — a result calls the onChange current when it lands', () => {
  function SwapHost({ onFileUpload, onChange }: { onFileUpload: RowFileUpload; onChange: (rows: LinkRow[]) => void }) {
    return <LinksPrePopulateRows rows={[emptyRow]} onChange={onChange} onFileUpload={onFileUpload} />;
  }

  test('a one-file result calls the new onChange once and never the pick-time one', async () => {
    const { upload, calls } = createControlledUpload();
    const pickTime = vi.fn();
    const current = vi.fn();
    const { rerender } = render(<SwapHost onFileUpload={upload} onChange={pickTime} />);

    pick(fileInputs()[0], [pdf('alpha.pdf')]);
    rerender(<SwapHost onFileUpload={upload} onChange={current} />);
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(pickTime).not.toHaveBeenCalled();
    expect(current).toHaveBeenCalledTimes(1);
    expect(current).toHaveBeenCalledWith([{ title: 'alpha', url: 'https://cdn/alpha', description: '' }]);
  });

  test('each multi-file result calls the onChange current when it lands', async () => {
    const { upload, calls } = createControlledUpload();
    const pickTime = vi.fn();
    const later = vi.fn();
    const { rerender } = render(<SwapHost onFileUpload={upload} onChange={pickTime} />);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf')]);
    rerender(<SwapHost onFileUpload={upload} onChange={later} />);
    await act(async () => calls[0].resolve('https://cdn/a'));
    await act(async () => calls[1].resolve('https://cdn/b'));

    expect(pickTime).not.toHaveBeenCalled();
    expect(later).toHaveBeenCalledTimes(2);
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
