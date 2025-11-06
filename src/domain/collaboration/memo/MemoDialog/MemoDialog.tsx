import { useRef, useState } from 'react';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import CollaborativeMarkdownInput from '@/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput';
import { CharacterCountContextProvider } from '@/core/ui/forms/MarkdownInput/CharacterCountContext';
import { Box, DialogContent, OutlinedInput } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import useMemoManager from '../MemoManager/useMemoManager';
import Loading from '@/core/ui/loading/Loading';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import UserPresencing from '../../realTimeCollaboration/UserPresencing';
import { MemoStatus, RealTimeCollaborationState } from '../../realTimeCollaboration/RealTimeCollaborationState';
import MemoFooter from './MemoFooter';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import CollaborationSettings from '../../realTimeCollaboration/CollaborationSettings/CollaborationSettings';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';

interface MemoDialogProps {
  open?: boolean;
  onClose?: () => void;
  memoId: string;
  calloutId: string;
}

const MemoDialog = ({ open = false, onClose, memoId, calloutId }: MemoDialogProps) => {
  const { t } = useTranslation();
  const [collaborationState, setCollaborationState] = useState<RealTimeCollaborationState>();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { fullscreen, setFullscreen } = useFullscreen();

  const { memo, loading } = useMemoManager({ id: memoId });

  const handleClose = () => {
    if (fullscreen) {
      setFullscreen(false);
    }

    onClose?.();
  };

  const hasUpdatePrivileges = (memo?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Update);
  const hasContributePrivileges = (memo?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Contribute);
  const notConnected = !collaborationState || collaborationState.status !== MemoStatus.CONNECTED;
  const notSynced = !collaborationState || !collaborationState.synced;
  const disabled = !hasContributePrivileges || collaborationState?.readOnly || notConnected || notSynced;

  return (
    <DialogWithGrid
      ref={dialogRef}
      open={open}
      onClose={handleClose}
      fullWidth
      fullHeight
      fullScreen={fullscreen}
      aria-labelledby="memo-dialog-title"
    >
      <DialogHeader
        onClose={handleClose}
        id="memo-dialog-title"
        actions={
          <>
            <ShareButton url={memo?.profile.url} entityTypeName="memo" disabled={!memo?.profile.url}>
              {hasUpdatePrivileges && <CollaborationSettings element={memo} elementType="memo" />}
            </ShareButton>
            <FullscreenButton />
            <UserPresencing
              collaborationState={collaborationState}
              hideSaveRequestIndicator={
                !hasContributePrivileges || collaborationState?.readOnly || !collaborationState?.lastActive
              }
            />
          </>
        }
      >
        {t('common.memo')}
      </DialogHeader>
      <DialogContent>
        <Box position="relative" height="100%" width="100%">
          {loading && <Loading />}
          {notConnected && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex={1}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            >
              <Loading text="Connecting to collaboration service..." />
            </Box>
          )}
          {!loading && memo && (
            <StorageConfigContextProvider locationType="callout" calloutId={calloutId}>
              <CharacterCountContextProvider>
                <OutlinedInput
                  inputComponent={CollaborativeMarkdownInput}
                  disabled={disabled}
                  inputProps={{
                    controlsVisible: 'always',
                    collaborationId: memoId,
                    height: '100%',
                    fullScreen: fullscreen,
                    onChangeCollaborationState: setCollaborationState,
                    storageBucketId: memo?.profile.storageBucket.id,
                    autoFocus: true,
                  }}
                  sx={{
                    '&.MuiOutlinedInput-root': {
                      padding: gutters(0.5),
                    },
                    height: '100%',
                    alignItems: 'flex-start',
                  }}
                  multiline
                  fullWidth
                />
              </CharacterCountContextProvider>
            </StorageConfigContextProvider>
          )}
        </Box>
      </DialogContent>
      <DialogFooter>
        <MemoFooter
          memoUrl={memo?.profile.url}
          createdBy={memo?.createdBy}
          collaborationState={collaborationState}
          contentUpdatePolicy={memo?.contentUpdatePolicy}
        />
      </DialogFooter>
    </DialogWithGrid>
  );
};

export default MemoDialog;
