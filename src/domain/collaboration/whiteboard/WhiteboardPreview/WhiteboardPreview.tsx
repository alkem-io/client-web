import { WhiteboardIcon } from '../icon/WhiteboardIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import { Box, Button, ButtonProps, styled } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import Centered from '@/core/ui/utils/Centered';
import { WhiteboardPreviewVisualDimensions } from '../WhiteboardVisuals/WhiteboardVisualsDimensions';
import GuestVisibilityBadge from '../components/GuestVisibilityBadge';
import { previewContainerStyles, previewButtonStyles, chipButtonPositionStyles } from '../../common/PreviewStyles';

type WhiteboardPreviewProps = {
  displayName?: string;
  whiteboard:
    | {
        profile: {
          preview?: { uri: string };
        };
        guestContributionsAllowed?: boolean;
      }
    | undefined;
  onClick?: MouseEventHandler;
};

const Container = styled(Box)(({ theme, onClick }) => previewContainerStyles(theme, onClick));

const ImageContainer = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  display: 'flex',
  aspectRatio: WhiteboardPreviewVisualDimensions.aspectRatio,
}));

const OpenWhiteboardButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button variant="outlined" className="only-on-hover" sx={theme => previewButtonStyles(theme)} {...props}>
      {t('callout.whiteboard.clickToSee')}
    </Button>
  );
};

const WhiteboardChipButton = ({ disableClick, ...props }: ButtonProps & { disableClick?: boolean }) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outlined"
      startIcon={<WhiteboardIcon />}
      size="small"
      sx={theme => ({
        ...previewButtonStyles(theme),
        ...chipButtonPositionStyles(theme),
        pointerEvents: disableClick ? 'none' : 'auto',
      })}
      aria-label={
        disableClick ? t('pages.whiteboard.preview.ariaLabelDisabled') : t('pages.whiteboard.preview.ariaLabel')
      }
      {...props}
    >
      {t('common.Whiteboard')}
    </Button>
  );
};

const WhiteboardPreview = ({ displayName, whiteboard, onClick }: WhiteboardPreviewProps) => {
  const imageSrc = whiteboard?.profile.preview?.uri;
  const defaultImage = <WhiteboardIcon />;
  const showGuestWarning = Boolean(whiteboard?.guestContributionsAllowed);

  return (
    <Container onClick={onClick}>
      {showGuestWarning && (
        <Box
          display="flex"
          justifyContent="center"
          position="absolute"
          top={gutters(0.5)}
          left={gutters(1)}
          right={gutters(1)}
          zIndex={3}
        >
          <GuestVisibilityBadge data-testid="guest-visibility-badge-preview" />
        </Box>
      )}
      <ImageContainer>
        {!imageSrc && defaultImage && <Centered>{defaultImage}</Centered>}
        {imageSrc && (
          <ImageFadeIn src={imageSrc} alt={displayName} width="100%" height="100%" sx={{ objectFit: 'contain' }} />
        )}
      </ImageContainer>
      <WhiteboardChipButton disableClick={!onClick} />
      {onClick && <OpenWhiteboardButton />}
    </Container>
  );
};

export default WhiteboardPreview;
