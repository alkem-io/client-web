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
  uploadAccept,
}: {
  initial: ReferenceRow[];
  onFileUpload: RowFileUpload;
  uploadAccept?: string;
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
        uploadAccept={uploadAccept}
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

  test('after unmount, a late result calls no onChange', async () => {
    const { upload, calls } = createControlledUpload();
    const { unmount } = render(<Host initial={[emptyRow]} onFileUpload={upload} />);

    pick(fileInputs()[0], [pdf('alpha.pdf'), pdf('beta.pdf')]);
    onChangeSpy.mockClear();
    unmount();
    await act(async () => {
      calls[0].resolve('https://cdn/alpha');
      calls[1].resolve('https://cdn/beta');
    });

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

  test('unaccepted files are named and never uploaded; dismissing clears the notice; later selections add to it', async () => {
    const user = userEvent.setup();
    const { upload } = createControlledUpload();
    render(<Host initial={[emptyRow]} onFileUpload={upload} uploadAccept=".pdf" />);

    pick(fileInputs()[0], [new File(['x'], 'a.png'), new File(['x'], 'b.gif')]);
    expect(upload).not.toHaveBeenCalled();
    expect(uriInputs()).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('a.png');
    expect(screen.getByRole('status')).toHaveTextContent('b.gif');

    await user.click(screen.getByRole('button', { name: 'fileSelection.dismiss' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    pick(fileInputs()[0], [new File(['x'], 'c.png'), new File(['x'], 'd.png')]);
    pick(fileInputs()[0], [new File(['x'], 'e.png'), new File(['x'], 'f.png')]);
    const notice = screen.getByRole('status');
    expect(notice).toHaveTextContent('c.png');
    expect(notice).toHaveTextContent('f.png');
    expect(notice).not.toHaveTextContent('a.png');
  });

  test('selections on two rows share the limit of three uploads', async () => {
    const { upload, calls, inFlight } = createControlledUpload();
    render(<Host initial={[emptyRow, { ...emptyRow }]} onFileUpload={upload} />);

    pick(
      fileInputs()[0],
      Array.from({ length: 6 }, (_, i) => pdf(`a-${i}.pdf`))
    );
    pick(
      fileInputs()[1],
      Array.from({ length: 6 }, (_, i) => pdf(`b-${i}.pdf`))
    );
    expect(inFlight()).toBe(3);

    for (let i = 0; i < 12; i += 1) {
      await act(async () => calls[i].resolve(`https://cdn/${i}`));
      expect(inFlight()).toBeLessThanOrEqual(3);
    }
    expect(upload).toHaveBeenCalledTimes(12);
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
