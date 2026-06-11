import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { PostCard, PostProps } from "./PostCard";
import { AddPostModal } from "@/app/components/space/AddPostModal";
import { PostDetailDialog } from "@/app/components/dialogs/PostDetailDialog";
import { useSpaceFilters } from "@/app/components/space/FilterContext";

// Whiteboard / visual preview images
const wb1 = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1080";

interface PostWithTags extends PostProps {
  tags: string[];
}

export function SpaceKnowledgeFeed() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostProps | null>(null);
  const { searchValue, activeTags } = useSpaceFilters();

  const posts: PostWithTags[] = [
    {
      id: "kb-1",
      type: "collection",
      tags: ["Reports", "Policy"],
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
      tags: ["Reports", "Data"],
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
      tags: ["Research", "Community"],
      author: {
        name: "James Wilson",
        role: "Community Lead",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Community Workshop Guidelines",
      snippet: "Best practices and facilitation guide for running effective community engagement workshops. Covers preparation checklists, participant engagement techniques, and post-workshop follow-up templates.",
      timestamp: "2 weeks ago",
      stats: { likes: 19, comments: 14 }
    },
    {
      id: "kb-4",
      type: "collection",
      tags: ["Research", "Technical"],
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
      tags: ["Policy", "Funding"],
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
      tags: ["Reports", "Governance"],
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
    },
    {
      id: "kb-7",
      type: "text",
      tags: ["Technical", "Data"],
      author: {
        name: "Priya Sharma",
        role: "Data Scientist",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Energy Consumption Baseline Analysis",
      snippet: "Statistical analysis of municipal energy consumption patterns over the past 5 years. Identifies peak demand periods, seasonal variations, and potential savings from demand-response programs.",
      timestamp: "1 month ago",
      stats: { likes: 28, comments: 9 }
    },
    {
      id: "kb-8",
      type: "collection",
      tags: ["Templates", "Community"],
      author: {
        name: "Lisa Park",
        role: "Program Manager",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Communication Templates & Brand Guidelines",
      snippet: "Standardised templates for community outreach, press releases, and social media posts. Also includes brand voice guidelines and approved imagery for public-facing materials.",
      timestamp: "5 weeks ago",
      contentPreview: {
        items: [
          { title: "Press Release Template", type: "doc" },
          { title: "Social Media Playbook", type: "pdf" },
          { title: "Brand Voice Guidelines", type: "pdf" }
        ]
      },
      stats: { likes: 15, comments: 3 }
    },
    {
      id: "kb-9",
      type: "text",
      tags: ["Policy", "Legal"],
      author: {
        name: "Robert Hayes",
        role: "Legal Advisor",
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Regulatory Framework & Compliance Guide",
      snippet: "Overview of federal, state, and local regulations affecting renewable energy installations. Includes permitting requirements, environmental impact assessment procedures, and zoning considerations.",
      timestamp: "6 weeks ago",
      stats: { likes: 33, comments: 6 }
    },
    {
      id: "kb-10",
      type: "collection",
      tags: ["Research", "Technical"],
      author: {
        name: "David Miller",
        role: "Energy Analyst",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Solar Panel Efficiency Benchmarks 2026",
      snippet: "Comparative analysis of leading solar panel manufacturers with efficiency ratings, degradation curves, and total cost of ownership calculations for municipal-scale installations.",
      timestamp: "6 weeks ago",
      contentPreview: {
        items: [
          { title: "Efficiency Comparison Chart", type: "pdf" },
          { title: "Cost-Benefit Calculator", type: "doc" },
          { title: "Manufacturer Spec Sheets", type: "pdf" }
        ]
      },
      stats: { likes: 41, comments: 15 }
    },
    {
      id: "kb-11",
      type: "text",
      tags: ["Funding", "Governance"],
      author: {
        name: "Nina Petrova",
        role: "Finance Director",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Budget Allocation & Financial Projections",
      snippet: "Detailed breakdown of the 2026-2028 budget allocation for the energy transition program. Includes projected ROI timelines, cost recovery mechanisms, and risk-adjusted financial models.",
      timestamp: "2 months ago",
      stats: { likes: 27, comments: 4 }
    },
    {
      id: "kb-12",
      type: "collection",
      tags: ["Community", "Education"],
      author: {
        name: "James Wilson",
        role: "Community Lead",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Public Education & Awareness Materials",
      snippet: "Curated collection of educational materials for community members. Covers the basics of renewable energy, home efficiency upgrades, and how residents can participate in the transition.",
      timestamp: "2 months ago",
      contentPreview: {
        items: [
          { title: "Homeowner's Guide to Solar", type: "pdf" },
          { title: "Energy Efficiency Checklist", type: "doc" },
          { title: "Community Q&A Recordings", type: "doc" },
          { title: "Infographic: Our Energy Future", type: "pdf" }
        ]
      },
      stats: { likes: 52, comments: 18 }
    },
    {
      id: "kb-13",
      type: "text",
      tags: ["Technical", "Infrastructure"],
      author: {
        name: "Tom Bradley",
        role: "Infrastructure Engineer",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "EV Charging Infrastructure Deployment Plan",
      snippet: "Strategic plan for deploying 200+ public EV charging stations across the municipality by 2028. Covers site selection criteria, grid capacity assessments, and phased rollout timeline.",
      timestamp: "2 months ago",
      stats: { likes: 38, comments: 21 }
    },
    {
      id: "kb-14",
      type: "text",
      tags: ["Research", "Environment"],
      author: {
        name: "Priya Sharma",
        role: "Data Scientist",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Carbon Footprint Reduction Projections",
      snippet: "Modelling results showing projected carbon emission reductions under three different transition scenarios (aggressive, moderate, baseline). Includes sensitivity analysis and key assumptions documentation.",
      timestamp: "2.5 months ago",
      stats: { likes: 29, comments: 7 }
    },
    {
      id: "kb-15",
      type: "collection",
      tags: ["Templates", "Governance"],
      author: {
        name: "Lisa Park",
        role: "Program Manager",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Project Management Toolkit",
      snippet: "Standard templates and tools for managing workstreams within the transition program. Includes risk registers, RACI matrices, status report templates, and decision logs.",
      timestamp: "3 months ago",
      contentPreview: {
        items: [
          { title: "Risk Register Template", type: "doc" },
          { title: "RACI Matrix", type: "doc" },
          { title: "Status Report Template", type: "doc" },
          { title: "Decision Log", type: "doc" }
        ]
      },
      stats: { likes: 18, comments: 2 }
    },
    {
      id: "kb-16",
      type: "text",
      tags: ["Policy", "Legal"],
      author: {
        name: "Robert Hayes",
        role: "Legal Advisor",
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Procurement Guidelines for Green Energy Contracts",
      snippet: "Legal framework and best practices for procuring renewable energy through Power Purchase Agreements (PPAs), community solar subscriptions, and direct municipal investment.",
      timestamp: "3 months ago",
      stats: { likes: 20, comments: 8 }
    },
    {
      id: "kb-17",
      type: "collection",
      tags: ["Data", "Infrastructure"],
      author: {
        name: "Tom Bradley",
        role: "Infrastructure Engineer",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Building Energy Audit Results",
      snippet: "Results from comprehensive energy audits of 45 municipal buildings. Ranked by potential savings with recommended retrofits, estimated costs, and payback periods.",
      timestamp: "3.5 months ago",
      contentPreview: {
        items: [
          { title: "Audit Summary Dashboard", type: "pdf" },
          { title: "Building-by-Building Results", type: "doc" },
          { title: "Retrofit Priority List", type: "doc" }
        ]
      },
      stats: { likes: 34, comments: 11 }
    },
    {
      id: "kb-18",
      type: "text",
      tags: ["Community", "Education"],
      author: {
        name: "Elena Rodriguez",
        role: "Policy Expert",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Youth Engagement Program Curriculum",
      snippet: "Curriculum framework for engaging high school students in the energy transition. Covers STEM activities, mentorship opportunities, and pathways to green careers.",
      timestamp: "4 months ago",
      stats: { likes: 45, comments: 13 }
    },
    {
      id: "kb-19",
      type: "text",
      tags: ["Funding", "Reports"],
      author: {
        name: "Nina Petrova",
        role: "Finance Director",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Grant Application: DOE Community Power Accelerator",
      snippet: "Complete grant application package submitted to the DOE Community Power Accelerator program. Includes narrative, budget justification, letters of support, and environmental justice analysis.",
      timestamp: "4 months ago",
      stats: { likes: 16, comments: 5 }
    },
    {
      id: "kb-20",
      type: "collection",
      tags: ["Research", "Environment"],
      author: {
        name: "Michael Chang",
        role: "Researcher",
        avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      title: "Climate Resilience & Adaptation Strategy",
      snippet: "Long-term strategy document addressing climate adaptation alongside the energy transition. Covers flood risk, heat island mitigation, urban forestry, and emergency preparedness.",
      timestamp: "4.5 months ago",
      contentPreview: {
        items: [
          { title: "Resilience Framework", type: "pdf" },
          { title: "Risk Assessment Map", type: "pdf" },
          { title: "Adaptation Action Plan", type: "doc" },
          { title: "Emergency Response Protocols", type: "doc" }
        ]
      },
      stats: { likes: 37, comments: 16 }
    },
  ];

  // Filter posts based on search and tag filters
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = !searchValue || 
      post.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      post.snippet.toLowerCase().includes(searchValue.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesTags = activeTags.length === 0 || activeTags.every((tag) => post.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <div className="w-full">
      <div className="space-y-6">
        {filteredPosts.map((post) => (
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