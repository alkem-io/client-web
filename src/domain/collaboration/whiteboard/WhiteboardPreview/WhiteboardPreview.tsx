import { WhiteboardIcon } from '../icon/WhiteboardIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import { Box, Button, ButtonBase, ButtonProps, styled, Theme } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import Centered from '@/core/ui/utils/Centered';

type WhiteboardPreviewProps = {
  displayName?: string;
  whiteboard:
    | {
        profile: {
          preview?: { uri: string };
        };
      }
    | undefined;
  onClick?: MouseEventHandler;
};

const Container = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '1px solid',
  borderColor: theme.palette.divider,
  margin: gutters(1)(theme),
  overflow: 'hidden',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  // Button appearing only on hover:
  '& .only-on-hover': {
    display: 'none',
  },
  '&:hover .only-on-hover': {
    display: 'block',
  },
  [theme.breakpoints.down('sm')]: {
    // But always on small screens:
    '& .only-on-hover': {
      display: 'block',
    },
  },
  // Background blur on hover
  '&:hover::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    backdropFilter: 'blur(3px)',
    zIndex: 1,
  },
}));

const ImageContainer = styled(ButtonBase)(() => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '2.5',
}));

// Common styles for the two buttons shown in the preview:
// on top of the preview, with slightly less rounded corners and with background
const buttonsInPreview = (theme: Theme) => ({
  position: 'absolute',
  borderColor: theme.palette.divider,
  borderRadius: `${theme.shape.borderRadiusSquare}px`,
  zIndex: 2,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.background.default,
  },
});

const OpenWhiteboardButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button variant="outlined" className="only-on-hover" sx={theme => buttonsInPreview(theme)} {...props}>
      {t('callout.whiteboard.clickToSee')}
    </Button>
  );
};

const WhiteboardChipButton = (props: ButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outlined"
      startIcon={<WhiteboardIcon />}
      size="small"
      sx={theme => ({
        ...buttonsInPreview(theme),
        top: gutters(1)(theme),
        left: gutters(1)(theme),
        textTransform: 'none',
      })}
      {...props}
    >
      {t('common.Whiteboard')}
    </Button>
  );
};

const WhiteboardPreview = ({ displayName, whiteboard, onClick }: WhiteboardPreviewProps) => {
  const imageSrc = whiteboard?.profile.preview?.uri;
  const defaultImage = <WhiteboardIcon />;

  return (
    <Container onClick={onClick}>
      <ImageContainer>
        {!imageSrc && defaultImage && <Centered>{defaultImage}</Centered>}
        {imageSrc && <ImageFadeIn src={imageSrc} alt={displayName} onClick={onClick} width="100%" height="100%" />}
      </ImageContainer>
      <WhiteboardChipButton onClick={onClick} />
      <OpenWhiteboardButton onClick={onClick} />
    </Container>
  );
};

export default WhiteboardPreview;
