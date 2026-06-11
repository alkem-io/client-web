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
import { Plus, Mail, UserPlus, Search, List, FileText, X, Calendar, ChevronDown } from "lucide-react";
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
    <div className="flex flex-col w-full">
      {/* Description */}
      <div className="pb-3">
        <ReadMoreText
          maxLines={3}
          className="text-sm text-foreground/85 leading-relaxed"
          toggleColor="var(--foreground)"
          toggleOpacity={0.75}
        >
          {activeTabDescription || "Activity and updates from members of this space."}
        </ReadMoreText>
      </div>

      {/* Post button */}
      <div className="pb-4">
        <TabCTAButtons variant={variant} />
      </div>

      {/* ── divider ── */}
      <hr className="border-border mb-4" />

      {/* Search bar */}
      <div className="pb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-9 pl-8 pr-3 transition-all text-sm rounded-md border border-border bg-input-background text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring"
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
      </div>

      {/* Tag cloud */}
      <TagCloud tags={tags} activeTags={activeTags} toggleTag={toggleTag} />

      {/* Filter feedback */}
      {hasFilters && (
        <div
          className="flex items-center justify-between gap-2 p-2 rounded-md text-xs mb-3"
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

      {/* ── divider ── */}
      <hr className="border-border mb-4" />

      {/* Subspace quick links (Home tab only) */}
      {variant === "home" && (
        <>
          <div className="pb-4">
            <SubspaceQuickLinks />
          </div>
          <hr className="border-border mb-4" />
        </>
      )}

      {/* Events (Home tab only) */}
      {variant === "home" && (
        <>
          <div className="pb-4">
            <UpcomingEvents />
          </div>
          <hr className="border-border mb-4" />
        </>
      )}

      {/* Index Button */}
      <div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 justify-start"
          onClick={() => setIndexOpen(true)}
        >
          <List className="w-3.5 h-3.5" />
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

const TAG_VISIBLE_LIMIT = 8;

function TagCloud({ tags, activeTags, toggleTag }: { tags: string[]; activeTags: string[]; toggleTag: (tag: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  const visibleTags = expanded ? tags : tags.slice(0, TAG_VISIBLE_LIMIT);
  const hiddenCount = tags.length - TAG_VISIBLE_LIMIT;

  return (
    <div className="flex flex-wrap gap-1.5 pb-4">
      {visibleTags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={cn(
            "px-2 py-0.5 rounded-full text-badge border transition-colors",
            activeTags.includes(tag)
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
          )}
        >
          {tag}
        </button>
      ))}
      {!expanded && hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="px-2 py-0.5 rounded-full text-badge border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
        >
          +{hiddenCount}
        </button>
      )}
    </div>
  );
}

function UpcomingEvents() {
  const [collapsed, setCollapsed] = useState(true);
  const events = [
    { title: "GovTechDay", date: "Today" },
    { title: "Stakeholder Workshop", date: "Jun 14" },
    { title: "Community Solar Session", date: "Jun 18" },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Events
          </span>
          <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", collapsed && "-rotate-90")} />
        </button>
        <button
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted/50 transition-colors"
          style={{ color: "var(--primary)" }}
          title="Add event"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      {!collapsed && (
        <>
          <div className="flex flex-col">
            {events.map((event) => (
              <button
                key={event.title}
                className="flex items-center gap-2 py-1.5 rounded-md text-sm hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-foreground/85 truncate">{event.title}</span>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">{event.date}</span>
              </button>
            ))}
          </div>
          <button
            className="mt-3 text-sm text-foreground/85 text-left hover:text-foreground transition-colors"
          >
            Show calendar
          </button>
        </>
      )}
    </div>
  );
}

const SUBSPACE_AVATARS = [
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
  "https://images.unsplash.com/photo-1677506048377-1099738d294d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80",
];

function SubspaceQuickLinks() {
  const [collapsed, setCollapsed] = useState(true);
  const subspaces = TAB_INDEX.workspaces.slice(0, 4);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Subspaces
          </span>
          <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", collapsed && "-rotate-90")} />
        </button>
      </div>
      {!collapsed && (
        <div className="flex flex-col gap-0.5">
          {subspaces.map((s, i) => (
            <button
              key={s.title}
              className="flex items-center gap-2.5 py-1.5 rounded-md text-sm hover:bg-muted/50 transition-colors text-left"
            >
              <img
                src={SUBSPACE_AVATARS[i % SUBSPACE_AVATARS.length]}
                alt={s.title}
                className="w-8 h-8 rounded-lg shrink-0 object-cover"
              />
              <span className="text-foreground/85 truncate">{s.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
