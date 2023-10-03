import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { Box, Button, DialogActions } from '@mui/material';
import { DialogContent } from '../../../../core/ui/dialog/deprecated';
import { CommunityUpdatesContainer } from '../../../communication/updates/CommunityUpdatesContainer/CommunityUpdatesContainer';
import { CommunityUpdatesView } from '../views/CommunityUpdates/CommunityUpdatesView';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import ShareButton from '../../../shared/components/ShareDialog/ShareButton';

export interface CommunityUpdatesDialogProps {
  open: boolean;
  onClose: () => void;
  spaceId?: string;
  communityId?: string;
  shareUrl: string;
}

const CommunityUpdatesDialog: FC<CommunityUpdatesDialogProps> = ({
  open,
  onClose,
  spaceId,
  communityId = '',
  shareUrl,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} maxWidth="md" fullWidth aria-labelledby="community-updates-dialog-title">
      <DialogHeader
        onClose={onClose}
        actions={
          <>
            <ShareButton url={shareUrl} entityTypeName="updates" />
          </>
        }
        title={t('dashboard-updates-section.dialog-title')}
      />
      <DialogContent dividers>
        <Box marginBottom={2} marginTop={4}>
          <CommunityUpdatesContainer entities={{ spaceId, communityId }}>
            {({ messages, authors }, actions, loading) => (
              <CommunityUpdatesView
                entities={{ messages, authors }}
                actions={{
                  onSubmit: message => actions.onSubmit(message, communityId),
                  onRemove: messageId => actions.onRemove(messageId, communityId),
                }}
                state={{
                  loadingMessages: loading.retrievingUpdateMessages,
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
