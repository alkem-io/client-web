import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { compact } from 'lodash';
import {
  useSpaceCommunityGuidelinesTemplatesLibraryLazyQuery,
  usePlatformCommunityGuidelinesTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import CommunityGuidelinesTemplatePreview from './CommunityGuidelinesTemplatePreview';
import { TemplateWithInnovationPack } from '../../_new/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialogGallery';
import { Identifiable } from '../../../../core/utils/Identifiable';
import CommunityGuidelinesConfirmationDialog from './CommunityGuidelinesConfirmationDialog';
import { TemplateBase } from '../CollaborationTemplatesLibrary/TemplateBase';
import CollaborationTemplatesLibrary from '../CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import { CommunityGuidelinesTemplate } from '../../_new/models/CommunityGuidelinesTemplate';
import CommunityGuidelinesTemplateCard from '../../_new/components/cards/CommunityGuidelinesTemplateCard';

export interface CommunityGuidelinesTemplatesLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CommunityGuidelinesTemplate) => void;
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
        spaceData?.space.library?.communityGuidelinesTemplates.map(template => ({
          ...template,
          innovationPack: {
            profile: { displayName: '' },
            provider: spaceData?.space.provider,
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
    template: CommunityGuidelinesTemplate & Identifiable
  ): Promise<CommunityGuidelinesTemplate & Identifiable> => {
    return Promise.resolve(template);
  };

  return (
    <CollaborationTemplatesLibrary
      open={open}
      onClose={onClose}
      dialogTitle={t('templateLibrary.communityGuidelinesTemplates.title')}
      onImportTemplate={onSelectTemplate}
      templateCardComponent={CommunityGuidelinesTemplateCard}
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
      confirmationDialog={CommunityGuidelinesConfirmationDialog}
    />
  );
};

export default CommunityGuidelinesTemplatesLibrary;
