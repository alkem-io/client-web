import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { 
  Search, 
  X, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Users, 
  Shield, 
  Lock, 
  Briefcase, 
  Plus, 
  ExternalLink,
  MoreHorizontal,
  Settings,
  LogOut,
  Eye,
  Check
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface ExploreSpacesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- Mock Data ---

type Role = "Admin" | "Lead" | "Member";

interface Subspace {
  id: number;
  name: string;
  description: string;
  members: number;
  image?: string;
}

interface Space {
  id: number;
  name: string;
  description: string;
  role: Role;
  members: number;
  lastActive: string;
  isPrivate: boolean;
  image: string;
  subspaces: Subspace[];
}

const RECENT_SPACES: Space[] = [
  {
    id: 1,
    name: "Innovation Lab",
    description: "Central hub for company-wide innovation initiatives and experiments.",
    role: "Lead",
    members: 124,
    lastActive: "2 hours ago",
    isPrivate: true,
    image: "https://images.unsplash.com/photo-1758873268663-5a362616b5a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjB0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3Njk1MTU2NTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    subspaces: [
      { id: 101, name: "Q1 Experiments", description: "Running tests for Q1", members: 12 },
      { id: 102, name: "Idea Repository", description: "Backlog of verified ideas", members: 45 },
    ]
  },
  {
    id: 2,
    name: "Design Workshop",
    description: "Resources, assets, and critiques for the design team.",
    role: "Admin",
    members: 45,
    lastActive: "5 mins ago",
    isPrivate: false,
    image: "https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGRlc2lnbiUyMHdvcmtzaG9wJTIwZGl2ZXJzZSUyMHRlYW18ZW58MXx8fHwxNzY5NTI2Mzk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    subspaces: []
  },
  {
    id: 3,
    name: "Team Sync",
    description: "Weekly sync meeting notes and action items for the core team.",
    role: "Member",
    members: 12,
    lastActive: "1 day ago",
    isPrivate: true,
    image: "https://images.unsplash.com/photo-1759884247144-53d52c31f859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBwcm9ncmFtbWluZyUyMHNvZnR3YXJlJTIwZW5naW5lZXJpbmclMjB0ZWFtfGVufDF8fHx8MTc2OTUyNjM5N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    subspaces: [
        { id: 301, name: "Daily Standup", description: "Archive of standups", members: 12 }
    ]
  }
];

const ALL_SPACES: Space[] = [
  ...RECENT_SPACES,
  {
    id: 4,
    name: "Future Strategy",
    description: "Long-term strategic planning and market analysis.",
    role: "Member",
    members: 89,
    lastActive: "3 days ago",
    isPrivate: false,
    image: "https://images.unsplash.com/photo-1765438869297-6fa4b627906a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBzdHJhdGVneSUyMHdoaXRlYm9hcmR8ZW58MXx8fHwxNzY5NTI2Mzk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    subspaces: [
        { id: 401, name: "Market Research", description: "Competitor analysis", members: 20 },
        { id: 402, name: "2026 Roadmap", description: "Planning for next year", members: 35 },
        { id: 403, name: "Budgeting", description: "Financial planning", members: 5 }
    ]
  },
  {
    id: 5,
    name: "Engineering All-Hands",
    description: "Recordings and slides from engineering meetings.",
    role: "Member",
    members: 210,
    lastActive: "1 week ago",
    isPrivate: false,
    image: "https://images.unsplash.com/photo-1744986014553-e5e866de814b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRpZ2l0YWwlMjBuZXR3b3JrJTIwY29ubmVjdGlvbnxlbnwxfHx8fDE3Njk0ODQzMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    subspaces: []
  },
  {
    id: 6,
    name: "Community Events",
    description: "Planning and organization of community meetups and digital events.",
    role: "Lead",
    members: 350,
    lastActive: "Just now",
    isPrivate: true,
    image: "https://images.unsplash.com/photo-1768776179834-93e6cafc6d97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBwZW9wbGUlMjBoYXBweXxlbnwxfHx8fDE3Njk1MjY0MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    subspaces: [
        { id: 601, name: "Regional Meetups", description: "Local events", members: 150 },
        { id: 602, name: "Webinars", description: "Online content", members: 200 }
    ]
  }
];

