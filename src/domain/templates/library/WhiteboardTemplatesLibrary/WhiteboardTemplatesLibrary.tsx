import { compact } from 'lodash';
import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePlatformWhiteboardTemplatesLibraryLazyQuery,
  useSpaceWhiteboardTemplatesLibraryLazyQuery,
  useWhiteboardTemplateContentLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import WhiteboardTemplateCard from '../../cards/WhiteboardTemplateCard/WhiteboardTemplateCard';
import WhiteboardTemplatePreview from './WhiteboardTemplatePreview';
import { TemplateWithInnovationPack } from '../../../platform/admin/InnovationPacks/ImportTemplatesDialogGalleryStep';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { WhiteboardTemplateWithContent } from '../../cards/WhiteboardTemplateCard/WhiteboardTemplateWithContent';
import { TemplateBase } from '../CollaborationTemplatesLibrary/TemplateBase';
import CollaborationTemplatesLibrary from '../CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';

export interface WhiteboardTemplatesLibraryProps {
  open: boolean;
  onClose: () => void;
  onImportTemplate: (template: WhiteboardTemplateWithContent) => void;
}

const applyFilter = <T extends TemplateWithInnovationPack<TemplateBase>>(
  filter: string[],
  templates: T[] | undefined
) => {
  if (filter.length === 0) {
    return templates;
  }
  return templates?.filter(whiteboard => {
    const whiteboardString =
      `${whiteboard.profile.displayName} ${whiteboard.innovationPack?.provider?.profile.displayName} ${whiteboard.innovationPack?.profile.displayName}`.toLowerCase();
    return filter.some(term => whiteboardString.includes(term.toLowerCase()));
  });
};

const WhiteboardTemplatesLibrary: FC<WhiteboardTemplatesLibraryProps> = ({ open, onClose, onImportTemplate }) => {
  const { t } = useTranslation();
  const { spaceNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Space Templates:
  const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
    useSpaceWhiteboardTemplatesLibraryLazyQuery({
      variables: {
        spaceNameId: spaceNameId!,
      },
    });

  const [fetchWhiteboardTemplateContent, { loading: loadingWhiteboardTemplateContent }] =
    useWhiteboardTemplateContentLazyQuery();

  const templatesFromSpace = useMemo(
    () =>
      applyFilter(
        filter,
        spaceData?.space.library?.whiteboardTemplates.map(template => ({
          ...template,
          innovationPack: {
            // TODO ???
            profile: {
              displayName: '',
            },
            provider: spaceData?.space.provider,
          },
        }))
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
        compact(
          platformData?.platform.library.innovationPacks.flatMap(ip =>
            ip.templates?.whiteboardTemplates.map(template => ({
              ...template,
              innovationPack: ip,
            }))
          )
        )
      ),
    [platformData]
  );

  const getWhiteboardTemplateWithContent = useCallback(async (template: TemplateBase & Identifiable) => {
    const { data } = await fetchWhiteboardTemplateContent({
      variables: {
        whiteboardTemplateId: template.id,
      },
    });

    const content = data?.lookup.template?.whiteboard?.content ?? '';

    return {
      ...template,
      content,
    };
  }, []);

  return (
    <CollaborationTemplatesLibrary<TemplateBase, WhiteboardTemplateWithContent, { content?: string }>
      open={open}
      onClose={onClose}
      dialogTitle={t('templateLibrary.whiteboardTemplates.title')}
      onImportTemplate={onImportTemplate}
      templateCardComponent={WhiteboardTemplateCard}
      templatePreviewComponent={WhiteboardTemplatePreview}
      filter={filter}
      onFilterChange={setFilter}
      fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
      fetchTemplatesFromSpace={fetchTemplatesFromSpace}
      templatesFromSpace={templatesFromSpace}
      loadingTemplatesFromSpace={loadingTemplatesFromSpace}
      loadingTemplateContent={loadingWhiteboardTemplateContent}
      getTemplateWithContent={getWhiteboardTemplateWithContent}
      fetchTemplatesFromPlatform={fetchPlatformTemplates}
      templatesFromPlatform={templatesFromPlatform}
      loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
    />
  );
};

export default WhiteboardTemplatesLibrary;