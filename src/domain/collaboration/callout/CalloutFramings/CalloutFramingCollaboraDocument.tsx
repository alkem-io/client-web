import { Box, type BoxProps, Button, Dialog, styled } from '@mui/material';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { gutters } from '@/core/ui/grid/utils';
import { useNotification } from '@/core/ui/notifications/useNotification';
import Centered from '@/core/ui/utils/Centered';
import { CollaboraCollabFooter } from '@/crd/components/collabora/CollaboraCollabFooter';
import CollaboraDocumentEditor from '@/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentEditor';
import { getCollaboraDocumentIcon } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraDocumentIcons';
import { mapCollaboraFooterProps } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraFooterMapper';
import { useCollaboraPostMessage } from '@/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraPostMessage';
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
  const { t: tCrd } = useTranslation('crd-space');
  const [editorOpen, setEditorOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isAuthenticated } = useAuthenticationContext();
  const notify = useNotification();

  const { connectionStatus, saveStatus, connectedUsers } = useCollaboraPostMessage(iframeRef, {
    onError: message => notify(tCrd('collabora.editor.error.runtime', { message }), 'error'),
    onSessionClosed: () => notify(tCrd('collabora.editor.error.sessionClosed'), 'warning'),
  });

  const footerProps = mapCollaboraFooterProps({
    connectionStatus,
    saveStatus,
    connectedUsers,
    isAuthenticated,
    hasEditPrivilege: isAuthenticated,
    isContribution: false,
    hasDeletePrivileges: false,
  });

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
        <Dialog
          open={true}
          onClose={() => setEditorOpen(false)}
          fullScreen={true}
          PaperProps={{
            sx: {
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              // The app theme caps MuiDialog.paper maxHeight to leave space for the top nav;
              // for the fullscreen editor we need to opt out so the paper truly fills the viewport.
              maxHeight: 'none',
            },
          }}
        >
          <DialogHeader
            title={callout.framing.profile.displayName}
            icon={<DocumentIcon color="primary" />}
            onClose={() => setEditorOpen(false)}
          />
          <Box flex={1} minHeight={0} display="flex" flexDirection="column" overflow="hidden">
            <CollaboraDocumentEditor collaboraDocumentId={collaboraDocument.id} iframeRef={iframeRef} />
          </Box>
          {/* Render the CRD footer inside a .crd-root scope so Tailwind preflight applies
              even though the parent MUI Dialog lives outside the global CRD scope. */}
          <div className="crd-root">
            <CollaboraCollabFooter {...footerProps} />
          </div>
        </Dialog>
      )}
    </>
  );
};

export default CalloutFramingCollaboraDocument;
