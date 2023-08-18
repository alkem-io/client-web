import { FC } from 'react';
import { Box, Card, styled, Typography } from '@mui/material';
import ImageFadeIn from '../../../core/ui/image/ImageFadeIn';

const DEFAULT_ICON = '/side-note-icon.png';

export interface SideNoteProps {
  title: string;
  description: string;
  iconSrc?: string;
}

const Root = styled(Box)(({ theme }) => ({
  height: '100%',
  paddingBottom: theme.spacing(2),
}));

const Container = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const TextWrapper = styled(Box)(() => ({
  display: 'flex',
  height: '80%',
}));

const Text = styled(Typography)(() => ({
  textAlign: 'justify',
  marginBottom: 0,
}));

const IconWrapper = styled('span')(() => ({
  float: 'right',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  shapeOutside: 'radial-gradient(70px at 75% 100%, #000 100%,#0000)',
}));

const Icon = styled(ImageFadeIn)(({ theme }) => ({
  width: theme.spacing(10),
}));

const SideNote: FC<SideNoteProps> = ({ title, description, iconSrc = DEFAULT_ICON }) => {
  return (
    <Root>
      <Container>
        <Typography variant="h5">{title}</Typography>
        <TextWrapper>
          <Text>
            <IconWrapper>
              <Icon src={iconSrc} />
            </IconWrapper>
            {description}
          </Text>
        </TextWrapper>
      </Container>
    </Root>
  );
};

export default SideNote;
