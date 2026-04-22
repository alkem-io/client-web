import { useState } from "react";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  LayoutTemplate, 
  Filter,
  Users,
  Calendar,
  Archive,
  Eye,
  Trash2,
  Check,
  Edit,
  Grid,
  List as ListIcon
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
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

// --- Mock Data ---

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  features: string[];
}

const TEMPLATES: Template[] = [
  {
    id: 'standard',
    name: 'Standard Project',
    description: 'A balanced setup for general project management with tasks, docs, and chat.',
    image: 'https://images.unsplash.com/photo-1761370981247-1dfd749ec96b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0JTIwZm9jdXMlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc2OTQ0MTk1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    features: ['Task Board', 'Wiki', 'Discussion']
  },
  {
    id: 'sprint',
    name: 'Sprint Planning',
    description: 'Optimized for agile teams with backlog management and retro tools.',
    image: 'https://images.unsplash.com/photo-1647887071649-5dbb0887dce6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwc3ByaW50JTIwcGxhbm5pbmclMjB3aGl0ZWJvYXJkfGVufDF8fHx8MTc2OTQ0MTk1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    features: ['Kanban', 'Backlog', 'Retrospective']
  },
  {
    id: 'brainstorm',
    name: 'Brainstorming Space',
    description: 'Free-form canvas and whiteboard focus for creative sessions.',
    image: 'https://images.unsplash.com/photo-1595411425732-e69c1abe2763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRlc2lnbiUyMHBhdHRlcm4lMjBnZW9tZXRyaWN8ZW58MXx8fHwxNzY5NDQxOTUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    features: ['Whiteboard', 'Mind Map', 'Chat']
  }
];

interface Subspace {
  id: string;
  name: string;
  description: string;
  image: string;
  memberCount: number;
  status: 'Active' | 'Archived';
  lastActive: string;
  templateId: string;
}

const MOCK_SUBSPACES: Subspace[] = [
  {
    id: '1',
    name: 'Q4 Marketing Campaign',
    description: 'Planning and execution for the end-of-year marketing push.',
    image: 'https://images.unsplash.com/photo-1748346918817-0b1b6b2f9bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjB0ZWFtfGVufDF8fHx8MTc2OTQwOTA3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    memberCount: 12,
    status: 'Active',
    lastActive: '2 hours ago',
    templateId: 'standard'
  },
  {
    id: '2',
    name: 'Product Roadmap 2024',
    description: 'Strategic planning for upcoming product features and releases.',
    image: 'https://images.unsplash.com/photo-1760629863094-5b1e8d1aae74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbiUyMGZ1dHVyZXxlbnwxfHx8fDE3Njk0Mzg1MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    memberCount: 8,
    status: 'Active',
    lastActive: '1 day ago',
    templateId: 'sprint'
  },
  {
    id: '3',
    name: 'Design System Review',
    description: 'Weekly syncs to update and maintain the design system components.',
    image: 'https://images.unsplash.com/photo-1595411425732-e69c1abe2763?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRlc2lnbiUyMHBhdHRlcm4lMjBnZW9tZXRyaWN8ZW58MXx8fHwxNzY5NDQxOTUwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    memberCount: 5,
    status: 'Active',
    lastActive: '3 days ago',
    templateId: 'brainstorm'
  },
  {
    id: '4',
    name: 'Legacy Migration',
    description: 'Moving old infrastructure to the new cloud provider.',
    image: 'https://images.unsplash.com/photo-1761370981247-1dfd749ec96b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0JTIwZm9jdXMlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc2OTQ0MTk1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    memberCount: 4,
    status: 'Archived',
    lastActive: '2 months ago',
    templateId: 'standard'
  }
];

