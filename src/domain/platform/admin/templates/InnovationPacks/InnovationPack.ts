import { InnovationPacksQuery } from '../../../../../models/graphql-schema';
import { Template } from '../AdminTemplatesSection';

type InnovationPackArray = InnovationPacksQuery['library']['innovationPacks'][number];
type InnovationPackInfo = Pick<InnovationPackArray, 'id' | 'nameID' | 'displayName' | 'provider'>;
type InnovationPackTemplates = NonNullable<InnovationPackArray['templates']>;
type InnovationPackTemplatesData =
  | Pick<InnovationPackTemplates['aspectTemplates'][number], 'id' | 'defaultDescription' | 'type' | 'info'>
  | Pick<InnovationPackTemplates['canvasTemplates'][number], 'id' | 'value' | 'info'>
  | Pick<InnovationPackTemplates['lifecycleTemplates'][number], 'id' | 'definition' | 'type' | 'info'>;

export type InnovationPack = InnovationPackInfo & { templates: InnovationPackTemplatesData[] };

// TODO figure out why admin templates components use generics while receiving data of known types
export type InnovationPackSpecificTemplate<T extends Template> = InnovationPackInfo & { templates: T[] };

export interface TemplateInnovationPackMetaInfo extends Template {
  innovationPackNameID: string;
  innovationPackId: string;
  innovationPackDisplayName: string;
  provider: InnovationPackArray['provider']; // = Organization
}
