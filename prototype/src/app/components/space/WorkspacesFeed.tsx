import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { PostCard, PostProps } from "./PostCard";
import { AddPostModal } from "@/app/components/space/AddPostModal";
import { PostDetailDialog } from "@/app/components/dialogs/PostDetailDialog";

const WORKSPACES_POSTS: PostProps[] = [
  {
    id: "ws-1",
    type: "text",
    author: {
      name: "David Kim",
      role: "Lead",
      avatarUrl:
        "https://images.unsplash.com/photo-1723537742563-15c3d351dbf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMGJ1c2luZXNzfGVufDF8fHx8MTc3MjExNTEzMHww&ixlib=rb-4.1.0&q=80&w=256",
    },
    title: "Subspace updates: Q1 progress across all workstreams",
    snippet:
      "Quick recap of where each subspace stands heading into March. The Mobility Hub has finalized its stakeholder interviews, Circular Economy is preparing their pilot proposal, and the Energy Transition subspace just onboarded three new contributors. Please check in with your respective leads if you have deliverables due this sprint.",
    timestamp: "5 hours ago",
    stats: { likes: 24, comments: 9 },
  },
  {
    id: "ws-2",
    type: "call-for-whiteboards",
    author: {
      name: "Sophia Li",
      role: "Admin",
      avatarUrl:
        "https://images.unsplash.com/photo-1758599543113-3de73604e916?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGN1cmx5JTIwaGFpciUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjExNTEzMHww&ixlib=rb-4.1.0&q=80&w=256",
    },
    title: "Proposal: new subspace for Digital Infrastructure",
    snippet:
      "Several members have expressed interest in a dedicated subspace for digital infrastructure challenges — covering topics like open data platforms, smart-city APIs, and interoperability standards. Before we create it, I'd like to gather feedback on scope and initial leads. Drop your thoughts below or add to the whiteboard.",
    timestamp: "2 days ago",
    contentPreview: {
      whiteboards: [
        {
          title: "Digital Infra Scope",
          imageUrl:
            "https://images.unsplash.com/photo-1542744094-24638eff58bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsYWJvcmF0aXZlJTIwd2hpdGVib2FyZCUyMGJyYWluc3Rvcm0lMjBzdHJhdGVneXxlbnwxfHx8fDE3NzIxMTUxMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
          author: "Sophia Li",
        },
        {
          title: "Roadmap Draft",
          imageUrl:
            "https://images.unsplash.com/photo-1676276374782-39159bc5e7b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0JTIwcm9hZG1hcCUyMHRpbWVsaW5lJTIwcGxhbm5pbmd8ZW58MXx8fHwxNzcyMTE1MTMxfDA&ixlib=rb-4.1.0&q=80&w=1080",
          author: "David Kim",
        },
      ],
    },
    stats: { likes: 37, comments: 16 },
  },
];

export function WorkspacesFeed() {
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
            fontFamily: "var(--font-family, 'Inter', sans-serif)",
          }}
        >
          Workspace Posts
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
        {WORKSPACES_POSTS.map((post) => (
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
