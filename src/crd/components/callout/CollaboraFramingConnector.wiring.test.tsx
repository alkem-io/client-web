/**
 * @vitest-environment jsdom
 *
 * End-to-end wiring guard, deliberately colocated with the declared
 * `src/crd/components/callout` vitest scope rather than living only beside
 * the connector itself: the earlier browser-visible defect (previewUrl
 * resolved by the backend but never reaching the rendered <img>) sat exactly
 * on the seam between `CollaboraFramingConnector` (reads
 * `callout.framing.collaboraDocument.previewUrl`) and `CalloutCollaboraPreview`
 * (renders `previewImageUrl`) — a mapper-only test or a component-only test
 * each stay green if that seam breaks, because neither one exercises both
 * sides together. This test renders the real connector against a
 * GraphQL-shaped callout object and asserts on the resulting <img src>, so a
 * regression of the wiring itself fails the already-declared client-web
 * vitest command instead of only a spec file outside its scope.
 */
import { MockedProvider } from '@apollo/client/testing';
import { render } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import { AuthorizationPrivilege, CalloutFramingType } from '@/core/apollo/generated/graphql-schema';
import { GlobalStateProvider } from '@/core/state/GlobalStateProvider';
import enJson from '@/crd/i18n/space/space.en.json';
import type { CalloutDetailsModelExtended } from '@/domain/collaboration/callout/models/CalloutDetailsModel';
import { CollaboraFramingConnector } from '@/main/crdPages/space/callout/CollaboraFramingConnector';

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

const makeCallout = (previewUrl: string | null): CalloutDetailsModelExtended =>
  ({
    authorization: { myPrivileges: [AuthorizationPrivilege.Update] },
    framing: {
      type: CalloutFramingType.CollaboraDocument,
      profile: { id: 'p', displayName: 'Framing title' },
      collaboraDocument: {
        id: 'doc-1',
        documentType: 'WORDPROCESSING',
        previewUrl,
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

describe('CollaboraFramingConnector — previewUrl wiring (declared-scope guard)', () => {
  it('threads a real callout.framing.collaboraDocument.previewUrl into the rendered <img src>', () => {
    const { container } = renderConnector(
      <CollaboraFramingConnector callout={makeCallout('/api/private/wopi/files/file-1/preview')} onOpen={() => {}} />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/api/private/wopi/files/file-1/preview');
  });

  it('renders no <img> when the backend resolves no previewUrl', () => {
    const { container } = renderConnector(<CollaboraFramingConnector callout={makeCallout(null)} onOpen={() => {}} />);

    expect(container.querySelector('img')).not.toBeInTheDocument();
  });
});
