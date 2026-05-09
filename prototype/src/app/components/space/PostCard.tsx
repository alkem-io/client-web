import { useState } from "react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageSquare, MoreHorizontal, LayoutGrid, FileText, Presentation, Maximize2, FileSpreadsheet, FileImage } from "lucide-react";

export type PostType = "text" | "whiteboard" | "collection" | "call-for-whiteboards" | "document";

export interface PostProps {
  id: string;
  type: PostType;
  author: {
    name: string;
    avatarUrl?: string;
    role: string;
  };
  title: string;
  snippet: string;
  timestamp: string;
  contentPreview?: {
    imageUrl?: string;
    items?: Array<{ title: string; type: string }>;
    whiteboards?: Array<{ title: string; imageUrl: string; author: string }>;
    documents?: Array<{ title: string; docType: 'word' | 'spreadsheet' | 'presentation'; size: string; lastEdited?: string }>;
    documentDisplayMode?: 'scroll' | 'paginated';
  };
  stats: {
    comments: number;
  };
  onClick?: () => void;
  onDocumentClick?: (doc: { title: string; docType: 'word' | 'spreadsheet' | 'presentation'; size: string; lastEdited?: string }) => void;
}

export function PostCard({ post }: { post: PostProps }) {
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [activeDocPage, setActiveDocPage] = useState(0);
  const getDocIcon = (docType: 'word' | 'spreadsheet' | 'presentation') => {
    switch (docType) {
      case 'word': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'spreadsheet': return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'presentation': return <FileImage className="w-5 h-5 text-orange-500" />;
    }
  };

  const getDocLabel = (docType: 'word' | 'spreadsheet' | 'presentation') => {
    switch (docType) {
      case 'word': return 'Word Document';
      case 'spreadsheet': return 'Spreadsheet';
      case 'presentation': return 'Presentation';
    }
  };

  const getIcon = () => {
    switch (post.type) {
      case "whiteboard": return <LayoutGrid className="w-4 h-4" />;
      case "collection": return <LayoutGrid className="w-4 h-4" />;
      case "call-for-whiteboards": return <Presentation className="w-4 h-4" />;
      case "document": return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (post.type) {
      case "whiteboard": return "Whiteboard";
      case "collection": return "Collection";
      case "call-for-whiteboards": return "Call for Whiteboards";
      case "document": return "Document";
      default: return "Post";
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300 border-border/60">
      <CardHeader className="flex flex-row items-start justify-between pb-3 pt-5 px-6 space-y-0">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{post.author.name}</span>
              <span className="text-xs text-muted-foreground">• {post.timestamp}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                {post.author.role}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {getIcon()} {getLabel()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              post.onClick?.();
            }}
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-3">
        <h3 
          className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors cursor-pointer"
          onClick={post.onClick}
        >
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {post.snippet}
        </p>

        {post.type === "whiteboard" && post.contentPreview?.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-border bg-muted/30 relative aspect-video">
            <ImageWithFallback 
              src={post.contentPreview.imageUrl} 
              alt="Whiteboard preview" 
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary/40">
              <Button variant="secondary" className="shadow-sm">Open Whiteboard</Button>
            </div>
          </div>
        )}

        {post.type === "collection" && post.contentPreview?.items && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {post.contentPreview.items.slice(0, 4).map((item, idx) => (
              <div key={idx} className="bg-muted/30 rounded-md p-3 border border-border flex items-center gap-2">
                <div className="w-8 h-8 bg-background rounded flex items-center justify-center border border-border shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium truncate">{item.title}</span>
              </div>
            ))}
          </div>
        )}

        {post.type === "document" && post.contentPreview?.documents && (() => {
          const docs = post.contentPreview.documents;
          const activeDoc = docs[activeDocIndex] || docs[0];
          const hasMultiple = docs.length > 1;

          // Static document preview thumbnail based on type
          const getDocPreviewThumbnail = (doc: typeof activeDoc) => {
            switch (doc.docType) {
              case 'word':
                return (
                  <div className="bg-white dark:bg-zinc-900 px-10 py-8 min-h-[280px]">
                    <div className="space-y-2.5 text-[11px] text-foreground/70 leading-[1.7]">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 text-center">Municipality of Greenfield</p>
                      <h1 className="text-[14px] font-bold text-foreground text-center mb-0.5">2030 Renewable Transition Policy Proposal</h1>
                      <p className="text-[10px] text-muted-foreground text-center mb-4">Draft v3.2 — April 2026</p>
                      <div className="w-8 h-px bg-border mx-auto mb-3" />
                      <h2 className="text-[11px] font-bold text-foreground mt-3">1. Executive Summary</h2>
                      <p>This policy proposal outlines a comprehensive framework for achieving 100% renewable energy across all municipal operations by 2030. The strategy addresses grid modernization, community solar programs, building electrification, and transportation fleet conversion.</p>
                      <p>Key targets include reducing carbon emissions by 85% from 2020 baselines, deploying 45 MW of new solar capacity across public infrastructure, and converting 100% of the municipal vehicle fleet to electric by 2029.</p>
                      <h2 className="text-[11px] font-bold text-foreground mt-3">2. Current State Assessment</h2>
                      <p>As of Q1 2026, the municipality derives 42% of its energy from renewable sources, primarily wind (28%) and solar (14%).</p>
                    </div>
                    {/* Fade out at bottom */}
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
                          { district: 'East Industrial', budget: '19.3', timeline: 'Q2 2028', risk: 'High', status: 'Planning' },
                          { district: 'West Residential', budget: '6.2', timeline: 'Q1 2027', risk: 'Low', status: 'In Progress' },
                        ].map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                            <td className="border border-border/40 px-3 py-1.5 font-medium">{row.district}</td>
                            <td className="border border-border/40 px-3 py-1.5 text-right tabular-nums">{row.budget}</td>
                            <td className="border border-border/40 px-3 py-1.5 text-right">{row.timeline}</td>
                            <td className="border border-border/40 px-3 py-1.5 text-right">
                              <span className={cn("inline-block px-1.5 py-0.5 rounded text-[10px] font-medium",
                                row.risk === 'Low' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                row.risk === 'Medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                row.risk === 'High' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              )}>{row.risk}</span>
                            </td>
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
                    <p className="text-sm opacity-80 text-center max-w-xs">Progress Report & Revised Timeline for Municipal Energy Strategy</p>
                    <div className="flex gap-4 mt-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">42%</p>
                        <p className="text-[10px] opacity-70">Current Renewable</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">100%</p>
                        <p className="text-[10px] opacity-70">2030 Target</p>
                      </div>
                    </div>
                    <p className="text-[10px] opacity-50 mt-4">Slide 1 of 24</p>
                  </div>
                );
            }
          };

          return (
            <div className="mt-2 rounded-lg border border-border overflow-hidden">
              {/* Document tab bar (only when multiple docs) */}
              {hasMultiple && (
                <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
                  {docs.map((doc, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setActiveDocIndex(idx); setActiveDocPage(0); }}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors shrink-0",
                        idx === activeDocIndex
                          ? "border-primary text-foreground bg-background"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {getDocIcon(doc.docType)}
                      <span className="truncate max-w-[180px]">{doc.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Static document preview with click-to-open overlay — goes to L3 */}
              <div className="relative cursor-pointer" onClick={(e) => { e.stopPropagation(); post.onDocumentClick?.(activeDoc); }}>
                <div className="max-h-[320px] overflow-hidden">
                  {getDocPreviewThumbnail(activeDoc)}
                </div>
                {/* Hover overlay — same pattern as whiteboards */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary/40">
                  <Button variant="secondary" className="shadow-sm">Open Document</Button>
                </div>
              </div>

              {/* Document info footer */}
              <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-t border-border">
                <div className="flex items-center gap-2 min-w-0">
                  {getDocIcon(activeDoc.docType)}
                  <span className="text-xs font-medium truncate">{activeDoc.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">({activeDoc.size})</span>
                  {activeDoc.lastEdited && (
                    <span className="text-[10px] text-muted-foreground/60 shrink-0">· {activeDoc.lastEdited}</span>
                  )}
                </div>
                {hasMultiple && (
                  <span className="text-[10px] text-muted-foreground shrink-0">{docs.length} documents</span>
                )}
              </div>
            </div>
          );
        })()}

        {post.type === "call-for-whiteboards" && post.contentPreview?.whiteboards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {post.contentPreview.whiteboards.slice(0, 4).map((wb, idx) => {
              const remainingCount = (post.contentPreview?.whiteboards?.length || 0) - 3;
              const isLastItem = idx === 3;
              const showMoreOverlay = isLastItem && remainingCount > 1;

              return (
                <div key={idx} className="group/wb relative rounded-lg overflow-hidden border border-border bg-muted/30 aspect-[4/3] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <ImageWithFallback 
                    src={wb.imageUrl} 
                    alt={wb.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/wb:scale-105" 
                  />
                  
                  {/* Hover Overlay (Button & Dimming) - Visible on hover, unless it's the "More" block */}
                  {!showMoreOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/wb:opacity-100 transition-opacity duration-200 bg-primary/40">
                      <Button variant="secondary" size="sm" className="shadow-lg h-8 text-xs font-semibold">
                        Open Whiteboard
                      </Button>
                    </div>
                  )}

                  {/* Text Overlay (Title/Author) - Always visible unless "More" overlay is active */}
                  {!showMoreOverlay && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent p-3 flex flex-col justify-end pointer-events-none">
                      <p className="text-white text-xs font-semibold truncate">{wb.title}</p>
                      <p className="text-white/70 text-[10px] truncate">by {wb.author}</p>
                    </div>
                  )}

                  {/* "More" Overlay - Always visible for the 4th item if there are more */}
                  {showMoreOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
                      <span className="text-white font-bold text-lg">+{remainingCount} more</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-3 border-t bg-muted/5 flex items-center gap-4">
        <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs">{post.stats.comments} Comments</span>
        </Button>
      </CardFooter>
    </Card>
  );
}