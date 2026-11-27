import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createInstance } from 'i18next';
import { type ReactElement, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import { type OrgProfileFormValuesData, OrgProfileTabView } from './OrgProfileTabView';

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

const values: OrgProfileFormValuesData = {
  profileId: 'p1',
  organizationId: 'o1',
  nameID: 'acme',
  displayName: 'Acme',
  tagline: '',
  description: '',
  city: '',
  country: '',
  keywords: { tags: [] },
  capabilities: { tags: [] },
  contactEmail: 'hello@acme.org',
  domain: 'acme.org',
  legalEntityName: 'Acme B.V.',
  website: '',
  avatar: { id: 'a1', uri: null, altText: null },
  references: [],
  recognizedReferences: { linkedin: null, bsky: null, github: null },
  verifiedStatus: 'notVerified',
};

const sectionOf = (title: string) => {
  // A collapsible SettingsSection: the heading's parent is the section root.
  const section = screen.getByRole('heading', { name: title }).parentElement;
  if (!section) throw new Error(`no section "${title}"`);
  return section;
};

describe('OrgProfileTabView — contact fields (spec 097 FR-091a)', () => {
  it('shows Contact Email in Social Links; Contact & Legal keeps domain and legal name', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <OrgProfileTabView
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

    expect(within(sectionOf('Social Links')).getByDisplayValue('hello@acme.org')).toBeInTheDocument();
    const contactLegal = sectionOf('Contact & Legal');
    expect(within(contactLegal).queryByDisplayValue('hello@acme.org')).not.toBeInTheDocument();
    expect(within(contactLegal).getByDisplayValue('acme.org')).toBeInTheDocument();
    expect(within(contactLegal).getByDisplayValue('Acme B.V.')).toBeInTheDocument();
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

describe('OrgProfileTabView — Save and Discard', () => {
  const renderView = (props: Partial<DiscardHostProps> & { disabled?: boolean }) => (
    <I18nextProvider i18n={i18n}>
      <OrgProfileTabView
        values={{ ...values, references: (props.references ?? []) as OrgProfileFormValuesData['references'] }}
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
