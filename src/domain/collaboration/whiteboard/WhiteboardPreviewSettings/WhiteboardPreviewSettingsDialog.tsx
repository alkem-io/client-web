import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { WhiteboardDetails } from '../WhiteboardDialog/WhiteboardDialog';
import { ExcalidrawImperativeAPI } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { useEffect, useState } from 'react';
import getWhiteboardPreviewImage from '../WhiteboardPreviewImages/utils/getWhiteboardPreviewImage';
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
import { useUpdateWhiteboardPreviewSettingsMutation } from '@/core/apollo/generated/apollo-hooks';
import { useTheme } from '@mui/material';
import WhiteboardPreviewCustomSelectionDialog from './WhiteboardPreviewCustomSelectionDialog';
import { WhiteboardPreviewVisualDimensions } from '../WhiteboardPreviewImages/WhiteboardDimensions';
import { CropConfig } from '@/core/utils/images/cropImage';
import { generateWhiteboardPreviewImages } from '../WhiteboardPreviewImages/utils/generateWhiteboardPreviewImages';
import { useUploadWhiteboardVisuals } from '../WhiteboardPreviewImages/utils/useUploadWhiteboardVisuals';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

interface WhiteboardPreviewSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  whiteboard: WhiteboardDetails;
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

const ModeButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
  width: '100%',
  padding: gutters(1)(theme),
  marginBottom: gutters(1)(theme),
  justifyContent: 'flex-start',
  alignItems: 'start',
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
  whiteboard,
  excalidrawAPI,
}: WhiteboardPreviewSettingsDialogProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState<WhiteboardPreviewMode>(whiteboard.previewSettings.mode);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);

  const [whiteboardPreviewImage, setWhiteboardPreviewImage] = useState<string>(); // blob data url
  useEffect(() => {
    if (!open || !excalidrawAPI) {
      return;
    }

    (async () => {
      const { image } = await getWhiteboardPreviewImage(excalidrawAPI);
      const reader = new FileReader();
      const loadFile = () => setWhiteboardPreviewImage(reader.result as string);
      reader.addEventListener('load', loadFile);
      reader.readAsDataURL(image);
    })();
  }, [open, whiteboard, excalidrawAPI]);

  const [updateWhiteboardPreviewSettings] = useUpdateWhiteboardPreviewSettingsMutation();

  const [handleClickOnAuto, loadingAuto] = useLoadingState(async () => {
    setSelectedMode(WhiteboardPreviewMode.Auto);
    if (whiteboard.previewSettings.mode !== WhiteboardPreviewMode.Auto) {
      await updateWhiteboardPreviewSettings({
        variables: {
          whiteboardId: whiteboard.id,
          previewSettings: {
            mode: WhiteboardPreviewMode.Auto,
          },
        },
      });
    }
    onClose();
  });

  const handleClickOnCustom = async () => {
    setSelectedMode(WhiteboardPreviewMode.Custom);
    setCropDialogOpen(true);
  };

  const handleClickOnFixed = async () => {
    setSelectedMode(WhiteboardPreviewMode.Fixed);
    setCropDialogOpen(true);
  };

  const { uploadVisuals } = useUploadWhiteboardVisuals();
  const [handleCropChanged, loadingCustom] = useLoadingState(async (newCrop: CropConfig) => {
    setCropDialogOpen(false);
    await updateWhiteboardPreviewSettings({
      variables: {
        whiteboardId: whiteboard.id,
        previewSettings: {
          mode: selectedMode,
          coordinates: newCrop,
        },
      },
    });
    if (selectedMode === WhiteboardPreviewMode.Fixed) {
      const previewImages = await generateWhiteboardPreviewImages(
        {
          profile: {
            preview: whiteboard.profile.preview,
            visual: whiteboard.profile.visual,
          },
          previewSettings: {
            mode: WhiteboardPreviewMode.Fixed,
            coordinates: newCrop,
          },
        },
        excalidrawAPI,
        true
      );
      await uploadVisuals(
        previewImages,
        {
          cardVisualId: whiteboard.profile.visual?.id,
          previewVisualId: whiteboard.profile.preview?.id,
        },
        whiteboard.nameID
      );
    }
    onClose();
  });

  const handleCropDialogClose = () => {
    setCropDialogOpen(false);
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
        onChangeCrop={handleCropChanged}
        whiteboardPreviewImage={whiteboardPreviewImage}
        cropConfig={whiteboard.previewSettings.coordinates}
        constraints={WhiteboardPreviewVisualDimensions}
      />
    </>
  );
};

export default WhiteboardPreviewSettingsDialog;
