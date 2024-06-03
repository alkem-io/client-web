import { useCalloutTemplatePreviewQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { Identifiable } from '../../../../core/utils/Identifiable';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import WhiteboardPreview from '../../whiteboard/whiteboardPreview/WhiteboardPreview';

interface CalloutTemplatePreviewProps {
  template?: Identifiable;
}

const CalloutTemplatePreview = ({ template }: CalloutTemplatePreviewProps) => {
  const { data } = useCalloutTemplatePreviewQuery({
    variables: {
      calloutTemplateId: template?.id!,
    },
    skip: !template?.id,
  });

  if (!data?.lookup.calloutTemplate) {
    return null;
  }

  const { framing } = data.lookup.calloutTemplate;

  const { whiteboard } = data.lookup.calloutTemplate.framing;

  return (
    <PageContentBlock>
      <BlockSectionTitle>{framing.profile.displayName}</BlockSectionTitle>
      <WrapperMarkdown>{framing.profile.description ?? ''}</WrapperMarkdown>
      <TagsComponent tags={framing.profile.tagset?.tags ?? []} />
      {whiteboard && <WhiteboardPreview whiteboard={whiteboard} displayName={framing.profile.displayName} />}
    </PageContentBlock>
  );
};

export default CalloutTemplatePreview;
