import { 
  X, Share2, MoreHorizontal, MessageSquare, ThumbsUp, Heart, Smile, 
  FileText, Link as LinkIcon, PenTool, Layout, Send, ChevronRight, Presentation, LayoutGrid,
  FileSpreadsheet, FileImage, Download, ExternalLink
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { ResponseDetailDialog } from "@/app/components/dialogs/ResponseDetailDialog";
import { DocumentDetailDialog } from "@/app/components/dialogs/DocumentDetailDialog";
import { PostProps } from "@/app/components/space/PostCard";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

interface PostDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: PostProps | null;
}

export function PostDetailDialog({ open, onOpenChange, post }: PostDetailDialogProps) {
  const [commentText, setCommentText] = useState("");
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<{ title: string; docType: 'word' | 'spreadsheet' | 'presentation'; size: string; lastEdited?: string } | null>(null);

  if (!post) return null;

  const handleShare = () => {
    toast.success("Link copied to clipboard");
  };

  const handleLevel3 = (responseTitle: string) => {
    // In a real app, we would pass the ID
    setSelectedResponseId("resp-1"); 
  };

  // Determine if we should show the contributions section
  const hasWhiteboards = post.contentPreview?.whiteboards && post.contentPreview.whiteboards.length > 0;
  const hasCollectionItems = post.contentPreview?.items && post.contentPreview.items.length > 0;
  const showContributions = hasWhiteboards || hasCollectionItems;

  const contributionsCount = (post.contentPreview?.whiteboards?.length || 0) + (post.contentPreview?.items?.length || 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-5xl h-[95vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border-none shadow-2xl rounded-xl z-50">
        
        {/* 1. Header Bar (Sticky, Light) */}
        <div className="h-16 shrink-0 bg-background text-foreground flex items-center justify-between px-6 shadow-sm border-b border-border z-20">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <DialogTitle className="text-base font-semibold leading-tight text-foreground line-clamp-1">
                {post.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                in Green Energy Space / Sustainability
              </DialogDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare} className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-5xl mx-auto w-full pb-20">
            
            {/* 2. Post Content Section */}
            <div className={cn("px-6 md:px-10 space-y-4", post.type === "document" ? "py-5" : "py-8 md:py-10 space-y-6")}>
              {post.type !== "document" && (
                <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {post.title}
                </h1>
              )}
              
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={post.author.avatarUrl} />
                  <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{post.author.name}</span>
                  <span className="text-xs text-muted-foreground">{post.timestamp} • {post.author.role}</span>
                </div>
              </div>

              <div className="prose prose-slate max-w-none dark:prose-invert text-foreground/90 leading-relaxed">
                <p>{post.snippet}</p>
                {/* Generic content only for non-document posts */}
                {post.type !== "document" && (
                  <>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    
                    {post.contentPreview?.imageUrl && (
                        <img 
                        src={post.contentPreview.imageUrl} 
                        alt="Post content" 
                        className="rounded-xl w-full max-h-[400px] object-cover my-6 shadow-sm"
                        />
                    )}

                    <h3 className="text-xl font-bold mt-6 mb-4">Key Discussion Points</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Impact on local community</li>
                      <li>Resource allocation requirements</li>
                      <li>Timeline for implementation</li>
                      <li>Success metrics and KPIs</li>
                    </ul>
                  </>
                )}
              </div>

              {/* Document Preview — click opens L3 Collabora editor */}
              {post.type === "document" && post.contentPreview?.documents && (() => {
                const docs = post.contentPreview.documents;
                const activeDoc = docs[activeDocIndex] || docs[0];
                const hasMultiple = docs.length > 1;

                const getDocIcon = (docType: 'word' | 'spreadsheet' | 'presentation') => {
                  switch (docType) {
                    case 'word': return <FileText className="w-4 h-4 text-blue-600" />;
                    case 'spreadsheet': return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
                    case 'presentation': return <FileImage className="w-4 h-4 text-orange-500" />;
                  }
                };

                const getDocPreview = (doc: typeof activeDoc) => {
                  switch (doc.docType) {
                    case 'word':
                      return (
                        <div className="bg-white dark:bg-zinc-900 px-10 py-8 min-h-[280px] relative">
                          <div className="space-y-2.5 text-[11px] text-foreground/70 leading-[1.7]">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 text-center">Municipality of Greenfield</p>
                            <h1 className="text-[14px] font-bold text-foreground text-center mb-0.5">2030 Renewable Transition Policy Proposal</h1>
                            <p className="text-[10px] text-muted-foreground text-center mb-4">Draft v3.2 — April 2026</p>
                            <div className="w-8 h-px bg-border mx-auto mb-3" />
                            <h2 className="text-[11px] font-bold text-foreground mt-3">1. Executive Summary</h2>
                            <p>This policy proposal outlines a comprehensive framework for achieving 100% renewable energy across all municipal operations by 2030.</p>
                            <h2 className="text-[11px] font-bold text-foreground mt-3">2. Current State Assessment</h2>
                            <p>As of Q1 2026, the municipality derives 42% of its energy from renewable sources, primarily wind (28%) and solar (14%).</p>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none" />
                        </div>
                      );
                    case 'spreadsheet':
                      return (
                        <div className="bg-white dark:bg-zinc-900 overflow-hidden min-h-[200px]">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="border border-border/40 px-3 py-1.5 text-left font-semibold text-muted-foreground">District</th>
                                <th className="border border-border/40 px-3 py-1.5 text-right font-semibold text-muted-foreground">Budget (€M)</th>
                                <th className="border border-border/40 px-3 py-1.5 text-right font-semibold text-muted-foreground">Timeline</th>
                                <th className="border border-border/40 px-3 py-1.5 text-right font-semibold text-muted-foreground">Risk</th>
                                <th className="border border-border/40 px-3 py-1.5 text-right font-semibold text-muted-foreground">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { district: 'North District', budget: '12.4', timeline: 'Q3 2027', risk: 'Medium', status: 'Planning' },
                                { district: 'Central Grid', budget: '28.1', timeline: 'Q1 2028', risk: 'High', status: 'Assessment' },
                                { district: 'South Campus', budget: '8.7', timeline: 'Q4 2027', risk: 'Low', status: 'Approved' },
                              ].map((row, i) => (
                                <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                                  <td className="border border-border/40 px-3 py-1.5 font-medium">{row.district}</td>
                                  <td className="border border-border/40 px-3 py-1.5 text-right tabular-nums">{row.budget}</td>
                                  <td className="border border-border/40 px-3 py-1.5 text-right">{row.timeline}</td>
                                  <td className="border border-border/40 px-3 py-1.5 text-right">{row.risk}</td>
                                  <td className="border border-border/40 px-3 py-1.5 text-right text-muted-foreground">{row.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    case 'presentation':
                      return (
                        <div className="aspect-[16/9] bg-gradient-to-br from-primary/90 to-primary/60 flex flex-col items-center justify-center text-white p-8">
                          <p className="text-xs uppercase tracking-widest opacity-70 mb-3">April 2026 Stakeholder Update</p>
                          <h2 className="text-xl font-bold text-center mb-2">2030 Renewable Transition</h2>
                          <p className="text-sm opacity-80 text-center max-w-xs">Progress Report & Revised Timeline</p>
                        </div>
                      );
                  }
                };

                return (
                  <div className="mt-6 space-y-3">
                    {/* Document cards — each is a clickable preview */}
                    {docs.map((doc, idx) => (
                      <div key={idx} className="rounded-xl border border-border overflow-hidden shadow-sm group cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        {/* Document info header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20 border-b border-border">
                          <div className="flex items-center gap-2 min-w-0">
                            {getDocIcon(doc.docType)}
                            <span className="text-sm font-medium truncate">{doc.title}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">({doc.size})</span>
                            {doc.lastEdited && (
                              <span className="text-[10px] text-muted-foreground/60 shrink-0">· {doc.lastEdited}</span>
                            )}
                          </div>
                        </div>
                        {/* Preview with overlay */}
                        <div className="relative">
                          <div className="max-h-[280px] overflow-hidden">
                            {getDocPreview(doc)}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/5 group-hover:bg-primary/15 transition-colors">
                            <Button variant="secondary" className="shadow-sm">Open Document</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* 5. Post Metadata / Reactions */}
              <div className="flex items-center gap-4 py-4 border-y border-border mt-8">
                <div className="flex -space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-info/10 text-info text-xs border border-background">👍</span>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive text-xs border border-background">❤️</span>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-warning/10 text-warning text-xs border border-background">💡</span>
                </div>
                <span className="text-sm text-muted-foreground font-medium">{post.stats.likes} reactions</span>
                
                <div className="flex-1" />
                
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <Smile className="w-4 h-4 text-muted-foreground" />
                  React
                </Button>
                <Button variant="outline" size="sm" className="gap-2 rounded-full">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                  Share
                </Button>
              </div>
            </div>

            {/* 3. Contributions/Responses Section - CONDITIONAL */}
            {showContributions && (
              <div className="bg-muted/30 py-10 px-6 md:px-10 border-t border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Contributions 
                    <Badge variant="secondary" className="rounded-full px-2">{contributionsCount}</Badge>
                  </h2>
                  
                  {/* Tabs for filtering - simplified for now */}
                  <Tabs defaultValue="all" className="w-auto">
                    <TabsList className="h-8 bg-background border border-border">
                      <TabsTrigger value="all" className="text-xs px-3 h-6">All</TabsTrigger>
                      <TabsTrigger value="whiteboards" className="text-xs px-3 h-6">Whiteboards</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Render Whiteboards */}
                  {post.contentPreview?.whiteboards?.map((wb, idx) => (
                    <div 
                      key={`wb-${idx}`}
                      className="group bg-background border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                      onClick={() => handleLevel3(wb.title)}
                    >
                      <div className="h-32 bg-muted relative overflow-hidden">
                        <ImageWithFallback 
                          src={wb.imageUrl} 
                          alt="Whiteboard" 
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md">
                          <PenTool className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{wb.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback>{wb.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{wb.author}</span>
                        </div>
                        <div className="text-xs text-muted-foreground/70 pt-1">
                          2d ago • 3 comments
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Render Collection Items */}
                  {post.contentPreview?.items?.map((item, idx) => (
                    <div 
                      key={`item-${idx}`}
                      className="group bg-background border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
                      onClick={() => handleLevel3(item.title)}
                    >
                      <div className="h-32 bg-accent/50 flex items-center justify-center relative">
                         <FileText className="w-10 h-10 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                         <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md">
                          <Layout className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
                        <div className="text-xs text-muted-foreground/70 pt-1">
                          {item.type.toUpperCase()} • 1d ago
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Response Card */}
                  <div 
                    className="group border-2 border-dashed border-muted-foreground/20 rounded-xl overflow-hidden hover:border-primary/50 hover:bg-muted/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary min-h-[180px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                       <PenTool className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Add Response</span>
                  </div>

                </div>
              </div>
            )}

            {/* 4. Comments Section */}
            <div className="px-[40px] py-[20px] md:px-10 max-w-4xl">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                Discussion
                <Badge variant="secondary" className="rounded-full px-2">{post.stats.comments}</Badge>
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Comments on this post</p>

              <div className="space-y-6 mb-8">
                {/* Mock Comment 1 */}
                <div className="flex gap-4">
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src="https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc2OTQ4MTEzMnww&ixlib=rb-4.1.0&q=80&w=1080" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Sarah Jenkins</span>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90">
                      Great initiative! I think we should also consider the implications on local traffic patterns.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                      <button className="hover:text-primary transition-colors">Reply</button>
                      <button className="hover:text-primary transition-colors">Like (2)</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Comment Input Box (Sticky Bottom) */}
        <div className="p-4 bg-background border-t border-border z-20">
          <div className="max-w-4xl mx-auto flex gap-3">
             <Avatar className="w-8 h-8">
               <AvatarFallback className="bg-primary/10 text-primary">ME</AvatarFallback>
             </Avatar>
             <div className="flex-1 relative">
                <Textarea 
                  placeholder="Type your comment here..." 
                  className="min-h-[44px] max-h-[120px] pr-20 resize-none py-3"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="h-7 w-7 rounded-md" disabled={!commentText.trim()}>
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
             </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>

    <ResponseDetailDialog 
      open={!!selectedResponseId} 
      onOpenChange={(open) => !open && setSelectedResponseId(null)}
      responseId={selectedResponseId}
    />
    <DocumentDetailDialog
      open={!!selectedDocument}
      onOpenChange={(open) => !open && setSelectedDocument(null)}
      document={selectedDocument}
      author={post?.author}
    />
    </>
  );
}