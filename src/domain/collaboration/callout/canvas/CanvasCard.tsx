import React, { useCallback } from 'react';
import { Box, styled } from '@mui/material';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import CardImage from '../../../../core/ui/card/CardImage';
import { CanvasIcon } from '../../canvas/icon/CanvasIcon';
import { CanvasCardCanvas } from './types';
import { useTranslation } from 'react-i18next';

interface CanvasCardProps {
  canvas: CanvasCardCanvas | undefined;
  onClick: (canvas: CanvasCardCanvas) => void;
}

const CANVAS_IMAGE_ASPECT_RATIO = '23/12';

const CanvasDefaultImageWrapper = styled(Box)({
  aspectRatio: CANVAS_IMAGE_ASPECT_RATIO,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& > svg': {
    fontSize: '3em',
  },
});

const CanvasDefaultImage = () => {
  return (
    <CanvasDefaultImageWrapper>
      <AutoGraphOutlinedIcon color="primary" fontSize="large" />
    </CanvasDefaultImageWrapper>
  );
};

const CanvasCard = ({ canvas, onClick }: CanvasCardProps) => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => canvas && onClick(canvas), [onClick, canvas]);

  return (
    <ContributeCard onClick={handleClick}>
      <CardHeader title={canvas?.profile.displayName} iconComponent={CanvasIcon} />
      {canvas?.profile?.visual?.uri ? (
        <CardImage
          aspectRatio={CANVAS_IMAGE_ASPECT_RATIO}
          src={canvas?.profile?.visual?.uri}
          alt={t('visuals-alt-text.banner.whiteboard.text', { displayName: canvas.profile.displayName })}
        />
      ) : (
        <CanvasDefaultImage />
      )}
      <CardFooter>{canvas?.createdDate && <CardFooterDate date={canvas?.createdDate} />}</CardFooter>
    </ContributeCard>
  );
};

export default CanvasCard;
