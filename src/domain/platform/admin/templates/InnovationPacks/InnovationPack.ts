import { InnovationPacksQuery } from '../../../../../models/graphql-schema';

type InnovationPackArray = InnovationPacksQuery['library']['innovationPacks'][number];
type InnovationPackInfo = Pick<InnovationPackArray, 'id' | 'nameID' | 'displayName' | 'provider'>;
type InnovationPackTemplates = NonNullable<InnovationPackArray['templates']>;
export type InnovationPackTemplatesData =
  | Pick<InnovationPackTemplates['aspectTemplates'][number], 'id' | 'defaultDescription' | 'type' | 'info'>
  | Pick<InnovationPackTemplates['canvasTemplates'][number], 'id' | 'value' | 'info'>
  | Pick<InnovationPackTemplates['lifecycleTemplates'][number], 'id' | 'definition' | 'type' | 'info'>;

export type InnovationPackTemplateViewModel = {
  innovationPackNameID: string;
  innovationPackId: string;
  innovationPackDisplayName: string;
  provider: InnovationPackArray['provider'];
} & InnovationPackTemplatesData;

export type InnovationPack = InnovationPackInfo & { templates: InnovationPackTemplatesData[] };

// TODO: use TemplateInfoFragment here ??
