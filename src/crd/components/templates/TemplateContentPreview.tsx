import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { ScrollArea } from '@/crd/primitives/scroll-area';
import { Skeleton } from '@/crd/primitives/skeleton';
import { CalloutTemplatePreview } from './preview/CalloutTemplatePreview';
import { CommunityGuidelinesTemplatePreview } from './preview/CommunityGuidelinesTemplatePreview';
import { PostTemplatePreview } from './preview/PostTemplatePreview';
import { SpaceTemplatePreview } from './preview/SpaceTemplatePreview';
import { WhiteboardTemplatePreview } from './preview/WhiteboardTemplatePreview';
import type { TemplateContentPreviewProps } from './types';

function PreviewBody({ content }: { content: TemplateContentPreviewProps['content'] }) {
  switch (content.type) {
    case 'callout':
      return <CalloutTemplatePreview content={content} />;
    case 'whiteboard':
      return <WhiteboardTemplatePreview content={content} />;
    case 'post':
      return <PostTemplatePreview content={content} />;
    case 'space':
      return <SpaceTemplatePreview content={content} />;
    case 'communityGuidelines':
      return <CommunityGuidelinesTemplatePreview content={content} />;
  }
}

export function TemplateContentPreview({ content, loading, className }: TemplateContentPreviewProps) {
  const { t } = useTranslation('crd-templates');

  if (loading) {
    return (
      <output aria-label={t('preview.loading')} className={cn('block space-y-3', className)}>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </output>
    );
  }

  return (
    <ScrollArea className={cn('max-h-[60vh] pr-3', className)}>
      <PreviewBody content={content} />
    </ScrollArea>
  );
}
