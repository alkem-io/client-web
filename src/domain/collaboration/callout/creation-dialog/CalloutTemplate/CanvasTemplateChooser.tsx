import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { CanvasTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import {
  useHubTemplatesCanvasTemplateWithValueQuery,
  useInnovationPackCanvasTemplateWithValueQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import CanvasTemplatesList from './CanvasTemplatesList';
import { CardText, Text } from '../../../../../core/ui/typography/components';
import { Button } from '@mui/material';

const FORM_TEXT_COLOR = '#00000099';
interface CanvasTemplatesChooserProps {
  name: string;
  templates: CanvasTemplateListItem[];
  editMode?: boolean;
  onSelectLibraryTemplate: (template: LibraryCanvasTemplate) => void;
}

export type TemplateOrigin = 'Hub' | 'Library';
export type LibraryCanvasTemplate = {
  id: string;
  profile: {
    displayName: string;
  };
  innovationPackId: string;
};
export type CanvasTemplateWithOrigin = CanvasTemplateFragment & {
  origin: TemplateOrigin;
  innovationPackId?: string;
};

export type CanvasTemplateListItem = {
  id: string;
  profile: {
    displayName: string;
  };
  origin: TemplateOrigin;
  innovationPackId?: string;
};

export const CanvasTemplatesChooser: FC<CanvasTemplatesChooserProps> = ({
  name,
  templates,
  editMode = false,
  onSelectLibraryTemplate: updateLibraryTemplates,
}) => {
  const [field, , helpers] = useField(name);
  const { hubNameId } = useUrlParams();
  const [isTemplateChooserVisible, setIsTemplateChooserVisible] = useState(!editMode);

  const selectedTemplate = templates.find(template => template.profile.displayName === field.value.displayName);

  const { data: canvasValueData, loading: isCanvasValueLoading } = useHubTemplatesCanvasTemplateWithValueQuery({
    fetchPolicy: 'cache-and-network',
    variables: { hubId: hubNameId!, canvasTemplateId: selectedTemplate?.id! },
    skip: !hubNameId || !selectedTemplate?.id || selectedTemplate?.origin === 'Library',
  });

  const { data: libraryCanvasValueData, loading: isLibraryCanvasValueLoading } =
    useInnovationPackCanvasTemplateWithValueQuery({
      fetchPolicy: 'cache-and-network',
      variables: {
        innovationPackId: selectedTemplate?.innovationPackId!,
        canvasTemplateId: selectedTemplate?.id!,
      },
      skip: !selectedTemplate?.innovationPackId || !selectedTemplate?.id || selectedTemplate?.origin === 'Hub',
    });

  const canvasValue =
    canvasValueData?.hub.templates?.canvasTemplate?.value ??
    libraryCanvasValueData?.platform.library.innovationPack?.templates?.canvasTemplate?.value ??
    '';
  const selectedTemplateWithValue = useMemo(
    () => (selectedTemplate ? { ...selectedTemplate, value: canvasValue } : undefined),
    [selectedTemplate, canvasValue]
  );

  const { t } = useTranslation();

  return (
    <>
      {/* TODO: Add this color to pallete to match Formik labels */}
      <Text sx={{ color: FORM_TEXT_COLOR }}>
        {t('components.callout-creation.template-step.canvas-template-label')}
      </Text>
      {editMode ? (
        <>
          <CardText sx={{ color: FORM_TEXT_COLOR }}>
            {t('components.callout-edit.canvas-template-edit-help-text')}
          </CardText>
          {!isTemplateChooserVisible && (
            <Button
              startIcon={<ChangeCircleIcon />}
              variant="contained"
              onClick={() => setIsTemplateChooserVisible(true)}
              sx={{ margin: theme => theme.spacing(1) }}
            >
              {t('buttons.change-field', { field: t('common.template') })}
            </Button>
          )}
          {isTemplateChooserVisible && (
            <CanvasTemplatesList
              entities={{ templates, selectedTemplate: selectedTemplateWithValue }}
              actions={{
                onSelect: helpers.setValue,
                updateLibraryTemplates,
              }}
              state={{
                canvasLoading: isCanvasValueLoading || isLibraryCanvasValueLoading,
              }}
            />
          )}
        </>
      ) : (
        <CanvasTemplatesList
          entities={{ templates, selectedTemplate: selectedTemplateWithValue }}
          actions={{
            onSelect: helpers.setValue,
            updateLibraryTemplates,
          }}
          state={{
            canvasLoading: isCanvasValueLoading || isLibraryCanvasValueLoading,
          }}
        />
      )}
    </>
  );
};

export default CanvasTemplatesChooser;
