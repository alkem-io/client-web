import { compact } from 'lodash';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useInnovationFlowTemplateDefinitionLazyQuery,
  usePlatformInnovationFlowTemplatesLibraryLazyQuery,
  useSpaceInnovationFlowTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CollaborationTemplatesLibrary from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import InnovationFlowTemplateCard from '../InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import InnovationFlowTemplatePreview from './InnovationFlowTemplatePreview';
import { Autorenew } from '@mui/icons-material';
import { InnovationFlowType } from '../../../../core/apollo/generated/graphql-schema';
import { TemplateBase } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { TemplateWithInnovationPack } from '../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialogGalleryStep';
import { Identifiable } from '../../../../core/utils/Identifiable';

interface InnovationFlowTemplate extends TemplateBase {
  type: InnovationFlowType;
}

export interface InnovationFlowTemplatesLibraryProps {
  onSelectTemplate: (template: InnovationFlowTemplate & Identifiable) => void;
  filterType?: InnovationFlowType;
  disabled?: boolean;
}

const filterByType = (filter: InnovationFlowType | undefined) =>
  !filter ? () => true : <T extends InnovationFlowTemplate>(template: T) => template.type === filter;

const filterByText = (filter: string[]) => {
  if (filter.length === 0) {
    return () => true;
  }
  return (template: TemplateWithInnovationPack<TemplateBase>) => {
    const terms = filter.map(term => term.toLowerCase());
    const templateString =
      `${template.profile.displayName} ${template.innovationPack?.provider?.profile.displayName} ${template.innovationPack?.profile.displayName}`.toLowerCase();
    return terms.some(term => templateString.includes(term));
  };
};

const InnovationFlowTemplatesLibrary: FC<InnovationFlowTemplatesLibraryProps> = ({
  onSelectTemplate,
  filterType,
  disabled,
}) => {
  const { t } = useTranslation();
  const { spaceNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Space Templates:
  const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
    useSpaceInnovationFlowTemplatesLibraryLazyQuery({
      variables: {
        spaceId: spaceNameId!,
      },
    });

  const templatesFromSpace = useMemo(
    () =>
      spaceData?.space.templates?.innovationFlowTemplates
        .map(template => ({
          ...template,
          innovationPack: {
            // TODO Introduce subtype with optional profile
            profile: {
              displayName: '',
            },
            provider: spaceData?.space.host,
          },
        }))
        .filter(filterByType(filterType))
        .filter(filterByText(filter)),
    [spaceData, filterType, filter]
  );

  // Platform Templates:
  const [fetchPlatformTemplates, { data: platformData, loading: loadingTemplatesFromPlatform }] =
    usePlatformInnovationFlowTemplatesLibraryLazyQuery();

  const templatesFromPlatform = useMemo(
    () =>
      platformData?.platform.library.innovationPacks
        .flatMap(ip =>
          compact(
            ip.templates?.innovationFlowTemplates.map(template => ({
              ...template,
              innovationPack: ip,
            }))
          )
        )
        .filter(filterByType(filterType))
        .filter(filterByText(filter)),
    [platformData, filterType, filter]
  );
  const [fetchInnovationFlowTemplateDefinition, { loading: loadingInnovationFlowTemplateDefinition }] =
    useInnovationFlowTemplateDefinitionLazyQuery();

  // InnovationFlow templates include the definition and type, so no need to go to the server and fetch like with Whiteboards
  const getInnovationFlowTemplateDefinition = async (template: InnovationFlowTemplate & Identifiable) => {
    const { data } = await fetchInnovationFlowTemplateDefinition({
      variables: {
        innovationFlowTemplateID: template.id,
      },
    });
    if (!data?.lookup.innovationFlowTemplate) {
      throw new Error(`Innovation Flow template id:'${template.id}' not found`);
    }
    return {
      ...template,
      definition: data.lookup.innovationFlowTemplate.definition,
    };
  };

  return (
    <CollaborationTemplatesLibrary
      dialogTitle={t('templateLibrary.innovationFlowTemplates.title')}
      onSelectTemplate={onSelectTemplate}
      templateCardComponent={InnovationFlowTemplateCard}
      // TODO figure out why it's failing, InnovationFlowTemplatePreview requires an Identifiable
      // @ts-ignore
      templatePreviewComponent={InnovationFlowTemplatePreview}
      filter={filter}
      onFilterChange={setFilter}
      fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
      fetchTemplatesFromSpace={fetchTemplatesFromSpace}
      loadingTemplateContent={loadingInnovationFlowTemplateDefinition}
      getTemplateWithContent={getInnovationFlowTemplateDefinition}
      templatesFromSpace={templatesFromSpace}
      loadingTemplatesFromSpace={loadingTemplatesFromSpace}
      fetchTemplatesFromPlatform={fetchPlatformTemplates}
      templatesFromPlatform={templatesFromPlatform}
      loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
      disableUsePlatformTemplates
      buttonProps={{
        variant: 'text',
        disabled,
        children: t('components.innovationFlowTemplateSelect.select'),
        startIcon: <Autorenew />,
      }}
    />
  );
};

export default InnovationFlowTemplatesLibrary;
