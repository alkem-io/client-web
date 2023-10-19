import { compact } from 'lodash';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSpaceWhiteboardTemplatesLibraryLazyQuery,
  useWhiteboardTemplateContentLazyQuery,
  usePlatformWhiteboardTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CollaborationTemplatesLibrary from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import {
  WhiteboardTemplate,
  whiteboardTemplateMapper,
  WhiteboardTemplateWithContent,
} from '../WhiteboardTemplateCard/WhiteboardTemplate';
import WhiteboardTemplateCard from '../WhiteboardTemplateCard/WhiteboardTemplateCard';
import WhiteboardTemplatePreview from './WhiteboardTemplatePreview';

export interface WhiteboardTemplatesLibraryProps {
  onSelectTemplate: (template: WhiteboardTemplateWithContent) => void;
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

  const [fetchWhiteboardTemplateContent, { loading: loadingWhiteboardTemplateContent }] =
    useWhiteboardTemplateContentLazyQuery();

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

  // Platform Templates:
  const [fetchPlatformTemplates, { data: platformData, loading: loadingTemplatesFromPlatform }] =
    usePlatformWhiteboardTemplatesLibraryLazyQuery();

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

  const getWhiteboardTemplateWithContent = useCallback(async (template: WhiteboardTemplate) => {
    const { data } = await fetchWhiteboardTemplateContent({
      variables: {
        whiteboardTemplateId: template.id,
      },
    });

    const content = data?.lookup.whiteboardTemplate?.content ?? '';

    return {
      ...template,
      content,
    };
  }, []);

  return (
    <CollaborationTemplatesLibrary
      dialogTitle={t('templateLibrary.whiteboardTemplates.title')}
      onSelectTemplate={onSelectTemplate}
      templateCardComponent={WhiteboardTemplateCard}
      templatePreviewComponent={WhiteboardTemplatePreview}
      filter={filter}
      onFilterChange={setFilter}
      fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
      fetchTemplatesFromSpace={fetchTemplatesFromSpace}
      templatesFromSpace={templatesFromSpace}
      loadingTemplatesFromSpace={loadingTemplatesFromSpace}
      loadingWhiteboardTemplateContent={loadingWhiteboardTemplateContent}
      getWhiteboardTemplateWithContent={getWhiteboardTemplateWithContent}
      fetchTemplatesFromPlatform={fetchPlatformTemplates}
      templatesFromPlatform={templatesFromPlatform}
      loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
    />
  );
};

export default WhiteboardTemplatesLibrary;
