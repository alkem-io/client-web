import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { PostCard, PostProps } from "./PostCard";
import { AddPostModal } from "@/app/components/space/AddPostModal";
import { PostDetailDialog } from "@/app/components/dialogs/PostDetailDialog";

const COMMUNITY_POSTS: PostProps[] = [
  {
    id: "community-1",
    type: "text",
    author: {
      name: "Elena Martinez",
      role: "Host",
      avatarUrl:
        "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256",
    },
    title: "Welcome new members & organizations!",
    snippet:
      "We're thrilled to welcome Green Future Labs and the Sustainable Cities Fund to the space this month. Together with our 29 members, we now have four organizations actively contributing to the transition strategy. If you're new, please introduce yourself below — we'd love to hear about your background and what you hope to contribute!",
    timestamp: "3 hours ago",
    stats: { likes: 18, comments: 7 },
  },
  {
    id: "community-2",
    type: "call-for-whiteboards",
    author: {
      name: "Maya Ross",
      role: "Lead",
      avatarUrl:
        "https://images.unsplash.com/photo-1589332911105-a6b59f2e4c4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256",
    },
    title: "Call for Volunteers: Community Engagement Working Group",
    snippet:
      "We're forming a working group to design our community engagement strategy for Q3. We need volunteers with experience in stakeholder outreach, workshop facilitation, or public communication. Comment below if you'd like to join — we'll kick off with an introductory call next week.",
    timestamp: "1 day ago",
    contentPreview: {
      whiteboards: [
        {
          title: "Engagement Framework",
          imageUrl:
            "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1080",
          author: "Maya Ross",
        },
        {
          title: "Stakeholder Map",
          imageUrl:
            "https://images.unsplash.com/photo-1574359219611-a3031f074b2c?auto=format&fit=crop&q=80&w=1080",
          author: "David Kim",
        },
      ],
    },
    stats: { likes: 31, comments: 14 },
  },
];

export function CommunityFeed() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostProps | null>(null);

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            color: "var(--foreground)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Community Posts
        </h2>
        <Button
          size="sm"
          className="gap-2 shadow-sm"
          onClick={() => setIsPostModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Post
        </Button>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {COMMUNITY_POSTS.map((post) => (
          <PostCard
            key={post.id}
            post={{
              ...post,
              onClick: () => setSelectedPost(post),
            }}
          />
        ))}
      </div>

      {/* Modals */}
      <AddPostModal
        open={isPostModalOpen}
        onOpenChange={setIsPostModalOpen}
      />
      <PostDetailDialog
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
        post={selectedPost}
      />
    </div>
  );
}
