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
import { WhiteboardTemplate, WhiteboardTemplateMapper, WhiteboardTemplateWithValue } from './WhiteboardTemplate';
import WhiteboardTemplateCard from './WhiteboardTemplateCard';
import WhiteboardTemplatePreview from './WhiteboardTemplatePreview';

export interface WhiteboardTemplatesLibraryProps {
  onSelectTemplate: (template: WhiteboardTemplateWithValue) => void;
}

const applyFilter = (filter: string[], templates: WhiteboardTemplate[] | undefined) => {
  return templates?.filter(canvas => {
    if (!filter || filter.length === 0) return true;
    const canvasString =
      `${canvas.displayName} ${canvas.provider.displayName} ${canvas.innovationPack.displayName}`.toLowerCase();
    return filter.some(term => canvasString.includes(term.toLowerCase()));
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

  const [fetchWhiteboardTemplateValueHub, { loading: loadingTemplateValueFromHub }] =
    useHubWhiteboardTemplateValueLazyQuery();

  const templatesFromHub = useMemo(
    () =>
      applyFilter(
        filter,
        hubData?.hub.templates?.whiteboardTemplates.map<WhiteboardTemplate>(template =>
          WhiteboardTemplateMapper(template, hubData?.hub.host?.profile)
        )
      ),
    [hubData, filter]
  );

  const fetchTemplateFromHubValue = async (template: WhiteboardTemplate) => {
    const { data } = await fetchWhiteboardTemplateValueHub({
      variables: {
        hubId: hubNameId!,
        whiteboardTemplateId: template.id,
      },
    });
    const templateValue = data?.hub.templates?.whiteboardTemplate;
    if (templateValue) {
      return {
        ...WhiteboardTemplateMapper(templateValue, hubData?.hub.host?.profile),
        value: templateValue.value,
      };
    }
  };

  // Platform Templates:
  const [fetchPlatformTemplates, { data: platformData, loading: loadingTemplatesFromPlatform }] =
    usePlatformWhiteboardTemplatesLibraryLazyQuery();

  const [fetchWhiteboardTemplateValuePlatform, { loading: loadingTemplateValueFromPlatform }] =
    usePlatformWhiteboardTemplateValueLazyQuery();

  const templatesFromPlatform = useMemo(
    () =>
      applyFilter(
        filter,
        platformData?.platform.library.innovationPacks.flatMap(ip =>
          compact(
            ip.templates?.whiteboardTemplates.map<WhiteboardTemplate>(template =>
              WhiteboardTemplateMapper(template, ip.provider?.profile, ip)
            )
          )
        )
      ),
    [platformData]
  );

  const fetchTemplateFromPlatformValue = async (template: WhiteboardTemplate) => {
    const { data } = await fetchWhiteboardTemplateValuePlatform({
      variables: {
        innovationPackId: template.innovationPack.id!,
        whiteboardTemplateId: template.id,
      },
    });
    const ip = data?.platform.library.innovationPack;
    const templateValue = ip?.templates?.whiteboardTemplate;
    if (templateValue) {
      return {
        ...WhiteboardTemplateMapper(templateValue, ip?.provider?.profile, ip),
        value: templateValue.value,
      };
    }
  };

  return (
    <CollaborationTemplatesLibrary
      dialogTitle={t('canvas-templates.template-library')}
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
