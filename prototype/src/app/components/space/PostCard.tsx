import { useState } from "react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageSquare, MoreHorizontal, LayoutGrid, FileText, Presentation, Maximize2, FileSpreadsheet, FileImage, Download, ExternalLink, Pencil, ChevronLeft, ChevronRight } from "lucide-react";

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
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
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
          const displayMode = post.contentPreview.documentDisplayMode || 'paginated';

          // Fake document content based on type
          const getDocPreview = (doc: typeof activeDoc) => {
            switch (doc.docType) {
              case 'word': {
                const pageContent = [
                  // Page 1 — Title page
                  <div key="p1" className="flex flex-col items-center justify-center text-center min-h-[420px]">
                    <div className="w-16 h-px bg-primary/25 mb-10" />
                    <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70 mb-6">Municipality of Greenfield</p>
                    <h1 className="text-[17px] font-bold text-foreground mb-1 font-sans leading-snug">2030 Renewable Transition<br />Policy Proposal</h1>
                    <p className="text-[11px] text-muted-foreground mt-4">Draft v3.2 — April 2026</p>
                    <div className="w-16 h-px bg-primary/25 my-10" />
                    <div className="text-[9px] text-muted-foreground/70 space-y-0.5">
                      <p>Prepared by the Energy Transition Working Group</p>
                      <p>Lead author: Elena Rodriguez</p>
                      <p>Reviewed by: Sarah Chen, David Miller</p>
                    </div>
                    <p className="text-[7px] text-muted-foreground/30 uppercase tracking-widest mt-12">Confidential — For internal circulation only</p>
                  </div>,
                  // Page 2 — Executive Summary
                  <div key="p2" className="space-y-3 text-[11px] text-foreground/80 leading-[1.75] font-serif">
                    <h2 className="text-[13px] font-bold text-foreground font-sans mb-1.5">1. Executive Summary</h2>
                    <p>This policy proposal outlines a comprehensive framework for achieving 100% renewable energy across all municipal operations by 2030. The strategy addresses grid modernization, community solar programs, building electrification, and transportation fleet conversion.</p>
                    <p>Key targets include reducing carbon emissions by 85% from 2020 baselines, deploying 45 MW of new solar capacity across public infrastructure, and converting 100% of the municipal vehicle fleet to electric by 2029. The total estimated investment is €74.7M over four fiscal years, with projected annual savings of €12.3M by 2031.</p>
                    <h2 className="text-[13px] font-bold text-foreground font-sans mt-5 mb-1.5">2. Current State Assessment</h2>
                    <p>As of Q1 2026, the municipality derives 42% of its energy from renewable sources, primarily wind (28%) and solar (14%). Natural gas accounts for 35% of current energy consumption, with the remainder split between grid electricity (18%) and heating oil (5%).</p>
                    <p>The municipality operates 127 public buildings, of which 23 currently have rooftop solar installations. The existing fleet comprises 340 vehicles, of which 48 (14%) are fully electric. A full energy audit conducted in Q4 2025 identified 34 high-priority buildings for immediate retrofit consideration.</p>
                  </div>,
                  // Page 3 — Strategic Pillars
                  <div key="p3" className="space-y-3 text-[11px] text-foreground/80 leading-[1.75] font-serif">
                    <h2 className="text-[13px] font-bold text-foreground font-sans mb-1.5">3. Strategic Pillars</h2>
                    <h3 className="text-[11px] font-semibold text-foreground font-sans mt-3">3.1 Grid Modernization</h3>
                    <p>Deploy smart metering across all 12,400 municipal connections by Q2 2028. Install 15 MW battery storage at three grid nodes to stabilize renewable intermittency. Upgrade substation infrastructure in the North and East districts to support bidirectional power flow.</p>
                    <h3 className="text-[11px] font-semibold text-foreground font-sans mt-3">3.2 Community Solar Programs</h3>
                    <p>Launch the "Solar Rooftops" initiative targeting 2,000 residential installations through subsidized financing (0% interest, 10-year term). Establish three community solar gardens on underutilized municipal land, each 5 MW capacity, with shared ownership models for low-income residents.</p>
                    <h3 className="text-[11px] font-semibold text-foreground font-sans mt-3">3.3 Building Electrification</h3>
                    <p>Retrofit all municipal buildings to eliminate fossil fuel heating by 2029. Priority sites include the Central Library, Town Hall complex, and all 14 public schools. Estimated cost: €18.2M with projected 40% reduction in building energy costs by 2031.</p>
                    <h3 className="text-[11px] font-semibold text-foreground font-sans mt-3">3.4 Transportation Fleet Conversion</h3>
                    <p>Replace all 340 municipal vehicles with electric alternatives on a rolling schedule. Install 85 Level 2 and 12 DC fast chargers at municipal depots and public facilities. Partner with regional transit authority for shared charging infrastructure.</p>
                  </div>,
                  // Page 4 — Timeline & Budget
                  <div key="p4" className="space-y-3 text-[11px] text-foreground/80 leading-[1.75] font-serif">
                    <h2 className="text-[13px] font-bold text-foreground font-sans mb-1.5">4. Implementation Timeline & Budget</h2>
                    <div className="not-prose my-2">
                      <table className="w-full text-[10px] border-collapse font-sans">
                        <thead>
                          <tr className="bg-muted/40">
                            <th className="border border-border/40 px-2.5 py-1.5 text-left font-semibold">Phase</th>
                            <th className="border border-border/40 px-2.5 py-1.5 text-left font-semibold">Period</th>
                            <th className="border border-border/40 px-2.5 py-1.5 text-right font-semibold">Budget (€M)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { phase: 'Phase 1: Assessment & Planning', period: 'Q3 2026 – Q1 2027', budget: '4.2' },
                            { phase: 'Phase 2: Grid & Solar Deployment', period: 'Q2 2027 – Q4 2028', budget: '32.1' },
                            { phase: 'Phase 3: Building Retrofit', period: 'Q1 2028 – Q3 2029', budget: '18.2' },
                            { phase: 'Phase 4: Fleet & Final Integration', period: 'Q4 2029 – Q4 2030', budget: '20.2' },
                          ].map((row, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                              <td className="border border-border/40 px-2.5 py-1.5">{row.phase}</td>
                              <td className="border border-border/40 px-2.5 py-1.5">{row.period}</td>
                              <td className="border border-border/40 px-2.5 py-1.5 text-right tabular-nums">{row.budget}</td>
                            </tr>
                          ))}
                          <tr className="bg-muted/30 font-semibold">
                            <td className="border border-border/40 px-2.5 py-1.5" colSpan={2}>Total Investment</td>
                            <td className="border border-border/40 px-2.5 py-1.5 text-right tabular-nums">74.7</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <h2 className="text-[13px] font-bold text-foreground font-sans mt-4 mb-1.5">5. Risk Mitigation</h2>
                    <p>Key risks include supply chain delays for battery storage systems, potential changes in national subsidy frameworks, and community resistance to visual impact of solar installations. Each risk has been assigned a mitigation owner and quarterly review cadence. A contingency reserve of €5.8M (7.8% of total budget) has been allocated.</p>
                    <h2 className="text-[13px] font-bold text-foreground font-sans mt-4 mb-1.5">6. Next Steps</h2>
                    <p>Present proposal to Municipal Council for approval (May 2026). Initiate Phase 1 procurement and vendor selection. Establish quarterly progress reporting framework with public dashboard.</p>
                  </div>,
                ];
                // Continuous scroll mode
                if (displayMode === 'scroll') {
                  return (
                    <div className="bg-white dark:bg-zinc-900 px-8 py-8 space-y-0">
                      {/* Title block */}
                      <div className="flex flex-col items-center text-center pb-10 border-b border-border/20 mb-8">
                        <div className="w-16 h-px bg-primary/25 mb-8" />
                        <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/70 mb-5">Municipality of Greenfield</p>
                        <h1 className="text-[17px] font-bold text-foreground mb-1 font-sans leading-snug">2030 Renewable Transition<br />Policy Proposal</h1>
                        <p className="text-[11px] text-muted-foreground mt-3">Draft v3.2 — April 2026</p>
                        <div className="w-16 h-px bg-primary/25 my-8" />
                        <div className="text-[9px] text-muted-foreground/70 space-y-0.5">
                          <p>Prepared by the Energy Transition Working Group</p>
                          <p>Lead author: Elena Rodriguez</p>
                          <p>Reviewed by: Sarah Chen, David Miller</p>
                        </div>
                        <p className="text-[7px] text-muted-foreground/30 uppercase tracking-widest mt-8">Confidential — For internal circulation only</p>
                      </div>
                      {/* Body content — all sections flow continuously */}
                      <div className="space-y-5 text-[12.5px] text-foreground/80 leading-[1.8] font-serif">
                        <h2 className="text-[14px] font-bold text-foreground font-sans">1. Executive Summary</h2>
                        <p>This policy proposal outlines a comprehensive framework for achieving 100% renewable energy across all municipal operations by 2030. The strategy addresses grid modernization, community solar programs, building electrification, and transportation fleet conversion.</p>
                        <p>Key targets include reducing carbon emissions by 85% from 2020 baselines, deploying 45 MW of new solar capacity across public infrastructure, and converting 100% of the municipal vehicle fleet to electric by 2029. The total estimated investment is €74.7M over four fiscal years, with projected annual savings of €12.3M by 2031.</p>

                        <h2 className="text-[14px] font-bold text-foreground font-sans pt-3">2. Current State Assessment</h2>
                        <p>As of Q1 2026, the municipality derives 42% of its energy from renewable sources, primarily wind (28%) and solar (14%). Natural gas accounts for 35% of current energy consumption, with the remainder split between grid electricity (18%) and heating oil (5%).</p>
                        <p>The municipality operates 127 public buildings, of which 23 currently have rooftop solar installations. The existing fleet comprises 340 vehicles, of which 48 (14%) are fully electric. A full energy audit conducted in Q4 2025 identified 34 high-priority buildings for immediate retrofit consideration.</p>

                        <h2 className="text-[14px] font-bold text-foreground font-sans pt-3">3. Strategic Pillars</h2>
                        <h3 className="text-[12.5px] font-semibold text-foreground font-sans">3.1 Grid Modernization</h3>
                        <p>Deploy smart metering across all 12,400 municipal connections by Q2 2028. Install 15 MW battery storage at three grid nodes to stabilize renewable intermittency. Upgrade substation infrastructure in the North and East districts to support bidirectional power flow.</p>
                        <h3 className="text-[12.5px] font-semibold text-foreground font-sans">3.2 Community Solar Programs</h3>
                        <p>Launch the "Solar Rooftops" initiative targeting 2,000 residential installations through subsidized financing (0% interest, 10-year term). Establish three community solar gardens on underutilized municipal land, each 5 MW capacity, with shared ownership models for low-income residents.</p>
                        <h3 className="text-[12.5px] font-semibold text-foreground font-sans">3.3 Building Electrification</h3>
                        <p>Retrofit all municipal buildings to eliminate fossil fuel heating by 2029. Priority sites include the Central Library, Town Hall complex, and all 14 public schools. Estimated cost: €18.2M with projected 40% reduction in building energy costs by 2031.</p>
                        <h3 className="text-[12.5px] font-semibold text-foreground font-sans">3.4 Transportation Fleet Conversion</h3>
                        <p>Replace all 340 municipal vehicles with electric alternatives on a rolling schedule. Install 85 Level 2 and 12 DC fast chargers at municipal depots and public facilities. Partner with regional transit authority for shared charging infrastructure.</p>

                        <h2 className="text-[14px] font-bold text-foreground font-sans pt-3">4. Implementation Timeline & Budget</h2>
                        <table className="w-full text-[11px] border-collapse font-sans my-2">
                          <thead>
                            <tr className="bg-muted/40">
                              <th className="border border-border/40 px-3 py-2 text-left font-semibold">Phase</th>
                              <th className="border border-border/40 px-3 py-2 text-left font-semibold">Period</th>
                              <th className="border border-border/40 px-3 py-2 text-right font-semibold">Budget (€M)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { phase: 'Phase 1: Assessment & Planning', period: 'Q3 2026 – Q1 2027', budget: '4.2' },
                              { phase: 'Phase 2: Grid & Solar Deployment', period: 'Q2 2027 – Q4 2028', budget: '32.1' },
                              { phase: 'Phase 3: Building Retrofit', period: 'Q1 2028 – Q3 2029', budget: '18.2' },
                              { phase: 'Phase 4: Fleet & Final Integration', period: 'Q4 2029 – Q4 2030', budget: '20.2' },
                            ].map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/10"}>
                                <td className="border border-border/40 px-3 py-1.5">{row.phase}</td>
                                <td className="border border-border/40 px-3 py-1.5">{row.period}</td>
                                <td className="border border-border/40 px-3 py-1.5 text-right tabular-nums">{row.budget}</td>
                              </tr>
                            ))}
                            <tr className="bg-muted/30 font-semibold">
                              <td className="border border-border/40 px-3 py-1.5" colSpan={2}>Total Investment</td>
                              <td className="border border-border/40 px-3 py-1.5 text-right tabular-nums">74.7</td>
                            </tr>
                          </tbody>
                        </table>

                        <h2 className="text-[14px] font-bold text-foreground font-sans pt-3">5. Risk Mitigation</h2>
                        <p>Key risks include supply chain delays for battery storage systems, potential changes in national subsidy frameworks, and community resistance to visual impact of solar installations. Each risk has been assigned a mitigation owner and quarterly review cadence. A contingency reserve of €5.8M (7.8% of total budget) has been allocated.</p>

                        <h2 className="text-[14px] font-bold text-foreground font-sans pt-3">6. Next Steps</h2>
                        <p>Present proposal to Municipal Council for approval (May 2026). Initiate Phase 1 procurement and vendor selection. Establish quarterly progress reporting framework with public dashboard.</p>
                      </div>
                    </div>
                  );
                }

                // Paginated mode
                const totalPages = pageContent.length;
                const currentPage = Math.min(activeDocPage, totalPages - 1);
                return (
                  <div className="bg-[hsl(var(--muted)/0.35)] py-5 px-6">
                    {/* Paper page */}
                    <div className="mx-auto max-w-[540px] bg-white dark:bg-zinc-900 rounded shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06)] px-10 py-9 min-h-[480px]">
                      {pageContent[currentPage]}
                    </div>
                    {/* Page navigation */}
                    <div className="flex items-center justify-center gap-3 pt-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={currentPage === 0}
                        onClick={(e) => { e.stopPropagation(); setActiveDocPage(currentPage - 1); }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-1.5">
                        {pageContent.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setActiveDocPage(i); }}
                            className={cn(
                              "w-6 h-6 rounded text-[10px] font-medium transition-colors",
                              i === currentPage
                                ? "bg-primary text-primary-foreground"
                                : "bg-white dark:bg-zinc-800 text-muted-foreground hover:bg-muted border border-border/40 shadow-sm"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={currentPage === totalPages - 1}
                        onClick={(e) => { e.stopPropagation(); setActiveDocPage(currentPage + 1); }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <span className="text-[10px] text-muted-foreground ml-1">Page {currentPage + 1} of {totalPages}</span>
                    </div>
                  </div>
                );
              }
              case 'spreadsheet':
                return (
                  <div className="overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/60">
                          <th className="border border-border/50 px-3 py-1.5 text-left font-semibold text-muted-foreground">District</th>
                          <th className="border border-border/50 px-3 py-1.5 text-right font-semibold text-muted-foreground">Budget (€M)</th>
                          <th className="border border-border/50 px-3 py-1.5 text-right font-semibold text-muted-foreground">Timeline</th>
                          <th className="border border-border/50 px-3 py-1.5 text-right font-semibold text-muted-foreground">Risk</th>
                          <th className="border border-border/50 px-3 py-1.5 text-right font-semibold text-muted-foreground">Status</th>
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
                          <tr key={i} className={cn("hover:bg-muted/30", i % 2 === 0 ? "bg-background" : "bg-muted/10")}>
                            <td className="border border-border/50 px-3 py-1.5 font-medium">{row.district}</td>
                            <td className="border border-border/50 px-3 py-1.5 text-right tabular-nums">{row.budget}</td>
                            <td className="border border-border/50 px-3 py-1.5 text-right">{row.timeline}</td>
                            <td className="border border-border/50 px-3 py-1.5 text-right">
                              <span className={cn("inline-block px-1.5 py-0.5 rounded text-[10px] font-medium",
                                row.risk === 'Low' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                row.risk === 'Medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                row.risk === 'High' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              )}>{row.risk}</span>
                            </td>
                            <td className="border border-border/50 px-3 py-1.5 text-right text-muted-foreground">{row.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              case 'presentation':
                return (
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/90 to-primary/60 rounded flex flex-col items-center justify-center text-white p-8">
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

              {/* Toolbar */}
              <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border">
                <div className="flex items-center gap-2 min-w-0">
                  {getDocIcon(activeDoc.docType)}
                  <span className="text-xs font-medium truncate">{activeDoc.title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">({activeDoc.size})</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Embedded document preview */}
              <div className={cn(
                activeDoc.docType === 'word' ? "" : "max-h-[280px] overflow-y-auto bg-background"
              )}>
                {getDocPreview(activeDoc)}
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