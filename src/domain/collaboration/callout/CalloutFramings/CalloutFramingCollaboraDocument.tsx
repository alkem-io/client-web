import { Box, type BoxProps, Button, Dialog, DialogContent, styled } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import Centered from '@/core/ui/utils/Centered';
import CollaboraDocumentEditor from '@/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentEditor';
import { getCollaboraDocumentIcon } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraDocumentIcons';
import { chipButtonPositionStyles, previewButtonStyles, previewContainerStyles } from '../../common/PreviewStyles';
import type { CalloutDetailsModel } from '../models/CalloutDetailsModel';

interface CalloutFramingCollaboraDocumentProps {
  callout: CalloutDetailsModel;
}

const Container = styled(Box)<BoxProps>(({ theme, onClick }) => previewContainerStyles(theme, onClick));

const ContentContainer = styled(Box)<BoxProps>(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  minHeight: gutters(16)(theme),
}));

const CalloutFramingCollaboraDocument = ({ callout }: CalloutFramingCollaboraDocumentProps) => {
  const { t } = useTranslation();
  const [editorOpen, setEditorOpen] = useState(false);

  const collaboraDocument = callout.framing.collaboraDocument;
  if (!collaboraDocument) {
    return null;
  }

  const docType = collaboraDocument.documentType as CollaboraDocumentType;
  const DocumentIcon = getCollaboraDocumentIcon(docType);
  const typeLabel =
    docType === CollaboraDocumentType.Spreadsheet
      ? t('collaboraDocument.create.documentType.SPREADSHEET')
      : docType === CollaboraDocumentType.Presentation
        ? t('collaboraDocument.create.documentType.PRESENTATION')
        : t('collaboraDocument.create.documentType.TEXT_DOCUMENT');

  const handleOpen = () => setEditorOpen(true);

  return (
    <>
      <Container onClick={handleOpen}>
        <ContentContainer>
          <Centered>
            <DocumentIcon color="primary" sx={{ fontSize: '4rem' }} />
          </Centered>
        </ContentContainer>
        <Button
          variant="outlined"
          startIcon={<DocumentIcon />}
          size="small"
          sx={theme => ({
            ...previewButtonStyles(theme),
            ...chipButtonPositionStyles(theme),
          })}
          aria-label={typeLabel}
        >
          {typeLabel}
        </Button>
        <Button variant="outlined" sx={theme => previewButtonStyles(theme)}>
          {t('callout.collaboraDocument.clickToSee')}
        </Button>
      </Container>
      {editorOpen && (
        <Dialog open={true} onClose={() => setEditorOpen(false)} fullScreen={true}>
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
