import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateCollaboraDocumentOnCalloutMutation } from '@/core/apollo/generated/apollo-hooks';
import { CalloutContributionType, CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { normalizeLink } from '@/core/utils/links';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { LocationStateKeyCachedCallout } from '../../CalloutPage/CalloutPage';
import CreateContributionButton from '../CreateContributionButton';
import type { CalloutContributionCreateButtonProps } from '../interfaces/CalloutContributionCreateButtonProps';

const CreateContributionButtonCollaboraDocument = ({
  callout,
  canCreateContribution,
  onContributionCreated,
}: CalloutContributionCreateButtonProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [documentType, setDocumentType] = useState<CollaboraDocumentType>(CollaboraDocumentType.TextDocument);
  const [createCollaboraDocument] = useCreateCollaboraDocumentOnCalloutMutation();

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDisplayName('');
    setDocumentType(CollaboraDocumentType.TextDocument);
  };

  const [handleCreate, creating] = useLoadingState(async () => {
    const { data } = await createCollaboraDocument({
      variables: {
        calloutId: callout.id,
        collaboraDocument: {
          displayName: displayName.trim(),
          documentType,
        },
      },
      refetchQueries: ['CalloutContributions'],
      awaitRefetchQueries: true,
    });

    await onContributionCreated?.();

    const profileUrl = data?.createContributionOnCallout.collaboraDocument?.profile?.url;
    if (profileUrl) {
      navigate(normalizeLink(profileUrl), {
        state: {
          [LocationStateKeyCachedCallout]: callout,
          keepScroll: true,
        },
      });
    }
    handleCloseDialog();
  });

  return (
    <>
      {canCreateContribution ? (
        <CreateContributionButton
          onClick={() => setDialogOpen(true)}
          contributionType={CalloutContributionType.CollaboraDocument}
        />
      ) : undefined}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth={true}>
        <DialogHeader onClose={handleCloseDialog} title={t('collaboraDocument.create.title')} />
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            fullWidth={true}
            label={t('fields.displayName')}
            variant="outlined"
            onChange={e => setDisplayName(e.target.value)}
            value={displayName}
            autoFocus={true}
          />
          <FormControl fullWidth={true}>
            <InputLabel>{t('collaboraDocument.create.documentType.label')}</InputLabel>
            <Select
              value={documentType}
              label={t('collaboraDocument.create.documentType.label')}
              onChange={e => setDocumentType(e.target.value as CollaboraDocumentType)}
            >
              <MenuItem value={CollaboraDocumentType.TextDocument}>
                {t('collaboraDocument.create.documentType.TEXT_DOCUMENT')}
              </MenuItem>
              <MenuItem value={CollaboraDocumentType.Spreadsheet}>
                {t('collaboraDocument.create.documentType.SPREADSHEET')}
              </MenuItem>
              <MenuItem value={CollaboraDocumentType.Presentation}>
                {t('collaboraDocument.create.documentType.PRESENTATION')}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={handleCloseDialog} disabled={creating}>
            {t('buttons.cancel')}
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={!displayName.trim()} loading={creating}>
            {t('buttons.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

CreateContributionButtonCollaboraDocument.displayName = 'CreateContributionButtonCollaboraDocument';
export default CreateContributionButtonCollaboraDocument;
