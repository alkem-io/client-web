import React, { useCallback } from 'react';
import { Box, styled } from '@mui/material';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import CardImage from '../../../../core/ui/card/CardImage';
import { WhiteboardIcon } from '../../whiteboard/icon/WhiteboardIcon';
import { WhiteboardCardWhiteboard } from './types';
import { useTranslation } from 'react-i18next';

interface WhiteboardCardProps {
  whiteboard: WhiteboardCardWhiteboard | undefined;
  onClick: (whiteboard: WhiteboardCardWhiteboard) => void;
}

const WHITEBOARD_IMAGE_ASPECT_RATIO = '23/12';

const WhiteboardDefaultImageWrapper = styled(Box)({
  aspectRatio: WHITEBOARD_IMAGE_ASPECT_RATIO,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& > svg': {
    fontSize: '3em',
  },
});

const WhiteboardDefaultImage = () => {
  return (
    <WhiteboardDefaultImageWrapper>
      <AutoGraphOutlinedIcon color="primary" fontSize="large" />
    </WhiteboardDefaultImageWrapper>
  );
};

const WhiteboardCard = ({ whiteboard, onClick }: WhiteboardCardProps) => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => whiteboard && onClick(whiteboard), [onClick, whiteboard]);

  return (
    <ContributeCard onClick={handleClick}>
      <CardHeader title={whiteboard?.profile.displayName} iconComponent={WhiteboardIcon} />
      {whiteboard?.profile?.visual?.uri ? (
        <CardImage
          aspectRatio={WHITEBOARD_IMAGE_ASPECT_RATIO}
          src={whiteboard?.profile?.visual?.uri}
          alt={t('visuals-alt-text.banner.whiteboard.text', { displayName: whiteboard.profile.displayName })}
        />
      ) : (
        <WhiteboardDefaultImage />
      )}
      <CardFooter>{whiteboard?.createdDate && <CardFooterDate date={whiteboard?.createdDate} />}</CardFooter>
    </ContributeCard>
  );
};

export default WhiteboardCard;
