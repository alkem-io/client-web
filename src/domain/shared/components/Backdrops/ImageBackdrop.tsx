import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BackdropProps } from './BackdropWithMessage';
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from '../../../../models/constants';
import Image from '../Image';
import { Box, Button, styled, Typography } from '@mui/material';

const Root = styled(Box)(() => ({
  position: 'relative',
  overflow: 'hidden',
}));

const Background = styled(Image)(() => ({
  width: '100%',
  height: '100%',
}));

const Message = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  textAlign: 'center',
  alignItems: 'center',
  paddingTop: theme.spacing(5),
}));

const ButtonsWrapper = styled(Box)(({ theme }) => ({
  flexBasis: '100%',
  display: 'flex',
  justifyContent: 'space-evenly',
  marginBottom: theme.spacing(4),
}));

interface ImageBackdropProps extends BackdropProps {
  src: string;
  blockName: 'users-contributing'; // | ... any other common.block.* in the translation
}

const ImageBackdrop: FC<ImageBackdropProps> = ({ children, src, blockName, show = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      {show && (
        <Root>
          <Background src={src} />
          {children}
          <Message>
            <Typography variant="h5" sx={{ width: '100%', textAlign: 'center' }}>
              {t('components.backdrop.authentication', { blockName: t(`common.blocks.${blockName}` as const) })}
            </Typography>
            <ButtonsWrapper>
              <Button variant={'contained'} onClick={() => navigate(AUTH_LOGIN_PATH, { replace: true })}>
                {t('authentication.sign-in')}
              </Button>
              <Button variant={'contained'} onClick={() => navigate(AUTH_REGISTER_PATH, { replace: true })}>
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
