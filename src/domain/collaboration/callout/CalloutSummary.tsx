import React, { ComponentType, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { styled, Typography, Box } from '@mui/material';
import WrapperMarkdown from '@core/ui/markdown/WrapperMarkdown';
import { CalloutType } from '@core/apollo/generated/graphql-schema';

export type CalloutSummaryFields = {
  framing: {
    profile: {
      description?: string;
      displayName: string;
    };
  };
  templateId?: string;
  type: CalloutType;
};

export interface CalloutSumaryProps {
  callout: CalloutSummaryFields;
}

export const CalloutSummary: FC<{
  callout: CalloutSummaryFields;
  templatePreviewComponent?: ComponentType<CalloutSumaryProps> | null;
}> = ({ callout, templatePreviewComponent: TemplatePreview }) => {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <TypographyTitle>{t('common.title')}</TypographyTitle>
        <Typography variant="body2">{callout?.framing.profile.displayName}</Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('common.description')}</TypographyTitle>
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }} component={WrapperMarkdown}>
          {callout?.framing.profile.description}
        </Typography>
      </Box>
      {TemplatePreview && <TemplatePreview callout={callout} />}
    </>
  );
};

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));
