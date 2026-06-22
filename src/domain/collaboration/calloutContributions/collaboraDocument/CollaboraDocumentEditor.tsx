import { useApolloClient } from '@apollo/client';
import { Loader2 } from 'lucide-react';
import { type Ref, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CollaboraEditorUrlDocument } from '@/core/apollo/generated/apollo-hooks';
import type { CollaboraEditorUrlQuery, CollaboraEditorUrlQueryVariables } from '@/core/apollo/generated/graphql-schema';

interface CollaboraDocumentEditorProps {
  collaboraDocumentId: string;
  /**
   * Optional ref attached to the underlying iframe so callers can listen to the
   * Collabora postMessage API for save-state + presence signals.
   */
  iframeRef?: Ref<HTMLIFrameElement>;
}

const CollaboraDocumentEditor = ({ collaboraDocumentId, iframeRef }: CollaboraDocumentEditorProps) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [editorUrl, setEditorUrl] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    mountedRef.current = true;

    const fetchUrl = async () => {
      try {
        setLoading(true);
        const { data, error } = await client.query<CollaboraEditorUrlQuery, CollaboraEditorUrlQueryVariables>({
          query: CollaboraEditorUrlDocument,
          variables: { collaboraDocumentId },
          fetchPolicy: 'network-only',
        });

        if (!mountedRef.current) return;

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (data?.collaboraEditorUrl) {
          setEditorUrl(prev => prev ?? data.collaboraEditorUrl.editorUrl);
          setLoading(false);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchUrl();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [collaboraDocumentId, client]);

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
