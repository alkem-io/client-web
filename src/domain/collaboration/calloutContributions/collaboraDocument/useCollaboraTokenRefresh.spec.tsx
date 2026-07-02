/** @vitest-environment jsdom */
import { MockedProvider, type MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CollaboraEditorUrlDocument } from '@/core/apollo/generated/apollo-hooks';
import { useCollaboraTokenRefresh } from './useCollaboraTokenRefresh';

const DOC = 'doc-1';
const FRESH_URL = 'https://cool.test/browser/abc/cool.html?WOPISrc=w&access_token=FRESH_TOKEN&access_token_ttl=999';

function urlMock(): MockedResponse {
  return {
    request: { query: CollaboraEditorUrlDocument, variables: { collaboraDocumentId: DOC } },
    result: {
      data: {
        collaboraEditorUrl: { __typename: 'CollaboraEditorUrlResult', editorUrl: FRESH_URL, accessTokenTTL: 999 },
      },
    },
  };
}

function makeIframeRef() {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  return { ref: { current: iframe }, iframe };
}

function tokenExpiring(iframe: HTMLIFrameElement) {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: JSON.stringify({ MessageId: 'App_TokenExpiring' }),
      source: iframe.contentWindow,
    })
  );
}

describe('useCollaboraTokenRefresh', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('refreshes the token in place on App_TokenExpiring (Reset_Access_Token, no remount)', async () => {
    const { ref, iframe } = makeIframeRef();
    const postSpy = vi.spyOn(iframe.contentWindow as Window, 'postMessage');
    const onRefreshed = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <MockedProvider mocks={[urlMock()]}>{children}</MockedProvider>
    );

    renderHook(() => useCollaboraTokenRefresh(ref, DOC, { onRefreshed }), { wrapper });

    tokenExpiring(iframe);

    await waitFor(() => expect(onRefreshed).toHaveBeenCalledWith(999));
    // Collabora adopts the new token in place — no iframe reload happened.
    const sent = postSpy.mock.calls.find(([msg]) => typeof msg === 'string' && msg.includes('Reset_Access_Token'));
    expect(sent).toBeTruthy();
    expect(sent?.[0]).toContain('FRESH_TOKEN');
  });

  it('ignores unrelated messages and messages from other windows', async () => {
    const { ref, iframe } = makeIframeRef();
    const onRefreshed = vi.fn();
    const wrapper = ({ children }: PropsWithChildren) => (
      <MockedProvider mocks={[urlMock()]}>{children}</MockedProvider>
    );
    renderHook(() => useCollaboraTokenRefresh(ref, DOC, { onRefreshed }), { wrapper });

    // Wrong message id, from the iframe.
    window.dispatchEvent(
      new MessageEvent('message', { data: JSON.stringify({ MessageId: 'App_Saved' }), source: iframe.contentWindow })
    );
    // Right message id, but not from the iframe (source is the top window).
    window.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ MessageId: 'App_TokenExpiring' }) }));

    await new Promise(r => setTimeout(r, 20));
    expect(onRefreshed).not.toHaveBeenCalled();
  });
});
