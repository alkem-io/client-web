import React, { useCallback } from 'react';
import { Box, BoxProps, styled } from '@mui/material';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import { CanvasIcon } from '../../../shared/icons/CanvasIcon';
import { CanvasCardCanvas } from './types';

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

const ImagePreview = (props: BoxProps<'img'>) => {
  return <Box component="img" sx={{ aspectRatio: CANVAS_IMAGE_ASPECT_RATIO, objectFit: 'cover' }} {...props} />;
};

const CanvasCard = ({ canvas, onClick }: CanvasCardProps) => {
  const handleClick = useCallback(() => canvas && onClick(canvas), [onClick, canvas]);

  return (
    <ContributeCard onClick={handleClick}>
      <CardHeader title={canvas?.displayName} iconComponent={CanvasIcon} />
      {canvas?.preview?.uri ? (
        <ImagePreview src={canvas?.preview?.uri} alt={canvas.displayName} />
      ) : (
        <CanvasDefaultImage />
      )}
      <CardFooter>{canvas?.createdDate && <CardFooterDate date={canvas?.createdDate} />}</CardFooter>
    </ContributeCard>
  );
};

export default CanvasCard;
