import React, { ComponentType, useMemo } from 'react';
import { Grid } from '@mui/material';
import { InnovationPack, InnovationPackTemplatesData, InnovationPackTemplateViewModel } from './InnovationPack';

export interface TemplateImportCardComponentProps {
  template: InnovationPackTemplateViewModel;
  onClick: (template: InnovationPackTemplateViewModel) => void;
}

export interface TemplatesGalleryProps {
  innovationPacks: InnovationPack[];
  onPreviewTemplate: (template: InnovationPackTemplateViewModel) => void;
  onSelectTemplate: (template: InnovationPackTemplatesData) => void;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps>;
}

const TemplatesGallery = ({
  innovationPacks,
  onPreviewTemplate,
  templateImportCardComponent: TemplateCard,
}: TemplatesGalleryProps) => {
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

  return (
    <Grid container>
      <Grid item xs={12}>
        <input type="text" value="search" />
      </Grid>
      <Grid item xs={12} md={4}>
        Filters
      </Grid>
      <Grid item xs={12} md={8}>
        {templates.map(template => (
          <TemplateCard template={template} onClick={onPreviewTemplate} />
        ))}
      </Grid>
    </Grid>
  );
};

export default TemplatesGallery;
