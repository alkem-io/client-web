import { useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Users,
  Calendar,
  Archive,
  Eye,
  Trash2,
  Edit,
  Grid,
  List as ListIcon,
  LayoutTemplate,
  Filter,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/lib/utils";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

interface SubSubspace {
  id: string;
  name: string;
  description: string;
  image: string;
  memberCount: number;
  status: "Active" | "Archived";
  lastActive: string;
}

const MOCK_SUBSUBSPACES: SubSubspace[] = [
  {
    id: "1",
    name: "Solar Panel Research",
    description: "Exploring next-gen photovoltaic technologies and materials.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVsfGVufDF8fHx8MTc2OTQ0MTk1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    memberCount: 8,
    status: "Active",
    lastActive: "3 hours ago",
  },
  {
    id: "2",
    name: "Wind Energy Models",
    description: "Computational fluid dynamics models for wind turbine placement.",
    image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5kJTIwdHVyYmluZXxlbnwxfHx8fDE3Njk0NDE5NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    memberCount: 5,
    status: "Active",
    lastActive: "1 day ago",
  },
  {
    id: "3",
    name: "Policy Analysis",
    description: "Reviewing legislative frameworks for renewable energy subsidies.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpY3klMjBkb2N1bWVudHxlbnwxfHx8fDE3Njk0NDE5NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    memberCount: 4,
    status: "Archived",
    lastActive: "2 weeks ago",
  },
];

export function SubspaceSettingsSubspaces() {
  const [subspaces, setSubspaces] = useState<SubSubspace[]>(MOCK_SUBSUBSPACES);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Archived">("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filtered = subspaces.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    const newSubspace: SubSubspace = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      description: newDesc,
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVsfGVufDF8fHx8MTc2OTQ0MTk1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      memberCount: 1,
      status: "Active",
      lastActive: "Just now",
    };
    setSubspaces([newSubspace, ...subspaces]);
    setIsCreateModalOpen(false);
    setNewName("");
    setNewDesc("");
  };

  const handleDelete = (id: string) => {
    setSubspaces(subspaces.filter((s) => s.id !== id));
  };

  const handleArchive = (id: string) => {
    setSubspaces(subspaces.map((s) => (s.id === id ? { ...s, status: "Archived" as const } : s)));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subspaces</h2>
        <p className="text-muted-foreground mt-2">
          Manage child subspaces within this subspace.
        </p>
      </div>

      <Separator />

      {/* Subspaces List */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Subspaces
            <Badge variant="secondary" className="rounded-full">
              {filtered.length}
            </Badge>
          </h3>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subspaces..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Filter className="w-4 h-4" />
                  Filter: {statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter("All")}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Active")}>Active Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Archived")}>Archived Only</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="border rounded-md flex items-center h-9 p-0.5 bg-muted/20">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-sm"
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="w-4 h-4" />
              </Button>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Subspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Subspace</DialogTitle>
                  <DialogDescription>
                    Set up a new workspace within this subspace.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subspace Name</label>
                    <Input
                      placeholder="e.g. Solar Panel Research"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      placeholder="What is this subspace for?"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={!newName}>Create Subspace</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col"
              >
                <div className="h-32 bg-muted relative overflow-hidden">
                  <ImageWithFallback
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm border border-black/5 hover:bg-background">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit Details</DropdownMenuItem>
                        {s.status !== "Archived" && (
                          <DropdownMenuItem onClick={() => handleArchive(s.id)}>
                            <Archive className="w-4 h-4 mr-2" /> Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {s.status === "Archived" && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                      <Badge variant="secondary" className="gap-1">
                        <Archive className="w-3 h-3" /> Archived
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                      {s.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">
                      {s.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5" title={`${s.memberCount} members`}>
                      <Users className="w-3.5 h-3.5" /> {s.memberCount}
                    </div>
                    <div className="flex items-center gap-1.5" title="Last active">
                      <Calendar className="w-3.5 h-3.5" /> {s.lastActive}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/10">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 opacity-50" />
                </div>
                <h3 className="font-medium text-lg text-foreground">No subspaces found</h3>
                <p className="text-sm mt-1 mb-4">Try adjusting your search or filters.</p>
                <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("All"); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            {filtered.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors",
                  i !== filtered.length - 1 && "border-b border-border"
                )}
              >
                <div className="w-16 h-12 rounded bg-muted overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={s.image}
                    alt={s.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-foreground truncate">{s.name}</h4>
                    {s.status === "Archived" && (
                      <Badge variant="secondary" className="text-[10px] py-0 h-5">Archived</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-md">{s.description}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground shrink-0">
                  <div className="flex items-center gap-1.5 w-20">
                    <Users className="w-3.5 h-3.5" /> {s.memberCount}
                  </div>
                  <div className="flex items-center gap-1.5 w-24">
                    <Calendar className="w-3.5 h-3.5" /> {s.lastActive}
                  </div>
                </div>
                <div className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        {s.status === "Active" ? "Archive" : "Unarchive"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No subspaces found matching criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
