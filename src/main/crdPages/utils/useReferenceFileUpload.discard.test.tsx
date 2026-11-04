import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type ReferenceRow, ReferencesEditor } from '@/crd/forms/references/ReferencesEditor';
import type { StorageConfig } from '@/domain/storage/StorageBucket/useStorageConfig';
import { useReferenceFileUpload } from './useReferenceFileUpload';

vi.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});

type Request = { name: string; resolve: (url: string) => void };
const requests: Request[] = [];
const uploadFileMock = vi.fn(
  ({ variables }: { variables: { file: File } }) =>
    new Promise(resolve => {
      requests.push({
        name: variables.file.name,
        resolve: url => resolve({ data: { uploadFileOnStorageBucket: { url } } }),
      });
    })
);

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUploadFileMutation: () => [uploadFileMock, { loading: false }],
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => vi.fn(),
}));

const storageConfig: StorageConfig = {
  storageBucketId: 'bucket-1',
  allowedMimeTypes: [],
  maxFileSize: 1024,
  canUpload: true,
  temporaryLocation: false,
};

const emptyRow: ReferenceRow = { name: '', uri: '', description: '' };

/** A settings tab: one upload hook for the tab's lifetime, a references editor keyed on the
 *  confirmed-Discard generation, and Save withheld while the hook reports uploads. */
function SettingsTab() {
  const upload = useReferenceFileUpload(storageConfig);
  const [resetGeneration, setResetGeneration] = useState(0);
  const [rows, setRows] = useState<ReferenceRow[]>([emptyRow]);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRows([emptyRow]);
          setResetGeneration(n => n + 1);
        }}
      >
        discard
      </button>
      <button type="button" disabled={upload.uploading}>
        save
      </button>
      <ReferencesEditor
        key={resetGeneration}
        rows={rows}
        onChange={setRows}
        onFileUpload={upload.onFileUpload}
        uploading={upload.uploading}
      />
    </>
  );
}

const pick = (files: string[]) =>
  fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
    target: { files: files.map(name => new File(['x'], name)) },
  });
const paperclip = () => screen.getByRole('button', { name: 'references.attachFile' });
const save = () => screen.getByRole('button', { name: 'save' });
const uris = () => (screen.getAllByLabelText('references.uriLabel') as HTMLInputElement[]).map(input => input.value);
const settle = async (names: string[]) => {
  for (const name of names) {
    const request = requests.find(r => r.name === name);
    await act(async () => request?.resolve(`https://cdn/${name}`));
  }
};

beforeEach(() => {
  requests.length = 0;
  uploadFileMock.mockClear();
});

describe('Discard while a multi-file pick uploads, then a new pick', () => {
  test('the old pick writes nothing and starts no queued file; the pickers and Save wait for it', async () => {
    render(<SettingsTab />);

    pick(['a.pdf', 'b.pdf', 'c.pdf', 'd.pdf']);
    expect(requests.map(r => r.name)).toEqual(['a.pdf', 'b.pdf', 'c.pdf']);
    expect(paperclip()).toBeDisabled();
    expect(save()).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'discard' }));
    expect(paperclip()).toBeDisabled();
    expect(save()).toBeDisabled();

    await settle(['a.pdf', 'b.pdf', 'c.pdf']);
    expect(uploadFileMock).toHaveBeenCalledTimes(3);
    expect(uris()).toEqual(['']);
    expect(paperclip()).toBeEnabled();
    expect(save()).toBeEnabled();

    pick(['x.pdf', 'y.pdf']);
    expect(requests.map(r => r.name)).toEqual(['a.pdf', 'b.pdf', 'c.pdf', 'x.pdf', 'y.pdf']);
    expect(save()).toBeDisabled();

    await settle(['x.pdf', 'y.pdf']);
    expect(uris()).toEqual(['https://cdn/x.pdf', 'https://cdn/y.pdf']);
    expect(save()).toBeEnabled();
  });

  test('successive Discards before anything settles never put more than one pick on the network', async () => {
    render(<SettingsTab />);

    pick(['a.pdf', 'b.pdf', 'c.pdf']);
    fireEvent.click(screen.getByRole('button', { name: 'discard' }));
    fireEvent.click(screen.getByRole('button', { name: 'discard' }));
    expect(paperclip()).toBeDisabled();

    await settle(['a.pdf', 'b.pdf']);
    expect(paperclip()).toBeDisabled();
    expect(save()).toBeDisabled();

    await settle(['c.pdf']);
    expect(paperclip()).toBeEnabled();
    expect(uploadFileMock).toHaveBeenCalledTimes(3);
    expect(uris()).toEqual(['']);
  });
});
