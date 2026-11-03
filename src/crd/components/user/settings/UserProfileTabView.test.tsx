import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createInstance } from 'i18next';
import { type ReactElement, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import { UserProfileTabView } from './UserProfileTabView';
import type { UserProfileFormValues } from './UserProfileTabView.types';

// The brand icons are `*.svg?react` imports, which the test transform does not turn into components.
vi.mock('@/crd/components/contributor/settings/ProfileFormFields', async importOriginal => ({
  ...(await importOriginal<typeof import('@/crd/components/contributor/settings/ProfileFormFields')>()),
  SocialLinksFields: () => null,
}));

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-contributorSettings': contributorSettingsEn } },
    interpolation: { escapeValue: false },
  });
});

const values: UserProfileFormValues = {
  profileId: 'p1',
  displayName: 'Ada',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  phone: '+31 6 12345678',
  tagline: '',
  city: '',
  country: '',
  bio: '',
  skills: { tags: [] },
  keywords: { tags: [] },
  avatar: { id: 'a1', uri: null, altText: null },
  references: [],
  recognizedReferences: { linkedin: null, bsky: null, github: null },
};

const sectionOf = (title: string) => {
  // A collapsible SettingsSection: the heading's parent is the section root.
  const section = screen.getByRole('heading', { name: title }).parentElement;
  if (!section) throw new Error(`no section "${title}"`);
  return section;
};

describe('UserProfileTabView — contact fields (spec 097 FR-021a)', () => {
  it('shows Phone in Social Links and keeps the read-only Email in Identity', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <UserProfileTabView
          values={values}
          countries={[]}
          loading={false}
          onChange={vi.fn()}
          onReferencesChange={vi.fn()}
          onUpdateRecognizedReference={vi.fn()}
          onUploadAvatar={vi.fn()}
          uploadingAvatar={false}
        />
      </I18nextProvider>
    );

    expect(within(sectionOf('Social Links')).getByDisplayValue('+31 6 12345678')).toBeInTheDocument();
    expect(within(sectionOf('Identity')).queryByDisplayValue('+31 6 12345678')).not.toBeInTheDocument();
    expect(within(sectionOf('Identity')).getByDisplayValue('ada@example.com')).toHaveAttribute('readonly');
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
  expect((screen.getAllByLabelText('references.uriLabel') as HTMLInputElement[]).map(i => i.value)).toEqual(['']);
};

type DiscardHostProps = {
  references: ReferenceRow[];
  referencesKey: number;
  onReferencesChange: (rows: ReferenceRow[]) => void;
  onReferenceFileUpload: (file: File) => Promise<string | null>;
};

describe('UserProfileTabView — Save and Discard', () => {
  const renderView = (props: Partial<DiscardHostProps> & { disabled?: boolean }) => (
    <I18nextProvider i18n={i18n}>
      <UserProfileTabView
        values={{ ...values, references: (props.references ?? []) as UserProfileFormValues['references'] }}
        countries={[]}
        loading={false}
        disabled={props.disabled}
        onChange={vi.fn()}
        onReferencesChange={props.onReferencesChange ?? vi.fn()}
        referencesKey={props.referencesKey}
        onReferenceFileUpload={props.onReferenceFileUpload}
        onUpdateRecognizedReference={vi.fn()}
        onUploadAvatar={vi.fn()}
        uploadingAvatar={false}
      />
    </I18nextProvider>
  );

  it('freezes the whole form while a Save runs', () => {
    const { container } = render(renderView({ disabled: true }));
    expect(container.firstElementChild).toHaveAttribute('inert');
  });

  it('a new referencesKey drops the pending uploads of the references editor', async () => {
    await discardDuringUploads(renderView);
  });
});
