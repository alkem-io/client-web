import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { BlockSectionTitle } from '@/core/ui/typography';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import WhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/WhiteboardPreview';
import { findDefaultTagset } from '@/domain/common/tagset/TagsetUtils';
import { TagsetModel } from '@/domain/common/tagset/TagsetModel';

interface TemplateContentCalloutPreviewProps {
  template?: {
    callout?: {
      framing: {
        profile: {
          displayName: string;
          description?: string;
          tagsets?: TagsetModel[];
          tagset?: TagsetModel;
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

const TemplateContentCalloutPreview = ({ template }: TemplateContentCalloutPreviewProps) => {
  const framing = template?.callout?.framing;
  const whiteboard = template?.callout?.framing.whiteboard;

  return (
    <PageContentBlock>
      <BlockSectionTitle>{framing?.profile.displayName}</BlockSectionTitle>
      <WrapperMarkdown>{framing?.profile.description ?? ''}</WrapperMarkdown>
      <TagsComponent tags={findDefaultTagset(framing?.profile.tagsets)?.tags ?? framing?.profile.tagset?.tags ?? []} />
      {whiteboard && <WhiteboardPreview whiteboard={whiteboard} displayName={framing?.profile.displayName} />}
    </PageContentBlock>
  );
};

export default TemplateContentCalloutPreview;
