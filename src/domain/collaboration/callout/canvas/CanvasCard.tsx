import React, { useCallback } from 'react';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import { CanvasIcon } from '../../../../common/icons/CanvasIcon';
import { CanvasCardCanvas } from './CanvasCallout';
import { Box, styled } from '@mui/material';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import hexToRGBA from '../../../../common/utils/hexToRGBA';

interface CanvasCardProps {
  canvas: CanvasCardCanvas | undefined;
  onClick: (canvas: CanvasCardCanvas) => void;
}

const ImageWrapper = styled(Box)(({ theme }) => ({
  aspectRatio: '7/4',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.palette.primary.main,
  '& > svg': {
    fontSize: '3em',
  },
}));

const ImagePreview = ({ src }: { src: string }) => {
  return (
    <Box
      flexGrow={1}
      sx={{
        background: theme => `${hexToRGBA(theme.palette.highlight.main, 0.2)} url('${src}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        aspectRatio: '7/4',
      }}
    />
  );
};

const CanvasCard = ({ canvas, onClick }: CanvasCardProps) => {
  const handleClick = useCallback(() => canvas && onClick(canvas), [onClick, canvas]);

  return (
    <ContributeCard onClick={handleClick}>
      <CardHeader title={canvas?.displayName} iconComponent={CanvasIcon} />
      <CardDetails>
        <ImageWrapper>
          {canvas?.preview?.uri ? <ImagePreview src={canvas?.preview?.uri} /> : <AutoGraphOutlinedIcon />}
        </ImageWrapper>
      </CardDetails>
      <CardFooter>{canvas?.createdDate && <CardFooterDate date={canvas?.createdDate} />}</CardFooter>
    </ContributeCard>
  );
};

export default CanvasCard;
