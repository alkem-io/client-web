import React, { ComponentType, useMemo } from 'react';
import { Grid, Typography } from '@mui/material';
import { InnovationPack, TemplateInnovationPackMetaInfo } from './InnovationPack';
import { Template } from '../AdminTemplatesSection';
import { useTranslation } from 'react-i18next';

export interface TemplateImportCardComponentProps<Q extends TemplateInnovationPackMetaInfo> {
  template: Q;
  onClick?: (e: MouseEvent) => void;
  actionButtons?: React.ReactNode[];
}

export interface ImportTemplatesDialogGalleryStepProps<
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo
> {
  innovationPacks: InnovationPack<T>[];
  onPreviewTemplate: (template: Q) => void;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
}

const ImportTemplatesDialogGalleryStep = <T extends Template, Q extends T & TemplateInnovationPackMetaInfo>({
  innovationPacks,
  onPreviewTemplate,
  templateImportCardComponent: TemplateCard,
}: ImportTemplatesDialogGalleryStepProps<T, Q>) => {
  const { t } = useTranslation();
  // TODO: Pending Implement filters
  const organizationFilter = null;
  const innovationPackFilter = null;

  const templates = useMemo(() => {
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
      ) as Q[];
  }, [innovationPacks, organizationFilter, innovationPackFilter]);

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
    <Grid container sx={{ padding: theme => theme.spacing(2) }}>
      <Grid item xs={12}>
        <Grid container columns={{ xs: 2, sm: 6, lg: 8 }} spacing={3}>
          {templates.map(template => (
            <Grid item xs={2} key={`grid-item-${template.id}`}>
              <TemplateCard template={template} onClick={() => onPreviewTemplate(template)} />
            </Grid>
          ))}
          {templates.length === 0 && (
            <Grid item xs={8}>
              <Typography>{t('pages.admin.generic.sections.templates.import.no-templates')}</Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ImportTemplatesDialogGalleryStep;
