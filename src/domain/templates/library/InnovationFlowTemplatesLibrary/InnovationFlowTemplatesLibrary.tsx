import { compact } from 'lodash';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  usePlatformInnovationFlowTemplatesLibraryLazyQuery,
  useSpaceInnovationFlowTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import InnovationFlowTemplateCard, {
  InnovationFlowTemplate,
} from '../../_new/components/cards/InnovationFlowTemplateCard';
import InnovationFlowTemplatePreview from './InnovationFlowTemplatePreview';
import { Autorenew } from '@mui/icons-material';
import { TemplateWithInnovationPack } from '../../_new/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialogGallery';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { TemplateBase } from '../CollaborationTemplatesLibrary/TemplateBase';
import CollaborationTemplatesLibraryButton from '../CollaborationTemplatesLibrary/CollaborationTemplatesLibraryButton';
import CollaborationTemplatesLibrary from '../CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';

export interface InnovationFlowTemplatesLibraryProps {
  onImportTemplate: (template: Identifiable) => void;
  disabled?: boolean;
}

const filterByText = (filter: string[]) => {
  if (filter.length === 0) {
    return () => true;
  }
  return (template: TemplateWithInnovationPack<TemplateBase>) => {
    const terms = filter.map(term => term.toLowerCase());
    const templateString =
      `${template.profile.displayName} ${template.innovationPack?.provider?.profile.displayName} ${template.innovationPack?.profile.displayName}`.toLowerCase();
    return terms.some(term => templateString.includes(term));
  };
};

const InnovationFlowTemplatesLibrary: FC<InnovationFlowTemplatesLibraryProps> = ({ onImportTemplate, disabled }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { spaceNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Space Templates:
  const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
    useSpaceInnovationFlowTemplatesLibraryLazyQuery({
      variables: {
        spaceNameId: spaceNameId!,
      },
    });

  const templatesFromSpace = useMemo(
    () =>
      spaceData?.space.library?.innovationFlowTemplates
        .map(template => ({
          ...template,
          innovationPack: {
            // TODO Introduce subtype with optional profile
            profile: {
              displayName: '',
            },
            provider: spaceData?.space.provider,
          },
        }))
        .filter(filterByText(filter)),
    [spaceData, filter]
  );

  // Platform Templates:
  const [fetchPlatformTemplates, { data: platformData, loading: loadingTemplatesFromPlatform }] =
    usePlatformInnovationFlowTemplatesLibraryLazyQuery();

  const templatesFromPlatform = useMemo(
    () =>
      platformData?.platform.library.innovationPacks
        .flatMap(ip =>
          compact(
            ip.templates?.innovationFlowTemplates.map(template => ({
              ...template,
              innovationPack: ip,
            }))
          )
        )
        .filter(filterByText(filter)),
    [platformData, filter]
  );

  // InnovationFlow templates includes the states, so no need to go to the server and fetch like we do with Whiteboards
  const getInnovationFlowTemplateData = (
    template: InnovationFlowTemplate & Identifiable
  ): Promise<InnovationFlowTemplate & Identifiable> => {
    return Promise.resolve(template); // Just resolve it as it is
  };

  return (
    <>
      <CollaborationTemplatesLibraryButton
        variant="text"
        disabled={disabled}
        startIcon={<Autorenew />}
        onClick={() => setIsOpen(true)}
      >
        {t('components.innovationFlowTemplateSelect.select')}
      </CollaborationTemplatesLibraryButton>
      <CollaborationTemplatesLibrary<InnovationFlowTemplate, Identifiable, Identifiable>
        open={isOpen}
        onClose={() => setIsOpen(false)}
        dialogTitle={t('templateLibrary.innovationFlowTemplates.title')}
        onImportTemplate={onImportTemplate}
        templateCardComponent={InnovationFlowTemplateCard}
        templatePreviewComponent={InnovationFlowTemplatePreview}
        filter={filter}
        onFilterChange={setFilter}
        fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
        fetchTemplatesFromSpace={fetchTemplatesFromSpace}
        getTemplateWithContent={getInnovationFlowTemplateData}
        templatesFromSpace={templatesFromSpace}
        loadingTemplatesFromSpace={loadingTemplatesFromSpace}
        fetchTemplatesFromPlatform={fetchPlatformTemplates}
        templatesFromPlatform={templatesFromPlatform}
        loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
        disableUsePlatformTemplates
      />
    </>
  );
};

export default InnovationFlowTemplatesLibrary;
