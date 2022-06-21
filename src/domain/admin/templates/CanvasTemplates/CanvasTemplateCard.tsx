import { Box } from '@mui/material';
import React from 'react';
import { TemplateCardProps } from '../TemplateCardProps';
import TemplateCardLayout from '../TemplateCardLayout';

interface CanvasTemplateCardProps extends TemplateCardProps {
  imageUrl: string;
}

// TODO is a draft component; wasn't used or tested
const CanvasTemplateCard = (props: CanvasTemplateCardProps) => {
  return (
    <TemplateCardLayout {...props} hasImage>
      <Box sx={{ backgroundColor: 'white', height: theme => theme.spacing(14) }} />
    </TemplateCardLayout>
  );
};

export default CanvasTemplateCard;
