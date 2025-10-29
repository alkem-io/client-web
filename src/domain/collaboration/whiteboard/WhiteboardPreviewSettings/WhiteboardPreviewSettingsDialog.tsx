import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { WhiteboardDetails } from '../WhiteboardDialog/WhiteboardDialog';
import { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { useState } from 'react';
import getWhiteboardPreviewImage from '../WhiteboardVisuals/getWhiteboardPreviewImage';
import DialogWithGrid, { DialogFooter } from '@/core/ui/dialog/DialogWithGrid';
import { Button, CircularProgress, DialogActions, DialogContent, styled } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import { useTranslation } from 'react-i18next';
import { gutters } from '@/core/ui/grid/utils';
import {
  WhiteboardPreviewModeAutoIcon,
  WhiteboardPreviewModeCustomIcon,
  WhiteboardPreviewModeFixedIcon,
  WhiteboardPreviewSettingsIcon,
} from './icons/WhiteboardPreviewIcons';
import { Box } from '@mui/system';
import { WhiteboardPreviewMode } from '@/core/apollo/generated/graphql-schema';
import { useTheme } from '@mui/material';
import WhiteboardPreviewCustomSelectionDialog from './WhiteboardPreviewCustomSelectionDialog';
import { WhiteboardPreviewVisualDimensions } from '../WhiteboardVisuals/WhiteboardVisualsDimensions';
import { CropConfig } from '@/core/utils/images/cropImage';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import { toBlobPromise } from '@/core/utils/images/toBlobPromise';
import createFallbackWhiteboardPreview from '../WhiteboardVisuals/createFallbackWhiteboardPreview';
import useEnsurePresence from '@/core/utils/ensurePresence';
import { WhiteboardPreviewSettings } from './WhiteboardPreviewSettingsModel';

interface WhiteboardPreviewSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  onUpdate: (whiteboardPreviewSettings: WhiteboardPreviewSettings) => Promise<unknown>;
  whiteboard: WhiteboardDetails;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

const ModeButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
  width: '100%',
  padding: gutters(1)(theme),
  marginBottom: gutters(1)(theme),
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  '& > .MuiButton-startIcon': {
    padding: gutters(0.5)(theme),
    marginRight: gutters(1)(theme),
    background: theme.palette.background.default,
    borderRadius: Number(theme.shape.borderRadius) / 2,
  },
  '& > div': {
    textAlign: 'left',
  },
  '& > div > span': {
    textTransform: 'none',
  },
}));

const WhiteboardPreviewSettingsDialog = ({
  open = false,
  onClose,
  onUpdate,
  whiteboard,
  excalidrawAPI,
}: WhiteboardPreviewSettingsDialogProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const ensurePresence = useEnsurePresence();
  const [selectedMode, setSelectedMode] = useState<WhiteboardPreviewMode>(whiteboard.previewSettings.mode);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);

  const [whiteboardPreviewImage, setWhiteboardPreviewImage] = useState<Blob>();
  const openCropDialog = async () => {
    const excalidrawAPIrequired = ensurePresence(excalidrawAPI);
    setCropDialogOpen(true);

    const { image } = await getWhiteboardPreviewImage(excalidrawAPIrequired);
    const blob = await toBlobPromise(image).catch(async () => toBlobPromise(await createFallbackWhiteboardPreview()));
    setWhiteboardPreviewImage(blob);
  };

  const closeCropDialog = () => {
    setCropDialogOpen(false);
    setWhiteboardPreviewImage(undefined);
  };

  const [handleClickOnAuto, loadingAuto] = useLoadingState(async () => {
    setSelectedMode(WhiteboardPreviewMode.Auto);
    if (whiteboard.previewSettings.mode !== WhiteboardPreviewMode.Auto) {
      await onUpdate({
        mode: WhiteboardPreviewMode.Auto,
      });
    }
    onClose();
  });

  const handleClickOnCustom = async () => {
    setSelectedMode(WhiteboardPreviewMode.Custom);
    openCropDialog();
  };

  const handleClickOnFixed = async () => {
    setSelectedMode(WhiteboardPreviewMode.Fixed);
    openCropDialog();
  };

  const [handleCropChanged, loadingCustom] = useLoadingState(async (newCrop: CropConfig) => {
    closeCropDialog();
    await onUpdate({
      mode: selectedMode,
      coordinates: newCrop,
    });
    onClose();
  });

  const handleCropDialogClose = () => {
    closeCropDialog();
    setSelectedMode(whiteboard.previewSettings.mode); // Set whatever mode was selected before
  };

  return (
    <>
      <DialogWithGrid open={open} onClose={onClose}>
        <DialogHeader
          title={t('pages.whiteboard.previewSettings.title')}
          onClose={onClose}
          icon={<WhiteboardPreviewSettingsIcon />}
        />
        <Caption marginX={gutters()}>{t('pages.whiteboard.previewSettings.subtitle')}</Caption>
        <DialogContent>
          <ModeButton
            variant="outlined"
            startIcon={
              selectedMode === WhiteboardPreviewMode.Auto && loadingAuto ? (
                <CircularProgress size={gutters(1)(theme)} />
              ) : (
                <WhiteboardPreviewModeAutoIcon />
              )
            }
            selected={selectedMode === WhiteboardPreviewMode.Auto}
            onClick={handleClickOnAuto}
          >
            <Box>
              {t('pages.whiteboard.previewSettings.modes.auto.title')}
              <Caption>{t('pages.whiteboard.previewSettings.modes.auto.description')}</Caption>
            </Box>
          </ModeButton>
          <ModeButton
            variant="outlined"
            startIcon={
              selectedMode === WhiteboardPreviewMode.Custom && loadingCustom ? (
                <CircularProgress size={gutters(1)(theme)} />
              ) : (
                <WhiteboardPreviewModeCustomIcon />
              )
            }
            selected={selectedMode === WhiteboardPreviewMode.Custom}
            onClick={handleClickOnCustom}
          >
            <Box>
              {t('pages.whiteboard.previewSettings.modes.custom.title')}
              <Caption>{t('pages.whiteboard.previewSettings.modes.custom.description')}</Caption>
            </Box>
          </ModeButton>
          <ModeButton
            variant="outlined"
            startIcon={
              selectedMode === WhiteboardPreviewMode.Fixed && loadingCustom ? (
                <CircularProgress size={gutters(1)(theme)} />
              ) : (
                <WhiteboardPreviewModeFixedIcon />
              )
            }
            selected={selectedMode === WhiteboardPreviewMode.Fixed}
            onClick={handleClickOnFixed}
          >
            <Box>
              {t('pages.whiteboard.previewSettings.modes.fixed.title')}
              <Caption>{t('pages.whiteboard.previewSettings.modes.fixed.description')}</Caption>
            </Box>
          </ModeButton>
        </DialogContent>
        <DialogFooter>
          <DialogActions>
            <Button variant="outlined" onClick={onClose}>
              {t('buttons.close')}
            </Button>
          </DialogActions>
        </DialogFooter>
      </DialogWithGrid>
      <WhiteboardPreviewCustomSelectionDialog
        open={cropDialogOpen}
        onClose={handleCropDialogClose}
        onCropSave={handleCropChanged}
        whiteboardPreviewImage={whiteboardPreviewImage}
        cropConfig={whiteboard.previewSettings.coordinates}
        constraints={WhiteboardPreviewVisualDimensions}
      />
    </>
  );
};

export default WhiteboardPreviewSettingsDialog;
