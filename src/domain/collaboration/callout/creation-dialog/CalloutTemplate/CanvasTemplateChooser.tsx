import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { CanvasTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { useHubTemplatesCanvasTemplateWithValueQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import CanvasTemplatesList from './CanvasTemplatesList';
import { CardText, Text } from '../../../../../core/ui/typography/components';

interface CardTemplatesChooserProps {
  name: string;
  templates: CanvasTemplateFragment[];
  editMode?: boolean;
}

export const CanvasTemplatesChooser: FC<CardTemplatesChooserProps> = ({ name, templates, editMode = false }) => {
  const [field, , helpers] = useField(name);
  const { hubNameId } = useUrlParams();
  const selectedTemplate = templates.find(template => template.info.title === field.value ?? '');

  const { data: canvasValueData, loading: isCanvasValueLoading } = useHubTemplatesCanvasTemplateWithValueQuery({
    fetchPolicy: 'cache-and-network',
    variables: { hubId: hubNameId!, canvasTemplateId: selectedTemplate?.id! },
    skip: !hubNameId || !selectedTemplate?.id,
  });

  const canvasValue = canvasValueData?.hub.templates?.canvasTemplate?.value ?? '';
  const selectedTemplateWithValue = useMemo(
    () => (selectedTemplate ? { ...selectedTemplate, value: canvasValue } : undefined),
    [selectedTemplate, canvasValue]
  );

  const { t } = useTranslation();

  return (
    <>
      {/* TODO: Add this color to pallete to match Formik labels */}
      <Text sx={{ color: '#00000099' }}>{t('components.callout-creation.template-step.canvas-template-label')}</Text>
      {editMode && (
        <CardText sx={{ color: '#00000099' }} variant="body2">
          {t('components.callout-edit.canvas-template-edit-help-text')}
        </CardText>
      )}
      <CanvasTemplatesList
        entities={{ templates, selectedTemplate: selectedTemplateWithValue }}
        actions={{
          onSelect: helpers.setValue,
        }}
        state={{
          canvasLoading: isCanvasValueLoading,
        }}
      />
    </>
  );
};

export default CanvasTemplatesChooser;
