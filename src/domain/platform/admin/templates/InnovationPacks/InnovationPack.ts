import { InnovationPacksQuery } from '../../../../../core/apollo/generated/graphql-schema';
import { Template } from '../AdminTemplatesSection';

type InnovationPackArray = InnovationPacksQuery['platform']['library']['innovationPacks'][number];
type InnovationPackInfo = Pick<InnovationPackArray, 'id' | 'nameID' | 'displayName' | 'provider'>;

export type InnovationPack<T extends Template> = InnovationPackInfo & { templates: T[] };

export interface TemplateInnovationPackMetaInfo extends Template {
  innovationPackNameID: InnovationPackInfo['nameID'];
  innovationPackId: InnovationPackInfo['id'];
  innovationPackDisplayName: InnovationPackInfo['displayName'];
  provider: InnovationPackArray['provider'];
}
