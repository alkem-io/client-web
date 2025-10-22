import { WhiteboardIcon } from '../icon/WhiteboardIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import { Box, Button, ButtonBase, ButtonProps, styled } from '@mui/material';
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
    cursor: 'pointer',
    // backgroundColor: theme.palette.background.default,
    backdropFilter: 'blur(2px)',
    zIndex: 1,
  },
}));

const ImageContainer = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '2.5',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  width: '100%',
}));

const OpenWhiteboardButton = (props: ButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="outlined"
      className="only-on-hover"
      sx={{
        position: 'absolute',
        borderColor: theme => theme.palette.divider,
        borderRadius: theme => `${theme.shape.borderRadiusSquare}px`,
        zIndex: 2,
        backgroundColor: theme => theme.palette.background.paper,
        '&:hover': {
          backgroundColor: theme => theme.palette.background.default,
        },
        ...props.sx,
      }}
      {...props}
    >
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
      sx={{
        position: 'absolute',
        top: gutters(1),
        left: gutters(1),
        textTransform: 'none',
        borderColor: theme => theme.palette.divider,
        borderRadius: theme => `${theme.shape.borderRadiusSquare}px`,
        zIndex: 2,
        ...props.sx,
      }}
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
        {imageSrc && <ImageFadeIn sx={{ minHeight: '100%' }} alt={displayName} onClick={onClick} />}
      </ImageContainer>
      <WhiteboardChipButton onClick={onClick} />
      <OpenWhiteboardButton onClick={onClick} />
    </Container>
  );
};

export default WhiteboardPreview;
