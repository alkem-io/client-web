import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import { 
  X, Share2, MoreHorizontal, FileText, FileSpreadsheet, FileImage, 
  ChevronRight, Send, Smile, AtSign, Download, ExternalLink, Presentation
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: {
    title: string;
    docType: 'word' | 'spreadsheet' | 'presentation';
    size: string;
    lastEdited?: string;
  } | null;
  author?: {
    name: string;
    avatarUrl?: string;
    role: string;
  };
}

const MOCK_COMMENTS = [
  {
    id: "c1",
    author: { name: "Sarah Chen", avatar: "", initials: "SC" },
    text: "I've updated section 3.2 with the revised subsidy figures from the council meeting.",
    date: "1 hour ago",
    reactions: 3
  },
  {
    id: "c2",
    author: { name: "David Miller", avatar: "", initials: "DM" },
    text: "The budget table on page 4 needs the Phase 3 numbers adjusted — I'll update after lunch.",
    date: "45 min ago",
    reactions: 1
  }
];

export function DocumentDetailDialog({ open, onOpenChange, document, author }: DocumentDetailDialogProps) {
  const [commentText, setCommentText] = useState("");

  if (!document) return null;

  const collaboraColor = document.docType === 'spreadsheet' ? '#18794e' : document.docType === 'presentation' ? '#c4540a' : '#1b5eb5';
  const collaboraLabel = document.docType === 'spreadsheet' ? 'Collabora Calc' : document.docType === 'presentation' ? 'Collabora Impress' : 'Collabora Writer';

  const getDocIcon = (docType: 'word' | 'spreadsheet' | 'presentation') => {
    switch (docType) {
      case 'word': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'spreadsheet': return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
      case 'presentation': return <FileImage className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[95vw] h-[95vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border-none shadow-2xl rounded-xl z-[60]">
        
        {/* Header */}
        <div className="h-12 shrink-0 bg-background flex items-center justify-between px-4 border-b border-border z-20">
          <div className="flex items-center gap-3 min-w-0">
            {getDocIcon(document.docType)}
            <div className="flex flex-col min-w-0">
              <DialogTitle className="text-sm font-semibold text-foreground line-clamp-1">
                {document.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Editing document in Collabora Online
              </DialogDescription>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">({document.size})</span>
            {document.lastEdited && (
              <span className="text-[10px] text-muted-foreground/60 shrink-0">· Edited {document.lastEdited}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Collaborators */}
            <div className="flex -space-x-1.5 mr-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-background flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">DM</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">ER</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-violet-500 border-2 border-background flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">SC</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => toast.success("Link copied")} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Collabora Editor - takes full remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Collabora Menu Bar */}
          <div className="flex items-center gap-0.5 px-3 py-1 bg-[#ededed] dark:bg-zinc-800 border-b border-[#d4d4d4] dark:border-zinc-700 shrink-0">
            <div className="flex items-center gap-1.5 mr-3 pr-3 border-r border-[#ccc] dark:border-zinc-600">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: collaboraColor }}>
                <span className="text-white text-[9px] font-bold">C</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">{collaboraLabel}</span>
            </div>
            {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Help'].map((menu) => (
              <button key={menu} className="px-2.5 py-0.5 text-[11px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded">
                {menu}
              </button>
            ))}
          </div>

          {/* Collabora Formatting Toolbar */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-[#fafafa] dark:bg-zinc-850 border-b border-[#e0e0e0] dark:border-zinc-700 shrink-0">
            {document.docType !== 'presentation' && (
              <>
                <div className="flex items-center gap-1">
                  <div className="h-6 px-2 bg-white dark:bg-zinc-800 border border-[#ccc] dark:border-zinc-600 rounded flex items-center">
                    <span className="text-[10px] text-foreground/70">Liberation Sans</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground rotate-90 ml-1" />
                  </div>
                  <div className="h-6 w-10 bg-white dark:bg-zinc-800 border border-[#ccc] dark:border-zinc-600 rounded flex items-center justify-center">
                    <span className="text-[10px] text-foreground/70">12</span>
                  </div>
                </div>
                <div className="w-px h-4 bg-[#d4d4d4] dark:bg-zinc-600 mx-1" />
                <div className="flex items-center gap-0">
                  {[
                    { label: 'B', style: 'font-bold' },
                    { label: 'I', style: 'italic' },
                    { label: 'U', style: 'underline' },
                    { label: 'S', style: 'line-through' },
                  ].map((btn) => (
                    <button key={btn.label} className="w-6 h-6 flex items-center justify-center text-[11px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded">
                      <span className={btn.style}>{btn.label}</span>
                    </button>
                  ))}
                </div>
                <div className="w-px h-4 bg-[#d4d4d4] dark:bg-zinc-600 mx-1" />
                <div className="flex items-center gap-0">
                  {['left', 'center', 'right'].map((align) => (
                    <button key={align} className="w-6 h-6 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded">
                      <div className="flex flex-col gap-[2px]">
                        <div className={cn("h-[1px] bg-muted-foreground/60", align === 'left' ? "w-3" : align === 'center' ? "w-2.5 mx-auto" : "w-3 ml-auto")} />
                        <div className="h-[1px] w-3 bg-muted-foreground/60" />
                        <div className={cn("h-[1px] bg-muted-foreground/60", align === 'left' ? "w-2" : align === 'center' ? "w-2 mx-auto" : "w-2 ml-auto")} />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {document.docType === 'spreadsheet' && (
              <>
                <div className="w-px h-4 bg-[#d4d4d4] dark:bg-zinc-600 mx-1" />
                <div className="h-6 w-14 bg-white dark:bg-zinc-800 border border-[#ccc] dark:border-zinc-600 rounded flex items-center justify-center">
                  <span className="text-[10px] text-foreground/70 font-mono">A1</span>
                </div>
                <div className="flex-1 h-6 bg-white dark:bg-zinc-800 border border-[#ccc] dark:border-zinc-600 rounded flex items-center px-2 ml-1">
                  <span className="text-[10px] text-muted-foreground font-mono">=SUM(B2:B6)</span>
                </div>
              </>
            )}
            {document.docType === 'presentation' && (
              <>
                <button className="h-6 px-2 bg-white dark:bg-zinc-800 border border-[#ccc] dark:border-zinc-600 rounded flex items-center gap-1">
                  <Presentation className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-foreground/70">Slide 1 of 24</span>
                </button>
                <div className="w-px h-4 bg-[#d4d4d4] dark:bg-zinc-600 mx-1" />
                {['Text Box', 'Image', 'Shape', 'Table'].map((tool) => (
                  <button key={tool} className="h-6 px-2 text-[10px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded">
                    {tool}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Document Editor Content Area — fills remaining space */}
          <div className="flex-1 overflow-auto">
            {document.docType === 'word' && (
              <div className="h-full bg-[#e8e8e8] dark:bg-zinc-950 p-8 flex justify-center overflow-auto">
                <div className="w-full max-w-[760px] bg-white dark:bg-zinc-900 shadow-[0_1px_6px_rgba(0,0,0,0.1)] px-20 py-14 min-h-full">
                  {/* Ruler */}
                  <div className="h-3 border-b border-[#ddd] dark:border-zinc-700 mb-8 flex items-end">
                    <div className="flex w-full justify-between">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className={cn("bg-muted-foreground/30", i % 5 === 0 ? "w-px h-2.5" : "w-px h-1")} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Document body */}
                  <div className="space-y-4 text-[14px] text-foreground/85 leading-[1.85]">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 text-center">Municipality of Greenfield</p>
                    <h1 className="text-[22px] font-bold text-foreground text-center mb-1">2030 Renewable Transition Policy Proposal</h1>
                    <p className="text-[13px] text-muted-foreground text-center mb-2">Draft v3.2 — April 2026</p>
                    <div className="w-14 h-px bg-border mx-auto mb-8" />
                    
                    <h2 className="text-[16px] font-bold text-foreground mt-8">1. Executive Summary</h2>
                    <p>This policy proposal outlines a comprehensive framework for achieving 100% renewable energy across all municipal operations by 2030. The strategy addresses grid modernization, community solar programs, building electrification, and transportation fleet conversion.</p>
                    <p>Key targets include reducing carbon emissions by 85% from 2020 baselines, deploying 45 MW of new solar capacity across public infrastructure, and converting 100% of the municipal vehicle fleet to electric by 2029. The total estimated investment is €74.7M over four fiscal years, with projected annual savings of €12.3M by 2031.</p>
                    
                    <h2 className="text-[16px] font-bold text-foreground mt-8">2. Current State Assessment</h2>
                    <p>As of Q1 2026, the municipality derives 42% of its energy from renewable sources, primarily wind (28%) and solar (14%). Natural gas accounts for 35% of current energy consumption, with the remainder split between grid electricity (18%) and heating oil (5%).</p>
                    <p>The municipality operates 127 public buildings, of which 23 currently have rooftop solar installations. The existing fleet comprises 340 vehicles, of which 48 (14%) are fully electric. A full energy audit conducted in Q4 2025 identified 34 high-priority buildings for immediate retrofit consideration.</p>

                    <h2 className="text-[16px] font-bold text-foreground mt-8">3. Strategic Pillars</h2>
                    <h3 className="text-[14px] font-semibold text-foreground mt-4">3.1 Grid Modernization</h3>
                    <p>Deploy smart metering across all 12,400 municipal connections by Q2 2028. Install 15 MW battery storage at three grid nodes to stabilize renewable intermittency. Upgrade substation infrastructure in the North and East districts to support bidirectional power flow.</p>
                    <h3 className="text-[14px] font-semibold text-foreground mt-4">3.2 Community Solar Programs</h3>
                    <p>Launch the "Solar Rooftops" initiative targeting 2,000 residential installations through subsidized financing (0% interest, 10-year term). Establish three community solar gardens on underutilized municipal land, each 5 MW capacity, with shared ownership models for low-income residents.</p>
                    <h3 className="text-[14px] font-semibold text-foreground mt-4">3.3 Building Electrification</h3>
                    <p>Retrofit all municipal buildings to eliminate fossil fuel heating by 2029. Priority sites include the Central Library, Town Hall complex, and all 14 public schools. Estimated cost: €18.2M with projected 40% reduction in building energy costs by 2031.</p>
                    <h3 className="text-[14px] font-semibold text-foreground mt-4">3.4 Transportation Fleet Conversion</h3>
                    <p>Replace all 340 municipal vehicles with electric alternatives on a rolling schedule. Install 85 Level 2 and 12 DC fast chargers at municipal depots and public facilities. Partner with regional transit authority for shared charging infrastructure.</p>

                    <h2 className="text-[16px] font-bold text-foreground mt-8">4. Implementation Timeline & Budget</h2>
                    <table className="w-full text-[12px] border-collapse my-4">
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

                    <h2 className="text-[16px] font-bold text-foreground mt-8">5. Risk Mitigation</h2>
                    <p>Key risks include supply chain delays for battery storage systems, potential changes in national subsidy frameworks, and community resistance to visual impact of solar installations. Each risk has been assigned a mitigation owner and quarterly review cadence. A contingency reserve of €5.8M (7.8% of total budget) has been allocated.</p>
                    
                    <h2 className="text-[16px] font-bold text-foreground mt-8">6. Next Steps</h2>
                    <p>Present proposal to Municipal Council for approval (May 2026). Initiate Phase 1 procurement and vendor selection. Establish quarterly progress reporting framework with public dashboard.</p>
                    {/* Simulated blinking cursor */}
                    <div className="inline-block w-[2px] h-4 bg-blue-500 animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {document.docType === 'spreadsheet' && (
              <div className="h-full bg-white dark:bg-zinc-900 flex flex-col">
                {/* Column headers */}
                <div className="flex border-b border-[#d4d4d4] dark:border-zinc-700 shrink-0">
                  <div className="w-12 shrink-0 bg-[#f0f0f0] dark:bg-zinc-800 border-r border-[#d4d4d4] dark:border-zinc-700" />
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((col) => (
                    <div key={col} className="flex-1 text-center text-[10px] font-medium text-muted-foreground py-1 bg-[#f0f0f0] dark:bg-zinc-800 border-r border-[#d4d4d4] dark:border-zinc-700">
                      {col}
                    </div>
                  ))}
                </div>
                <div className="flex-1 overflow-auto">
                  {[
                    { row: 1, cells: ['District', 'Budget (€M)', 'Timeline', 'Risk', 'Status', 'Lead', 'Phase', 'Notes'], isHeader: true },
                    { row: 2, cells: ['North District', '12.4', 'Q3 2027', 'Medium', 'Planning', 'D. Miller', 'Phase 2', 'Solar focus'], isHeader: false },
                    { row: 3, cells: ['Central Grid', '28.1', 'Q1 2028', 'High', 'Assessment', 'E. Rodriguez', 'Phase 2', 'Grid upgrade priority'], isHeader: false },
                    { row: 4, cells: ['South Campus', '8.7', 'Q4 2027', 'Low', 'Approved', 'S. Chen', 'Phase 1', 'Quick win'], isHeader: false },
                    { row: 5, cells: ['East Industrial', '19.3', 'Q2 2028', 'High', 'Planning', 'A. Wong', 'Phase 3', 'Complex retrofit'], isHeader: false },
                    { row: 6, cells: ['West Residential', '6.2', 'Q1 2027', 'Low', 'In Progress', 'M. Johnson', 'Phase 1', 'Community solar'], isHeader: false },
                    { row: 7, cells: ['Total', '=SUM(B2:B6)', '', '', '', '', '', ''], isHeader: false },
                    ...Array.from({ length: 15 }, (_, i) => ({ row: 8 + i, cells: Array(8).fill(''), isHeader: false })),
                  ].map(({ row, cells, isHeader }) => (
                    <div key={row} className={cn("flex border-b border-[#e0e0e0] dark:border-zinc-800", row === 3 ? "bg-blue-50/50 dark:bg-blue-900/10" : "")}>
                      <div className="w-12 shrink-0 text-center text-[10px] text-muted-foreground py-1.5 bg-[#f0f0f0] dark:bg-zinc-800 border-r border-[#d4d4d4] dark:border-zinc-700">
                        {row}
                      </div>
                      {cells.map((cell, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 text-[11px] py-1.5 px-2 border-r border-[#e0e0e0] dark:border-zinc-800 truncate",
                            isHeader ? "font-semibold text-foreground bg-[#f8f8f8] dark:bg-zinc-850" : "text-foreground/80",
                            row === 3 && i === 1 ? "outline outline-2 outline-blue-500 outline-offset-[-1px] relative z-10" : ""
                          )}
                        >
                          {cell}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* Sheet tabs */}
                <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[#f0f0f0] dark:bg-zinc-800 border-t border-[#d4d4d4] dark:border-zinc-700 shrink-0">
                  {['Budget Overview', 'District Detail', 'Risk Matrix', 'Timeline'].map((sheet, i) => (
                    <button
                      key={sheet}
                      className={cn(
                        "px-3 py-1 text-[10px] rounded",
                        i === 0 ? "bg-white dark:bg-zinc-700 text-foreground font-medium shadow-sm border border-[#ccc] dark:border-zinc-600" : "text-muted-foreground hover:bg-white/50 dark:hover:bg-zinc-700/50"
                      )}
                    >
                      {sheet}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {document.docType === 'presentation' && (
              <div className="h-full flex bg-[#2d2d2d]">
                {/* Slide panel */}
                <div className="w-32 shrink-0 bg-[#353535] border-r border-[#444] p-2 space-y-2 overflow-y-auto">
                  {Array.from({ length: 8 }, (_, n) => n + 1).map((n) => (
                    <div
                      key={n}
                      className={cn(
                        "aspect-[16/9] rounded overflow-hidden border cursor-pointer",
                        n === 1 ? "border-blue-500 ring-1 ring-blue-500/50" : "border-[#555] hover:border-[#777]"
                      )}
                    >
                      <div className={cn(
                        "w-full h-full flex items-center justify-center",
                        n === 1 ? "bg-gradient-to-br from-primary/90 to-primary/60" :
                        n === 2 ? "bg-gradient-to-br from-zinc-700 to-zinc-800" :
                        n === 3 ? "bg-gradient-to-br from-teal-700/80 to-teal-900" :
                        n === 4 ? "bg-gradient-to-br from-zinc-600 to-zinc-700" :
                        n === 5 ? "bg-gradient-to-br from-blue-800 to-blue-900" :
                        n === 6 ? "bg-gradient-to-br from-orange-800/80 to-orange-900" :
                        n === 7 ? "bg-gradient-to-br from-emerald-800 to-emerald-900" :
                        "bg-gradient-to-br from-violet-800 to-violet-900"
                      )}>
                        <span className="text-white/50 text-[7px]">Slide {n}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Main slide area */}
                <div className="flex-1 p-8 flex items-center justify-center">
                  <div className="w-full max-w-[900px] aspect-[16/9] bg-gradient-to-br from-primary/90 to-primary/60 rounded-lg shadow-xl flex flex-col items-center justify-center text-white p-10">
                    <p className="text-xs uppercase tracking-widest opacity-60 mb-4">April 2026 Stakeholder Update</p>
                    <h2 className="text-3xl font-bold text-center mb-3">2030 Renewable Transition</h2>
                    <p className="text-base opacity-75 text-center max-w-md">Progress Report & Revised Timeline for Municipal Energy Strategy</p>
                    <div className="flex gap-10 mt-10">
                      <div className="text-center">
                        <p className="text-4xl font-bold">42%</p>
                        <p className="text-xs opacity-60">Current Renewable</p>
                      </div>
                      <div className="text-center">
                        <p className="text-4xl font-bold">100%</p>
                        <p className="text-xs opacity-60">2030 Target</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collabora Status Bar */}
          <div className="flex items-center justify-between px-3 py-1 bg-[#ededed] dark:bg-zinc-800 border-t border-[#d4d4d4] dark:border-zinc-700 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground">
                {document.docType === 'word' ? 'Page 1 / 4' : document.docType === 'spreadsheet' ? 'Sheet 1 / 4' : 'Slide 1 / 24'}
              </span>
              <span className="text-[9px] text-muted-foreground/50">|</span>
              <span className="text-[9px] text-muted-foreground">
                {document.docType === 'word' ? 'Words: 2,847' : document.docType === 'spreadsheet' ? 'Sum: 74.7' : '24 slides'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                All changes saved
              </span>
              <span className="text-[9px] text-muted-foreground/50">|</span>
              <span className="text-[9px] text-muted-foreground">100%</span>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
