import { compact } from 'lodash';
import { ComponentType, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSpacePostTemplatesLibraryLazyQuery,
  usePlatformPostTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CollaborationTemplatesLibrary from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import { PostTemplate, PostTemplateWithValue } from '../PostTemplateCard/PostTemplate';
import PostTemplateCard from '../PostTemplateCard/PostTemplateCard';
import PostTemplatePreview from './PostTemplatePreview';
import { TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { TemplateWithInnovationPack } from '../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialogGalleryStep';
import { Identifiable } from '../../../../core/utils/Identifiable';
import CollaborationTemplatesLibraryButton from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibraryButton';

export interface PostTemplatesLibraryProps {
  onSelectTemplate: (template: PostTemplateWithValue) => void;
}

const applyFilter = <T extends TemplateWithInnovationPack<PostTemplate>>(
  filter: string[],
  templates: T[] | undefined
) => {
  if (filter.length === 0) {
    return templates;
  }
  return templates?.filter(post => {
    const postString =
      `${post.profile.displayName} ${post.innovationPack?.provider?.profile.displayName} ${post.innovationPack?.profile.displayName}`.toLowerCase();
    return filter.some(term => postString.includes(term.toLowerCase()));
  });
};

const PostTemplatesLibrary: FC<PostTemplatesLibraryProps> = ({ onSelectTemplate }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { spaceNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Space Templates:
  const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
    useSpacePostTemplatesLibraryLazyQuery({
      variables: {
        spaceNameId: spaceNameId!,
      },
    });

  const templatesFromSpace = useMemo(
    () =>
      applyFilter(
        filter,
        spaceData?.space.account.library?.postTemplates.map(template => ({
          ...template,
          innovationPack: {
            profile: { displayName: '' },
            provider: spaceData?.space.account.host,
          },
        }))
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
            ip.templates?.postTemplates.map(template => ({
              ...template,
              innovationPack: ip,
            }))
          )
        )
      ),
    [platformData]
  );

  // Post templates include the value (defaultDescription and type), so no need to go to the server and fetch like we do with Whiteboards
  const getPostTemplateContent = (
    template: PostTemplate & Identifiable
  ): Promise<PostTemplateWithValue & Identifiable> => {
    return Promise.resolve(template);
  };

  return (
    <>
      <CollaborationTemplatesLibraryButton onClick={() => setIsOpen(true)} />
      <CollaborationTemplatesLibrary
        open={isOpen}
        onClose={() => setIsOpen(false)}
        dialogTitle={t('templateLibrary.postTemplates.title')}
        onImportTemplate={onSelectTemplate}
        templateCardComponent={PostTemplateCard as ComponentType<TemplateCardBaseProps<PostTemplate>>}
        templatePreviewComponent={PostTemplatePreview}
        filter={filter}
        onFilterChange={setFilter}
        fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
        fetchTemplatesFromSpace={fetchTemplatesFromSpace}
        templatesFromSpace={templatesFromSpace}
        loadingTemplatesFromSpace={loadingTemplatesFromSpace}
        getTemplateWithContent={getPostTemplateContent}
        fetchTemplatesFromPlatform={fetchPlatformTemplates}
        templatesFromPlatform={templatesFromPlatform}
        loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
      />
    </>
  );
};

export default PostTemplatesLibrary;
