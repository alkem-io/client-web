import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, IconButton, TextField, Tooltip } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateCollaboraDocumentMutation } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, type CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { getCollaboraDocumentIcon } from '@/domain/collaboration/calloutContributions/collaboraDocument/collaboraDocumentIcons';
import type { CalloutContributionPreviewComponentProps } from '../interfaces/CalloutContributionPreviewComponentProps';

const CalloutContributionPreviewCollaboraDocument = ({
  contribution,
  loading,
  onOpenContribution,
}: CalloutContributionPreviewComponentProps) => {
  const { t } = useTranslation();
  const collaboraDocument = contribution?.collaboraDocument;
  const docType = collaboraDocument?.documentType as CollaboraDocumentType | undefined;
  const DocumentIcon = docType ? getCollaboraDocumentIcon(docType) : null;

  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [updateCollaboraDocument] = useUpdateCollaboraDocumentMutation();

  const canUpdate = contribution?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;

  const handleStartRename = () => {
    setNewName(collaboraDocument?.profile?.displayName ?? '');
    setRenaming(true);
  };

  const handleRename = async () => {
    if (!collaboraDocument?.id || !newName.trim()) return;
    await updateCollaboraDocument({
      variables: {
        updateData: {
          ID: collaboraDocument.id,
          displayName: newName.trim(),
        },
      },
      refetchQueries: ['CalloutContributions'],
    });
    setRenaming(false);
  };

  if (loading || !collaboraDocument) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={gutters()} padding={gutters(2)}>
      {DocumentIcon && <DocumentIcon sx={{ fontSize: '4rem' }} color="primary" />}
      {renaming ? (
        <Box display="flex" gap={1} alignItems="center">
          <TextField
            size="small"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setRenaming(false);
            }}
            autoFocus={true}
          />
          <Button size="small" variant="contained" onClick={handleRename} disabled={!newName.trim()}>
            {t('buttons.save')}
          </Button>
          <Button size="small" variant="text" onClick={() => setRenaming(false)}>
            {t('buttons.cancel')}
          </Button>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Caption>{collaboraDocument.profile?.displayName}</Caption>
          {canUpdate && (
            <Tooltip title={t('buttons.edit')}>
              <IconButton size="small" onClick={handleStartRename} aria-label={t('buttons.edit')}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
      <Button variant="contained" onClick={onOpenContribution}>
        {t('buttons.edit')}
      </Button>
    </Box>
  );
};

export default CalloutContributionPreviewCollaboraDocument;
