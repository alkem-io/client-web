import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { 
  ArrowLeft, Share2, Heart, Check, ChevronDown, ChevronRight, 
  Layers, Info, Calendar, Users, BarChart, FileText, Monitor, 
  MessageSquare, Home, Zap, StickyNote, Layout as LayoutIcon, Image as ImageIcon,
  BookOpen, List, Shield, ExternalLink, Grid, Paperclip, MoreHorizontal, PenTool
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { ALL_TEMPLATES } from "@/app/data/template-data";

const MOCK_SPACES = [
  { id: "space-1", name: "My Personal Space" },
  { id: "space-2", name: "Marketing Team" },
  { id: "space-3", name: "Product Development" },
  { id: "space-4", name: "Innovation Lab" }
];

// --- Header Component ---

function TemplateHeader({ template, onBack, onApply }: { template: any, onBack: () => void, onApply: () => void }) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Determine icon based on type
  const getTypeIcon = (type: string) => {
    switch(type) {
      case "Space": return <Home className="w-4 h-4" />;
      case "Subspace": return <Layers className="w-4 h-4" />;
      case "Whiteboard": return <Monitor className="w-4 h-4" />;
      case "Post": return <FileText className="w-4 h-4" />;
      case "Collaboration Tool": return <MessageSquare className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 pl-0 hover:bg-transparent hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <span className="text-border">/</span>
        <Link to="/templates" className="hover:text-foreground hover:underline">Template Library</Link>
        {template.packName && (
          <>
            <span className="text-border">/</span>
            <Link to={`/templates/packs/${template.packId}`} className="hover:text-foreground hover:underline">{template.packName}</Link>
          </>
        )}
        <span className="text-border">/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{template.name}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant="secondary" 
              className={cn(
                "h-6 px-2 gap-1.5 font-medium border",
                template.type === "Space" ? "bg-primary/10 text-primary border-primary/20" : 
                template.type === "Subspace" ? "bg-accent text-accent-foreground border-border" :
                "bg-muted text-muted-foreground border-border"
              )}
            >
              {getTypeIcon(template.type)}
              {template.type}
            </Badge>
            
            {template.type === "Collaboration Tool" && template.structure?.component && (
               <Badge variant="outline" className="h-6 px-2 text-muted-foreground border-dashed gap-1">
                 <span className="opacity-70">with</span> {template.structure.component.type}
               </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{template.name}</h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl">
            {template.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{template.author || "Alkemio"}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex gap-1.5">
              {template.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal text-muted-foreground bg-muted hover:bg-muted/80">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-[200px]">
          <Button size="lg" className="w-full sm:w-auto font-semibold shadow-sm" onClick={onApply}>
            <Zap className="w-4 h-4 mr-2 fill-current" />
            Apply This Template
          </Button>
          
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setIsFavorite(!isFavorite)}>
                    <Heart className={cn("w-4 h-4", isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Favorite</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Specialized Preview Components ---

function RenderSpaceContent({ structure }: { structure: any }) {
  const [activeTab, setActiveTab] = useState(structure?.tabs?.[0] || "About");
  
  if (!structure) return null;
  
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden flex flex-col h-full shadow-sm min-h-[500px]">
      {/* Space Header Mockup */}
      <div className="bg-white border-b border-border">
          <div className="h-32 bg-gradient-to-r from-primary/5 to-accent w-full relative">
              <div className="absolute -bottom-8 left-8 flex items-end">
                  <div className="w-16 h-16 bg-white rounded-lg border border-border shadow-sm flex items-center justify-center">
                      <Home className="w-8 h-8 text-primary" />
                  </div>
              </div>
          </div>
          <div className="pt-10 px-8 pb-0">
             <div className="flex gap-6 border-b border-transparent">
                  {structure.tabs?.map((tab: string) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "pb-3 text-sm font-medium border-b-2 transition-colors",
                            activeTab === tab 
                                ? "border-primary text-primary" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                      >
                          {tab}
                      </button>
                  ))}
             </div>
          </div>
          <Separator />
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-muted/30 p-8">
         <div className="max-w-4xl mx-auto">
             {/* Dynamic Content based on Active Tab */}
             
             {/* ABOUT TAB */}
             {activeTab === "About" && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
                         <h3 className="font-semibold text-lg mb-2">About this Space</h3>
                         <p className="text-muted-foreground leading-relaxed">{structure.about || "This space serves as a central hub for collaboration."}</p>
                     </div>
                     
                     {structure.samplePosts?.["About"] && (
                         <div className="space-y-3">
                             <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pinned Content</h4>
                             {structure.samplePosts["About"].map((post: any, i: number) => (
                                 <div key={i} className="bg-white p-4 rounded-lg border border-border flex items-start gap-3">
                                     <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center shrink-0">
                                         <Info className="w-4 h-4 text-info" />
                                     </div>
                                     <div>
                                         <div className="font-medium text-foreground">{post.title}</div>
                                         <div className="text-xs text-muted-foreground mt-1">Updated recently</div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             )}

             {/* SUBSPACES TAB */}
             {activeTab === "Subspaces" && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="grid grid-cols-1 gap-4">
                         {structure.subspaces?.map((sub: any, i: number) => (
                             <div key={i} className="bg-white p-4 rounded-lg border border-border shadow-sm hover:border-primary/50 transition-colors flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0 text-primary">
                                      {sub.icon === "Map" ? <Grid className="w-6 h-6" /> : 
                                       sub.icon === "PenTool" ? <Zap className="w-6 h-6" /> :
                                       <Layers className="w-6 h-6" />}
                                 </div>
                                 <div className="flex-1">
                                     <div className="font-semibold text-foreground">{sub.name}</div>
                                     <div className="text-sm text-muted-foreground">{sub.description}</div>
                                 </div>
                                 <Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                             </div>
                         ))}
                         {(!structure.subspaces || structure.subspaces.length === 0) && (
                             <div className="text-center py-10 text-muted-foreground">No subspaces included.</div>
                         )}
                     </div>
                 </div>
             )}

             {/* RESOURCES TAB */}
             {activeTab === "Resources" && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                         <div className="p-4 border-b border-border bg-muted/50 font-medium text-sm text-muted-foreground">Files & Links</div>
                         <div className="divide-y divide-border">
                             {structure.samplePosts?.["Resources"]?.map((res: any, i: number) => (
                                 <div key={i} className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                     {res.type === "File" ? <FileText className="w-5 h-5 text-info" /> : <ExternalLink className="w-5 h-5 text-success" />}
                                     <div className="flex-1">
                                         <div className="text-sm font-medium text-foreground">{res.title}</div>
                                         <div className="text-xs text-muted-foreground">{res.type} • Added recently</div>
                                     </div>
                                 </div>
                             ))}
                             {(!structure.samplePosts?.["Resources"]) && (
                                 <div className="p-8 text-center text-muted-foreground text-sm">No sample resources shown.</div>
                             )}
                         </div>
                     </div>
                 </div>
             )}

             {/* TEMPLATES TAB */}
             {activeTab === "Templates" && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {structure.templates?.map((temp: any, i: number) => (
                             <div key={i} className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col gap-2">
                                 <div className="flex items-center justify-between">
                                     <Badge variant="secondary" className="text-xs">{temp.type}</Badge>
                                 </div>
                                 <div className="font-medium text-foreground">{temp.name}</div>
                                 <div className="text-sm text-muted-foreground">Ready to use in this space.</div>
                                 <Button variant="outline" size="sm" className="w-full mt-2">Use Template</Button>
                             </div>
                         ))}
                          {(!structure.templates || structure.templates.length === 0) && (
                             <div className="col-span-2 text-center py-10 text-muted-foreground">No templates configured.</div>
                         )}
                     </div>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
}

function RenderSubspaceContent({ structure }: { structure: any }) {
  if (!structure) return null;

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
       <div className="p-6 border-b border-border bg-white">
          <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-primary">
                  <Layers className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-lg font-semibold text-foreground">Innovation Flow</h3>
                  <p className="text-muted-foreground text-xs">Subspace Structure</p>
              </div>
          </div>
          <p className="text-muted-foreground text-sm mt-2 max-w-3xl">{structure.description}</p>
       </div>
       
       <div className="p-0 bg-muted/50">
          <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
             {structure.stages?.map((stage: any, i: number) => (
                 <div key={i} className="relative pl-8 md:pl-0">
                     {/* Connector Line for Mobile/Desktop */}
                     {i < structure.stages.length - 1 && (
                        <div className="absolute left-[15px] top-10 bottom-[-20px] w-0.5 bg-border md:hidden" />
                     )}

                     <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
                         <div className="p-4 flex items-start gap-4 border-b border-border/50">
                             <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                                 {i + 1}
                             </div>
                             <div className="flex-1">
                                 <h4 className="font-semibold text-foreground">{stage.name}</h4>
                                 <p className="text-xs text-muted-foreground mb-3">{stage.posts?.length || 0} items included</p>
                                 
                                 <div className="space-y-2">
                                     {stage.posts?.map((post: string, k: number) => (
                                         <div key={k} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded border border-border/50">
                                             <FileText className="w-3.5 h-3.5 text-muted-foreground/60" />
                                             {post}
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             ))}
          </div>
       </div>
    </div>
  );
}

function RenderPostContent({ structure }: { structure: any }) {
  if (!structure) return null;
  
  const title = structure.title || structure.titleTemplate || "Post Title";
  const description = structure.description || "";
  const body = structure.body || "";

  return (
    <div className="max-w-2xl mx-auto w-full">
       <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
           <div className="p-6">
               <div className="flex items-start gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold shrink-0">
                       <Users className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                       <div className="flex items-center justify-between">
                           <div className="font-semibold text-sm text-foreground">Author Name</div>
                           <MoreHorizontal className="w-4 h-4 text-muted-foreground/60" />
                       </div>
                       <div className="text-xs text-muted-foreground">Just now • in General</div>
                   </div>
               </div>
               
               <div className="space-y-4">
                   <h2 className="text-lg font-bold text-foreground">{title}</h2>
                   <div className="prose prose-sm max-w-none text-muted-foreground">
                       <p>{description}</p>
                       {body && (
                           <div className="whitespace-pre-line mt-2 text-sm">
                               {body}
                           </div>
                       )}
                   </div>
               </div>
           </div>
       </div>
    </div>
  );
}

function RenderCollabContent({ structure }: { structure: any }) {
  if (!structure) return null;

  return (
    <div className="max-w-2xl mx-auto w-full">
       <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
           <div className="p-6">
               <div className="flex items-start gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info font-bold shrink-0">
                       <Users className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                       <div className="flex items-center justify-between">
                           <div className="font-semibold text-sm text-foreground">Alkemio User</div>
                           <MoreHorizontal className="w-4 h-4 text-muted-foreground/60" />
                       </div>
                       <div className="text-xs text-muted-foreground">Just now</div>
                   </div>
               </div>
               
               <div className="space-y-4 mb-6">
                   <h2 className="text-lg font-bold text-foreground">{structure.post?.title || "Post Title"}</h2>
                   <div className="prose prose-sm max-w-none text-muted-foreground">
                       <p>{structure.post?.description}</p>
                       {structure.post?.body && (
                           <div className="whitespace-pre-line mt-2 text-sm">
                               {structure.post.body}
                           </div>
                       )}
                   </div>
               </div>
               
               {/* Attached Component Card */}
               <div className="mt-4">
                   <div className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-all cursor-pointer group shadow-sm">
                       <div className="h-40 bg-muted relative flex items-center justify-center overflow-hidden">
                           <Grid className="absolute inset-0 text-border w-full h-full opacity-50" />
                           
                           {structure.component?.type === "Whiteboard" ? (
                               <div className="bg-card p-2 rounded shadow-sm border border-border absolute inset-4 flex flex-col gap-2">
                                   <div className="flex gap-2 border-b border-border/50 pb-2">
                                       <div className="w-6 h-6 bg-muted rounded" />
                                       <div className="w-6 h-6 bg-muted rounded" />
                                       <div className="flex-1" />
                                       <div className="w-16 h-6 bg-muted rounded" />
                                   </div>
                                   <div className="flex-1 relative">
                                       <div className="absolute top-4 left-4 w-12 h-12 bg-warning/15 border border-warning/20 rounded-sm shadow-sm rotate-1" />
                                       <div className="absolute top-8 right-8 w-16 h-10 bg-info/15 border border-info/20 rounded-sm shadow-sm -rotate-2" />
                                   </div>
                               </div>
                           ) : (
                               <div className="bg-card p-4 rounded shadow-sm border border-border absolute inset-8 flex flex-col">
                                   <div className="h-4 w-1/2 bg-muted rounded mb-3" />
                                   <div className="space-y-2">
                                       <div className="h-2 w-full bg-muted/50 rounded" />
                                       <div className="h-2 w-full bg-muted/50 rounded" />
                                       <div className="h-2 w-3/4 bg-muted/50 rounded" />
                                   </div>
                               </div>
                           )}
                           
                           <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded text-[10px] font-medium border border-border text-muted-foreground flex items-center gap-1">
                               {structure.component?.type === "Whiteboard" ? <Monitor className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                               Click to open
                           </div>
                       </div>
                       
                       <div className="p-3 bg-muted/50 border-t border-border/50 flex items-center justify-between">
                           <div>
                               <div className="flex items-center gap-2 mb-0.5">
                                   <h4 className="font-medium text-foreground text-sm">{structure.component?.name}</h4>
                                   <Badge variant="outline" className="text-[10px] h-4 px-1 bg-background border-border text-muted-foreground">{structure.component?.type}</Badge>
                               </div>
                               <p className="text-xs text-muted-foreground truncate max-w-[200px]">{structure.component?.preview}</p>
                           </div>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ExternalLink className="w-4 h-4 text-muted-foreground/60" /></Button>
                       </div>
                   </div>
               </div>
           </div>
       </div>

       <div className="flex justify-center mt-6">
           <Button variant="outline" className="gap-2">
               <Zap className="w-4 h-4" /> Preview This Flow
           </Button>
       </div>
    </div>
  );
}

function RenderWhiteboardContent({ template }: { template: any }) {
  // Pure whiteboard preview, no post wrapper
  return (
    <div className="w-full h-[600px] bg-card rounded-xl overflow-hidden border border-border relative flex flex-col shadow-sm">
        {/* Mock Whiteboard Toolbar */}
        <div className="h-12 border-b border-border bg-muted/50 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded hover:bg-muted cursor-pointer text-muted-foreground"><Monitor className="w-4 h-4" /></div>
                <div className="h-4 w-[1px] bg-border mx-1" />
                <div className="p-1.5 rounded hover:bg-muted cursor-pointer text-muted-foreground"><PenTool className="w-4 h-4" /></div>
                <div className="p-1.5 rounded hover:bg-muted cursor-pointer text-muted-foreground"><StickyNote className="w-4 h-4" /></div>
                <div className="p-1.5 rounded hover:bg-muted cursor-pointer text-muted-foreground"><ImageIcon className="w-4 h-4" /></div>
            </div>
            <div className="text-xs font-medium text-muted-foreground">{template.name}</div>
            <div className="flex items-center gap-2">
                 <div className="text-xs text-muted-foreground/60">100%</div>
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-muted/30 overflow-hidden cursor-move group">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(var(--muted-foreground) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              </div>
              
              {/* Mock Content on Canvas */}
              <div className="absolute inset-0 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700 ease-out">
                 {/* Zone 1 */}
                 <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                     <div className="w-48 h-48 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-background/50">
                         <span className="text-muted-foreground/60 text-xs font-medium uppercase tracking-widest">Brainstorming Zone</span>
                     </div>
                     <div className="absolute -top-4 -right-4 w-32 h-32 bg-warning/15 shadow-md rounded-sm transform rotate-6 border border-warning/20 p-4 flex items-center justify-center text-center">
                         <span className="text-sm text-foreground/80">How might we...?</span>
                     </div>
                 </div>

                 {/* Zone 2 */}
                 <div className="absolute bottom-1/3 right-1/4 transform translate-x-1/2 translate-y-1/2">
                     <div className="w-64 h-40 bg-card border border-border rounded shadow-lg p-4 flex flex-col gap-2">
                         <div className="h-3 w-1/3 bg-muted rounded" />
                         <div className="h-2 w-full bg-muted/50 rounded" />
                         <div className="h-2 w-full bg-muted/50 rounded" />
                         <div className="h-2 w-2/3 bg-muted/50 rounded" />
                         <div className="mt-auto flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-info/15 border border-info/20" />
                            <div className="w-6 h-6 rounded-full bg-success/15 border border-success/20" />
                         </div>
                     </div>
                 </div>
              </div>
        </div>
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <Button variant="default" className="shadow-lg">
                <Monitor className="w-4 h-4 mr-2" />
                Open Interactive Board
            </Button>
        </div>
    </div>
  );
}

function RenderBriefContent({ structure }: { structure: any }) {
    if (!structure) return null;
    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm p-8">
            <div className="max-w-3xl mx-auto border border-border shadow-sm min-h-[600px] bg-card p-10 relative">
                <div className="border-b border-border/50 pb-6 mb-8">
                    <div className="h-8 w-2/3 bg-muted rounded mb-4" />
                    <div className="flex gap-4">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-4 w-24 bg-muted rounded" />
                    </div>
                </div>
                
                <div className="space-y-8">
                    {structure.sections?.map((section: any, i: number) => (
                        <div key={i} className="space-y-3">
                            <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">{section.title}</h4>
                            <p className="text-sm text-muted-foreground italic">{section.description}</p>
                            <div className="p-4 bg-muted/50 border border-border/50 rounded border-dashed min-h-[60px] flex items-center justify-center text-xs text-muted-foreground/60">
                                {section.type} Input Area
                            </div>
                        </div>
                    ))}
                    {!structure.sections && (
                        <div className="text-center text-muted-foreground/60 py-12">No section data available</div>
                    )}
                </div>
            </div>
            <div className="flex justify-center mt-6">
                <Button variant="outline">View Full Document</Button>
            </div>
        </div>
    );
}

function RenderCommunityGuidelines({ structure }: { structure: any }) {
    if (!structure) return null;
    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm p-8 bg-muted/30">
            <div className="max-w-2xl mx-auto space-y-6">
                 {structure.categories?.map((cat: any, i: number) => (
                     <div key={i} className="bg-card p-6 rounded-lg border border-border shadow-sm">
                         <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                             <Shield className="w-5 h-5 text-success" />
                             {cat.name}
                         </h3>
                         <p className="text-muted-foreground text-sm leading-relaxed border-l-2 border-border pl-4">
                             {cat.preview}
                         </p>
                     </div>
                 ))}
            </div>
        </div>
    );
}

function TemplatePreview({ template }: { template: any }) {
  const { type, structure } = template;

  if (type === "Space") return <RenderSpaceContent structure={structure} />;
  if (type === "Subspace") return <RenderSubspaceContent structure={structure} />;
  if (type === "Collaboration Tool") return <RenderCollabContent structure={structure} />;
  if (type === "Whiteboard") return <RenderWhiteboardContent template={template} />;
  if (type === "Community Guidelines") return <RenderCommunityGuidelines structure={structure} />;
  if (type === "Post") return <RenderPostContent structure={structure} />;
  
  // Default/Fallback
  return (
    <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
       <div className="max-w-2xl mx-auto">
           <div className="mb-6 pb-6 border-b border-border">
               <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Title Format</div>
               <div className="text-lg font-medium text-foreground font-mono bg-muted/50 p-3 rounded border border-border inline-block">
                   {structure?.titleTemplate || "[Title Here]"}
               </div>
           </div>
           
           <div className="space-y-6">
               <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Template Fields</div>
               {structure?.fields?.map((field: any, i: number) => (
                   <div key={i} className="space-y-2">
                       <label className="text-sm font-medium text-foreground/80">{typeof field === 'string' ? field : field.label}</label>
                       <div className="h-10 bg-muted/50 border border-border rounded w-full" />
                   </div>
               ))}
               {!structure?.fields && <div className="text-muted-foreground/60 italic">No specific fields defined.</div>}
               
               {structure?.richText && (
                   <div className="flex items-center gap-2 text-xs text-muted-foreground bg-info/10 p-2 rounded text-info w-fit">
                       <FileText className="w-3 h-3" /> Supports Rich Text Formatting
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}

function MetadataPanel({ template }: { template: any }) {
  const showInstructions = !!template.instructions;
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);

  return (
    <div className="space-y-6">
      {showInstructions && (
        <div className="bg-info/5 rounded-xl border border-info/15 overflow-hidden shadow-sm">
          <button 
            onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
            className="w-full flex items-center justify-between p-4 bg-info/10 hover:bg-info/15 transition-colors text-left border-b border-info/15"
          >
             <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
               <Info className="w-4 h-4 text-info" />
               How to Use This Template
             </h3>
             {isInstructionsOpen ? <ChevronDown className="w-4 h-4 text-info" /> : <ChevronRight className="w-4 h-4 text-info" />}
          </button>
          
          {isInstructionsOpen && (
            <div className="p-5 animate-in slide-in-from-top-2 duration-200 bg-background/50">
               <div 
                 className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
                 dangerouslySetInnerHTML={{ __html: template.instructions }}
               />
               <p className="text-xs text-muted-foreground/60 mt-4 pt-4 border-t border-info/15 italic">
                  These instructions are informational. Keep them as reference or customize per your needs.
               </p>
            </div>
          )}
        </div>
      )}

      {/* About Section */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4 shadow-sm">
        <h3 className="font-semibold text-foreground">About This Template</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Usage
            </span>
            <span className="font-medium">{template.usageCount || 120} members</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Updated
            </span>
            <span className="font-medium">{template.lastUpdated || "Recently"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <BarChart className="w-4 h-4" /> Complexity
            </span>
            <Badge variant="outline" className="font-normal text-xs">{template.complexity || "Intermediate"}</Badge>
          </div>
        </div>
        
        <Separator />
        
        <div>
           <h4 className="text-sm font-medium mb-3">What's Included</h4>
           <div className="space-y-2">
              {template.type === "Collaboration Tool" && template.structure?.component ? (
                <>
                  <div className="text-sm text-muted-foreground flex items-start gap-2 bg-muted/50 p-2 rounded">
                     <Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
                     <span><strong>1 Post Template:</strong> {template.structure.post?.title || "Standard Post"}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-start gap-2 bg-muted/50 p-2 rounded">
                     <Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
                     <span><strong>1 Attached Tool:</strong> {template.structure.component.name} ({template.structure.component.type})</span>
                  </div>
                </>
              ) : template.type === "Space" ? (
                <>
                   <div className="text-sm text-muted-foreground flex items-start gap-2">
                     <Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
                     <span>{template.structure?.subspaces?.length || 0} Subspaces</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-start gap-2">
                     <Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
                     <span>{template.structure?.templates?.length || 0} Pre-configured Templates</span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground flex items-start gap-2">
                   <Check className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
                   <span>Standard {template.type} Structure</span>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Related Templates */}
      <div>
         <h3 className="font-semibold text-foreground mb-3">Related Templates</h3>
         <div className="space-y-3">
            {ALL_TEMPLATES
              .filter(t => t.type === template.type && t.id !== template.id)
              .slice(0, 3)
              .map(related => (
                <Link 
                  key={related.id} 
                  to={`/templates/${related.id}`}
                  className="block group bg-card border border-border rounded-lg p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                     <Badge variant="secondary" className="text-[10px] h-4 px-1">{related.type}</Badge>
                     <span className="text-[10px] text-muted-foreground">{related.usageCount || 45} uses</span>
                  </div>
                  <h4 className="text-sm font-medium group-hover:text-primary transition-colors truncate">{related.name}</h4>
                </Link>
              ))
            }
         </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export function TemplateDetail() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string>("");

  const handleApplyClick = () => {
    setIsApplyDialogOpen(true);
  };

  const handleConfirmApply = () => {
    if (!selectedSpace) return;
    const spaceName = MOCK_SPACES.find(s => s.id === selectedSpace)?.name;
    setIsApplyDialogOpen(false);
    toast.success(`Applied ${template.name} to ${spaceName}`);
  };

  useEffect(() => {
    // Simulate API fetch
    setIsLoading(true);
    const foundTemplate = ALL_TEMPLATES.find(t => t.id === templateId);
    
    // Slight delay to mock network
    const timer = setTimeout(() => {
       setTemplate(foundTemplate || null);
       setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [templateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading template...</p>
         </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
         <h2 className="text-2xl font-bold mb-2">Template Not Found</h2>
         <p className="text-muted-foreground mb-6">The template you are looking for does not exist or has been removed.</p>
         <Button onClick={() => navigate("/templates")}>Back to Library</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8">
           <TemplateHeader template={template} onBack={() => navigate(-1)} onApply={handleApplyClick} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           {/* Left Column: Preview Content (60%) */}
           <div className="lg:col-span-8 space-y-8">
              <TemplatePreview template={template} />
              
              <div className="block lg:hidden">
                 <MetadataPanel template={template} />
              </div>
           </div>

           {/* Right Column: Metadata (40%) - Sticky */}
           <div className="hidden lg:block lg:col-span-4 sticky top-6">
              <MetadataPanel template={template} />
           </div>
        </div>

      </div>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Template</DialogTitle>
            <DialogDescription>
              Select the space where you want to add <strong>{template?.name}</strong>.
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
                Apply Template
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}