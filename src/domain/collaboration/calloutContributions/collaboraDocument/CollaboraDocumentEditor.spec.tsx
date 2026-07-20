/** @vitest-environment jsdom */
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { CollaboraEditorUrlDocument } from '@/core/apollo/generated/apollo-hooks';
import { render, screen, waitFor } from '@/main/test/testUtils';
import CollaboraDocumentEditor from './CollaboraDocumentEditor';

const DOC_ID = 'doc-1';

function urlMock(editorUrl: string): MockedResponse {
  return {
    request: { query: CollaboraEditorUrlDocument, variables: { collaboraDocumentId: DOC_ID } },
    result: {
      data: { collaboraEditorUrl: { __typename: 'CollaboraEditorUrlResult', editorUrl, accessTokenTTL: 3_600_000 } },
    },
  };
}

// Keeps a single MockedProvider (and its client) mounted while the reconnect nonce changes,
// so the second fetch consumes the second mock — reproducing a real in-place reconnect.
function Harness() {
  const [nonce, setNonce] = useState(0);
  return (
    <>
      <button type="button" onClick={() => setNonce(n => n + 1)}>
        bump
      </button>
      <CollaboraDocumentEditor collaboraDocumentId={DOC_ID} reconnectNonce={nonce} />
    </>
  );
}

describe('CollaboraDocumentEditor reconnect remount', () => {
  it('adopts a freshly-issued URL and remounts the iframe when the reconnect nonce changes', async () => {
    render(
      <MockedProvider mocks={[urlMock('https://collabora.test/first'), urlMock('https://collabora.test/second')]}>
        <Harness />
      </MockedProvider>
    );

    await waitFor(() =>
      expect(document.querySelector('iframe')).toHaveAttribute('src', 'https://collabora.test/first')
    );
    const firstIframe = document.querySelector('iframe');
    expect(firstIframe).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'bump' }));

    // The old first-URL pin is gone: the fresh fetch adopts the new URL.
    await waitFor(() =>
      expect(document.querySelector('iframe')).toHaveAttribute('src', 'https://collabora.test/second')
    );
    // …and `key={reconnectNonce}` forces a real remount — a brand-new iframe node, not just a
    // src swap on the existing element (which would keep the dead Collabora session alive).
    expect(document.querySelector('iframe')).not.toBe(firstIframe);
  });
});
