import { useCalloutTemplatePreviewQuery } from '../../../core/apollo/generated/apollo-hooks';
import { Identifiable } from '../../../core/utils/Identifiable';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import { BlockTitle } from '../../../core/ui/typography';
import WrapperMarkdown from '../../../core/ui/markdown/WrapperMarkdown';
import TagsComponent from '../../shared/components/TagsComponent/TagsComponent';
import WhiteboardPreview from '../../collaboration/whiteboard/whiteboardPreview/WhiteboardPreview';

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

  return (
    <PageContentBlock>
      <BlockTitle>{framing.profile.displayName}</BlockTitle>
      <WrapperMarkdown>{framing.profile.description ?? ''}</WrapperMarkdown>
      <TagsComponent tags={framing.profile.tagset?.tags ?? []} />
      <WhiteboardPreview frameable={data.lookup.calloutTemplate} />
    </PageContentBlock>
  );
};

export default CalloutTemplatePreview;
