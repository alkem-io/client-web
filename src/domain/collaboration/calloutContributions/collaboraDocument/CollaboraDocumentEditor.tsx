import { Box, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCollaboraEditorUrlQuery } from '@/core/apollo/generated/apollo-hooks';

interface CollaboraDocumentEditorProps {
  collaboraDocumentId: string;
}

const REFRESH_BUFFER_MS = 60_000; // Refresh 1 minute before token expires

const CollaboraDocumentEditor = ({ collaboraDocumentId }: CollaboraDocumentEditorProps) => {
  const { t } = useTranslation();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data, loading, error, refetch } = useCollaboraEditorUrlQuery({
    variables: { collaboraDocumentId },
    fetchPolicy: 'network-only',
  });

  const editorUrl = data?.collaboraEditorUrl.editorUrl;
  const accessTokenTTL = data?.collaboraEditorUrl.accessTokenTTL;

  // Silent token auto-refresh
  useEffect(() => {
    if (!accessTokenTTL || accessTokenTTL <= REFRESH_BUFFER_MS) {
      return;
    }

    timerRef.current = setTimeout(() => {
      refetch();
    }, accessTokenTTL - REFRESH_BUFFER_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [accessTokenTTL, refetch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('collaboraDocument.editor.loading')}</Typography>
      </Box>
    );
  }

  if (error || !editorUrl) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
        <Typography color="error">{t('collaboraDocument.editor.error.unavailable')}</Typography>
      </Box>
    );
  }

  return (
    <iframe
      src={editorUrl}
      title={t('collaboraDocument.editor.title')}
      style={{ width: '100%', height: '100%', border: 'none' }}
      allow="clipboard-read; clipboard-write"
    />
  );
};

export default CollaboraDocumentEditor;
