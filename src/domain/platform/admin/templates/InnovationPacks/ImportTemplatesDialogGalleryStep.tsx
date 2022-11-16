import React, { ComponentType, useMemo, useState } from 'react';
import { Button, Grid } from '@mui/material';
import { InnovationPack, TemplateFromInnovationPack } from './InnovationPack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useTranslation } from 'react-i18next';
import { Template } from '../AdminTemplatesSection';

export interface TemplateImportCardComponentProps<Q extends TemplateFromInnovationPack> {
  template: Q;
  actionButtons?: React.ReactNode[];
}

export interface ImportTemplatesDialogGalleryStepProps<T extends Template, Q extends T & TemplateFromInnovationPack> {
  innovationPacks: InnovationPack[];
  onImportTemplate: (template: T) => Promise<void>;
  onPreviewTemplate: (template: Q) => void;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
}

const ImportTemplatesDialogGalleryStep = <T extends Template, Q extends T & TemplateFromInnovationPack>({
  innovationPacks,
  onPreviewTemplate,
  onImportTemplate,
  templateImportCardComponent: TemplateCard,
}: ImportTemplatesDialogGalleryStepProps<T, Q>) => {
  const { t } = useTranslation();
  // TODO: Pending Implement filters
  const organizationFilter = null;
  const innovationPackFilter = null;

  const templates: Q[] = useMemo(() => {
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
      ) as any; //TODO? Better?
  }, [innovationPacks, organizationFilter, innovationPackFilter]);

  const [selectingTemplate, setSelectingTemplate] = useState<string>('');
  const handleSelectTemplate = (template: Q) => {
    setSelectingTemplate(template.id);
    onImportTemplate(template).finally(() => {
      setSelectingTemplate('');
    });
  };

  /*
  // TODO: Pending Implement filters
      <Grid item xs={12}>
        <input type="text" placeholder="search" />
      </Grid>
      <Grid item xs={12} md={3}>
        Filters
      </Grid>
      <Grid item xs={12} md={9}>
*/
  return (
    <Grid container>
      <Grid item xs={12}>
        <Grid container columns={{ xs: 2, sm: 6, lg: 8 }} spacing={3}>
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

export default ImportTemplatesDialogGalleryStep;
