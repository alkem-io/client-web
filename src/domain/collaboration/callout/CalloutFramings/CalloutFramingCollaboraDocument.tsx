import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import { getCollaboraDocumentIcon } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraDocumentIcons';
import CollaboraDocumentEditor from '@/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentEditor';
import type { CalloutDetailsModel } from '../models/CalloutDetailsModel';

interface CalloutFramingCollaboraDocumentProps {
  callout: CalloutDetailsModel;
}

const CalloutFramingCollaboraDocument = ({ callout }: CalloutFramingCollaboraDocumentProps) => {
  const { t } = useTranslation();
  const [editorOpen, setEditorOpen] = useState(false);

  const collaboraDocument = callout.framing.collaboraDocument;
  if (!collaboraDocument) {
    return null;
  }

  const docType = collaboraDocument.documentType as CollaboraDocumentType;
  const DocumentIcon = getCollaboraDocumentIcon(docType);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        gap={gutters()}
        padding={gutters()}
        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' }, borderRadius: 1 }}
        onClick={() => setEditorOpen(true)}
      >
        <DocumentIcon color="primary" fontSize="large" />
        <Box flex={1}>
          <Typography variant="subtitle1">{collaboraDocument.profile?.displayName}</Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={e => { e.stopPropagation(); setEditorOpen(true); }}>
          {t('buttons.open')}
        </Button>
      </Box>
      {editorOpen && (
        <Dialog open onClose={() => setEditorOpen(false)} fullScreen>
          <Box display="flex" justifyContent="flex-end" px={2} py={1}>
            <Button variant="text" onClick={() => setEditorOpen(false)}>
              {t('buttons.close')}
            </Button>
          </Box>
          <DialogContent sx={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <CollaboraDocumentEditor collaboraDocumentId={collaboraDocument.id} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CalloutFramingCollaboraDocument;
