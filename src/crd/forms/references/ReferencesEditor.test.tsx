import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { FileUploadRejection, type RowFileUpload } from '@/crd/lib/fileSelection';
import { type ReferenceRow, ReferencesEditor } from './ReferencesEditor';

vi.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});

type Call = {
  file: File;
  options?: { silent?: boolean };
  resolve: (url: string | null) => void;
  reject: (e: unknown) => void;
};

const createControlledUpload = () => {
  const calls: Call[] = [];
  let settled = 0;
  const upload = vi.fn<RowFileUpload>(
    (file, options) =>
      new Promise<string | null>((resolve, reject) => {
        calls.push({
          file,
          options,
          resolve: url => {
            settled += 1;
            resolve(url);
          },
          reject: e => {
            settled += 1;
            reject(e);
          },
        });
      })
  );
  return { upload, calls, inFlight: () => calls.length - settled };
};

const onChangeSpy = vi.fn();

/** Keeps rows in state and hands the editor a freshly mapped array on every render, as the
 *  profile settings views do. */
function Host({
  initial,
  onFileUpload,
  disabled,
}: {
  initial: ReferenceRow[];
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
      <ReferencesEditor
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

const emptyRow: ReferenceRow = { name: '', uri: '', description: '' };
const pdf = (name: string) => new File(['x'], name);
const fileInputs = () => Array.from(document.querySelectorAll('input[type="file"]')) as HTMLInputElement[];
const pick = (input: HTMLInputElement, files: File[]) => fireEvent.change(input, { target: { files } });
const nameInputs = () => screen.getAllByLabelText('references.nameLabel') as HTMLInputElement[];
const uriInputs = () => screen.getAllByLabelText('references.uriLabel') as HTMLInputElement[];
const descriptionInputs = () => screen.getAllByLabelText('references.descriptionLabel') as HTMLInputElement[];
const paperclips = () => screen.getAllByRole('button', { name: 'references.attachFile' });

describe('ReferencesEditor — several files on one paperclip', () => {
  test('the first result fills the empty clicked row, later ones are appended, uploading files are listed', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf'), pdf('gamma.pdf')]);
    expect(screen.getByText('alpha.pdf')).toBeInTheDocument();
    expect(screen.getByText('gamma.pdf')).toBeInTheDocument();

    await act(async () => calls[0].resolve('https://cdn/alpha'));
    await act(async () => calls[1].resolve('https://cdn/beta'));
    await act(async () => calls[2].resolve('https://cdn/gamma'));

    expect(uriInputs().map(i => i.value)).toEqual(['https://cdn/alpha', 'https://cdn/beta', 'https://cdn/gamma']);
    expect(nameInputs().map(i => i.value)).toEqual(['alpha', 'beta', 'gamma']);
    expect(descriptionInputs().map(i => i.value)).toEqual(['', '', '']);
    expect(screen.queryByText('alpha.pdf')).not.toBeInTheDocument();
    for (const call of calls) expect(call.options).toEqual({ silent: true });
  });

  test('a re-render between pick and completion still fills the clicked row', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.click(screen.getByRole('button', { name: 'rerender' }));
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(uriInputs().map(i => i.value)).toEqual(['https://cdn/alpha']);
  });

  test('a clicked row whose name was edited after the pick is not overwritten', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.type(nameInputs()[0], 'Mine');
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(nameInputs().map(i => i.value)).toEqual(['Mine', 'alpha']);
    expect(uriInputs().map(i => i.value)).toEqual(['', 'https://cdn/alpha']);
  });

  test('a clicked row whose URL was cleared after the pick is not filled; results are appended', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[{ name: '', uri: 'https://old', description: '' }]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.clear(uriInputs()[0]);
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(uriInputs().map(i => i.value)).toEqual(['', 'https://cdn/alpha']);
    expect(nameInputs().map(i => i.value)).toEqual(['', 'alpha']);
  });

  test('two results settling in the same act both land', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[{ name: 'Kept', uri: 'https://kept', description: '' }]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await act(async () => {
      calls[0].resolve('https://cdn/alpha');
      calls[1].resolve('https://cdn/beta');
    });

    expect(uriInputs().map(i => i.value)).toEqual(['https://kept', 'https://cdn/alpha', 'https://cdn/beta']);
  });

  test('removing an earlier row during the uploads appends every result and leaves the clicked row as authored', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(
      <Host
        initial={[
          { name: 'A', uri: 'https://a', description: '' },
          { name: 'B', uri: '', description: 'about B' },
        ]}
        onFileUpload={upload}
      />
    );

    pick(fileInputs()[1], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.click(screen.getAllByRole('button', { name: 'references.removeRow' })[0]);
    await user.click(screen.getByRole('button', { name: 'references.removeConfirm.confirm' }));
    await act(async () => {
      calls[0].resolve('https://cdn/alpha');
      calls[1].resolve('https://cdn/beta');
    });

    expect(nameInputs().map(i => i.value)).toEqual(['B', 'alpha', 'beta']);
    expect(uriInputs().map(i => i.value)).toEqual(['', 'https://cdn/alpha', 'https://cdn/beta']);
    expect(descriptionInputs()[0]).toHaveValue('about B');
  });

  test('removing the clicked row during the uploads appends every result, even when an identical row takes its place', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(
      <Host
        initial={[
          { name: 'Report', uri: '', description: '' },
          { id: 'kept', name: 'Report', uri: '', description: '' },
        ]}
        onFileUpload={upload}
      />
    );

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.click(screen.getAllByRole('button', { name: 'references.removeRow' })[0]);
    await user.click(screen.getByRole('button', { name: 'references.removeConfirm.confirm' }));
    await act(async () => {
      calls[0].resolve('https://cdn/alpha');
      calls[1].resolve('https://cdn/beta');
    });

    expect(nameInputs().map(i => i.value)).toEqual(['Report', 'alpha', 'beta']);
    expect(uriInputs().map(i => i.value)).toEqual(['', 'https://cdn/alpha', 'https://cdn/beta']);
  });

  test('one failure of three: two rows added and the failed file is named once, with no notification', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf'), pdf('gamma.pdf')]);
    await act(async () => calls[0].resolve('https://cdn/alpha'));
    await act(async () => calls[1].reject(new FileUploadRejection({ kind: 'failed' })));
    await act(async () => calls[2].resolve('https://cdn/gamma'));

    expect(uriInputs().map(i => i.value)).toEqual(['https://cdn/alpha', 'https://cdn/gamma']);
    const notice = screen.getByRole('status');
    expect(notice.textContent?.match(/beta\.pdf/g)).toHaveLength(1);
    expect(notice).toHaveTextContent('fileSelection.reason.failed');
  });

  test('two failing files are each named once in the notice and every upload was silent', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await act(async () => calls[0].reject(new FileUploadRejection({ kind: 'size', maxBytes: 1024 * 1024 })));
    await act(async () => calls[1].reject(new Error('network')));

    const notice = screen.getByRole('status');
    expect(notice.textContent?.match(/alpha\.pdf/g)).toHaveLength(1);
    expect(notice.textContent?.match(/beta\.pdf/g)).toHaveLength(1);
    for (const call of calls) expect(call.options).toEqual({ silent: true });
  });

  test('one file picked behaves as today: same row, not silent', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf')]);
    expect(calls[0].options).toBeUndefined();
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(uriInputs().map(i => i.value)).toEqual(['https://cdn/alpha']);
    expect(nameInputs()[0]).toHaveValue('alpha');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
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

  test('26 files: 25 rows and the 26th is named', async () => {
    const { upload, calls, inFlight } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(
      fileInputs()[0],
      Array.from({ length: 26 }, (_, i) => pdf(`file-${i + 1}.pdf`))
    );
    for (let i = 0; i < 25; i += 1) {
      expect(inFlight()).toBeLessThanOrEqual(3);
      await act(async () => calls[i].resolve(`https://cdn/${i + 1}`));
    }

    expect(uriInputs()).toHaveLength(25);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('file-26.pdf');
    expect(notice).toHaveTextContent('fileSelection.reason.limit');
  });

  test('files the upload rejects for their type each reach it once, add no row and are named; dismiss clears, later selections add', async () => {
    const user = userEvent.setup();
    const upload = vi.fn<RowFileUpload>(async () => {
      throw new FileUploadRejection({ kind: 'type' });
    });
    render(<Host initial={[emptyRow]} onFileUpload={upload} />);
    onChangeSpy.mockClear();

    await act(async () => pick(fileInputs()[0], [pdf('a.png'), pdf('b.gif')]));
    expect(upload).toHaveBeenCalledTimes(2);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(uriInputs()).toHaveLength(1);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('a.png');
    expect(notice).toHaveTextContent('b.gif');
    expect(notice).toHaveTextContent('fileSelection.reason.type');

    await user.click(screen.getByRole('button', { name: 'fileSelection.dismiss' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await act(async () => pick(fileInputs()[0], [pdf('c.png'), pdf('d.png')]));
    await act(async () => pick(fileInputs()[0], [pdf('e.png'), pdf('f.png')]));
    const later = screen.getByRole('status');
    expect(later).toHaveTextContent('c.png');
    expect(later).toHaveTextContent('f.png');
    expect(later).not.toHaveTextContent('a.png');
  });
});

describe('ReferencesEditor — one pick at a time', () => {
  test('while a multi-file pick uploads, every paperclip is disabled until the last settles', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow, { ...emptyRow }]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]);
    for (const clip of paperclips()) expect(clip).toBeDisabled();

    await act(async () => calls[0].resolve('https://cdn/a'));
    await act(async () => calls[1].resolve('https://cdn/b'));
    for (const clip of paperclips()) expect(clip).toBeDisabled();
    await act(async () => calls[2].resolve('https://cdn/c'));

    for (const clip of paperclips()) expect(clip).toBeEnabled();
  });

  test('while a one-file pick uploads, every paperclip is disabled until it settles', async () => {
    const { upload, calls } = createControlledUpload();
    render(<Host initial={[emptyRow, { ...emptyRow }]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('a.pdf')]);
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

describe('ReferencesEditor — a result calls the onChange current when it lands', () => {
  function SwapHost({
    onFileUpload,
    onChange,
  }: {
    onFileUpload: RowFileUpload;
    onChange: (rows: ReferenceRow[]) => void;
  }) {
    return <ReferencesEditor rows={[emptyRow]} onChange={onChange} onFileUpload={onFileUpload} />;
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
    expect(current).toHaveBeenCalledWith([{ name: 'alpha', uri: 'https://cdn/alpha', description: '' }]);
  });

  test('each multi-file result calls the onChange current when it lands', async () => {
    const { upload, calls } = createControlledUpload();
    const pickTime = vi.fn();
    const second = vi.fn();
    const third = vi.fn();
    const { rerender } = render(<SwapHost onFileUpload={upload} onChange={pickTime} />);

    pick(fileInputs()[0], [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]);
    rerender(<SwapHost onFileUpload={upload} onChange={second} />);
    await act(async () => calls[0].resolve('https://cdn/a'));
    rerender(<SwapHost onFileUpload={upload} onChange={third} />);
    await act(async () => calls[1].resolve('https://cdn/b'));
    await act(async () => calls[2].resolve('https://cdn/c'));

    expect(pickTime).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(third).toHaveBeenCalledTimes(2);
  });
});

/** Merges rows into a whole form value captured at render, as `InnovationPackForm` does. */
function WholeFormHost({ onFileUpload }: { onFileUpload: RowFileUpload }) {
  const [value, setValue] = useState({ title: 'Pack', references: [emptyRow] });
  return (
    <>
      <input aria-label="title" value={value.title} onChange={e => setValue({ ...value, title: e.target.value })} />
      <ReferencesEditor
        rows={value.references}
        onChange={references => setValue({ ...value, references })}
        onFileUpload={onFileUpload}
      />
    </>
  );
}

describe('ReferencesEditor — a host that merges rows into its whole form value', () => {
  test('a multi-file result landing after another field was edited keeps that edit', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<WholeFormHost onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    await user.type(screen.getByLabelText('title'), ' renamed');
    await act(async () => calls[0].resolve('https://cdn/alpha'));
    await act(async () => calls[1].resolve('https://cdn/beta'));

    expect(screen.getByLabelText('title')).toHaveValue('Pack renamed');
    expect(uriInputs().map(i => i.value)).toEqual(['https://cdn/alpha', 'https://cdn/beta']);
  });

  test('a one-file result landing after another field was edited keeps that edit', async () => {
    const user = userEvent.setup();
    const { upload, calls } = createControlledUpload();
    render(<WholeFormHost onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf')]);
    await user.type(screen.getByLabelText('title'), ' renamed');
    await act(async () => calls[0].resolve('https://cdn/alpha'));

    expect(screen.getByLabelText('title')).toHaveValue('Pack renamed');
    expect(uriInputs().map(i => i.value)).toEqual(['https://cdn/alpha']);
  });
});
