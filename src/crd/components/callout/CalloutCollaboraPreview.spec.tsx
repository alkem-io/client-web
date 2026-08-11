/**
 * @vitest-environment jsdom
 *
 * PDF must render with a distinct icon/label from the other Collabora document
 * types, and use "View" framing rather than the create/edit framing used by
 * word-processing, spreadsheet, and presentation documents. Currently
 * view-only (not view/annotate) pending a Collabora-side fix — see
 * CalloutCollaboraPreview.tsx's openLabelKey comment.
 */
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import enJson from '@/crd/i18n/space/space.en.json';
import { CalloutCollaboraPreview, type CollaboraDocumentPreviewType } from './CalloutCollaboraPreview';

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

const renderPreview = (ui: ReactElement) => render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe('CalloutCollaboraPreview — PDF type', () => {
  it('renders the PDF label, not a generic/fallback type label', () => {
    renderPreview(<CalloutCollaboraPreview documentType="pdf" onOpen={() => {}} />);
    expect(screen.getByText(enJson.callout.documentPdf)).toBeInTheDocument();
    expect(screen.queryByText(enJson.callout.document)).not.toBeInTheDocument();
  });

  it('uses "View" framing for the open action, distinct from "Open Document"', () => {
    renderPreview(<CalloutCollaboraPreview documentType="pdf" onOpen={() => {}} />);
    expect(screen.getByRole('button', { name: enJson.callout.openDocumentPdf })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: enJson.callout.openDocument })).not.toBeInTheDocument();
  });

  it.each<[CollaboraDocumentPreviewType, string]>([
    ['text', enJson.callout.document],
    ['spreadsheet', enJson.callout.documentSpreadsheet],
    ['presentation', enJson.callout.documentPresentation],
  ])('leaves the other Collabora document types (%s) on the unchanged "Open Document" framing (no regression)', (documentType, expectedLabel) => {
    renderPreview(<CalloutCollaboraPreview documentType={documentType} onOpen={() => {}} />);
    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: enJson.callout.openDocument })).toBeInTheDocument();
  });

  it('offers Replace file for PDF the same way as other types when onReplace is provided (US2)', () => {
    renderPreview(<CalloutCollaboraPreview documentType="pdf" onOpen={() => {}} onReplace={() => {}} />);
    expect(screen.getByRole('button', { name: enJson.callout.documentReplace })).toBeInTheDocument();
  });
});
