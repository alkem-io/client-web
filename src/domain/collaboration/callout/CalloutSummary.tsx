import { Box, styled, Typography } from '@mui/material';
import type { ComponentType, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';

export type CalloutSummaryFields = {
  framing: {
    profile: {
      description?: string;
      displayName: string;
    };
  };
  templateId?: string;
};

interface CalloutSummaryProps {
  callout: CalloutSummaryFields;
}

export const CalloutSummary = ({
  callout,
  templatePreviewComponent: TemplatePreview,
}: {
  callout: CalloutSummaryFields;
  templatePreviewComponent?: ComponentType<CalloutSummaryProps> | null;
}) => {
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

const TypographyTitle = styled((props: PropsWithChildren) => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));
