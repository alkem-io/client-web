import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, Dialog, DialogContent, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteContributionMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import useEnsurePresence from '@/core/utils/ensurePresence';
import CollaboraDocumentEditor from '@/domain/collaboration/calloutContributions/collaboraDocument/CollaboraDocumentEditor';
import type { CalloutContributionPreviewDialogProps } from '../interfaces/CalloutContributionPreviewDialogProps';

const CalloutContributionDialogCollaboraDocument = ({
  open,
  onClose,
  contribution,
  onContributionDeleted,
}: CalloutContributionPreviewDialogProps) => {
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [deleteContribution] = useDeleteContributionMutation();

  const canDelete = contribution?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Delete) ?? false;

  const handleDelete = async () => {
    const contributionId = ensurePresence(contribution?.id, 'ContributionId');
    await deleteContribution({
      variables: { contributionId },
      awaitRefetchQueries: true,
      refetchQueries: ['CalloutDetails', 'CalloutContributions'],
      onCompleted: data => {
        onContributionDeleted(data.deleteContribution.id);
      },
    });
    setConfirmDeleteOpen(false);
  };

  if (!open) {
    return null;
  }

  const collaboraDocumentId = contribution?.collaboraDocument?.id;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullScreen={true}>
        <Box display="flex" justifyContent="flex-end" alignItems="center" px={2} py={1} gap={1}>
          {canDelete && (
            <Tooltip title={t('buttons.delete')}>
              <IconButton onClick={() => setConfirmDeleteOpen(true)} size="small" aria-label={t('buttons.delete')}>
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('buttons.close')}>
            <IconButton onClick={onClose} size="small" aria-label={t('buttons.close')}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <DialogContent sx={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {collaboraDocumentId ? <CollaboraDocumentEditor collaboraDocumentId={collaboraDocumentId} /> : null}
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        actions={{
          onConfirm: handleDelete,
          onCancel: () => setConfirmDeleteOpen(false),
        }}
        options={{
          show: confirmDeleteOpen,
        }}
        entities={{
          confirmButtonTextId: 'buttons.delete',
          title: t('collaboraDocument.delete.confirm'),
          content: t('collaboraDocument.delete.confirm'),
        }}
      />
    </>
  );
};

export default CalloutContributionDialogCollaboraDocument;
