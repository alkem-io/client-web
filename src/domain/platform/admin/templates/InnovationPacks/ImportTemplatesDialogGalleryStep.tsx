import React, { ComponentType, useMemo } from 'react';
import { InnovationPack } from './InnovationPack';
import { Template } from '../AdminTemplatesSection';
import { useTranslation } from 'react-i18next';
import CardsLayout from '../../../../../core/ui/card/cardsLayout/CardsLayout';
import { Caption } from '../../../../../core/ui/typography';
import GridProvider from '../../../../../core/ui/grid/GridProvider';
import { Skeleton } from '@mui/material';
import { Visual } from '../../../../common/visual/Visual';
import { Identifiable } from '../../../../../core/utils/Identifiable';

export type TemplateWithInnovationPack<T extends Template> = T & {
  innovationPack?: {
    profile: {
      displayName: string;
    };
    provider?: {
      nameID: string;
      profile: {
        displayName: string;
        avatar?: Visual;
      };
    };
  };
};

export interface TemplateImportCardComponentProps<T extends Template = Template> {
  template: TemplateWithInnovationPack<T & Identifiable>;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface ImportTemplatesDialogGalleryStepProps<T extends Template> {
  innovationPacks: InnovationPack<T>[];
  onPreviewTemplate: (template: T) => void;
  templateImportCardComponent: ComponentType<TemplateImportCardComponentProps<T & Identifiable>>;
  loading?: boolean;
}

const ImportTemplatesDialogGalleryStep = <T extends Template /*, Q extends T & TemplateInnovationPackMetaInfo*/>({
  innovationPacks,
  onPreviewTemplate,
  templateImportCardComponent: TemplateCard,
  loading,
}: ImportTemplatesDialogGalleryStepProps<T>) => {
  const { t } = useTranslation();
  // TODO: Pending Implement filters
  const organizationFilter = null;
  const innovationPackFilter = null;

  const templates = useMemo(() => {
    return innovationPacks
      .filter(innovationPack => {
        if (innovationPackFilter) {
          return innovationPack.id === innovationPackFilter;
        }
        if (organizationFilter) {
          return innovationPack.provider?.id === organizationFilter;
        }
        return true;
      })
      .flatMap(innovationPack =>
        innovationPack.templates.map(template => ({
          ...template,
          innovationPack,
        }))
      );
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
        <Caption>{t('pages.admin.generic.sections.templates.import.no-templates')}</Caption>
      )}
    </GridProvider>
  );
};

export default ImportTemplatesDialogGalleryStep;
