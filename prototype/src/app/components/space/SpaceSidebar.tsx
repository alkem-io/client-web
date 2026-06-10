import { useState } from "react";
import { ReadMoreText } from "@/app/components/ui/ReadMoreText";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Plus, Mail, UserPlus, Search, List, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpaceFilters } from "@/app/components/space/FilterContext";

interface SpaceSidebarProps {
  spaceSlug: string;
  /** Controls which sections render below the info block */
  variant?: "home" | "community" | "workspaces" | "knowledge";
  /** Description of the currently active tab */
  activeTabDescription?: string;
}

const TAB_TAGS: Record<string, string[]> = {
  home:       ["Updates", "Events", "Ideas", "Announcements"],
  community:  ["Members", "Active", "Leads", "New"],
  workspaces: ["Energy", "Strategy", "Transport", "Urban", "Green Spaces", "Policy", "Community", "Digital", "Simulation", "Regulation"],
  knowledge:  ["Reports", "Policy", "Research", "Data", "Technical", "Funding", "Community", "Templates", "Legal", "Infrastructure", "Governance", "Environment", "Education"],
};

const TAB_INDEX: Record<string, Array<{ title: string; type: string; author: string; tags: string[] }>> = {
  home: [
    { title: "Kickoff: Municipal Transition Strategy", type: "Post", author: "Sarah Chen", tags: ["Updates", "Announcements"] },
    { title: "Q1 Community Update", type: "Post", author: "Elena Martinez", tags: ["Updates"] },
    { title: "Call for Ideas: Community Solar Projects", type: "Call", author: "Alex Torres", tags: ["Ideas", "Events"] },
    { title: "Welcome to the Space", type: "Post", author: "Elena Martinez", tags: ["Announcements"] },
  ],
  community: [
    { title: "Member Directory", type: "Collection", author: "Elena Martinez", tags: ["Members"] },
    { title: "Onboarding Guide for New Members", type: "Post", author: "Sarah Chen", tags: ["Active"] },
    { title: "Community Roles & Responsibilities", type: "Post", author: "Elena Martinez", tags: ["Leads"] },
  ],
  workspaces: [
    { title: "Renewable Energy Transition", type: "Subspace", author: "Sarah Chen", tags: ["Energy", "Strategy"] },
    { title: "Urban Mobility Lab", type: "Subspace", author: "David Kim", tags: ["Transport"] },
    { title: "Green Infrastructure", type: "Subspace", author: "Emily Davis", tags: ["Urban", "Green Spaces"] },
    { title: "Policy Frameworks", type: "Subspace", author: "Policy Institute", tags: ["Policy", "Regulation"] },
    { title: "Community Engagement", type: "Subspace", author: "Anna Martinez", tags: ["Community"] },
    { title: "Digital Twin Project", type: "Subspace", author: "Robert Fox", tags: ["Digital", "Simulation"] },
  ],
  knowledge: [
    { title: "Transition Case Studies & Policy Docs", type: "Collection", author: "Elena Rodriguez", tags: ["Reports", "Policy"] },
    { title: "Q1 Sustainability Report & Supporting Data", type: "Collection", author: "Sarah Chen", tags: ["Reports", "Data"] },
    { title: "Community Workshop Guidelines", type: "Document", author: "James Wilson", tags: ["Research", "Community"] },
    { title: "Grid Modernisation Reference Materials", type: "Collection", author: "David Miller", tags: ["Research", "Technical"] },
    { title: "Funding Opportunities for Municipal Energy Projects", type: "Document", author: "Alex Contributor", tags: ["Policy", "Funding"] },
    { title: "Stakeholder Meeting Notes & Action Items", type: "Collection", author: "Michael Chang", tags: ["Reports", "Governance"] },
    { title: "Energy Consumption Baseline Analysis", type: "Document", author: "Priya Sharma", tags: ["Technical", "Data"] },
    { title: "Communication Templates & Brand Guidelines", type: "Collection", author: "Lisa Park", tags: ["Templates", "Community"] },
    { title: "Regulatory Framework & Compliance Guide", type: "Document", author: "Robert Hayes", tags: ["Policy", "Legal"] },
    { title: "Solar Panel Efficiency Benchmarks 2026", type: "Collection", author: "David Miller", tags: ["Research", "Technical"] },
    { title: "Budget Allocation & Financial Projections", type: "Document", author: "Nina Petrova", tags: ["Funding", "Governance"] },
    { title: "Public Education & Awareness Materials", type: "Collection", author: "James Wilson", tags: ["Community", "Education"] },
    { title: "EV Charging Infrastructure Deployment Plan", type: "Document", author: "Tom Bradley", tags: ["Technical", "Infrastructure"] },
    { title: "Carbon Footprint Reduction Projections", type: "Document", author: "Priya Sharma", tags: ["Research", "Environment"] },
    { title: "Project Management Toolkit", type: "Collection", author: "Lisa Park", tags: ["Templates", "Governance"] },
    { title: "Procurement Guidelines for Green Energy Contracts", type: "Document", author: "Robert Hayes", tags: ["Policy", "Legal"] },
    { title: "Building Energy Audit Results", type: "Collection", author: "Tom Bradley", tags: ["Data", "Infrastructure"] },
    { title: "Youth Engagement Program Curriculum", type: "Document", author: "Elena Rodriguez", tags: ["Community", "Education"] },
    { title: "Grant Application: DOE Community Power Accelerator", type: "Document", author: "Nina Petrova", tags: ["Funding", "Reports"] },
    { title: "Climate Resilience & Adaptation Strategy", type: "Collection", author: "Michael Chang", tags: ["Research", "Environment"] },
  ],
};