export function SpaceSettingsSubspaces() {
  const [defaultTemplateId, setDefaultTemplateId] = useState<string>('standard');
  const [subspaces, setSubspaces] = useState<Subspace[]>(MOCK_SUBSPACES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Archived'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create Form
  const [newSubspaceTitle, setNewSubspaceTitle] = useState('');
  const [newSubspaceDesc, setNewSubspaceDesc] = useState('');
  const [newSubspaceTemplate, setNewSubspaceTemplate] = useState(defaultTemplateId);

  const currentDefaultTemplate = TEMPLATES.find(t => t.id === defaultTemplateId) || TEMPLATES[0];

  const filteredSubspaces = subspaces.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSubspace = () => {
    const newSubspace: Subspace = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSubspaceTitle,
      description: newSubspaceDesc,
      image: 'https://images.unsplash.com/photo-1761370981247-1dfd749ec96b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9qZWN0JTIwZm9jdXMlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc2OTQ0MTk1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      memberCount: 1,
      status: 'Active',
      lastActive: 'Just now',
      templateId: newSubspaceTemplate
    };
    
    setSubspaces([newSubspace, ...subspaces]);
    setIsCreateModalOpen(false);
    setNewSubspaceTitle('');
    setNewSubspaceDesc('');
    setNewSubspaceTemplate(defaultTemplateId);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subspace?')) {
      setSubspaces(subspaces.filter(s => s.id !== id));
    }
  };

  const handleArchive = (id: string) => {
    setSubspaces(subspaces.map(s => s.id === id ? { ...s, status: 'Archived' } : s));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subspaces</h2>
        <p className="text-muted-foreground mt-2">
          Edit the Subspaces in this Space. Configure default templates and view all existing subspaces.
        </p>
      </div>

      <Separator />

      {/* 2. Default Subspace Template */}
      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-4 flex-1">
             <div>
               <h3 className="font-semibold text-lg flex items-center gap-2">
                 <LayoutTemplate className="w-5 h-5 text-primary" />
                 Default Subspace Template
               </h3>
               <p className="text-muted-foreground text-sm mt-1">
                 Choose the default settings that will apply when creating a new Subspace within this Space.
                 Templates can be modified during the creation process or at any time.
               </p>
             </div>
             
             <div className="flex items-start gap-4 p-4 bg-background border border-border rounded-lg shadow-sm max-w-2xl">
                <div className="w-24 h-16 rounded-md overflow-hidden shrink-0 bg-muted">
                   <ImageWithFallback 
                      src={currentDefaultTemplate.image} 
                      alt={currentDefaultTemplate.name} 
                      className="w-full h-full object-cover"
                   />
                </div>
                <div>
                   <h4 className="font-semibold text-foreground">{currentDefaultTemplate.name}</h4>
                   <p className="text-xs text-muted-foreground mt-1 mb-2">
                      {currentDefaultTemplate.description}
                   </p>
                   <div className="flex flex-wrap gap-2">
                      {currentDefaultTemplate.features.map(f => (
                        <Badge key={f} variant="secondary" className="text-[10px] px-1.5 h-5">
                           {f}
                        </Badge>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="shrink-0">
             <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
               <DialogTrigger asChild>
                 <Button>
                   Change Default Template
                 </Button>
               </DialogTrigger>
               <DialogContent className="max-w-3xl">
                 <DialogHeader>
                   <DialogTitle>Select Default Template</DialogTitle>
                   <DialogDescription>
                     Choose a template to be used as the default for new subspaces.
                   </DialogDescription>
                 </DialogHeader>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    {TEMPLATES.map(template => (
                      <div 
                        key={template.id}
                        className={cn(
                          "cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-md",
                          defaultTemplateId === template.id ? "ring-2 ring-primary border-primary" : "border-border"
                        )}
                        onClick={() => {
                          setDefaultTemplateId(template.id);
                          setIsTemplateModalOpen(false);
                        }}
                      >
                         <div className="h-32 bg-muted relative">
                           <ImageWithFallback 
                              src={template.image} 
                              alt={template.name}
                              className="w-full h-full object-cover" 
                           />
                           {defaultTemplateId === template.id && (
                             <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                               <Check className="w-4 h-4" />
                             </div>
                           )}
                         </div>
                         <div className="p-4">
                           <h4 className="font-semibold">{template.name}</h4>
                           <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                             {template.description}
                           </p>
                           <div className="flex flex-wrap gap-1 mt-3">
                              {template.features.slice(0, 2).map(f => (
                                <span key={f} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                  {f}
                                </span>
                              ))}
                              {template.features.length > 2 && (
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                  +{template.features.length - 2}
                                </span>
                              )}
                           </div>
                         </div>
                      </div>
                    ))}
                 </div>
               </DialogContent>
             </Dialog>
          </div>
        </div>
      </div>

      <Separator />

      {/* 3. Subspaces List */}
      <div className="space-y-4">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
               Subspaces
               <Badge variant="secondary" className="rounded-full">
                  {filteredSubspaces.length}
               </Badge>
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
               <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search subspaces..." 
                    className="pl-9 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
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
                     <DropdownMenuItem onClick={() => setStatusFilter('All')}>All</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setStatusFilter('Active')}>Active Only</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setStatusFilter('Archived')}>Archived Only</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <div className="border rounded-md flex items-center h-9 p-0.5 bg-muted/20">
                  <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8 rounded-sm"
                    onClick={() => setViewMode('grid')}
                  >
                     <Grid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8 rounded-sm"
                    onClick={() => setViewMode('list')}
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
                           Set up a new workspace within this space.
                        </DialogDescription>
                     </DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Subspace Name</label>
                           <Input 
                              placeholder="e.g. Q1 Marketing Campaign" 
                              value={newSubspaceTitle}
                              onChange={(e) => setNewSubspaceTitle(e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Description</label>
                           <Input 
                              placeholder="What is this space for?" 
                              value={newSubspaceDesc}
                              onChange={(e) => setNewSubspaceDesc(e.target.value)}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Template</label>
                           <div className="grid grid-cols-3 gap-2">
                              {TEMPLATES.map(t => (
                                <div 
                                  key={t.id}
                                  onClick={() => setNewSubspaceTemplate(t.id)}
                                  className={cn(
                                     "cursor-pointer border rounded p-2 text-center text-xs hover:bg-muted transition-colors",
                                     newSubspaceTemplate === t.id ? "bg-primary/5 border-primary ring-1 ring-primary" : "border-border"
                                  )}
                                >
                                   <div className="font-medium">{t.name}</div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateSubspace} disabled={!newSubspaceTitle}>Create Subspace</Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>
            </div>
         </div>

         {/* Grid View */}
         {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubspaces.map(subspace => (
                <div 
                  key={subspace.id} 
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col"
                >
                   <div className="h-32 bg-muted relative overflow-hidden">
                      <ImageWithFallback 
                         src={subspace.image} 
                         alt={subspace.name}
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
                               <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" /> View
                               </DropdownMenuItem>
                               <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" /> Edit Details
                               </DropdownMenuItem>
                               {subspace.status !== 'Archived' && (
                                 <DropdownMenuItem onClick={() => handleArchive(subspace.id)}>
                                    <Archive className="w-4 h-4 mr-2" /> Archive
                                 </DropdownMenuItem>
                               )}
                               <DropdownMenuSeparator />
                               <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(subspace.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                               </DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                      </div>
                      {subspace.status === 'Archived' && (
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
                            {subspace.name}
                         </h4>
                         <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">
                            {subspace.description}
                         </p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                         <div className="flex items-center gap-1.5" title={`${subspace.memberCount} members`}>
                            <Users className="w-3.5 h-3.5" />
                            {subspace.memberCount}
                         </div>
                         <div className="flex items-center gap-1.5" title="Last active">
                            <Calendar className="w-3.5 h-3.5" />
                            {subspace.lastActive}
                         </div>
                      </div>
                   </div>
                </div>
              ))}
              
              {/* Empty State */}
              {filteredSubspaces.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/10">
                   <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 opacity-50" />
                   </div>
                   <h3 className="font-medium text-lg text-foreground">No subspaces found</h3>
                   <p className="text-sm mt-1 mb-4">
                      Try adjusting your search or filters.
                   </p>
                   <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}>
                      Clear Filters
                   </Button>
                </div>
              )}
            </div>
         )}

         {/* List View */}
         {viewMode === 'list' && (
            <div className="border border-border rounded-xl overflow-hidden bg-card">
               {filteredSubspaces.map((subspace, i) => (
                  <div 
                    key={subspace.id}
                    className={cn(
                       "flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors",
                       i !== filteredSubspaces.length - 1 && "border-b border-border"
                    )}
                  >
                     <div className="w-16 h-12 rounded bg-muted overflow-hidden shrink-0">
                        <ImageWithFallback 
                           src={subspace.image} 
                           alt={subspace.name} 
                           className="w-full h-full object-cover"
                        />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <h4 className="font-medium text-sm text-foreground truncate">{subspace.name}</h4>
                           {subspace.status === 'Archived' && (
                              <Badge variant="secondary" className="text-[10px] py-0 h-5">Archived</Badge>
                           )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                           {subspace.description}
                        </p>
                     </div>
                     <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1.5 w-20">
                           <Users className="w-3.5 h-3.5" />
                           {subspace.memberCount}
                        </div>
                        <div className="flex items-center gap-1.5 w-24">
                           <Calendar className="w-3.5 h-3.5" />
                           {subspace.lastActive}
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
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Archive</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(subspace.id)}>
                                 Delete
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     </div>
                  </div>
               ))}
               {filteredSubspaces.length === 0 && (
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
