import React, { FC, useCallback, useMemo } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CardTemplatesList from './CardTemplatesList';
import CardTemplatePreview from './CardTemplateCardPreview';
import { useHub } from '../../../../../hooks';
import { useField } from 'formik';

interface CardTemplatesChooserProps {
  name: string;
}

export const CardTemplatesChooser: FC<CardTemplatesChooserProps> = ({ name }) => {
  const { templates } = useHub();
  const [field, , helpers] = useField(name);
  const cardTemplatesTypeList = useMemo(
    () => templates.aspectTemplates.map(template => ({ type: template.type })),
    [templates.aspectTemplates]
  );

  const onSelectCardTemplate = useCallback(
    (value: string) => {
      helpers.setValue(value);
    },
    [helpers]
  );

  const selectedTemplate = useMemo(
    () => templates.aspectTemplates.find(template => template.type === field.value),
    [templates.aspectTemplates, field.value]
  );

  const { t } = useTranslation();

  return (
    <>
      <Typography>{t('components.callout-creation.template-step.card-template-label')}</Typography>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Box display="flex" flexDirection="column">
            <CardTemplatesList
              entities={{
                cardTemplates: cardTemplatesTypeList,
                selectedCardTemplateType: selectedTemplate?.type,
              }}
              actions={{
                onSelect: onSelectCardTemplate,
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400} minWidth={250}>
            {!selectedTemplate && (
              <Typography variant="overline">
                {t('components.callout-creation.template-step.no-card-template-selected')}
              </Typography>
            )}
            {selectedTemplate && <CardTemplatePreview cardTemplate={selectedTemplate} />}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default CardTemplatesChooser;
