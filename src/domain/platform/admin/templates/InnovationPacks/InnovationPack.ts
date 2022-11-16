import { InnovationPacksQuery } from '../../../../../models/graphql-schema';
import { Template } from '../AdminTemplatesSection';

type InnovationPackArray = InnovationPacksQuery['library']['innovationPacks'][number];
type InnovationPackInfo = Pick<InnovationPackArray, 'id' | 'nameID' | 'displayName' | 'provider'>;
type InnovationPackTemplates = NonNullable<InnovationPackArray['templates']>;
export type InnovationPackTemplatesData =
  | Pick<InnovationPackTemplates['aspectTemplates'][number], 'id' | 'defaultDescription' | 'type' | 'info'>
  | Pick<InnovationPackTemplates['canvasTemplates'][number], 'id' | 'value' | 'info'>
  | Pick<InnovationPackTemplates['lifecycleTemplates'][number], 'id' | 'definition' | 'type' | 'info'>;

/*export type InnovationPackTemplateViewModel = Template & {
  innovationPackNameID: string;
  innovationPackId: string;
  innovationPackDisplayName: string;
  provider: InnovationPackArray['provider'];
};// & InnovationPackTemplatesData; // TODO: use TemplateInfoFragment here ??
*/

export type InnovationPack = InnovationPackInfo & { templates: InnovationPackTemplatesData[] };

export interface TemplateFromInnovationPack extends Template {
  innovationPackNameID: string;
  innovationPackId: string;
  innovationPackDisplayName: string;
  provider: InnovationPackArray['provider']; // Organization
}

export type AspectTemplateFromInnovationPack = Template &
  TemplateFromInnovationPack &
  InnovationPackTemplates['aspectTemplates'];
export type CanvasTemplateFromInnovationPack = Template &
  TemplateFromInnovationPack &
  InnovationPackTemplates['canvasTemplates'];
export type LifecycleTemplateFromInnovationPack = Template &
  TemplateFromInnovationPack &
  InnovationPackTemplates['lifecycleTemplates'];
