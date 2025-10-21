import ImageWithCaption from '@/core/ui/image/ImageWithCaption';
import { WhiteboardIcon } from '../icon/WhiteboardIcon';
import { useTranslation } from 'react-i18next';
import { MouseEventHandler } from 'react';
import { Box, Button, ButtonProps, styled } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

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
  // border: `1px solid ${theme.palette.divider}`,
  border: '1px solid red',
  margin: gutters(1)(theme),
  borderRadius: theme.shape.borderRadius, //!!
  '& .only-on-hover': {
    display: 'none',
  },
  '&:hover .only-on-hover': {
    display: 'block',
  },
  [theme.breakpoints.down('sm')]: {
    '& .only-on-hover': {
      display: 'block',
    },
  },
}));

const OpenWhiteboardButton = (props: ButtonProps) => (
  <Button
    variant="outlined"
    className="only-on-hover"
    sx={{
      position: 'absolute',
      borderColor: theme => theme.palette.divider,
      borderRadius: theme => theme.shape.borderRadius, //!!
      ...props.sx,
    }}
    {...props}
  >
    Click to open whiteboard
  </Button>
);
const WhiteboardTagButton = (props: ButtonProps) => (
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
      ...props.sx,
    }}
    {...props}
  >
    Whiteboard
  </Button>
);

const WhiteboardPreview = ({ displayName, whiteboard, onClick }: WhiteboardPreviewProps) => {
  const { t } = useTranslation();

  return (
    <Container>
      <ImageWithCaption
        caption={onClick ? t('callout.singleWhiteboard.clickToSee') : ''}
        src={whiteboard?.profile.preview?.uri}
        alt={displayName}
        defaultImage={<WhiteboardIcon />}
        onClick={onClick}
      />
      <WhiteboardTagButton onClick={onClick} />
      <OpenWhiteboardButton onClick={onClick} />
    </Container>
  );
};

export default WhiteboardPreview;
