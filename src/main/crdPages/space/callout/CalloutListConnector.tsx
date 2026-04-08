import type { PostCardData } from '@/crd/components/space/PostCard';
import { SpaceFeed } from '@/crd/components/space/SpaceFeed';

type CalloutListConnectorProps = {
  title?: string;
  posts: PostCardData[];
  canCreate?: boolean;
  loading?: boolean;
  onCreateClick?: () => void;
};

export function CalloutListConnector({ title, posts, canCreate, loading, onCreateClick }: CalloutListConnectorProps) {
  return (
    <SpaceFeed title={title} posts={posts} canCreate={canCreate} onCreateClick={onCreateClick} loading={loading} />
  );
}