export function ExploreSpacesDialog({ open, onOpenChange }: ExploreSpacesDialogProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | Role>("All");
  const [sortBy, setSortBy] = useState<"Recent" | "Name" | "Members" | "Active">("Recent");
  const [expandedSpaces, setExpandedSpaces] = useState<Set<number>>(new Set());

  // Toggle expanded state
  const toggleExpand = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newExpanded = new Set(expandedSpaces);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSpaces(newExpanded);
  };

  // Filter and Sort Logic
  const filteredSpaces = useMemo(() => {
    let result = [...ALL_SPACES];

    // Filter by Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
      );
    }

    // Filter by Role
    if (roleFilter !== "All") {
      result = result.filter(s => s.role === roleFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "Name": return a.name.localeCompare(b.name);
        case "Members": return b.members - a.members;
        // Mocking date sort using simple logic or string comparison for this demo
        case "Active": return a.lastActive.localeCompare(b.lastActive); 
        case "Recent": default: return a.id - b.id; // Mock order
      }
    });

    return result;
  }, [search, roleFilter, sortBy]);

  const hasActiveFilters = search.length > 0 || roleFilter !== "All" || sortBy !== "Recent";

  // Role Badge Helper
  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case "Admin": return "destructive"; // Red-ish
      case "Lead": return "default"; // Primary color (Teal-ish often)
      case "Member": return "secondary"; // Blue/Gray-ish
      default: return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-full max-h-[90vh] flex flex-col p-0 gap-0 bg-background border-border shadow-xl sm:rounded-2xl overflow-hidden px-[20px] py-[0px]">
        
        {/* 1. Header */}
        <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm relative">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-3xl font-bold tracking-tight">Explore All My Spaces</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2 text-base max-w-2xl">
                Browse all spaces and subspaces you're a member of. Click to navigate or expand to see subspaces.
              </DialogDescription>
            </div>
            {/* Close button is automatically added by DialogContent usually */}
          </div>

          {/* 2. Search & Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search spaces and subspaces..." 
                className="h-14 pl-12 text-lg bg-background border-input focus:ring-primary/20 transition-shadow shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 shrink-0">
               {/* Role Filter */}
               <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val as any)}>
                 <SelectTrigger className="w-[140px] sm:w-[160px] h-14 text-base">
                   <SelectValue placeholder="All Roles" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="All">All Roles</SelectItem>
                   <SelectItem value="Admin">Admin</SelectItem>
                   <SelectItem value="Lead">Lead</SelectItem>
                   <SelectItem value="Member">Member</SelectItem>
                 </SelectContent>
               </Select>

               {/* Sort Filter */}
               <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                 <SelectTrigger className="w-[140px] sm:w-[180px] h-14 text-base">
                   <SelectValue placeholder="Sort By" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Recent">Recent</SelectItem>
                   <SelectItem value="Name">Name (A-Z)</SelectItem>
                   <SelectItem value="Members">Member Count</SelectItem>
                   <SelectItem value="Active">Last Active</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </div>
          
          {hasActiveFilters && (
             <div className="mt-3 text-sm text-muted-foreground font-medium animate-in fade-in">
               {filteredSpaces.length} spaces match your filters
             </div>
          )}
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-muted/5 p-8 space-y-10">
          
          {/* 4. Recent Spaces Section (Only show if no active search/filter) */}
          {!hasActiveFilters && RECENT_SPACES.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-muted-foreground uppercase tracking-wider pl-1">
                Your Recent Spaces ({RECENT_SPACES.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {RECENT_SPACES.map(space => (
                  <div 
                    key={space.id}
                    className="group bg-card hover:bg-card/80 border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      <img src={space.image} alt={space.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                      <div className="absolute top-3 right-3 flex flex-col gap-1">
                        <Badge variant={getRoleBadgeVariant(space.role)} className="shadow-sm bg-background/90 backdrop-blur text-foreground border-transparent hover:bg-background text-xs px-2 py-0.5">
                          {space.role}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 text-white">
                         <h4 className="font-bold text-base leading-tight drop-shadow-md">{space.name}</h4>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{space.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {space.members}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {space.lastActive}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. All Spaces Section */}
          <div className="space-y-6">
             <h3 className="text-base font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center justify-between">
                <span>All Spaces ({filteredSpaces.length} total)</span>
             </h3>

             {filteredSpaces.length === 0 ? (
                // 6. Empty State
                <div className="text-center py-24 px-4 bg-card border border-dashed border-border rounded-xl">
                   <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                      <Search className="w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-semibold">No spaces match your search</h3>
                   <p className="text-muted-foreground mt-2 text-base max-w-sm mx-auto">
                     Try adjusting your filters or search terms. You can also create a new space.
                   </p>
                   <Button variant="outline" size="lg" className="mt-6" onClick={() => { setSearch(""); setRoleFilter("All"); }}>
                     Clear Filters
                   </Button>
                </div>
             ) : (
               <div className="flex flex-col gap-4">
                 {filteredSpaces.map(space => {
                   const isExpanded = expandedSpaces.has(space.id);
                   
                   return (
                     <div 
                        key={space.id} 
                        className={cn(
                          "bg-card border border-border rounded-xl transition-all overflow-hidden",
                          isExpanded ? "shadow-lg ring-1 ring-border/50" : "hover:border-primary/50 hover:shadow-md"
                        )}
                     >
                        {/* Space Card Header */}
                        <div 
                          className="p-5 flex gap-6 items-center cursor-pointer relative group"
                          onClick={() => toggleExpand(space.id)}
                        >
                           {/* Thumbnail */}
                           <div className="w-24 h-24 sm:w-32 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/50 relative shadow-sm">
                             <img src={space.image} alt={space.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                           </div>

                           {/* Info */}
                           <div className="flex-1 min-w-0 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
                              <div className="space-y-3">
                                 <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                      {space.name}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      {space.isPrivate && <Lock className="w-4 h-4 text-muted-foreground" />}
                                      <Badge variant={getRoleBadgeVariant(space.role)} className="h-6 text-xs px-2.5 font-medium">
                                        {space.role}
                                      </Badge>
                                    </div>
                                 </div>
                                 <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed max-w-3xl">{space.description}</p>
                                 <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground pt-1">
                                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> {space.members} members</span>
                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Active {space.lastActive}</span>
                                 </div>
                              </div>

                              {/* Actions / Expand */}
                              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                                 <Button size="sm" variant="outline" className="h-9 px-4 hidden sm:flex">
                                    View Space
                                 </Button>
                                 <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-9 w-9 text-muted-foreground bg-muted/30 hover:bg-muted"
                                    onClick={(e) => toggleExpand(space.id, e)}
                                 >
                                    <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isExpanded && "rotate-180")} />
                                 </Button>
                              </div>
                           </div>
                        </div>

                        {/* Expanded Subspaces */}
                        {isExpanded && (
                          <div className="bg-muted/30 border-t border-border animate-in slide-in-from-top-2 duration-200">
                             <div className="p-4 pl-6 sm:pl-32">
                                <div className="flex items-center justify-between mb-3">
                                   <h5 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                                     <Briefcase className="w-3.5 h-3.5" /> Subspaces you're in
                                   </h5>
                                </div>

                                {space.subspaces.length > 0 ? (
                                  <div className="grid gap-2">
                                     {space.subspaces.map(sub => (
                                       <div 
                                         key={sub.id}
                                         className="flex items-center gap-4 p-3 rounded-lg hover:bg-background hover:shadow-sm border border-transparent hover:border-border transition-all cursor-pointer group/sub"
                                       >
                                          <img 
                                             src={sub.image || [
                                               "https://images.unsplash.com/photo-1729830375022-b0248100c501?w=100&h=100&fit=crop&q=80",
                                               "https://images.unsplash.com/photo-1706720095318-e3538cae10bf?w=100&h=100&fit=crop&q=80",
                                               "https://images.unsplash.com/photo-1762939079730-23708c0dd337?w=100&h=100&fit=crop&q=80"
                                             ][sub.id % 3]}
                                             alt={sub.name}
                                             className="w-10 h-10 rounded object-cover shrink-0 border border-border/50"
                                          />
                                          <div className="flex-1 min-w-0">
                                             <h6 className="text-base font-medium text-foreground group-hover/sub:text-primary truncate">
                                               {sub.name}
                                             </h6>
                                             <p className="text-sm text-muted-foreground truncate">{sub.description}</p>
                                          </div>
                                          <div className="text-sm text-muted-foreground pr-2">
                                             {sub.members} members
                                          </div>
                                       </div>
                                     ))}
                                  </div>
                                ) : (
                                  <div className="py-4 text-sm text-muted-foreground italic">
                                    No subspaces found.
                                  </div>
                                )}
                                
                                <div className="mt-4 pt-2 border-t border-border/50 flex justify-end gap-2">
                                   <Button size="sm" variant="ghost" className="text-xs h-7 text-muted-foreground">
                                      <LogOut className="w-3 h-3 mr-1.5" /> Leave Space
                                   </Button>
                                   <Button size="sm" variant="ghost" className="text-xs h-7">
                                      <Settings className="w-3 h-3 mr-1.5" /> Settings
                                   </Button>
                                </div>
                             </div>
                          </div>
                        )}
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        </div>

        {/* 8. Footer */}
        <div className="p-4 border-t border-border bg-background flex items-center justify-between gap-4">
           <p className="hidden sm:block text-xs text-muted-foreground">
             Don't see what you're looking for? <a href="#" className="underline hover:text-primary">Contact support</a>.
           </p>
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button variant="outline" className="flex-1 sm:flex-none">
               Join a Space
             </Button>
             <Button className="flex-1 sm:flex-none" onClick={() => { onOpenChange(false); navigate("/create-space"); }}>
               <Plus className="w-4 h-4 mr-2" /> Create New Space
             </Button>
           </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}