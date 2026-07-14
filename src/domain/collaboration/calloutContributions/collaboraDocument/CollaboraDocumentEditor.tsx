import { useApolloClient } from '@apollo/client';
import { Loader2 } from 'lucide-react';
import { type Ref, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCollaboraEditorUrl, graphQLErrorCode } from './collaboraEditorSession';

type CollaboraDocumentEditorProps = {
  collaboraDocumentId: string;
  /**
   * Optional ref attached to the underlying iframe so callers can listen to the
   * Collabora postMessage API for save-state + presence signals.
   */
  iframeRef?: Ref<HTMLIFrameElement>;
  /**
   * Called with the per-actor WOPI access-token lifetime (ms) each time the editor URL is
   * (re)issued. The connection monitor uses it to arm a client-side token-expiry timer —
   * an expiring token is otherwise an invisible failure (saves start 401'ing with no
   * Collabora signal). See `useCollaboraConnectionMonitor`.
   */
  onAccessTokenTTL?: (accessTokenTTL: number) => void;
  /**
   * Recovery trigger. Bumping this re-issues a fresh editor URL/token (`network-only`) and
   * remounts the iframe (it is used as the iframe `key`), re-establishing the session in
   * place without a page reload. See `useCollaboraConnectionMonitor.reconnect()`.
   */
  reconnectNonce?: number;
  /**
   * Reports a failed editor-URL fetch so the caller can classify it: not-found / forbidden
   * are terminal (document gone / access revoked), anything else is recoverable (FR-013).
   */
  onFetchError?: (code: string | undefined, message: string) => void;
};

const CollaboraDocumentEditor = ({
  collaboraDocumentId,
  iframeRef,
  onAccessTokenTTL,
  reconnectNonce = 0,
  onFetchError,
}: CollaboraDocumentEditorProps) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [editorUrl, setEditorUrl] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();
  useEffect(() => {
    // Guards against a superseded request: when the deps change (a reconnect bumps the nonce) or
    // the editor unmounts, cleanup flips this so a stale in-flight response can't apply an
    // outdated URL/TTL/error over the newer request's result. A shared mounted-ref would be
    // re-set true by the next effect run and let the stale response through.
    let cancelled = false;

    const fetchUrl = async () => {
      try {
        setLoading(true);
        // network-only + silent (own loading/error/terminal UI, no global toast) — see the helper.
        const { data, error } = await fetchCollaboraEditorUrl(client, collaboraDocumentId);
        if (cancelled) return;

        if (error) {
          setErrorMessage(error.message);
          onFetchError?.(graphQLErrorCode(error), error.message);
          setLoading(false);
          return;
        }

        if (data?.collaboraEditorUrl) {
          // Adopt the freshly-issued URL every time (no first-URL pin) so a reconnect remounts
          // with a new token; the iframe `key={reconnectNonce}` forces the actual remount.
          setEditorUrl(data.collaboraEditorUrl.editorUrl);
          onAccessTokenTTL?.(data.collaboraEditorUrl.accessTokenTTL);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setErrorMessage(message);
        onFetchError?.(graphQLErrorCode(err), message);
        setLoading(false);
      }
    };

    fetchUrl();

    return () => {
      cancelled = true;
    };
  }, [collaboraDocumentId, client, onAccessTokenTTL, onFetchError, reconnectNonce]);

  if (loading && !editorUrl) {
    return (
      <div className="flex h-full items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-primary" aria-hidden="true" />
        <span>{t('collaboraDocument.editor.loading')}</span>
      </div>
    );
  }

  if (errorMessage && !editorUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <span className="text-destructive">{t('collaboraDocument.editor.error.unavailable')}</span>
        <span className="text-sm text-muted-foreground">{errorMessage}</span>
      </div>
    );
  }

  if (!editorUrl) {
    return null;
  }

  return (
    <iframe
      // Keying on the reconnect nonce forces a full remount (fresh Collabora session) when the
      // user reconnects, dropping the dead session and loading the new token'd URL.
      key={reconnectNonce}
      ref={iframeRef}
      src={editorUrl}
      title={t('collaboraDocument.editor.title')}
      style={{ width: '100%', flex: 1, border: 'none', minHeight: 0 }}
      allow="clipboard-read; clipboard-write; microphone; camera"
      allowFullScreen={true}
    />
  );
};

export default CollaboraDocumentEditor;
