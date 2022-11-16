import React, { ComponentType, useMemo, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { InnovationPack, InnovationPackTemplatesData, InnovationPackTemplateViewModel } from './InnovationPack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useTranslation } from 'react-i18next';

export interface TemplateImportCardComponentProps {
  template: InnovationPackTemplateViewModel;
  actionButtons?: React.ReactNode[];
}

export interface ImportTemplatesDialogTemplatesGalleryProps {
  innovationPacks: InnovationPack[];
  onPreviewTemplate: (template: InnovationPackTemplateViewModel) => void;
  onSelectTemplate: (template: InnovationPackTemplatesData) => Promise<void>;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps>;
}

const ImportTemplatesDialogTemplatesGallery = ({
  innovationPacks,
  onPreviewTemplate,
  onSelectTemplate,
  templateImportCardComponent: TemplateCard,
}: ImportTemplatesDialogTemplatesGalleryProps) => {
  const { t } = useTranslation();
  const organizationFilter = null;
  const innovationPackFilter = null;

  const templates: InnovationPackTemplateViewModel[] = useMemo(() => {
    return innovationPacks
      .filter(pack => {
        if (innovationPackFilter) {
          return pack.id === innovationPackFilter;
        }
        if (organizationFilter) {
          return pack.provider?.id === organizationFilter;
        }
        return true;
      })
      .flatMap(pack =>
        pack.templates.map(template => ({
          ...template,
          provider: pack.provider,
          innovationPackDisplayName: pack.displayName,
          innovationPackNameID: pack.nameID,
          innovationPackId: pack.id,
        }))
      );
  }, [innovationPacks, organizationFilter, innovationPackFilter]);

  const [selectingTemplate, setSelectingTemplate] = useState<string>('');
  const handleSelectTemplate = (template: InnovationPackTemplatesData) => {
    setSelectingTemplate(template.id);
    onSelectTemplate(template).finally(() => {
      setSelectingTemplate('');
    });
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <input type="text" placeholder="search" />
      </Grid>
      <Grid item xs={12} md={3}>
        Filters
      </Grid>
      <Grid item xs={12} md={9}>
        <Grid container columns={{ xs: 2, sm: 4, lg: 6 }} spacing={2}>
          {templates.map(template => (
            <Grid item xs={2} key={`grid-item-${template.id}`}>
              <TemplateCard
                template={template}
                actionButtons={[
                  <Button
                    key={`preview-${template.id}`}
                    startIcon={<VisibilityIcon />}
                    variant="text"
                    onClick={() => onPreviewTemplate(template)}
                  >
                    {t('buttons.preview')}
                  </Button>,
                  <Button
                    key={`import-${template.id}`}
                    startIcon={<SystemUpdateAltIcon />}
                    variant="contained"
                    onClick={() => handleSelectTemplate(template)}
                    disabled={selectingTemplate === template.id}
                  >
                    {selectingTemplate === template.id ? t('buttons.importing') : t('buttons.import')}
                  </Button>,
                ]}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ImportTemplatesDialogTemplatesGallery;
