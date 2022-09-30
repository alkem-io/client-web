import React, { ComponentType, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { styled, Typography, Box } from '@mui/material';
import { Callout } from './creation-dialog/CalloutCreationDialog';
import WrapperMarkdown from '../../../common/components/core/WrapperMarkdown';

export interface CalloutSumaryProps {
  callout: Callout;
}

export const CalloutSummary: FC<{
  callout: Callout;
  templatePreviewComponent?: ComponentType<CalloutSumaryProps> | null;
}> = ({ callout, templatePreviewComponent: TemplatePreview }) => {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <TypographyTitle>{t('common.title')}</TypographyTitle>
        <Typography variant="body2">{callout?.displayName}</Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('common.description')}</TypographyTitle>
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }} component={WrapperMarkdown}>
          {callout?.description}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('components.callout-creation.callout-type-label')}</TypographyTitle>
        <Typography variant="h6" color="primary">
          {callout?.type}
        </Typography>
      </Box>
      {TemplatePreview && <TemplatePreview callout={callout} />}
    </>
  );
};

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));
