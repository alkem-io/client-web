/**
 * @vitest-environment jsdom
 *
 * workspace#014-officedocs-replace-file — US1: the "Replace file" action is
 * offered only to users with edit rights (FR-002), only where a callout has a
 * Collabora framing document (FR-011), and only for a Phase-1 replaceable type
 * (FR-006 — Drawing has no Phase-1 extension so Replace would dead-end).
 */
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import { AuthorizationPrivilege, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import enJson from '@/crd/i18n/space/space.en.json';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { CollaboraFramingConnector } from './CollaboraFramingConnector';

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

const makeCallout = (
  privileges: AuthorizationPrivilege[],
  documentType = 'WORDPROCESSING'
): CalloutDetailsModelExtended =>
  ({
    authorization: { myPrivileges: privileges },
    framing: {
      type: CalloutFramingType.CollaboraDocument,
      profile: { id: 'p', displayName: 'Framing title' },
      collaboraDocument: {
        id: 'doc-1',
        documentType,
        profile: { id: 'dp', displayName: 'Doc title', url: '/doc' },
      },
    },
  }) as unknown as CalloutDetailsModelExtended;

const renderConnector = (ui: ReactElement) =>
  render(
    <GlobalStateProvider>
      <I18nextProvider i18n={i18n}>
        <MockedProvider mocks={[]}>{ui}</MockedProvider>
      </I18nextProvider>
    </GlobalStateProvider>
  );

describe('CollaboraFramingConnector — Replace action gating', () => {
  it('shows the Replace file action when the user has UPDATE (edit rights)', () => {
    renderConnector(
      <CollaboraFramingConnector callout={makeCallout([AuthorizationPrivilege.Update])} onOpen={() => {}} />
    );
    expect(screen.getByRole('button', { name: enJson.callout.documentReplace })).toBeInTheDocument();
  });

  it('hides the Replace file action when the user lacks edit rights', () => {
    renderConnector(<CollaboraFramingConnector callout={makeCallout([])} onOpen={() => {}} />);
    expect(screen.queryByRole('button', { name: enJson.callout.documentReplace })).not.toBeInTheDocument();
    // The "Open Document" action is still present for read-only viewers.
    expect(screen.getByRole('button', { name: enJson.callout.openDocument })).toBeInTheDocument();
  });

  it('hides the Replace file action for a non-Phase-1 type (Drawing), even with edit rights', () => {
    renderConnector(
      <CollaboraFramingConnector callout={makeCallout([AuthorizationPrivilege.Update], 'DRAWING')} onOpen={() => {}} />
    );
    // Replace would dead-end for Drawing (no Phase-1 extension, FR-006), so it is suppressed;
    // Open Document stays available.
    expect(screen.queryByRole('button', { name: enJson.callout.documentReplace })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: enJson.callout.openDocument })).toBeInTheDocument();
  });

  it('shows the Replace file action for PDF when the user has edit rights (FR-004)', () => {
    renderConnector(
      <CollaboraFramingConnector callout={makeCallout([AuthorizationPrivilege.Update], 'PDF')} onOpen={() => {}} />
    );
    expect(screen.getByRole('button', { name: enJson.callout.documentReplace })).toBeInTheDocument();
    // PDF uses view/annotate framing rather than "Open Document" (FR-002).
    expect(screen.getByRole('button', { name: enJson.callout.openDocumentPdf })).toBeInTheDocument();
  });
});
