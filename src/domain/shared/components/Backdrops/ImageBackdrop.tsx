import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BackdropProps } from './BackdropWithMessage';
import {
  AUTH_LOGIN_PATH,
  AUTH_SIGN_UP_PATH,
} from '../../../../core/auth/authentication/constants/authentication.constants';
import Image from '../Image';
import { Box, Button, styled, Typography, TypographyProps } from '@mui/material';

const Root = styled(Box)(() => ({
  position: 'relative',
  overflow: 'hidden',
}));

const Background = styled(Image)(() => ({
  width: '100%',
  height: '100%',
}));

const Message = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexWrap: 'wrap',
  textAlign: 'center',
  alignItems: 'center',
}));

const ButtonsWrapper = styled(Box)(({ theme }) => ({
  flexBasis: '100%',
  textAlign: 'center',
  '& > button': {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));

const FlexSpacer = styled(Box)(() => ({
  flexBasis: '50%',
}));

interface ImageBackdropProps extends BackdropProps {
  src: string;
  backdropMessage: 'private' | 'authentication' | 'login'; // translation: components.backdrop.*
  blockName: 'users-contributing' | 'all-contributing-users'; // translation: common.block.*
  messageSx?: TypographyProps['sx'];
}

const ImageBackdrop: FC<ImageBackdropProps> = ({
  children,
  src,
  backdropMessage,
  blockName,
  messageSx,
  show = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      {show && (
        <Root>
          <Background src={src} />
          {children}
          <Message>
            <FlexSpacer />
            <Typography variant="h5" sx={messageSx} width="100%" textAlign="center">
              {t(`components.backdrop.${backdropMessage}` as const, {
                blockName: t(`common.blocks.${blockName}` as const),
              })}
            </Typography>
            <ButtonsWrapper>
              <Button variant={'contained'} onClick={() => navigate(AUTH_LOGIN_PATH, { replace: true })}>
                {t('authentication.sign-in')}
              </Button>
              <Button variant={'contained'} onClick={() => navigate(AUTH_SIGN_UP_PATH, { replace: true })}>
                {t('authentication.sign-up')}
              </Button>
            </ButtonsWrapper>
            <FlexSpacer />
          </Message>
        </Root>
      )}
    </>
  );
};

export default ImageBackdrop;
