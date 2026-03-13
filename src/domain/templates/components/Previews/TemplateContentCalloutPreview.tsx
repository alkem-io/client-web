import PageContentBlock from '@/core/ui/content/PageContentBlock';
import MediaGalleryPreview from '@/core/ui/gallery/MediaGalleryPreview';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { BlockSectionTitle } from '@/core/ui/typography';
import MemoPreview from '@/domain/collaboration/memo/MemoPreview/MemoPreview';
import WhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/WhiteboardPreview';
import type { ReferenceModel } from '@/domain/common/reference/ReferenceModel';
import type { TagsetModel } from '@/domain/common/tagset/TagsetModel';
import { findDefaultTagset } from '@/domain/common/tagset/TagsetUtils';
import References from '@/domain/shared/components/References/References';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';

interface TemplateContentCalloutPreviewProps {
  template?: {
    callout?: {
      framing: {
        profile: {
          displayName: string;
          description?: string;
          tagsets?: TagsetModel[];
          tagset?: TagsetModel;
          references?: ReferenceModel[];
        };
        whiteboard?: {
          profile: {
            preview?: {
              uri: string;
            };
          };
        };
        memo?: {
          markdown?: string;
        };
        mediaGallery?: {
          visuals?: {
            id: string;
            uri: string;
            alternateText?: string;
          }[];
        };
      };
    };
  };
}

const TemplateContentCalloutPreview = ({ template }: TemplateContentCalloutPreviewProps) => {
  const framing = template?.callout?.framing;
  const whiteboard = template?.callout?.framing.whiteboard;
  const memo = template?.callout?.framing.memo;
  const mediaGallery = template?.callout?.framing.mediaGallery;
  const references = framing?.profile.references;

  return (
    <PageContentBlock>
      <BlockSectionTitle>{framing?.profile.displayName}</BlockSectionTitle>
      <WrapperMarkdown>{framing?.profile.description ?? ''}</WrapperMarkdown>
      <TagsComponent tags={findDefaultTagset(framing?.profile.tagsets)?.tags ?? framing?.profile.tagset?.tags ?? []} />
      {references && references.length > 0 && <References compact={true} references={references} />}
      {whiteboard && <WhiteboardPreview whiteboard={whiteboard} displayName={framing?.profile.displayName} />}
      {mediaGallery && <MediaGalleryPreview visuals={mediaGallery.visuals} />}
      {memo && <MemoPreview memo={memo} displayName={framing?.profile.displayName} />}
    </PageContentBlock>
  );
};

export default TemplateContentCalloutPreview;
