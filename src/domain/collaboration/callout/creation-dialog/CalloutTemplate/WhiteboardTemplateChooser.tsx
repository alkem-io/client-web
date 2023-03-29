import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { WhiteboardTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import {
  useHubTemplatesWhiteboardTemplateWithValueQuery,
  useInnovationPackWhiteboardTemplateWithValueQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import WhiteboardTemplatesList from './WhiteboardTemplatesList';
import { CardText, Text } from '../../../../../core/ui/typography/components';
import { Button } from '@mui/material';

const FORM_TEXT_COLOR = '#00000099';
interface WhiteboardTemplatesChooserProps {
  name: string;
  templates: WhiteboardTemplateListItem[];
  editMode?: boolean;
  onSelectLibraryTemplate: (template: LibraryWhiteboardTemplate) => void;
}

export type TemplateOrigin = 'Hub' | 'Library';
export type LibraryWhiteboardTemplate = {
  id: string;
  profile: {
    displayName: string;
  };
  innovationPackId: string;
};
export type WhiteboardTemplateWithOrigin = WhiteboardTemplateFragment & {
  origin: TemplateOrigin;
  innovationPackId?: string;
};

export type WhiteboardTemplateListItem = {
  id: string;
  profile: {
    displayName: string;
  };
  origin: TemplateOrigin;
  innovationPackId?: string;
};

export const WhiteboardTemplatesChooser: FC<WhiteboardTemplatesChooserProps> = ({
  name,
  templates,
  editMode = false,
  onSelectLibraryTemplate: updateLibraryTemplates,
}) => {
  const [field, , helpers] = useField(name);
  const { hubNameId } = useUrlParams();
  const [isTemplateChooserVisible, setIsTemplateChooserVisible] = useState(!editMode);

  const selectedTemplate = templates.find(template => template.profile.displayName === field.value.displayName);

  const { data: canvasValueData, loading: isCanvasValueLoading } = useHubTemplatesWhiteboardTemplateWithValueQuery({
    fetchPolicy: 'cache-and-network',
    variables: { hubId: hubNameId!, whiteboardTemplateId: selectedTemplate?.id! },
    skip: !hubNameId || !selectedTemplate?.id || selectedTemplate?.origin === 'Library',
  });

  const { data: libraryCanvasValueData, loading: isLibraryCanvasValueLoading } =
    useInnovationPackWhiteboardTemplateWithValueQuery({
      fetchPolicy: 'cache-and-network',
      variables: {
        innovationPackId: selectedTemplate?.innovationPackId!,
        whiteboardTemplateId: selectedTemplate?.id!,
      },
      skip: !selectedTemplate?.innovationPackId || !selectedTemplate?.id || selectedTemplate?.origin === 'Hub',
    });

  const canvasValue =
    canvasValueData?.hub.templates?.whiteboardTemplate?.value ??
    libraryCanvasValueData?.platform.library.innovationPack?.templates?.whiteboardTemplate?.value ??
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
            <WhiteboardTemplatesList
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
        <WhiteboardTemplatesList
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

export default WhiteboardTemplatesChooser;
