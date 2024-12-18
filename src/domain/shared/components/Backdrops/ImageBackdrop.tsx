import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@/core/routing/useNavigate';
import { BackdropProps } from './BackdropWithMessage';
import { _AUTH_LOGIN_PATH, AUTH_SIGN_UP_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import { Box, BoxProps, Button, styled, Typography, TypographyProps } from '@mui/material';

const Root = styled(Box)(() => ({
  position: 'relative',
  overflow: 'hidden',
}));

const Background = styled(ImageFadeIn)(() => ({
  display: 'grid',
  placeContent: 'center',
  width: '100%',

  '@media (width > 600px)': {
    width: '100%',
  },

  '@media (width < 600px)': {
    height: 160,
  },
}));

const Message = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: 0,

  display: 'grid',
  placeContent: 'center',

  '@media (width < 600px)': {
    padding: theme.spacing(0.5),
  },
}));

const ButtonsWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  '& > button': {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),

    '@media (width > 600px)': {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  },
}));

interface ImageBackdropProps extends BackdropProps {
  src: string;
  backdropMessage: 'private' | 'authentication' | 'login'; // translation: components.backdrop.*
  blockName: 'users-contributing' | 'all-contributing-users'; // translation: common.block.*
  messageSx?: TypographyProps['sx'];
  imageSx?: BoxProps['sx'];
}

const ImageBackdrop: FC<ImageBackdropProps> = ({
  children,
  src,
  backdropMessage,
  blockName,
  messageSx,
  imageSx,
  show = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      {show && (
        <Root>
          <Background src={src} sx={imageSx} />
          {children}

          <Message>
            <Typography variant="h5" sx={messageSx} width="100%" textAlign="center">
              {t(`components.backdrop.${backdropMessage}`, { blockName: t(`common.blocks.${blockName}`) })}
            </Typography>

            <ButtonsWrapper>
              <Button variant={'contained'} onClick={() => navigate(_AUTH_LOGIN_PATH, { replace: true })}>
                {t('authentication.sign-in')}
              </Button>

              <Button variant={'contained'} onClick={() => navigate(AUTH_SIGN_UP_PATH, { replace: true })}>
                {t('authentication.sign-up')}
              </Button>
            </ButtonsWrapper>
          </Message>
        </Root>
      )}
    </>
  );
};

export default ImageBackdrop;
