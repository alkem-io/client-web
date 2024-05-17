import { ComponentType, FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { compact } from 'lodash';
import {
  useSpaceCommunityGuidelinesTemplatesLibraryLazyQuery,
  usePlatformCommunityGuidelinesTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CollaborationTemplatesLibrary from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import CommunityGuidelinesTemplateCard from '../CommunityGuidelinesTemplateCard/CommunityGuidelinesTemplateCard';
import { CommunityGuidelinesTemplateWithContent } from '../CommunityGuidelinesTemplateCard/CommunityGuidelines';
import CommunityGuidelinesTemplatePreview from './CommunityGuidelinesTemplatePreview';
import { TemplateBase, TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import { TemplateWithInnovationPack } from '../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialogGalleryStep';
import { Identifiable } from '../../../../core/utils/Identifiable';

export interface CommunityGuidelinesTemplatesLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CommunityGuidelinesTemplateWithContent) => void;
}

const applyFilter = <T extends TemplateWithInnovationPack<TemplateBase>>(
  filter: string[],
  templates: T[] | undefined
) => {
  if (filter.length === 0) {
    return templates;
  }
  return templates?.filter(communityGuidelines => {
    const communityGuidelinesString =
      `${communityGuidelines.profile.displayName} ${communityGuidelines.innovationPack?.provider?.profile.displayName} ${communityGuidelines.innovationPack?.profile.displayName}`.toLowerCase();
    return filter.some(term => communityGuidelinesString.includes(term.toLowerCase()));
  });
};

const CommunityGuidelinesTemplatesLibrary: FC<CommunityGuidelinesTemplatesLibraryProps> = ({
  open,
  onClose,
  onSelectTemplate,
}) => {
  const { t } = useTranslation();
  const { spaceNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Space Templates:
  const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
    useSpaceCommunityGuidelinesTemplatesLibraryLazyQuery({
      variables: {
        spaceNameId: spaceNameId!,
      },
    });

  const templatesFromSpace = useMemo(
    () =>
      applyFilter(
        filter,
        spaceData?.space.account.library?.communityGuidelinesTemplates.map(template => ({
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
    usePlatformCommunityGuidelinesTemplatesLibraryLazyQuery();

  const templatesFromPlatform = useMemo(
    () =>
      applyFilter(
        filter,
        platformData?.platform.library.innovationPacks.flatMap(ip =>
          compact(
            ip.templates?.communityGuidelinesTemplates.map(template => ({
              ...template,
              innovationPack: ip,
            }))
          )
        )
      ),
    [platformData]
  );

  const getCommunityGuidelinesTemplateWithContent = (
    template: CommunityGuidelinesTemplateWithContent & Identifiable
  ): Promise<CommunityGuidelinesTemplateWithContent & Identifiable> => {
    return Promise.resolve(template);
  };

  return (
    <CollaborationTemplatesLibrary
      open={open}
      onClose={onClose}
      dialogTitle={t('templateLibrary.communityGuidelinesTemplates.title')}
      onImportTemplate={onSelectTemplate}
      templateCardComponent={
        CommunityGuidelinesTemplateCard as ComponentType<TemplateCardBaseProps<CommunityGuidelinesTemplateWithContent>>
      }
      templatePreviewComponent={CommunityGuidelinesTemplatePreview}
      filter={filter}
      onFilterChange={setFilter}
      fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
      fetchTemplatesFromSpace={fetchTemplatesFromSpace}
      templatesFromSpace={templatesFromSpace}
      loadingTemplatesFromSpace={loadingTemplatesFromSpace}
      fetchTemplatesFromPlatform={fetchPlatformTemplates}
      templatesFromPlatform={templatesFromPlatform}
      loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
      getTemplateWithContent={getCommunityGuidelinesTemplateWithContent}
    />
  );
};

export default CommunityGuidelinesTemplatesLibrary;
