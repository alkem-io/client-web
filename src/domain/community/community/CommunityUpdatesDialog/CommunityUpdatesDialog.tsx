import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { CommunityUpdatesContainer } from '@/domain/communication/updates/CommunityUpdatesContainer/CommunityUpdatesContainer';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { useTranslation } from 'react-i18next';
import { CommunityUpdatesView } from '../views/CommunityUpdates/CommunityUpdatesView';

export interface CommunityUpdatesDialogProps {
  open: boolean;
  onClose: () => void;
  communityId?: string;
  shareUrl: string;
  loading?: boolean;
}

const CommunityUpdatesDialog = ({
  open,
  onClose,
  communityId = '',
  shareUrl,
  loading = false,
}: CommunityUpdatesDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="community-updates-dialog-title">
      <DialogHeader
        onClose={onClose}
        actions={<ShareButton url={shareUrl} entityTypeName="updates" />}
        title={t('dashboard-updates-section.dialog-title')}
      />
      <DialogContent dividers>
        <Box marginBottom={2} marginTop={4}>
          <CommunityUpdatesContainer communityId={communityId}>
            {({ messages, authors }, actions, { retrievingUpdateMessages }) => (
              <CommunityUpdatesView
                entities={{ messages, authors }}
                actions={{
                  onSubmit: message => actions.onSubmit(message, communityId),
                  onRemove: messageId => actions.onRemove(messageId, communityId),
                }}
                state={{
                  loadingMessages: retrievingUpdateMessages || loading,
                  submittingMessage: false,
                  removingMessage: false,
                }}
                options={{
                  hideHeaders: true,
                  disableCollapse: true,
                  disableElevation: true,
                  itemsPerRow: 1,
                }}
              />
            )}
          </CommunityUpdatesContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('buttons.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommunityUpdatesDialog;
