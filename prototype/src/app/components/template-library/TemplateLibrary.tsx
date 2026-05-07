import { useState, useMemo } from "react";
import { 
  Search, Filter, ChevronRight, Layout, Users, FileText, 
  Monitor, Info, Star, Plus, ArrowRight, BookOpen, Layers,
  ChevronLeft, MoreHorizontal, Home, Image as ImageIcon, Shield
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { useNavigate } from "react-router";
import { TEMPLATE_PACKS, INDIVIDUAL_TEMPLATES, CATEGORIES, ALL_TEMPLATES } from "@/app/data/template-data";

// --- Components ---

function PackCard({ pack, onClick }: { pack: typeof TEMPLATE_PACKS[0], onClick: () => void }) {
  return (
    <div 
        onClick={onClick}
        className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        <img 
          src={pack.image} 
          alt={pack.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold shadow-sm">
          {pack.templateCount} Templates
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold", pack.color)}>
              {pack.initials}
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{pack.name}</h3>
              {pack.author && <p className="text-[10px] text-muted-foreground">by {pack.author}</p>}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">{pack.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {pack.tags.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 h-5 font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ type, content, structure }: { type: string, content?: string, structure?: any }) {
  // Whiteboard: Keep existing but enhanced for new size
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

  // Space: Banner Image
  if (type === "Space") {
      return (
         <div className="w-full h-full relative bg-muted overflow-hidden">
             {content ? (
                 <img 
                    src={content} 
                    alt="Space Banner" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground/50">
                    <ImageIcon className="w-8 h-8" />
                 </div>
             )}
             
             {/* Gradient overlay for text readability if we wanted to add text, but also adds depth */}
             <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
             
             {/* Space "Header" simulation */}
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

  // Subspace: Tabs visualization -> Replaced with Image Banner
  if (type === "Subspace") {
     return (
        <div className="w-full h-full relative bg-muted overflow-hidden">
             {content ? (
                 <img 
                    src={content} 
                    alt="Subspace Banner" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground/50">
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

  // Fallback Text-based previews: mostly for unexpected types
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
                     <div key={i} className={cn(
                         "font-semibold text-foreground",
                         i === 0 ? "text-sm pb-1.5 border-b border-border flex items-center justify-between" : "text-xs mt-1"
                     )}>
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

             return (
                 <div key={i} className="text-[11px] text-muted-foreground leading-relaxed">
                     {line}
                 </div>
             );
          })}
          {!displayContent && (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                  <FileText className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs">Preview unavailable</span>
              </div>
          )}
       </div>
       
       {/* Bottom fade for overflow */}
       <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none group-hover:from-muted/20" />
    </div>
  );
}

function TemplateCard({ template }: { template: typeof INDIVIDUAL_TEMPLATES[0] }) {
  const navigate = useNavigate();

  return (
    <div 
        onClick={() => navigate(`/templates/${template.id}`)}
        className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer h-full"
    >
      {/* Preview Section - Expanded to match PackCard style */}
      <div className="relative h-44 w-full overflow-hidden bg-muted border-b border-border/50">
        <TemplatePreview type={template.type} content={template.previewContent} structure={template.structure} />
        
        {/* Type Badge overlaid on image - different style for image-based backgrounds */}
        <div className="absolute top-3 right-3">
             <Badge 
               variant="secondary" 
               className={cn(
                 "backdrop-blur-md shadow-sm text-[10px] h-5 px-1.5 font-normal border-white/50",
                 (template.type === "Space" || template.type === "Whiteboard" || template.type === "Subspace") ? "bg-background/90 text-foreground" : "bg-muted/90 text-muted-foreground"
               )}
             >
               {template.type}
             </Badge>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
           <h4 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1" title={template.name}>
             {template.name}
           </h4>
           <p className="text-[10px] text-muted-foreground mt-1">{template.category}</p>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {template.description}
        </p>
        
        {template.packId && (
          <div className="mt-4">
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal bg-info/10 text-info border-info/15 flex items-center gap-1 w-fit max-w-full truncate">
                <Layers className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Part of {template.packName}</span>
              </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button 
        variant="outline" 
        size="icon" 
        className="w-8 h-8" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <div className="text-sm font-medium text-muted-foreground px-2">
        Page {currentPage} of {totalPages}
      </div>

      <Button 
        variant="outline" 
        size="icon" 
        className="w-8 h-8" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// --- Main Page Component ---

export function TemplateLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  
  // Pagination State
  const [packPage, setPackPage] = useState(1);
  const [templatePage, setTemplatePage] = useState(1);
  
  const PACKS_PER_PAGE = 6;
  const TEMPLATES_PER_PAGE = 12;

  const filteredPacks = useMemo(() => {
    return TEMPLATE_PACKS.filter(pack => 
      pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const filteredTemplates = useMemo(() => {
    return ALL_TEMPLATES.filter(temp => {
      const matchesSearch = temp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            temp.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || temp.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Pagination Logic
  const totalPackPages = Math.ceil(filteredPacks.length / PACKS_PER_PAGE);
  const currentPacks = filteredPacks.slice((packPage - 1) * PACKS_PER_PAGE, packPage * PACKS_PER_PAGE);

  const totalTemplatePages = Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE);
  const currentTemplates = filteredTemplates.slice((templatePage - 1) * TEMPLATES_PER_PAGE, templatePage * TEMPLATES_PER_PAGE);

  // Reset pagination when filters change
  useMemo(() => {
    setPackPage(1);
    setTemplatePage(1);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header & Sticky Search */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="px-6 md:px-8 py-4">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Template Library</h1>
              <p className="text-sm text-muted-foreground mt-1">Explore curated template packs and individual templates to enhance your space.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search templates, packs, or keywords..." 
                className="pl-9 bg-muted/50 border-border focus:bg-background h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full px-6 md:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 space-y-12">
          
          {/* Template Packs Section */}
          {(filteredPacks.length > 0) && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    Template Packs 
                    <Badge variant="secondary" className="text-[10px] h-5">{filteredPacks.length}</Badge>
                  </h2>
                  <p className="text-sm text-muted-foreground">Coherent sets of templates curated around specific themes.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentPacks.map(pack => (
                  <PackCard 
                    key={pack.id} 
                    pack={pack} 
                    onClick={() => navigate(`/templates/packs/${pack.id}`)}
                  />
                ))}
              </div>
              
              <Pagination 
                currentPage={packPage} 
                totalPages={totalPackPages} 
                onPageChange={setPackPage} 
              />
            </section>
          )}

          {(filteredPacks.length > 0) && <Separator />}

          {/* Individual Templates Section */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Templates
                  <Badge variant="secondary" className="text-[10px] h-5">{filteredTemplates.length}</Badge>
                </h2>
                <p className="text-sm text-muted-foreground">Browse individual templates organized by type.</p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide w-full md:w-auto">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                      selectedCategory === cat 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                    className="text-xs text-muted-foreground hover:text-foreground ml-2 whitespace-nowrap"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Displaying as a simplified grid for pagination clarity with large datasets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>

            <Pagination 
              currentPage={templatePage} 
              totalPages={totalTemplatePages} 
              onPageChange={setTemplatePage} 
            />

            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 opacity-50" />
                </div>
                <p className="font-medium">No templates found</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
                <Button 
                  variant="link" 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </section>

          </div>
        </div>
      </main>
    </div>
  );
}