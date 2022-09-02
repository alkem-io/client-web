import React, { ComponentType, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { styled, Typography, Box } from '@mui/material';
import { StepSummaryLayout } from '../../step-layout/StepLayout';
import { CalloutDialogCreationType } from '../../CalloutCreationDialog';
import { CalloutStepProps } from '../CalloutStepProps';
import { StepComponentProps } from '../../../../shared/components/Steps/step/Step';
import Markdown from '../../../../../common/components/core/Markdown';

interface CalloutSummaryStepProps extends CalloutStepProps {
  onPublish: () => Promise<void>;
  onSaveAsDraft: () => Promise<void>;
  isPublishing: boolean;
}

const CalloutSummaryStep: FC<StepComponentProps & CalloutSummaryStepProps> = ({
  callout,
  isPublishing,
  onClose,
  onPublish,
  onSaveAsDraft,
  prev,
}) => {
  const { t } = useTranslation();

  /*const TemplatePreviewComponent = useMemo<ComponentType<CalloutStepProps> | null>(() => {
    if (callout?.type === CalloutType.Card) {
      return CalloutAspectSummary;
    } else if (callout?.type === CalloutType.Canvas) {
      return CalloutCanvasSummary;
    } else {
      return null;
    }
  }, [callout]);*/

  return (
    <StepSummaryLayout
      dialogTitle={t('components.callout-creation.title')}
      onClose={onClose}
      prev={prev}
      onPublish={onPublish}
      onSaveAsDraft={onSaveAsDraft}
      isPublishing={isPublishing}
    >
      <CalloutSummary callout={callout} /* templatePreviewComponent={TemplatePreviewComponent} */ />
    </StepSummaryLayout>
  );
};
CalloutSummaryStep.displayName = 'CalloutSummaryStep';
export default CalloutSummaryStep;

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
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
          <Markdown>{callout?.description!}</Markdown>
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
