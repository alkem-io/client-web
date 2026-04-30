import { useState } from "react";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Trash2, 
  Eye, 
  Edit,
  LayoutTemplate,
  FileText,
  Users,
  PenTool
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Separator } from "@/app/components/ui/separator";

// --- Types ---

type TemplateCategory = 'Space' | 'Collaboration' | 'Whiteboard' | 'Brief' | 'Guidelines';

interface Template {
  id: string;
  name: string;
  description: string;
  image: string;
  category: TemplateCategory;
  isCustom: boolean;
  tags: string[];
}

interface TemplateSection {
  id: TemplateCategory;
  title: string;
  description: string;
  icon: React.ElementType;
}

// --- Mock Data ---

const SECTIONS: TemplateSection[] = [
  { 
    id: 'Space', 
    title: 'Space Templates', 
    description: 'Structure your space with predefined layouts and tools.',
    icon: LayoutTemplate
  },
  { 
    id: 'Collaboration', 
    title: 'Collaboration Tool Templates', 
    description: 'Tools for workshops, brainstorming, and group activities.',
    icon: Users
  },
  { 
    id: 'Whiteboard', 
    title: 'Whiteboard Templates', 
    description: 'Canvas layouts for visual collaboration.',
    icon: PenTool
  },
  { 
    id: 'Brief', 
    title: 'Brief Templates', 
    description: 'Standardized documents for projects and decisions.',
    icon: FileText
  },
  { 
    id: 'Guidelines', 
    title: 'Community Guidelines Templates', 
    description: 'Rules and expectations for your community.',
    icon: Users
  }
];

const MOCK_TEMPLATES: Template[] = [
  // Space Templates
  {
    id: 't1',
    name: "Creative Thinking Space",
    description: "A complete setup for design thinking workshops including whiteboards and breakout rooms.",
    image: "https://images.unsplash.com/photo-1768796370577-c6e8b708b980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHRoaW5raW5nJTIwd29ya3Nob3AlMjBicmFpbnN0b3JtaW5nfGVufDF8fHx8MTc2OTQ0MzIwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Space",
    isCustom: false,
    tags: ["Workshop", "Design"]
  },
  {
    id: 't2',
    name: "Agile Project Space",
    description: "Pre-configured for scrum teams with kanban boards and daily standup tools.",
    image: "https://images.unsplash.com/photo-1731924532579-d23ed102496c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwd2hpdGVib2FyZCUyMGNvbGxhYm9yYXRpb24lMjB1aXxlbnwxfHx8fDE3Njk0NDMyMDd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Space",
    isCustom: false,
    tags: ["Agile", "Management"]
  },
  
  // Collaboration Templates
  {
    id: 't3',
    name: "Brainstorming Session",
    description: "Structured flow for generating and voting on ideas.",
    image: "https://images.unsplash.com/photo-1768796370577-c6e8b708b980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHRoaW5raW5nJTIwd29ya3Nob3AlMjBicmFpbnN0b3JtaW5nfGVufDF8fHx8MTc2OTQ0MzIwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Collaboration",
    isCustom: false,
    tags: ["Ideation"]
  },
  
  // Whiteboard Templates
  {
    id: 't4',
    name: "Customer Journey Map",
    description: "Visual template for mapping user experiences.",
    image: "https://images.unsplash.com/photo-1690192168579-0f79e522a270?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwam91cm5leSUyMG1hcCUyMHN0aWNreSUyMG5vdGVzJTIwd2hpdGVib2FyZHxlbnwxfHx8fDE3Njk0NDM1OTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Whiteboard",
    isCustom: false,
    tags: ["UX", "Mapping"]
  },
  {
    id: 't5',
    name: "Retrospective Board",
    description: "Start/Stop/Continue layout for team retrospectives.",
    image: "https://images.unsplash.com/photo-1717994818193-266ff93e3396?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ2lsZSUyMHJldHJvc3BlY3RpdmUlMjB3aGl0ZWJvYXJkJTIwdGVtcGxhdGV8ZW58MXx8fHwxNzY5NDQzNTg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Whiteboard",
    isCustom: true,
    tags: ["Agile", "Team"]
  },

  // Brief Templates
  {
    id: 't6',
    name: "Product Requirements Doc",
    description: "Standard PRD template with sections for features, metrics, and timeline.",
    image: "https://images.unsplash.com/photo-1641395437808-10c477b8f199?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGRvY3VtZW50JTIwcHJvamVjdCUyMGJyaWVmfGVufDF8fHx8MTc2OTQ0MzIwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Brief",
    isCustom: false,
    tags: ["Product", "Doc"]
  },

  // Guidelines Templates
  {
    id: 't7',
    name: "Open Source Code of Conduct",
    description: "Standard Contributor Covenant tailored for open innovation spaces.",
    image: "https://images.unsplash.com/photo-1758275557296-0340762a4ab3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBndWlkZWxpbmVzJTIwaGFuZHNoYWtlJTIwZGl2ZXJzZSUyMGdyb3VwfGVufDF8fHx8MTc2OTQ0MzIwN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Guidelines",
    isCustom: false,
    tags: ["Community", "Legal"]
  }
];

