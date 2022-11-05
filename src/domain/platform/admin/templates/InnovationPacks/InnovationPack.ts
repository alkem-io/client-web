import { InnovationPacksQuery } from '../../../../../models/graphql-schema';

type InnovationPackArray = InnovationPacksQuery['library']['innovationPacks'][number];
type InnovationPackInfo = Pick<InnovationPackArray, 'id' | 'nameID' | 'displayName' | 'provider'>;
type InnovationPackTemplates = NonNullable<InnovationPackArray['templates']>;
export type InnovationPackTemplatesData =
  Pick<InnovationPackTemplates['aspectTemplates'][number], 'id' | 'defaultDescription' | 'type' | 'info'> |
  Pick<InnovationPackTemplates['canvasTemplates'][number], 'id' | 'value' | 'info'> |
  Pick<InnovationPackTemplates['lifecycleTemplates'][number], 'id' | 'definition' | 'type' | 'info'>;


/**
 * Build a type based on the return of InnovationPacksQuery that looks like:
  {
      id: string;
      nameID: string;
      displayName: string;
      provider?: { __typename?: 'Organization'; id: string; nameID: string; displayName: string } | undefined;
      templates?: Array<{
              __typename?: 'AspectTemplate' | 'CanvasTemplate' | 'LifecycleTemplate';
              id: string;
              defaultDescription: string;
              type: string;
              info: {
                __typename?: 'TemplateInfo';
                id: string;
                title: string;
                description: string;
                tagset?: { __typename?: 'Tagset'; id: string; tags: Array<string> } | undefined;
                visual?: ...
              };
            }>;
      }>;
    }
 *
 */

export type InnovationPack = InnovationPackInfo & { templates: InnovationPackTemplatesData[] };

