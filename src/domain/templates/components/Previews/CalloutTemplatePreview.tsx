import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockSectionTitle } from '@/core/ui/typography';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import WhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/WhiteboardPreview';
import { findDefaultTagset } from '@/domain/common/tags/utils';
import { Tagset } from '@/domain/common/profile/Profile';

interface CalloutTemplatePreviewProps {
  template?: {
    callout?: {
      framing: {
        profile: {
          displayName: string;
          description?: string;
          tagsets?: Tagset[];
        };
        whiteboard?: {
          profile: {
            preview?: {
              uri: string;
            };
          };
        };
      };
    };
  };
}

const CalloutTemplatePreview = ({ template }: CalloutTemplatePreviewProps) => {
  const framing = template?.callout?.framing;
  const whiteboard = template?.callout?.framing.whiteboard;

  return (
    <PageContentBlock>
      <BlockSectionTitle>{framing?.profile.displayName}</BlockSectionTitle>
      <WrapperMarkdown>{framing?.profile.description ?? ''}</WrapperMarkdown>
      <TagsComponent tags={findDefaultTagset(framing?.profile.tagsets)?.tags ?? []} />
      {whiteboard && <WhiteboardPreview whiteboard={whiteboard} displayName={framing?.profile.displayName} />}
    </PageContentBlock>
  );
};

export default CalloutTemplatePreview;
