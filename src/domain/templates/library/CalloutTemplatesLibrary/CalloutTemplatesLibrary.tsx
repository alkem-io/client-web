import { compact } from 'lodash';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { TemplateWithInnovationPack } from '../../_new/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialogGallery';
import {
  usePlatformCalloutTemplatesLibraryLazyQuery,
  useSpaceCalloutTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { TemplateBase } from '../CollaborationTemplatesLibrary/TemplateBase';
import CollaborationTemplatesLibraryButton from '../CollaborationTemplatesLibrary/CollaborationTemplatesLibraryButton';
import CollaborationTemplatesLibrary from '../CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import CalloutTemplateCard, { CalloutTemplate } from '../../_new/components/cards/CalloutTemplateCard';
import CalloutTemplatePreview from '../../_new/components/Previews/CalloutTemplatePreview';

export interface CalloutTemplatesLibraryProps {
  onImportTemplate: (template: Identifiable) => void;
}

const applyFilter = <T extends TemplateWithInnovationPack<TemplateBase>>(
  filter: string[],
  templates: T[] | undefined
) => {
  if (filter.length === 0) {
    return templates;
  }
  return templates?.filter(callout => {
    const calloutString =
      `${callout.profile.displayName} ${callout.innovationPack?.provider?.profile.displayName} ${callout.innovationPack?.profile.displayName}`.toLowerCase();
    return filter.some(term => calloutString.includes(term.toLowerCase()));
  });
};

const CalloutTemplatesLibrary: FC<CalloutTemplatesLibraryProps> = ({ onImportTemplate }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { spaceNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Space Templates:
  const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
    useSpaceCalloutTemplatesLibraryLazyQuery({
      variables: {
        spaceNameId: spaceNameId!,
      },
    });

  const templatesFromSpace = useMemo(
    () =>
      applyFilter(
        filter,
        spaceData?.space.library?.calloutTemplates.map(template => ({
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
    usePlatformCalloutTemplatesLibraryLazyQuery();

  const templatesFromPlatform = useMemo(
    () =>
      applyFilter(
        filter,
        platformData?.platform.library.innovationPacks.flatMap(ip =>
          compact(
            ip.templates?.calloutTemplates.map(template => ({
              ...template,
              innovationPack: ip,
            }))
          )
        )
      ),
    [platformData]
  );

  return (
    <>
      <CollaborationTemplatesLibraryButton
        size="large"
        startIcon={<TipsAndUpdatesOutlinedIcon />}
        variant="outlined"
        sx={{ textTransform: 'none', justifyContent: 'start' }}
        onClick={() => setIsOpen(true)}
      >
        {t('components.calloutTypeSelect.callout-templates-library')}
      </CollaborationTemplatesLibraryButton>
      <CollaborationTemplatesLibrary<CalloutTemplate, Identifiable, Identifiable>
        open={isOpen}
        onClose={() => setIsOpen(false)}
        dialogTitle={t('templateLibrary.calloutTemplates.title')}
        onImportTemplate={onImportTemplate}
        templateCardComponent={CalloutTemplateCard}
        templatePreviewComponent={CalloutTemplatePreview}
        filter={filter}
        onFilterChange={setFilter}
        fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
        fetchTemplatesFromSpace={fetchTemplatesFromSpace}
        templatesFromSpace={templatesFromSpace}
        loadingTemplatesFromSpace={loadingTemplatesFromSpace}
        fetchTemplatesFromPlatform={fetchPlatformTemplates}
        templatesFromPlatform={templatesFromPlatform}
        loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
      />
    </>
  );
};

export default CalloutTemplatesLibrary;
