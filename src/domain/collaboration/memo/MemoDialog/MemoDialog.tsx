import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import CollaborativeMarkdownInput from '@/core/ui/forms/CollaborativeMarkdownInput/CollaborativeMarkdownInput';
import { CharacterCountContextProvider } from '@/core/ui/forms/MarkdownInput/CharacterCountContext';
import { Box, DialogContent, OutlinedInput } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import useMemoManager from '../MemoManager/useMemoManager';
import Loading from '@/core/ui/loading/Loading';
import ShareButton from '@/domain/shared/components/ShareDialog/ShareButton';
import FullscreenButton from '@/core/ui/button/FullscreenButton';
import { useEffect, useRef, useState } from 'react';
import UserPresencing from '../../realTimeCollaboration/UserPresencing';
import { RealTimeCollaborationState } from '../../realTimeCollaboration/RealTimeCollaborationState';
import MemoFooter from './MemoFooter';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';

interface MemoDialogProps {
  open?: boolean;
  onClose?: () => void;
  memoId: string;
}

const MemoDialog = ({ open = false, onClose, memoId }: MemoDialogProps) => {
  const { t } = useTranslation();
  const [fullScreen, setFullScreen] = useState(false);
  const [forceExitFullscreen, setForceExitFullscreen] = useState(false);
  const [collaborationState, setCollaborationState] = useState<RealTimeCollaborationState>();
  const dialogRef = useRef<HTMLDivElement>(null);

  const { memo, loading } = useMemoManager({ id: memoId });

  const handleClose = () => {
    // Declaratively trigger fullscreen exit
    setForceExitFullscreen(true);
    setFullScreen(false);
    onClose?.();
  };

  const handleDialogOpen = () => {
    if (open) {
      setForceExitFullscreen(false);
    }
  };

  useEffect(() => {
    handleDialogOpen();
  }, [open]);

  const hasContributePrivileges = (memo?.authorization?.myPrivileges ?? []).includes(AuthorizationPrivilege.Contribute);
  const notConnected = !collaborationState || collaborationState.status !== 'connected';
  const notSynced = !collaborationState || !collaborationState.synced;
  const disabled = !hasContributePrivileges || collaborationState?.readOnly || notConnected || notSynced;

  return (
    <DialogWithGrid ref={dialogRef} open={open} onClose={handleClose} fullWidth fullHeight fullScreen={fullScreen}>
      <DialogHeader
        onClose={handleClose}
        actions={
          <>
            <ShareButton url={memo?.profile.url} entityTypeName="memo" disabled={!memo?.profile.url} />
            <FullscreenButton
              element={dialogRef.current || undefined}
              onChange={setFullScreen}
              forceExit={forceExitFullscreen}
            />
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
            <CharacterCountContextProvider>
              <OutlinedInput
                inputComponent={CollaborativeMarkdownInput}
                disabled={disabled}
                inputProps={{
                  controlsVisible: 'always',
                  collaborationId: memoId,
                  height: '100%',
                  onChangeCollaborationState: setCollaborationState,
                  storageBucketId: memo.profile.storageBucket.id,
                }}
                sx={{
                  '&.MuiOutlinedInput-root': {
                    padding: gutters(0.5),
                  },
                  height: '100%',
                  minHeight: 'calc(100vh - 200px)',
                  alignItems: 'flex-start',
                }}
                multiline
                fullWidth
              />
            </CharacterCountContextProvider>
          )}
        </Box>
      </DialogContent>
      <DialogFooter>
        <MemoFooter memoUrl={memo?.profile.url} createdBy={memo?.createdBy} collaborationState={collaborationState} />
      </DialogFooter>
    </DialogWithGrid>
  );
};

export default MemoDialog;
