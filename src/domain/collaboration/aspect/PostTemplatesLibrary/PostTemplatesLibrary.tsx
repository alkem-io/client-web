import { compact } from 'lodash';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useHubPostTemplatesLibraryLazyQuery,
  usePlatformPostTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CollaborationTemplatesLibrary from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import { PostTemplate, PostTemplateMapper, PostTemplateWithValue } from './PostTemplate';
import PostTemplateCard from './PostTemplateCard';
import PostTemplatePreview from './PostTemplatePreview';

export interface PostTemplatesLibraryProps {
  onSelectTemplate: (template: PostTemplateWithValue) => void;
}

const applyFilter = (filter: string[], templates: PostTemplate[] | undefined) => {
  return templates?.filter(post => {
    if (!filter || filter.length === 0) return true;
    const postString =
      `${post.displayName} ${post.provider.displayName} ${post.innovationPack.displayName}`.toLowerCase();
    return filter.some(term => postString.includes(term.toLowerCase()));
  });
};

const PostTemplatesLibrary: FC<PostTemplatesLibraryProps> = ({ onSelectTemplate }) => {
  const { t } = useTranslation();
  const { hubNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Hub Templates:
  const [fetchTemplatesFromHub, { data: hubData, loading: loadingTemplatesFromHub }] =
    useHubPostTemplatesLibraryLazyQuery({
      variables: {
        hubId: hubNameId!,
      },
    });

  const templatesFromHub = useMemo(
    () =>
      applyFilter(
        filter,
        hubData?.hub.templates?.postTemplates.map<PostTemplate>(template =>
          PostTemplateMapper(template, hubData?.hub.host?.profile)
        )
      ),
    [hubData, filter]
  );

  // Platform Templates:
  const [fetchPlatformTemplates, { data: platformData, loading: loadingTemplatesFromPlatform }] =
    usePlatformPostTemplatesLibraryLazyQuery();

  const templatesFromPlatform = useMemo(
    () =>
      applyFilter(
        filter,
        platformData?.platform.library.innovationPacks.flatMap(ip =>
          compact(
            ip.templates?.postTemplates.map<PostTemplate>(template =>
              PostTemplateMapper(template, ip.provider?.profile, ip)
            )
          )
        )
      ),
    [platformData]
  );

  const postTemplateValue = (template: PostTemplate): Promise<PostTemplateWithValue> => {
    return Promise.resolve(template);
  };
  return (
    <CollaborationTemplatesLibrary
      dialogTitle={t('aspect-templates.template-library')}
      onSelectTemplate={onSelectTemplate}
      templateCardComponent={PostTemplateCard}
      templatePreviewComponent={PostTemplatePreview}
      filter={filter}
      onFilterChange={setFilter}
      fetchHubTemplatesOnLoad={Boolean(hubNameId)}
      fetchTemplatesFromHub={fetchTemplatesFromHub}
      templatesFromHub={templatesFromHub}
      loadingTemplatesFromHub={loadingTemplatesFromHub}
      loadingTemplateValueFromHub={false}
      fetchTemplateFromHubValue={template => postTemplateValue(template)}
      fetchTemplatesFromPlatform={fetchPlatformTemplates}
      templatesFromPlatform={templatesFromPlatform}
      loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
      loadingTemplateValueFromPlatform={false}
      fetchTemplateFromPlatformValue={template => postTemplateValue(template)}
    />
  );
};

export default PostTemplatesLibrary;
