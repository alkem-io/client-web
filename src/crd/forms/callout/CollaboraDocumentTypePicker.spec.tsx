/**
 * @vitest-environment jsdom
 *
 * PDF is import-only — Collabora's PDF mode has no blank-document concept —
 * so it must never gain a blank-create card in this picker. This is a
 * regression guard: the picker's `options` list must stay exactly
 * Word/Excel/PowerPoint even though PDF is now part of the P1 import
 * allowlist elsewhere.
 */
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import enJson from '@/crd/i18n/space/space.en.json';
import { CollaboraDocumentTypePicker } from './CollaboraDocumentTypePicker';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-space'],
    defaultNS: 'crd-space',
    resources: { en: { 'crd-space': enJson } },
    interpolation: { escapeValue: false },
  });
});

describe('CollaboraDocumentTypePicker — no blank-create PDF option', () => {
  it('offers exactly the Word/Excel/PowerPoint blank-create cards, never a PDF card', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <CollaboraDocumentTypePicker value="WORDPROCESSING" onChange={() => {}} />
      </I18nextProvider>
    );

    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(3);

    expect(screen.getByText(enJson.callout.documentText)).toBeInTheDocument();
    expect(screen.getByText(enJson.callout.documentSpreadsheet)).toBeInTheDocument();
    expect(screen.getByText(enJson.callout.documentPresentation)).toBeInTheDocument();
    expect(screen.queryByText(enJson.callout.documentPdf)).not.toBeInTheDocument();
  });
});
