import React, { ComponentType, useMemo } from 'react';
import { InnovationPack, TemplateInnovationPackMetaInfo } from './InnovationPack';
import { Template } from '../AdminTemplatesSection';
import { useTranslation } from 'react-i18next';
import CardsLayout from '../../../../../core/ui/card/CardsLayout/CardsLayout';
import { Text } from '../../../../../core/ui/typography';
import GridProvider from '../../../../../core/ui/grid/GridProvider';
import { Skeleton } from '@mui/material';

export interface TemplateImportCardComponentProps<Q extends TemplateInnovationPackMetaInfo> {
  template: Q;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface ImportTemplatesDialogGalleryStepProps<
  T extends Template,
  Q extends T & TemplateInnovationPackMetaInfo
> {
  innovationPacks: InnovationPack<T>[];
  onPreviewTemplate: (template: Q) => void;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<Q>>;
  loading?: boolean;
}

const ImportTemplatesDialogGalleryStep = <T extends Template, Q extends T & TemplateInnovationPackMetaInfo>({
  innovationPacks,
  onPreviewTemplate,
  templateImportCardComponent: TemplateCard,
  loading,
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
          innovationPackProfile: pack.profile,
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
    <GridProvider columns={12} force>
      {loading && <Skeleton />}
      <CardsLayout items={templates} deps={[templates]} disablePadding cards={false}>
        {template => <TemplateCard key={template.id} template={template} onClick={() => onPreviewTemplate(template)} />}
      </CardsLayout>
      {!loading && templates.length === 0 && (
        <Text>{t('pages.admin.generic.sections.templates.import.no-templates')}</Text>
      )}
    </GridProvider>
  );
};

export default ImportTemplatesDialogGalleryStep;
