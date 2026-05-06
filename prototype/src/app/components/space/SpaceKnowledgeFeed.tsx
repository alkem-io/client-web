import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { PostCard, PostProps } from "./PostCard";
import { AddPostModal } from "@/app/components/space/AddPostModal";
import { PostDetailDialog } from "@/app/components/dialogs/PostDetailDialog";

// Whiteboard / visual preview images
const wb1 = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1080";

export function SpaceKnowledgeFeed() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostProps | null>(null);

  const posts: PostProps[] = [
    {
      id: "kb-1",
      type: "collection",
      author: {
        name: "Elena Rodriguez",
        role: "Policy Expert",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Transition Case Studies & Policy Docs",
      snippet: "A collection of successful case studies from similarly sized municipalities that reached 100% renewables. Essential reading for the strategy team — includes both final reports and interim analyses.",
      timestamp: "1 day ago",
      contentPreview: {
        items: [
          { title: "Burlington, VT Case Study", type: "pdf" },
          { title: "Aspen, CO Transition Plan", type: "pdf" },
          { title: "Grid Integration Analysis", type: "doc" },
          { title: "2030 Policy Framework", type: "pdf" }
        ]
      },
      stats: { likes: 42, comments: 12 }
    },
    {
      id: "kb-2",
      type: "collection",
      author: {
        name: "Sarah Chen",
        role: "Facilitator",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Q1 Sustainability Report & Supporting Data",
      snippet: "Comprehensive report covering environmental impact metrics and sustainability goals for Q1 2026. Attached are the raw data spreadsheets and the executive summary for stakeholder review.",
      timestamp: "3 days ago",
      contentPreview: {
        items: [
          { title: "Q1 Sustainability Report", type: "pdf" },
          { title: "Impact Metrics Spreadsheet", type: "doc" },
          { title: "Executive Summary", type: "pdf" }
        ]
      },
      stats: { likes: 31, comments: 8 }
    },
    {
      id: "kb-3",
      type: "text",
      author: {
        name: "James Wilson",
        role: "Community Lead",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Community Workshop Guidelines",
      snippet: "Best practices and facilitation guide for running effective community engagement workshops. Covers preparation checklists, participant engagement techniques, and post-workshop follow-up templates. Please add comments if you have suggestions from your own experience.",
      timestamp: "2 weeks ago",
      stats: { likes: 19, comments: 14 }
    },
    {
      id: "kb-4",
      type: "collection",
      author: {
        name: "David Miller",
        role: "Energy Analyst",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Grid Modernisation Reference Materials",
      snippet: "Key reference documents for the grid modernisation workstream. Includes technical specifications, vendor comparisons, and regulatory compliance checklists.",
      timestamp: "3 weeks ago",
      contentPreview: {
        items: [
          { title: "Smart Meter Technical Spec", type: "pdf" },
          { title: "Vendor Comparison Matrix", type: "doc" },
          { title: "Regulatory Compliance Checklist", type: "pdf" },
          { title: "Installation Timeline", type: "doc" }
        ]
      },
      stats: { likes: 24, comments: 7 }
    },
    {
      id: "kb-5",
      type: "text",
      author: {
        name: "Alex Contributor",
        role: "City Planner",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Funding Opportunities for Municipal Energy Projects",
      snippet: "Overview of available federal and state grants for renewable energy transitions. Deadline for the DOE Community Power Accelerator is March 15 — I've summarised the eligibility criteria and application process below.",
      timestamp: "1 month ago",
      stats: { likes: 36, comments: 11 }
    },
    {
      id: "kb-6",
      type: "collection",
      author: {
        name: "Michael Chang",
        role: "Researcher",
        avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Stakeholder Meeting Notes & Action Items",
      snippet: "Summary and action items from the quarterly stakeholder alignment meeting. Includes recorded decisions, assigned owners, and deadline tracker.",
      timestamp: "1 month ago",
      contentPreview: {
        items: [
          { title: "Meeting Minutes — Q4 Review", type: "doc" },
          { title: "Action Item Tracker", type: "doc" },
          { title: "Stakeholder Contact List", type: "pdf" }
        ]
      },
      stats: { likes: 22, comments: 5 }
    }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 600,
            color: "var(--foreground)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Knowledge Base
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

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} id={post.id}>
            <PostCard
              post={{
                ...post,
                onClick: () => setSelectedPost(post),
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" className="w-full sm:w-auto">
          Show More
        </Button>
      </div>

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