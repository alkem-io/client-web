import { compact } from 'lodash';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSpaceWhiteboardTemplateValueLazyQuery,
  useSpaceWhiteboardTemplatesLibraryLazyQuery,
  usePlatformWhiteboardTemplateValueLazyQuery,
  usePlatformWhiteboardTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CollaborationTemplatesLibrary from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import {
  WhiteboardTemplate,
  whiteboardTemplateMapper,
  WhiteboardTemplateWithValue,
} from '../WhiteboardTemplateCard/WhiteboardTemplate';
import WhiteboardTemplateCard from '../WhiteboardTemplateCard/WhiteboardTemplateCard';
import WhiteboardTemplatePreview from './WhiteboardTemplatePreview';

export interface WhiteboardTemplatesLibraryProps {
  onSelectTemplate: (template: WhiteboardTemplateWithValue) => void;
}

const applyFilter = (filter: string[], templates: WhiteboardTemplate[] | undefined) => {
  if (filter.length === 0) {
    return templates;
  }
  return templates?.filter(whiteboard => {
    const whiteboardString =
      `${whiteboard.displayName} ${whiteboard.provider.displayName} ${whiteboard.innovationPack.displayName}`.toLowerCase();
    return filter.some(term => whiteboardString.includes(term.toLowerCase()));
  });
};

const WhiteboardTemplatesLibrary: FC<WhiteboardTemplatesLibraryProps> = ({ onSelectTemplate }) => {
  const { t } = useTranslation();
  const { spaceNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Space Templates:
  const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
    useSpaceWhiteboardTemplatesLibraryLazyQuery({
      variables: {
        spaceId: spaceNameId!,
      },
    });

  const [fetchTemplateValueSpace, { loading: loadingTemplateValueFromSpace }] =
    useSpaceWhiteboardTemplateValueLazyQuery();

  const templatesFromSpace = useMemo(
    () =>
      applyFilter(
        filter,
        spaceData?.space.templates?.whiteboardTemplates.map<WhiteboardTemplate>(template =>
          whiteboardTemplateMapper(template, spaceData?.space.host?.profile)
        )
      ),
    [spaceData, filter]
  );

  const fetchTemplateFromSpaceValue = async (template: WhiteboardTemplate) => {
    const { data } = await fetchTemplateValueSpace({
      variables: {
        spaceId: spaceNameId!,
        whiteboardTemplateId: template.id,
      },
    });
    const templateValue = data?.space.templates?.whiteboardTemplate;
    if (templateValue) {
      return {
        ...whiteboardTemplateMapper(templateValue, spaceData?.space.host?.profile),
        value: templateValue.value,
      };
    }
  };

  // Platform Templates:
  const [fetchPlatformTemplates, { data: platformData, loading: loadingTemplatesFromPlatform }] =
    usePlatformWhiteboardTemplatesLibraryLazyQuery();

  const [fetchTemplateValuePlatform, { loading: loadingTemplateValueFromPlatform }] =
    usePlatformWhiteboardTemplateValueLazyQuery();

  const templatesFromPlatform = useMemo(
    () =>
      applyFilter(
        filter,
        platformData?.platform.library.innovationPacks.flatMap(ip =>
          compact(
            ip.templates?.whiteboardTemplates.map<WhiteboardTemplate>(template =>
              whiteboardTemplateMapper(template, ip.provider?.profile, ip)
            )
          )
        )
      ),
    [platformData]
  );

  const fetchTemplateFromPlatformValue = async (template: WhiteboardTemplate) => {
    const { data } = await fetchTemplateValuePlatform({
      variables: {
        innovationPackId: template.innovationPack.id!,
        whiteboardTemplateId: template.id,
      },
    });
    const ip = data?.platform.library.innovationPack;
    const templateValue = ip?.templates?.whiteboardTemplate;
    if (templateValue) {
      return {
        ...whiteboardTemplateMapper(templateValue, ip?.provider?.profile, ip),
        value: templateValue.value,
      };
    }
  };

  return (
    <CollaborationTemplatesLibrary
      dialogTitle={t('whiteboard-templates.template-library')}
      onSelectTemplate={onSelectTemplate}
      templateCardComponent={WhiteboardTemplateCard}
      templatePreviewComponent={WhiteboardTemplatePreview}
      filter={filter}
      onFilterChange={setFilter}
      fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
      fetchTemplatesFromSpace={fetchTemplatesFromSpace}
      templatesFromSpace={templatesFromSpace}
      loadingTemplatesFromSpace={loadingTemplatesFromSpace}
      loadingTemplateValueFromSpace={loadingTemplateValueFromSpace}
      fetchTemplateFromSpaceValue={fetchTemplateFromSpaceValue}
      fetchTemplatesFromPlatform={fetchPlatformTemplates}
      templatesFromPlatform={templatesFromPlatform}
      loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
      loadingTemplateValueFromPlatform={loadingTemplateValueFromPlatform}
      fetchTemplateFromPlatformValue={fetchTemplateFromPlatformValue}
    />
  );
};

export default WhiteboardTemplatesLibrary;
