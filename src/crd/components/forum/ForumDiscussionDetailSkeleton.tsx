import { Card, CardContent, CardHeader } from '@/crd/primitives/card';
import { Separator } from '@/crd/primitives/separator';
import { Skeleton } from '@/crd/primitives/skeleton';

type ForumDiscussionDetailSkeletonProps = {
  loadingLabel: string;
};

export function ForumDiscussionDetailSkeleton({ loadingLabel }: ForumDiscussionDetailSkeletonProps) {
  return (
    <output aria-label={loadingLabel} className="flex flex-col gap-4">
      <Skeleton className="h-4 w-40" />
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="px-6 pb-0 pt-6">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="mb-5 flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="mb-6 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Separator />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    </output>
  );
}
