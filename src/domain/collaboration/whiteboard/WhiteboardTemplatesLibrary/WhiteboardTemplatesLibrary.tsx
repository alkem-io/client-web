import { compact } from 'lodash';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useHubWhiteboardTemplateValueLazyQuery,
  useHubWhiteboardTemplatesLibraryLazyQuery,
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
  const { hubNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Hub Templates:
  const [fetchTemplatesFromHub, { data: hubData, loading: loadingTemplatesFromHub }] =
    useHubWhiteboardTemplatesLibraryLazyQuery({
      variables: {
        hubId: hubNameId!,
      },
    });

  const [fetchTemplateValueHub, { loading: loadingTemplateValueFromHub }] = useHubWhiteboardTemplateValueLazyQuery();

  const templatesFromHub = useMemo(
    () =>
      applyFilter(
        filter,
        hubData?.hub.templates?.whiteboardTemplates.map<WhiteboardTemplate>(template =>
          whiteboardTemplateMapper(template, hubData?.hub.host?.profile)
        )
      ),
    [hubData, filter]
  );

  const fetchTemplateFromHubValue = async (template: WhiteboardTemplate) => {
    const { data } = await fetchTemplateValueHub({
      variables: {
        hubId: hubNameId!,
        whiteboardTemplateId: template.id,
      },
    });
    const templateValue = data?.hub.templates?.whiteboardTemplate;
    if (templateValue) {
      return {
        ...whiteboardTemplateMapper(templateValue, hubData?.hub.host?.profile),
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
      fetchHubTemplatesOnLoad={Boolean(hubNameId)}
      fetchTemplatesFromHub={fetchTemplatesFromHub}
      templatesFromHub={templatesFromHub}
      loadingTemplatesFromHub={loadingTemplatesFromHub}
      loadingTemplateValueFromHub={loadingTemplateValueFromHub}
      fetchTemplateFromHubValue={fetchTemplateFromHubValue}
      fetchTemplatesFromPlatform={fetchPlatformTemplates}
      templatesFromPlatform={templatesFromPlatform}
      loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
      loadingTemplateValueFromPlatform={loadingTemplateValueFromPlatform}
      fetchTemplateFromPlatformValue={fetchTemplateFromPlatformValue}
    />
  );
};

export default WhiteboardTemplatesLibrary;
