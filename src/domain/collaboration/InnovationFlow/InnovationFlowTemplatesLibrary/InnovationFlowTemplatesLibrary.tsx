import { compact } from 'lodash';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSpaceInnovationFlowTemplatesLibraryLazyQuery,
  usePlatformInnovationFlowTemplatesLibraryLazyQuery,
  useInnovationFlowTemplateDefinitionLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CollaborationTemplatesLibrary from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import {
  InnovationFlowTemplate,
  innovationFlowTemplateMapper,
} from '../InnovationFlowTemplateCard/InnovationFlowTemplate';
import InnovationFlowTemplateCard from '../InnovationFlowTemplateCard/InnovationFlowTemplateCard';
import InnovationFlowTemplatePreview from './InnovationFlowTemplatePreview';
import { Autorenew } from '@mui/icons-material';
import { InnovationFlowType } from '../../../../core/apollo/generated/graphql-schema';

export interface InnovationFlowTemplatesLibraryProps {
  onSelectTemplate: (template: InnovationFlowTemplate) => void;
  filterType?: InnovationFlowType;
  disabled?: boolean;
}

const filterByType = (filter: InnovationFlowType | undefined) => (template: InnovationFlowTemplate) =>
  !filter || template.type === filter;

const filterByText = (filter: string[]) => (template: InnovationFlowTemplate) => {
  const templateString =
    `${template.displayName} ${template.provider.displayName} ${template.innovationPack.displayName}`.toLowerCase();
  return filter.length === 0 || filter.some(term => templateString.includes(term.toLowerCase()));
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
        .map<InnovationFlowTemplate>(template => innovationFlowTemplateMapper(template, spaceData?.space.host?.profile))
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
            ip.templates?.innovationFlowTemplates.map<InnovationFlowTemplate>(template =>
              innovationFlowTemplateMapper(template, ip.provider?.profile, ip)
            )
          )
        )
        .filter(filterByType(filterType))
        .filter(filterByText(filter)),
    [platformData, filterType, filter]
  );
  const [fetchInnovationFlowTemplateDefinition, { loading: loadingInnovationFlowTemplateDefinition }] =
    useInnovationFlowTemplateDefinitionLazyQuery();

  // InnovationFlow templates include the definition and type, so no need to go to the server and fetch like with Whiteboards
  const getInnovationFlowTemplateDefinition = async (template: InnovationFlowTemplate) => {
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
      templatePreviewComponent={InnovationFlowTemplatePreview}
      filter={filter}
      onFilterChange={setFilter}
      fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
      fetchTemplatesFromSpace={fetchTemplatesFromSpace}
      loadingWhiteboardTemplateContent={loadingInnovationFlowTemplateDefinition}
      getWhiteboardTemplateWithContent={getInnovationFlowTemplateDefinition}
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
