import { CalloutType } from '@/core/apollo/generated/graphql-schema';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Box, Typography, styled } from '@mui/material';
import { ComponentType, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

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

export const CalloutSummary = ({
  callout,
  templatePreviewComponent: TemplatePreview,
}: {
  callout: CalloutSummaryFields;
  templatePreviewComponent?: ComponentType<CalloutSumaryProps> | null;
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
