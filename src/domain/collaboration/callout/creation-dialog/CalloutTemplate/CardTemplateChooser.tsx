import React, { FC, useMemo } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CardTemplatesList from './CardTemplatesList';
import CardTemplatePreview from './CardTemplateCardPreview';
import { useHub } from '../../../../challenge/hub/HubContext/useHub';
import { useField } from 'formik';
import { useHubTemplatesQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import GridProvider from '../../../../../core/ui/grid/GridProvider';

interface CardTemplatesChooserProps {
  name: string;
  editMode?: boolean;
}

export const CardTemplatesChooser: FC<CardTemplatesChooserProps> = ({ name, editMode = false }) => {
  const { hubId } = useHub();
  const [field, , helpers] = useField(name);

  const { data: hubTemplatesData } = useHubTemplatesQuery({
    variables: { hubId },
    skip: !hubId,
  });
  const templates = hubTemplatesData?.hub.templates ?? {
    id: '',
    aspectTemplates: [],
    canvasTemplates: [],
    lifecycleTemplates: [],
  };

  const cardTemplatesTypeList = useMemo(
    () => templates.aspectTemplates.map(template => ({ type: template.type, title: template.info.title })),
    [templates.aspectTemplates]
  );

  const selectedTemplate = useMemo(
    () => templates.aspectTemplates.find(template => template.type === field.value),
    [templates.aspectTemplates, field.value]
  );

  const { t } = useTranslation();

  return (
    <>
      {/* TODO: Add this color to pallete to match Formik labels */}
      <Typography sx={{ color: '#00000099' }}>
        {t('components.callout-creation.template-step.card-template-label')}
      </Typography>
      {editMode && (
        <Typography sx={{ color: '#00000099' }} variant="body2">
          {t('components.callout-edit.type-edit-help-text')}
        </Typography>
      )}
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Box display="flex" flexDirection="column">
            <CardTemplatesList
              entities={{
                cardTemplates: cardTemplatesTypeList,
                selectedCardTemplateType: selectedTemplate?.type,
              }}
              actions={{
                onSelect: helpers.setValue,
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300} minWidth={250}>
            {!selectedTemplate && (
              <Typography variant="overline">
                {t('components.callout-creation.template-step.no-card-template-selected')}
              </Typography>
            )}
            {selectedTemplate && (
              <GridProvider columns={3}>
                <CardTemplatePreview cardTemplate={selectedTemplate} />
              </GridProvider>
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default CardTemplatesChooser;
