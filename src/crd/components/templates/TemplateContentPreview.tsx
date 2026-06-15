import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
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
    // Plain max-height + overflow-y-auto (NOT Radix ScrollArea): the ScrollArea
    // Root only had a max-height (not a definite height) + no overflow clip, so
    // its height:100% Viewport resolved to auto and tall content (subspace cards)
    // spilled out of the box instead of scrolling. Native scroll contains it.
    <div className={cn('max-h-[60vh] overflow-y-auto pr-3', className)}>
      <PreviewBody content={content} />
    </div>
  );
}