// --- Components ---

function TemplateCard({ template, onAction }: { 
  template: Template, 
  onAction: (action: string, id: string) => void 
}) {
  return (
    <div className={cn(
      "group relative flex flex-col border rounded-lg overflow-hidden bg-card hover:shadow-md transition-all duration-200"
    )}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img 
          src={template.image} 
          alt={template.name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-2">
           <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm">
             {template.category}
           </Badge>
           {template.isCustom && (
             <Badge variant="default" className="bg-primary shadow-sm">
               Custom
             </Badge>
           )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div>
          <h4 className="font-semibold leading-none mb-1.5">{template.name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        </div>
        
        <div className="mt-auto flex items-center justify-end pt-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction('preview', template.id)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('duplicate', template.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate as Custom
              </DropdownMenuItem>
              {template.isCustom && (
                <>
                  <DropdownMenuItem onClick={() => onAction('edit', template.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onAction('delete', template.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export function SpaceSettingsTemplates() {
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Space: true,
    Collaboration: true,
    Whiteboard: true,
    Brief: true,
    Guidelines: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAction = (action: string, id: string) => {
    console.log(`Action: ${action} on template ${id}`);
    if (action === 'delete') {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
    // Implement other actions as needed
  };

  // Filter Logic
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTemplatesByCategory = (category: TemplateCategory) => {
    return filteredTemplates.filter(t => t.category === category);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
        <p className="text-muted-foreground mt-2">
          Select and manage the templates available to your space members. You can create custom templates or use templates from the General Library.
        </p>
      </div>

      <Separator />

      {/* 2. Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Template Sections */}
      <div className="space-y-6">
        {SECTIONS.map((section) => {
          const sectionTemplates = getTemplatesByCategory(section.id);
          const isEmpty = sectionTemplates.length === 0;
          
          return (
            <Collapsible 
              key={section.id}
              open={openSections[section.id]}
              onOpenChange={() => toggleSection(section.id)}
              className="bg-card border rounded-lg overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between bg-muted/20">
                 <CollapsibleTrigger asChild>
                   <div className="flex items-center gap-3 cursor-pointer select-none group">
                     <div className="p-2 bg-background border rounded-md group-hover:bg-accent transition-colors">
                       <section.icon className="w-5 h-5 text-muted-foreground" />
                     </div>
                     <div>
                       <div className="flex items-center gap-2">
                         <h3 className="font-semibold text-base">{section.title}</h3>
                         <Badge variant="secondary" className="text-xs h-5 px-1.5 min-w-[1.5rem] flex justify-center">
                            {sectionTemplates.length}
                         </Badge>
                       </div>
                       <p className="text-sm text-muted-foreground hidden sm:block">
                         {section.description}
                       </p>
                     </div>
                     {openSections[section.id] ? (
                       <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                     ) : (
                       <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
                     )}
                   </div>
                 </CollapsibleTrigger>
                 
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button size="sm" variant="outline" className="gap-2 hidden sm:flex">
                       <Plus className="w-4 h-4" />
                       Add New
                       <ChevronDown className="w-3 h-3 opacity-50" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-56">
                     <DropdownMenuItem onClick={() => handleAction('create_new', section.id)}>
                       <Plus className="w-4 h-4 mr-2" />
                       Create a new template
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleAction('select_library', section.id)}>
                       <LayoutTemplate className="w-4 h-4 mr-2" />
                       Select a template from the platform library
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>

                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button size="icon" variant="outline" className="sm:hidden h-8 w-8">
                       <Plus className="w-4 h-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-56">
                     <DropdownMenuItem onClick={() => handleAction('create_new', section.id)}>
                       <Plus className="w-4 h-4 mr-2" />
                       Create a new template
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleAction('select_library', section.id)}>
                       <LayoutTemplate className="w-4 h-4 mr-2" />
                       Select a template from the platform library
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
              </div>

              <CollapsibleContent>
                <div className="p-4 border-t">
                  {isEmpty ? (
                     <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                       <section.icon className="w-10 h-10 mb-3 opacity-20" />
                       <p className="font-medium">No templates found</p>
                       <p className="text-sm">Try searching for a different term or create a new template.</p>
                       <Button variant="link" size="sm" className="mt-2">
                         Browse General Library
                       </Button>
                     </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {sectionTemplates.map(template => (
                        <TemplateCard 
                          key={template.id} 
                          template={template} 
                          onAction={handleAction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {filteredTemplates.length === 0 && (
           <div className="text-center py-12">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="w-8 h-8 text-muted-foreground/50" />
             </div>
             <h3 className="text-lg font-semibold">No results found</h3>
             <p className="text-muted-foreground">
               No templates match your current search query.
             </p>
             <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchQuery('')}
             >
                Clear search
             </Button>
           </div>
        )}
      </div>
    </div>
  );
}
