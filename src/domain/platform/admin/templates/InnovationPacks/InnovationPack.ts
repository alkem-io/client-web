import { InnovationPacksQuery } from '../../../../../core/apollo/generated/graphql-schema';
import { Template } from '../AdminTemplatesSection';
import { Identifiable } from '../../../../../core/utils/Identifiable';

type InnovationPackArray = InnovationPacksQuery['platform']['library']['innovationPacks'][number];
type InnovationPackInfo = Pick<InnovationPackArray, 'id' | 'nameID' | 'profile'> & {
  provider?: InnovationPackArray['provider'];
};

export type InnovationPack<T extends Template> = InnovationPackInfo & { templates: (T & Identifiable)[] };
