import { compact } from 'lodash';
import { ComponentType, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSpacePostTemplatesLibraryLazyQuery,
  usePlatformPostTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CollaborationTemplatesLibrary from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import { PostTemplate, postTemplateMapper, PostTemplateWithValue } from '../PostTemplateCard/PostTemplate';
import PostTemplateCard from '../PostTemplateCard/PostTemplateCard';
import PostTemplatePreview from './PostTemplatePreview';
import { TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';

export interface PostTemplatesLibraryProps {
  onSelectTemplate: (template: PostTemplateWithValue) => void;
}

const applyFilter = (filter: string[], templates: PostTemplate[] | undefined) => {
  if (filter.length === 0) {
    return templates;
  }
  return templates?.filter(post => {
    const postString =
      `${post.displayName} ${post.provider.displayName} ${post.innovationPack.displayName}`.toLowerCase();
    return filter.some(term => postString.includes(term.toLowerCase()));
  });
};

const PostTemplatesLibrary: FC<PostTemplatesLibraryProps> = ({ onSelectTemplate }) => {
  const { t } = useTranslation();
  const { spaceNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Space Templates:
  const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
    useSpacePostTemplatesLibraryLazyQuery({
      variables: {
        spaceId: spaceNameId!,
      },
    });

  const templatesFromSpace = useMemo(
    () =>
      applyFilter(
        filter,
        spaceData?.space.templates?.postTemplates.map<PostTemplate>(template =>
          postTemplateMapper(template, spaceData?.space.host?.profile)
        )
      ),
    [spaceData, filter]
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
              postTemplateMapper(template, ip.provider?.profile, ip)
            )
          )
        )
      ),
    [platformData]
  );

  // Post templates include the value (defaultDescription and type), so no need to go to the server and fetch like with Whiteboards
  const getPostTemplateContent = (template: PostTemplate): Promise<PostTemplateWithValue> => {
    return Promise.resolve(template);
  };

  return (
    <CollaborationTemplatesLibrary
      dialogTitle={t('templateLibrary.postTemplates.title')}
      onSelectTemplate={onSelectTemplate}
      templateCardComponent={PostTemplateCard as ComponentType<TemplateCardBaseProps<PostTemplate>>}
      templatePreviewComponent={PostTemplatePreview}
      filter={filter}
      onFilterChange={setFilter}
      fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
      fetchTemplatesFromSpace={fetchTemplatesFromSpace}
      templatesFromSpace={templatesFromSpace}
      loadingTemplatesFromSpace={loadingTemplatesFromSpace}
      loadingWhiteboardTemplateContent={false}
      getWhiteboardTemplateWithContent={template => getPostTemplateContent(template)}
      fetchTemplatesFromPlatform={fetchPlatformTemplates}
      templatesFromPlatform={templatesFromPlatform}
      loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
    />
  );
};

export default PostTemplatesLibrary;
