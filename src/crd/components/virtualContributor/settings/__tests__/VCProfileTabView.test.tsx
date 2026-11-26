import { act, fireEvent, render, screen } from '@testing-library/react';
import { type ReactElement, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import { VCProfileTabView } from '../VCProfileTabView';
import type { VcProfileFormValues } from '../VCProfileTabView.types';

const VALUES: VcProfileFormValues = {
  profileId: 'profile-1',
  displayName: 'Helper',
  tagline: '',
  description: '',
  keywords: { id: undefined, tags: [] },
  avatar: { id: '', uri: null, altText: null },
  references: [],
};

const renderView = (disabled: boolean) =>
  render(
    <I18nextProvider i18n={i18n}>
      <VCProfileTabView
        values={VALUES}
        loading={false}
        disabled={disabled}
        onChange={vi.fn()}
        onReferencesChange={vi.fn()}
        onUploadAvatar={vi.fn()}
        uploadingAvatar={false}
        footerSlot={<span>footer</span>}
      />
    </I18nextProvider>
  );

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces(['crd-contributorSettings']);
});

describe('VCProfileTabView', () => {
  // The save re-bases the whole buffer on the refetched values, so an edit typed mid-save would be lost.
  it('freezes the whole form while a Save runs', async () => {
    const { container } = renderView(true);
    const name = await screen.findByDisplayValue('Helper');
    expect(container.firstElementChild).toHaveAttribute('inert');
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    expect(name.closest('[inert]')).toBe(container.firstElementChild);
  });

  it('is editable otherwise', async () => {
    renderView(false);
    expect((await screen.findByDisplayValue('Helper')).closest('[inert]')).toBeNull();
  });
});

type Deferred = { file: File; resolve: (url: string) => void };

/** Picks five files on the empty reference row, lands the first result (which starts the fourth
 *  upload), then Discards: the host restores the saved rows and bumps `referencesKey`. */
const discardDuringUploads = async (renderWith: (props: DiscardHostProps) => ReactElement) => {
  const calls: Deferred[] = [];
  const upload = vi.fn(
    (file: File) =>
      new Promise<string | null>(resolve => {
        calls.push({ file, resolve });
      })
  );
  const onReferencesChange = vi.fn();
  const saved: ReferenceRow[] = [{ id: 'r1', name: '', uri: '', description: '' }];

  function Host() {
    const [references, setReferences] = useState(saved);
    const [generation, setGeneration] = useState(0);
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setReferences(saved);
            setGeneration(n => n + 1);
          }}
        >
          discard
        </button>
        {renderWith({
          references,
          referencesKey: generation,
          onReferencesChange: rows => {
            onReferencesChange(rows);
            setReferences(rows);
          },
          onReferenceFileUpload: upload,
        })}
      </>
    );
  }

  render(<Host />);
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, {
    target: { files: ['a', 'b', 'c', 'd', 'e'].map(name => new File(['x'], `${name}.pdf`)) },
  });
  expect(upload).toHaveBeenCalledTimes(3);
  await act(async () => calls[0].resolve('https://cdn/a'));
  expect(upload).toHaveBeenCalledTimes(4);
  expect(onReferencesChange).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole('button', { name: 'discard' }));
  await act(async () => {
    for (const call of calls.slice(1)) call.resolve(`https://cdn/${call.file.name}`);
  });

  expect(upload).toHaveBeenCalledTimes(4);
  expect(onReferencesChange).toHaveBeenCalledTimes(1);
  expect((screen.getAllByLabelText('URL') as HTMLInputElement[]).map(i => i.value)).toEqual(['']);
};

type DiscardHostProps = {
  references: ReferenceRow[];
  referencesKey: number;
  onReferencesChange: (rows: ReferenceRow[]) => void;
  onReferenceFileUpload: (file: File) => Promise<string | null>;
};

describe('VCProfileTabView — Discard', () => {
  const renderDiscardView = (props: DiscardHostProps) => (
    <I18nextProvider i18n={i18n}>
      <VCProfileTabView
        values={{ ...VALUES, references: props.references as VcProfileFormValues['references'] }}
        loading={false}
        onChange={vi.fn()}
        onReferencesChange={props.onReferencesChange}
        referencesKey={props.referencesKey}
        onReferenceFileUpload={props.onReferenceFileUpload}
        onUploadAvatar={vi.fn()}
        uploadingAvatar={false}
      />
    </I18nextProvider>
  );

  it('a new referencesKey drops the pending uploads of the references editor', async () => {
    await discardDuringUploads(renderDiscardView);
  });
});
