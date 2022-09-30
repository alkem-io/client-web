import React, { ComponentType, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { styled, Typography, Box } from '@mui/material';
import { CalloutDialogCreationType } from './creation-dialog/CalloutCreationDialog';
import { CalloutStepProps } from './creation-dialog/steps/CalloutStepProps';
import WrapperMarkdown from '../../../common/components/core/WrapperMarkdown';

export const CalloutSummary: FC<{
  callout: CalloutDialogCreationType;
  templatePreviewComponent?: ComponentType<CalloutStepProps> | null;
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
