import React, { FC, useState } from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
// import { useField } from 'formik';
import { CanvasTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useHubTemplatesCanvasTemplateWithValueQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import CanvasTemplatesList from './CanvasTemplatesList';

interface CardTemplatesChooserProps {
  name: string;
  templates: CanvasTemplateFragment[];
  editMode?: boolean;
}

export const CanvasTemplatesChooser: FC<CardTemplatesChooserProps> = ({ templates, editMode = false }) => {
  //   const [field, , helpers] = useField(name);
  const { hubNameId } = useUrlParams();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();

  const { data: canvasValueData, loading: isCanvasValueLoading } = useHubTemplatesCanvasTemplateWithValueQuery({
    fetchPolicy: 'cache-and-network',
    variables: { hubId: hubNameId!, canvasTemplateId: selectedTemplateId! },
    skip: !hubNameId || !selectedTemplateId,
  });

  const selectedTemplate = templates.find(({ id }) => id === selectedTemplateId);
  const canvasValue = canvasValueData?.hub.templates?.canvasTemplate?.value ?? '';
  const selectedTemplateWithValue = selectedTemplate ? { ...selectedTemplate, value: canvasValue } : undefined;

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
      <CanvasTemplatesList
        entities={{ templates, selectedTemplate: selectedTemplateWithValue }}
        actions={{
          onTemplateSelected: canvas => {
            setSelectedTemplateId(canvas?.id);
          },
        }}
        state={{
          canvasLoading: isCanvasValueLoading,
        }}
      />
    </>
  );
};

export default CanvasTemplatesChooser;
