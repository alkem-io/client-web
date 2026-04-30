import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { PostCard, PostProps } from "./PostCard";
import { AddPostModal } from "@/app/components/space/AddPostModal";
import { PostDetailDialog } from "@/app/components/dialogs/PostDetailDialog";

// Whiteboard Preview Images (using Unsplash to avoid module loading errors)
const wb1 = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1080";
const wb2 = "https://images.unsplash.com/photo-1574359219611-a3031f074b2c?auto=format&fit=crop&q=80&w=1080";
const wb3 = "https://images.unsplash.com/photo-1578401058525-35aaec0b4658?auto=format&fit=crop&q=80&w=1080";
const wb4 = "https://images.unsplash.com/photo-1596496050844-3613acf57a8e?auto=format&fit=crop&q=80&w=1080";

export function SpaceFeed() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostProps | null>(null);

  const posts: PostProps[] = [
    {
      id: "1",
      type: "text",
      author: {
        name: "Sarah Chen",
        role: "Lead",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Kickoff: Municipal Transition Strategy",
      snippet: "We are officially launching the strategy phase for the 2030 renewable transition. Our goal is to outline a clear path for municipalities to reach 100% renewable energy. Please review the initial policy draft in the 'Policy Drafts' channel.",
      timestamp: "2 hours ago",
      stats: { comments: 5 }
    },
    {
      id: "4",
      type: "call-for-whiteboards",
      author: {
        name: "Alex Contributor",
        role: "Member",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Call for Ideas: Community Solar Projects",
      snippet: "We need innovative concepts for integrating solar into existing municipal infrastructure. Please sketch out your ideas for public buildings, parking lots, and open spaces.",
      timestamp: "3 hours ago",
      contentPreview: {
        whiteboards: [
            { title: "Public Library Solar Roof", imageUrl: wb1, author: "Sarah Chen" },
            { title: "Parking Lot Canopies", imageUrl: wb2, author: "David Miller" },
            { title: "School Microgrids", imageUrl: wb3, author: "Elena Rodriguez" },
            { title: "Bus Stop Solar Stations", imageUrl: wb4, author: "Marc Johnson" },
            { title: "Town Hall Retrofit", imageUrl: wb1, author: "John Smith" },
            { title: "Park Lighting", imageUrl: wb2, author: "Emily Davis" }
        ]
      },
      stats: { comments: 8 }
    },
    {
      id: "2",
      type: "document",
      author: {
        name: "David Miller",
        role: "Member",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "2030 Renewable Transition Policy Proposal",
      snippet: "The latest draft of our comprehensive policy proposal is ready for review. It covers the full strategic framework including grid modernization, community solar, building electrification, and fleet conversion — with updated budget projections and implementation timeline.",
      timestamp: "4 hours ago",
      contentPreview: {
        documents: [
          { title: "2030 Renewable Transition Policy Proposal.docx", docType: "word", size: "1.8 MB", lastEdited: "2 hours ago" }
        ],
        documentDisplayMode: 'scroll'
      },
      stats: { comments: 6 }
    },
    {
      id: "5",
      type: "whiteboard",
      author: {
        name: "David Miller",
        role: "Member",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Brainstorming: Municipal Infrastructure Upgrades",
      snippet: "Outputs from our session on grid modernization. Key clusters include smart metering, battery storage integration, and EV charging networks.",
      timestamp: "5 hours ago",
      contentPreview: {
        imageUrl: wb3
      },
      stats: { comments: 3 }
    },
    {
      id: "3",
      type: "document",
      author: {
        name: "Elena Rodriguez",
        role: "Lead",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "2030 Renewable Transition — Working Documents",
      snippet: "Sharing the latest drafts for the transition strategy. The policy proposal has been updated with feedback from last week's stakeholder session, and the budget model now includes the revised subsidy figures.",
      timestamp: "1 day ago",
      contentPreview: {
        documents: [
          { title: "2030 Renewable Transition Policy Proposal.docx", docType: "word", size: "1.8 MB", lastEdited: "6 hours ago" },
          { title: "Municipal Budget Model FY2027–2030.xlsx", docType: "spreadsheet", size: "3.1 MB", lastEdited: "1 day ago" },
          { title: "Stakeholder Presentation — April Update.pptx", docType: "presentation", size: "12.4 MB", lastEdited: "2 days ago" }
        ],
        documentDisplayMode: 'paginated'
      },
      stats: { comments: 9 }
    },
    {
      id: "6",
      type: "collection",
      author: {
        name: "Elena Rodriguez",
        role: "Lead",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Transition Case Studies & Policy Docs",
      snippet: "A collection of successful case studies from similar sized municipalities reaching 100% renewables. Essential reading for the strategy team.",
      timestamp: "1 day ago",
      contentPreview: {
        items: [
          { title: "Burlington, VT Case Study", type: "pdf" },
          { title: "Aspen, CO Transition Plan", type: "pdf" },
          { title: "Grid Integration Analysis", type: "doc" },
          { title: "2030 Policy Framework", type: "pdf" }
        ]
      },
      stats: { comments: 12 }
    }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--muted-foreground)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          The main landing page for your space, showcasing highlights and pinned content.
        </p>
        <Button 
          size="sm" 
          className="shrink-0 gap-2 shadow-sm"
          onClick={() => setIsPostModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Post
        </Button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={{
              ...post, 
              onClick: () => setSelectedPost(post)
            }} 
          />
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