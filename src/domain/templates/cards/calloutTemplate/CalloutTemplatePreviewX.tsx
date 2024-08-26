import { useCalloutTemplatePreviewQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { Identifiable } from '../../../../core/utils/Identifiable';
import WhiteboardPreview from '../../../collaboration/whiteboard/whiteboardPreview/WhiteboardPreview';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';

interface CalloutTemplatePreviewPropsX {
  template?: Identifiable;
}

const CalloutTemplatePreviewX = ({ template }: CalloutTemplatePreviewPropsX) => {
  const { data } = useCalloutTemplatePreviewQuery({
    variables: {
      calloutTemplateId: template?.id!,
    },
    skip: !template?.id,
  });

  if (!data?.lookup.template || !data.lookup.template.callout) {
    return null;
  }
  const callout = data.lookup.template.callout;

  const { framing } = callout;

  const { whiteboard } = callout.framing;

  return (
    <PageContentBlock>
      <BlockSectionTitle>{framing.profile.displayName}</BlockSectionTitle>
      <WrapperMarkdown>{framing.profile.description ?? ''}</WrapperMarkdown>
      <TagsComponent tags={framing.profile.tagset?.tags ?? []} />
      {whiteboard && <WhiteboardPreview whiteboard={whiteboard} displayName={framing.profile.displayName} />}
    </PageContentBlock>
  );
};

export default CalloutTemplatePreviewX;
