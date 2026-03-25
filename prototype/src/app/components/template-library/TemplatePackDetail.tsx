import { useState, useMemo } from "react";
import { 
  ArrowLeft, Share2, Layers, Check, ChevronRight, Home, Image as ImageIcon,
  MoreHorizontal, Plus, Shield, FileText
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/app/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";
import { PACK_SPECIFIC_TEMPLATES } from "@/app/data/template-data";

// --- Mock Data ---

const PACK_DATA = {
  id: "pack-1",
  name: "Design Sprint Kit",
  description: "A complete set of tools to run a 5-day Design Sprint. Validate ideas, solve big problems, and test prototypes with customers.",
  author: "Google Ventures",
  organization: "GV",
  templateCount: 14,
  tags: ["Innovation", "Product", "Strategy", "Workshop"],
  image: "https://images.unsplash.com/photo-1554103210-26d928978fb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
};

const PACK_TEMPLATES = PACK_SPECIFIC_TEMPLATES;

const MOCK_SPACES = [
  { id: "space-1", name: "My Personal Space" },
  { id: "space-2", name: "Marketing Team" },
  { id: "space-3", name: "Product Development" },
  { id: "space-4", name: "Innovation Lab" }
];

// Group templates by type
const SECTIONS = [
  { id: "space", title: "Space Templates", type: "Space" },
  { id: "subspace", title: "Subspace Templates", type: "Subspace" },
  { id: "collab", title: "Collaboration Tools", type: "Collaboration Tool" },
  { id: "whiteboard", title: "Whiteboards", type: "Whiteboard" },
  { id: "guidelines", title: "Community Guidelines", type: "Community Guidelines" }
];

// --- Components ---

function TemplatePreview({ type, content, structure }: { type: string, content?: string | null, structure?: any }) {
  if (type === "Whiteboard") {
     return (
       <div className="w-full h-full bg-muted/30 relative overflow-hidden p-2 group-hover:bg-muted/50 transition-colors">
          <div className="absolute top-4 left-6 w-14 h-14 bg-warning/15 shadow-sm rounded-sm transform -rotate-2 border border-warning/20 flex items-center justify-center">
            <div className="w-8 h-1 bg-warning/30 rounded-full" />
          </div>
          <div className="absolute top-12 left-28 w-16 h-12 bg-info/15 shadow-sm rounded-sm transform rotate-3 border border-info/20" />
          <div className="absolute top-24 left-10 w-12 h-12 bg-destructive/10 shadow-sm rounded-full transform rotate-1 border border-destructive/20" />
          <div className="absolute top-6 right-8 w-20 h-20 border-2 border-dashed border-border rounded-lg opacity-50" />
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 text-muted-foreground/40">
             <path d="M 50 40 Q 80 40 90 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
             <path d="M 60 90 Q 90 100 120 80" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
       </div>
     );
  }

  if (type === "Space") {
      return (
         <div className="w-full h-full relative bg-muted overflow-hidden">
             {content ? (
                 <img 
                    src={content} 
                    alt="Space Banner" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground/40">
                    <ImageIcon className="w-8 h-8" />
                 </div>
             )}
             <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
             <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent pt-8">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                        <Home className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-white/90 shadow-sm tracking-wide">Space</span>
                </div>
             </div>
         </div>
      );
  }

  if (type === "Subspace") {
     return (
        <div className="w-full h-full relative bg-muted overflow-hidden">
             {content ? (
                 <img 
                    src={content} 
                    alt="Subspace Banner" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground/40">
                    <Layers className="w-8 h-8" />
                 </div>
             )}
             <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
             <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent pt-8">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-primary/20 backdrop-blur flex items-center justify-center border border-primary/30">
                        <Layers className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-white/90 shadow-sm tracking-wide">{type}</span>
                </div>
             </div>
        </div>
     );
  }

  // Construct text content from structure if raw content is missing
  let displayContent = content;
  
  if (!displayContent && structure) {
      if (type === "Post") {
          displayContent = (structure.title || structure.titleTemplate || "") + "\n\n" + (structure.body || structure.description || "");
      } else if (type === "Collaboration Tool") {
          displayContent = (structure.post?.title || "") + "\n" + (structure.post?.description || "") + "\n\nAttached: " + (structure.component?.name || "");
      } else if (type === "Community Guidelines") {
          displayContent = structure.categories?.map((c: any) => c.name + "\n- " + c.preview).join("\n\n");
      }
  }

  return (
    <div className="w-full h-full bg-card p-5 overflow-hidden relative group-hover:bg-muted/30 transition-colors">
       <div className="flex flex-col gap-2.5 h-full">
          {displayContent?.split('\n').map((line, i) => {
             if (!line.trim()) return <div key={i} className="h-1" />;
             // Heuristics for styling
             const isHeader = i === 0 || line.startsWith("#") || line.includes("Agenda") || line.match(/^\d\./) || line.includes("Highlights:") || line.includes("Guidelines:") || line.includes("Goals");
             const isList = line.trim().startsWith("-") || line.trim().startsWith("[");
             
             if (isHeader) {
                 return (
                     <div key={i} className={cn("font-semibold text-foreground", i === 0 ? "text-sm pb-1.5 border-b border-border flex items-center justify-between" : "text-xs mt-1")}>
                         {line.replace(/^#+\s/, "")}
                     </div>
                 );
             }
             if (isList) {
                 return (
                     <div key={i} className="flex items-start gap-2 pl-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-1.5 shrink-0" />
                         <span className="text-[11px] text-muted-foreground leading-relaxed">{line.replace(/^[-*\[\] ]+/, "")}</span>
                     </div>
                 );
             }
             return <div key={i} className="text-[11px] text-muted-foreground leading-relaxed">{line}</div>;
          })}
          {!displayContent && (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                  <FileText className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs">Preview unavailable</span>
              </div>
          )}
       </div>
       <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none group-hover:from-muted/20" />
    </div>
  );
}

function TemplateCard({ template, onApply }: { template: typeof PACK_TEMPLATES[0], onApply: (e: React.MouseEvent) => void }) {
  const navigate = useNavigate();
  const { packSlug } = useParams();

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply(e);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (packSlug) {
        navigate(`/templates/packs/${packSlug}/${template.id}`);
    } else {
        navigate(`/templates/${template.id}`);
    }
  };

  return (
    <div 
        onClick={handleViewDetails}
        className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer h-full"
    >
      <div className="relative h-32 w-full overflow-hidden bg-muted border-b border-border/50">
        <TemplatePreview type={template.type} content={template.previewContent} structure={template.structure} />
        <div className="absolute top-2 right-2">
             <Badge variant="secondary" className="backdrop-blur-md bg-white/90 shadow-sm text-[10px] h-5 px-1.5 font-normal border-white/50">
               {template.type}
             </Badge>
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h4 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1 mb-1">
             {template.name}
        </h4>
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 flex-1">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
           <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-[10px] px-2 text-muted-foreground hover:text-foreground"
            onClick={handleViewDetails}
           >
             View Details
           </Button>
           <Button 
             variant="secondary"
             size="sm" 
             className="h-7 text-[10px] px-2 gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
             onClick={handleApply}
           >
             <Plus className="w-3 h-3" />
             Quick Apply
           </Button>
        </div>
      </div>
    </div>
  );
}

export function TemplatePackDetail() {
  const navigate = useNavigate();
  const { packSlug } = useParams(); // In a real app we'd use this to fetch data
  
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [applyingItem, setApplyingItem] = useState<{ type: 'pack' | 'template', name: string } | null>(null);

  const openApplyDialog = (type: 'pack' | 'template', name: string) => {
    setApplyingItem({ type, name });
    setSelectedSpace("");
    setIsApplyDialogOpen(true);
  };

  const handleConfirmApply = () => {
    if (!selectedSpace) return;
    
    const spaceName = MOCK_SPACES.find(s => s.id === selectedSpace)?.name;
    
    setIsApplyDialogOpen(false);
    
    if (applyingItem?.type === 'pack') {
        toast.success(`Applying ${applyingItem.name} to ${spaceName}...`);
        setTimeout(() => {
            toast.success("Pack applied successfully!");
        }, 1500);
    } else if (applyingItem?.type === 'template') {
        toast.success(`Applied ${applyingItem.name} to ${spaceName}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
           {/* Breadcrumb / Back */}
           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/templates" className="hover:text-foreground hover:underline transition-colors flex items-center gap-1">
                 <ArrowLeft className="w-3 h-3" /> Template Library
              </Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="text-foreground font-medium truncate">{PACK_DATA.name}</span>
           </div>
           
           <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                 <div className="flex items-start gap-4">
                     <div className="hidden sm:block w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                        <img 
                          src={PACK_DATA.image} 
                          alt={PACK_DATA.name}
                          className="w-full h-full object-cover"
                        />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{PACK_DATA.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                            {PACK_DATA.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            <Badge variant="secondary" className="font-normal text-xs">{PACK_DATA.templateCount} Templates</Badge>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-xs text-muted-foreground">by <span className="font-medium text-foreground">{PACK_DATA.author}</span></span>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex gap-1.5">
                                {PACK_DATA.tags.map(tag => (
                                    <span key={tag} className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                     </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-3 md:self-center shrink-0 w-full md:w-auto">
                  <Button variant="outline" size="icon" className="shrink-0" title="Share Pack">
                      <Share2 className="w-4 h-4" />
                  </Button>
                  
                  <Button className="flex-1 md:flex-none" onClick={() => openApplyDialog('pack', PACK_DATA.name)}>
                      <Layers className="w-4 h-4 mr-2" />
                      Apply Entire Pack
                  </Button>
              </div>
           </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <Accordion type="multiple" defaultValue={["space", "subspace", "collab", "whiteboard", "guidelines"]}>
                {SECTIONS.map(section => {
                    const templates = PACK_TEMPLATES.filter(t => t.type === section.type);
                    if (templates.length === 0) return null;

                    return (
                        <AccordionItem key={section.id} value={section.id} className="px-6 border-b last:border-b-0 border-border">
                            <AccordionTrigger className="py-6 hover:no-underline hover:text-primary transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-semibold text-foreground">{section.title}</span>
                                    <Badge variant="secondary" className="text-xs px-2 h-5 rounded-full">{templates.length}</Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-8 pt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {templates.map(template => (
                                        <div key={template.id} className="h-64">
                                            <TemplateCard template={template} onApply={() => openApplyDialog('template', template.name)} />
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
         </div>
         
         {/* Related Packs Preview (Optional) */}
         <div className="mt-12 pt-8 border-t border-border">
             <h3 className="text-lg font-semibold mb-4">You might also like</h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-60 hover:opacity-100 transition-opacity">
                 {/* Placeholder for related packs - using static simplified cards */}
                 {[1, 2, 3].map(i => (
                     <div key={i} className="h-32 rounded-lg border border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                         Related Pack {i}
                     </div>
                 ))}
             </div>
         </div>
      </main>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply {applyingItem?.type === 'pack' ? 'Pack' : 'Template'}</DialogTitle>
            <DialogDescription>
              Select the space where you want to add <strong>{applyingItem?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
             <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                   Target Space
                </label>
                <Select value={selectedSpace} onValueChange={setSelectedSpace}>
                   <SelectTrigger>
                      <SelectValue placeholder="Select a space..." />
                   </SelectTrigger>
                   <SelectContent>
                      {MOCK_SPACES.map(space => (
                         <SelectItem key={space.id} value={space.id}>{space.name}</SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>
          </div>

          <DialogFooter>
             <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>Cancel</Button>
             <Button onClick={handleConfirmApply} disabled={!selectedSpace}>
                {applyingItem?.type === 'pack' ? 'Apply Pack' : 'Apply Template'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}