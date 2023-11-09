import { compact } from 'lodash';
import { ComponentType, FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CollaborationTemplatesLibrary from '../../templates/CollaborationTemplatesLibrary/CollaborationTemplatesLibrary';
import CalloutTemplateCard from '../../../template/calloutTemplate/CalloutTemplateCard';
import { TemplateBase, TemplateCardBaseProps } from '../../templates/CollaborationTemplatesLibrary/TemplateBase';
import CalloutTemplatePreview from '../../../template/calloutTemplate/CalloutTemplatePreview';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import { TemplateWithInnovationPack } from '../../../platform/admin/templates/InnovationPacks/ImportTemplatesDialogGalleryStep';
import {
  useCalloutTemplateContentLazyQuery,
  usePlatformCalloutTemplatesLibraryLazyQuery,
  useSpaceCalloutTemplatesLibraryLazyQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { Reference, Tagset } from '../../../common/profile/Profile';
import { CalloutType } from '../../../../core/apollo/generated/graphql-schema';
import { WhiteboardWithContent } from '../../whiteboard/containers/WhiteboardContentContainer';
import { WhiteboardRtWithContent } from '../../whiteboard/containers/WhiteboardRtContentContainer';

export interface CalloutTemplateWithValues extends TemplateBase {
  type: CalloutType;
  framing: {
    profile: {
      displayName: string;
      description?: string;
      tagset?: Tagset;
      references?: Reference[];
    };
    whiteboard?: WhiteboardWithContent;
    whiteboardRt?: WhiteboardRtWithContent;
  };
  contributionDefaults?: {
    postDescription?: string;
    whiteboardContent?: string;
  };
}

export interface CalloutTemplatesLibraryProps {
  onImportTemplate: (template: CalloutTemplateWithValues) => void;
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
  const { spaceNameId } = useUrlParams();
  const [filter, setFilter] = useState<string[]>([]);

  // Space Templates:
  const [fetchTemplatesFromSpace, { data: spaceData, loading: loadingTemplatesFromSpace }] =
    useSpaceCalloutTemplatesLibraryLazyQuery({
      variables: {
        spaceId: spaceNameId!,
      },
    });

  const templatesFromSpace = useMemo(
    () =>
      applyFilter(
        filter,
        spaceData?.space.templates?.calloutTemplates.map(template => ({
          ...template,
          innovationPack: {
            profile: { displayName: '' },
            provider: spaceData?.space.host,
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

  const [fetchCalloutTemplateContent, { loading: loadingCalloutTemplateContent }] =
    useCalloutTemplateContentLazyQuery();

  // Post templates include the value (defaultDescription and type), so no need to go to the server and fetch like with Whiteboards
  const getCalloutTemplateContent = useCallback(async (template: TemplateBase & Identifiable) => {
    const { data } = await fetchCalloutTemplateContent({
      variables: {
        calloutTemplateId: template.id,
      },
    });

    return data?.lookup.calloutTemplate;
  }, []);

  return (
    <CollaborationTemplatesLibrary<TemplateBase, CalloutTemplateWithValues, Identifiable>
      dialogTitle={t('templateLibrary.calloutTemplates.title')}
      onImportTemplate={onImportTemplate}
      templateCardComponent={CalloutTemplateCard as ComponentType<TemplateCardBaseProps<TemplateBase>>}
      templatePreviewComponent={CalloutTemplatePreview}
      filter={filter}
      onFilterChange={setFilter}
      fetchSpaceTemplatesOnLoad={Boolean(spaceNameId)}
      fetchTemplatesFromSpace={fetchTemplatesFromSpace}
      templatesFromSpace={templatesFromSpace}
      loadingTemplatesFromSpace={loadingTemplatesFromSpace}
      loadingTemplateContent={loadingCalloutTemplateContent}
      getTemplateWithContent={getCalloutTemplateContent}
      fetchTemplatesFromPlatform={fetchPlatformTemplates}
      templatesFromPlatform={templatesFromPlatform}
      loadingTemplatesFromPlatform={loadingTemplatesFromPlatform}
      buttonProps={{
        size: 'large',
        startIcon: <TipsAndUpdatesOutlinedIcon />,
        variant: 'outlined',
        sx: { textTransform: 'none', justifyContent: 'start' },
        children: <>{t('components.calloutTypeSelect.callout-templates-library' as const)}</>,
      }}
    />
  );
};

export default CalloutTemplatesLibrary;
