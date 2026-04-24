import { useApolloClient } from '@apollo/client';
import { Box, CircularProgress, Typography } from '@mui/material';
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
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('collaboraDocument.editor.loading')}</Typography>
      </Box>
    );
  }

  if (errorMessage && !editorUrl) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
        p={4}
        gap={2}
      >
        <Typography color="error">{t('collaboraDocument.editor.error.unavailable')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {errorMessage}
        </Typography>
      </Box>
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
