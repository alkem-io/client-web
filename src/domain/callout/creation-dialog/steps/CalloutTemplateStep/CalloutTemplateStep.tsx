import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  ListItemButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  ListItemIcon,
  Grid,
  styled,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { CalloutCreationType } from '../../CalloutCreationDialog';
import { StepComponentProps } from '../../../../shared/components/Stepper/step/Step';
import { StepLayoutImpl } from '../../step-layout/StepLayout';
import {
  useAspectTemplatesOnCalloutCreationQuery, useAspectTemplateValueQuery,
  useCanvasTemplatesOnCalloutCreationQuery, useCanvasTemplateValueQuery,
} from '../../../../../hooks/generated/graphql';
import { useHub } from '../../../../hub/HubContext/useHub';
import { CalloutType } from '../../../../../models/graphql-schema';
import CanvasWhiteboard from '../../../../../components/composite/entities/Canvas/CanvasWhiteboard';
import Markdown from '../../../../../components/core/Markdown';
import { SectionSpacer } from '../../../../shared/components/Section/Section';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';

interface TemplateTitle {
  id: string;
  title: string;
}

export interface CalloutTemplateStepProps {
  callout: CalloutCreationType;
  onChange?: (templateId: string) => void;
}

const CalloutTemplateStep: FC<StepComponentProps & CalloutTemplateStepProps> = ({ callout, onChange, activeStep, isValid, steps, next, prev }) => {
  const { t } = useTranslation();
  const { hubId } = useHub();

  const { data: hubAspectTemplates, loading: aspectTemplatesLoading } = useAspectTemplatesOnCalloutCreationQuery({
    variables: { hubId },
    skip: callout.type !== CalloutType.Card
  });
  const aspectTemplates = hubAspectTemplates?.hub?.templates?.aspectTemplates?.map(x => ({ id: x.id, title: x.info.title }));
  const { data: hubCanvasTemplates, loading: canvasTemplatesLoading } = useCanvasTemplatesOnCalloutCreationQuery(    {
    variables: { hubId },
    skip: callout.type !== CalloutType.Canvas,
  });
  const canvasTemplates = hubCanvasTemplates?.hub?.templates?.canvasTemplates?.map(x => ({ id: x.id, title: x.info.title }));

  const templates: TemplateTitle[] = aspectTemplates ?? canvasTemplates ?? [];
  const templateListLoading = aspectTemplatesLoading ?? canvasTemplatesLoading;

  const { data: aspectTemplateData, loading: aspectTemplateLoading } = useAspectTemplateValueQuery({
    variables: { hubId, id: callout.templateId! },
    skip: callout.type !== CalloutType.Card || !callout.templateId,
  });

  const { data: canvasTemplateData, loading: canvasTemplateLoading} = useCanvasTemplateValueQuery({
    variables: { hubId, id: callout.templateId! },
    skip: callout.type !== CalloutType.Canvas || !callout.templateId,
    initialFetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-only',
  });

  const previewComponent = useMemo(() => {
    if (callout.type === CalloutType.Card) {
      const aspectTemplate = aspectTemplateData?.hub?.templates?.aspectTemplate;

      if (!aspectTemplate) {
        return null;
      }

      const { type = '', defaultDescription = '', info } = aspectTemplate;
      return <AspectPreview
        aspectTemplateType={type}
        description={info?.description ?? ''}
        tags={info?.tagset?.tags ?? []}
        defaultDescription={defaultDescription}
      />
    } else if (callout.type === CalloutType.Canvas) {
      const { value } = canvasTemplateData?.hub?.templates?.canvasTemplate ?? {};
      return value ? <CanvasPreview value={value} /> : null;
    }
  }, [callout, aspectTemplateData, canvasTemplateData]);

  return (
    <StepLayoutImpl
      dialogTitle={t('components.callout-creation.title')}
      onClose={() => {}}
      next={next} prev={prev}
      activeStep={activeStep}
      steps={steps}
      isValid={isValid}
    >
      <TemplateListWithPreview
        templates={templates}
        templatePreviewComponent={previewComponent}
        loading={templateListLoading}
        selectedTemplateId={callout?.templateId}
        onSelection={onChange}
      />
    </StepLayoutImpl>
  );
};
CalloutTemplateStep.displayName = 'CalloutTemplateStep';

export default CalloutTemplateStep;

interface TemplateListProps {
  templates: TemplateTitle[];
  templatePreviewComponent: React.ReactNode | undefined;
  selectedTemplateId?: string;
  loading?: boolean;
  onSelection?: (templateId: string) => void;
}

const TemplateListWithPreview: FC<TemplateListProps> = ({
  templates,
  templatePreviewComponent,
  loading,
  selectedTemplateId,
  onSelection
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <List>
        <Skeleton component={ListItem} />
        <Skeleton component={ListItem} />
        <Skeleton component={ListItem} />
      </List>
    )
  }

  if (!templates.length) {
    return <Typography>{t('components.callout-creation.template-step.no-templates')}</Typography>
  }

  return (
    <Grid container columnSpacing={2}>
      <Grid item xs={6}>
        <List>
          {templates.map(({ id, title }) => (
            <ListItem key={id} disablePadding>
              <ListItemButton onClick={() => onSelection?.(id)} selected={selectedTemplateId === id}>
                <ListItemIcon>
                  <FiberManualRecordIcon />
                </ListItemIcon>
                <ListItemText primary={title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={6}>
        {templatePreviewComponent}
      </Grid>
    </Grid>
  );
};


const CanvasPreview: FC<{ value: string }> = ({ value }) => {
  return (
    <CanvasWhiteboard
      entities={{ canvas: { id: '__template', value } }}
      actions={{}}
      options={{
        viewModeEnabled: true,
        UIOptions: {
          canvasActions: {
            export: false,
          },
        },
      }}
    />
  )
};

interface AspectPreviewProps {
  description: string;
  tags: string[] | undefined;
  aspectTemplateType: string;
  defaultDescription: string;
}

const AspectPreview: FC<AspectPreviewProps> = ({ description, tags, aspectTemplateType, defaultDescription }) => {
  const { t } = useTranslation();

  return (
    <>
      <Box>
        <TypographyTitle>{t('common.description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          <Markdown>{description}</Markdown>
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('common.tags')}</TypographyTitle>
        <SectionSpacer half />
        <TagsComponent tags={tags || []} />
      </Box>
      <Box>
        <TypographyTitle>{t('aspect-edit.type.title')}</TypographyTitle>
        <Typography variant="h6" color="primary">
          {aspectTemplateType}
        </Typography>
      </Box>
      <Box>
        <TypographyTitle>{t('aspect-templates.default-description')}</TypographyTitle>
        <Typography variant="body2" component="div">
          <Markdown>{defaultDescription}</Markdown>
        </Typography>
      </Box>
    </>
  )
};

const TypographyTitle = styled(props => <Typography variant="h6" {...props} />)(() => ({
  fontWeight: 'bold',
}));