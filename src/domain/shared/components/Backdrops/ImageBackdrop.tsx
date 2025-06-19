import useNavigate from '@/core/routing/useNavigate';
import ImageFadeIn from '@/core/ui/image/ImageFadeIn';
import { buildLoginUrl, buildSignUpUrl } from '@/main/routing/urlBuilders';
import { Box, BoxProps, Button, styled, Typography, TypographyProps } from '@mui/material';
import { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const Root = styled(Box)(() => ({
  position: 'relative',
  overflow: 'hidden',
}));

const Background = styled(ImageFadeIn)(({ theme }) => ({
  display: 'grid',
  placeContent: 'center',

  width: '100%',
  height: '100%',
  objectFit: 'cover',

  [theme.breakpoints.up('sm')]: {
    width: '100%',
  },

  [theme.breakpoints.down('sm')]: {
    height: 160,
  },
}));

const Message = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: 0,

  display: 'grid',
  placeContent: 'center',

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5),
  },
}));

const ButtonsWrapper = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  '& > button': {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),

    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
  },
}));

interface ImageBackdropProps extends PropsWithChildren {
  src: string;
  backdropMessage: 'private' | 'authentication' | 'login'; // translation: components.backdrop.*
  blockName: 'users-contributing' | 'all-contributing-users'; // translation: common.block.*
  messageSx?: TypographyProps['sx'];
  imageSx?: BoxProps['sx'];
  show?: boolean;
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
  const { pathname } = useLocation();
  const loginUrl = buildLoginUrl(pathname);
  const signUpUrl = buildSignUpUrl(pathname);

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
              <Button variant={'contained'} onClick={() => navigate(loginUrl, { replace: true })}>
                {t('authentication.sign-in')}
              </Button>

              <Button variant={'contained'} onClick={() => navigate(signUpUrl, { replace: true })}>
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