export function SpaceSidebar({ spaceSlug, variant = "home", activeTabDescription }: SpaceSidebarProps) {
  const [indexOpen, setIndexOpen] = useState(false);
  
  // Use filter context
  const { searchValue, activeTags, setSearchValue, toggleTag, clearTags } = useSpaceFilters();

  const tags = TAB_TAGS[variant] ?? TAB_TAGS.home;
  const allIndexItems = TAB_INDEX[variant] ?? TAB_INDEX.home;
  const searchPlaceholder =
    variant === "workspaces" ? "Search subspaces…"
    : variant === "knowledge" ? "Search knowledge base…"
    : variant === "community" ? "Search community…"
    : "Search posts…";

  // Filter index items by search and tag
  const filteredIndexItems = allIndexItems.filter((item) => {
    const matchesSearch = searchValue === "" || 
      item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.author.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesTags = activeTags.length === 0 || activeTags.every((tag) => item.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const hasFilters = searchValue !== "" || activeTags.length > 0;
  const matchCount = filteredIndexItems.length;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="py-1">
        <ReadMoreText
          maxLines={3}
          className="text-sm text-foreground/85 leading-relaxed"
          toggleColor="var(--foreground)"
          toggleOpacity={0.75}
        >
          {activeTabDescription || "Activity and updates from members of this space."}
        </ReadMoreText>
      </div>

      {/* Tab-specific CTA buttons */}
      <TabCTAButtons variant={variant} />

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full h-10 pl-9 pr-4 transition-all text-sm rounded-md border border-border bg-input-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring"
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.boxShadow = "0 0 0 1px var(--ring)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Tag cloud */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={cn(
              "px-2.5 py-1 rounded-full text-badge border transition-colors",
              activeTags.includes(tag)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Filter feedback */}
      {hasFilters && (
        <div
          className="flex items-center justify-between gap-2 p-2.5 rounded-md text-xs"
          style={{
            background: "color-mix(in srgb, var(--primary) 10%, transparent)",
            color: "var(--primary)",
          }}
        >
          <span>
            <strong>{matchCount}</strong> item{matchCount !== 1 ? 's' : ''} match
            {activeTags.length > 0 && (
              <>
                {" "}tagged <strong>"{activeTags.join('" + "')}"</strong>
              </>
            )}
            {activeTags.length > 0 && searchValue && " and "}
            {searchValue && (
              <>
                {" "}search for <strong>"{searchValue}"</strong>
              </>
            )}
          </span>
          <button
            onClick={() => {
              setSearchValue("");
              clearTags();
            }}
            className="flex items-center justify-center w-5 h-5 rounded hover:bg-primary/20 transition-colors"
            title="Clear filters"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Index Button */}
      <div className="pt-1">
        <Button
          variant="outline"
          className="w-full gap-2 justify-start"
          onClick={() => setIndexOpen(true)}
        >
          <List className="w-4 h-4" />
          Index
        </Button>
      </div>

      {/* Index Dialog */}
      <Dialog open={indexOpen} onOpenChange={setIndexOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="w-5 h-5" style={{ color: "var(--primary)" }} />
              Index
            </DialogTitle>
            <DialogDescription>
              All content in this space's {variant === "workspaces" ? "subspaces" : variant === "knowledge" ? "knowledge base" : variant} view.
            </DialogDescription>
          </DialogHeader>

          {/* Results */}
          {allIndexItems.length > 0 ? (
            <div className="space-y-1 mt-2">
              {allIndexItems.map((item, i) => (
                <button
                  key={i}
                  className="flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-md transition-colors hover:bg-muted/50"
                >
                  <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {item.type} · {item.author}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded text-badge"
                            style={{
                              background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                              color: "var(--primary)",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--muted-foreground)" }}>
              <p style={{ fontSize: "var(--text-sm)" }}>No items in this view.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function TabCTAButtons({ variant }: { variant: string }) {
  if (variant === "community") {
    return (
      <div className="flex flex-col gap-2">
        <Button size="sm" className="w-full gap-2 justify-start">
          <Plus className="w-4 h-4" />
          Post
        </Button>
        <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
        <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
          <Mail className="w-4 h-4" />
          Contact Leads
        </Button>
      </div>
    );
  }
  if (variant === "workspaces") {
    return (
      <div className="flex flex-col gap-2">
        <Button size="sm" className="w-full gap-2 justify-start">
          <Plus className="w-4 h-4" />
          Post
        </Button>
        <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
          <Plus className="w-4 h-4" />
          Create Subspace
        </Button>
      </div>
    );
  }
  // Home and Knowledge Base
  return (
    <Button size="sm" className="w-full gap-2 justify-start">
      <Plus className="w-4 h-4" />
      Post
    </Button>
  );
}
