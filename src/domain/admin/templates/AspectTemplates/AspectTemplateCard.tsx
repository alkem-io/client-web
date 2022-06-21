import React from 'react';
import PanoramaOutlinedIcon from '@mui/icons-material/PanoramaOutlined';
import TemplateCardLayout from '../TemplateCardLayout';
import { TemplateCardProps } from '../TemplateCardProps';

const AspectTemplateCard = (props: TemplateCardProps) => {
  return (
    <TemplateCardLayout {...props}>
      <PanoramaOutlinedIcon
        sx={{ fontSize: theme => theme.spacing(12), alignSelf: 'center', marginTop: 2 }}
        color="primary"
      />
    </TemplateCardLayout>
  );
};

export default AspectTemplateCard;
