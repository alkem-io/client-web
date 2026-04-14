import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Search, Filter, RefreshCw, BarChart2, Check, ArrowRight, Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SpaceOption {
  id: string;
  name: string;
  role: "Lead" | "Member";
  privacy: "Public" | "Private";
  lastActive: string;
  health: "High" | "Medium" | "Low";
}

const MOCK_SPACES: SpaceOption[] = [
  { id: "1", name: "Green Energy Space", role: "Lead", privacy: "Public", lastActive: "2m ago", health: "High" },
  { id: "2", name: "Urban Mobility", role: "Member", privacy: "Private", lastActive: "1h ago", health: "Medium" },
  { id: "3", name: "Green Energy", role: "Member", privacy: "Public", lastActive: "4h ago", health: "High" },
  { id: "4", name: "Digital Transformation", role: "Lead", privacy: "Private", lastActive: "1d ago", health: "Low" },
  { id: "5", name: "Community Outreach", role: "Member", privacy: "Public", lastActive: "3d ago", health: "Medium" },
  { id: "6", name: "AI Ethics Board", role: "Member", privacy: "Private", lastActive: "1w ago", health: "High" },
];

interface AnalyticsSpaceSelectorProps {
  onGenerate: (selectedIds: string[]) => void;
}

export function AnalyticsSpaceSelector({ onGenerate }: AnalyticsSpaceSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSelection = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onGenerate(selected);
    }, 2000);
  };

  const filteredSpaces = MOCK_SPACES.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-in fade-in duration-500" style={{ background: 'var(--background)', fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-3xl space-y-6">
        
        <div className="text-center space-y-2">
           <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--foreground)' }}>Select Top-Level Spaces</h1>
           <p style={{ fontSize: 'var(--text-base)', color: 'var(--muted-foreground)' }}>
              Choose the L0 spaces you want to include in your network graph.
           </p>
        </div>

        <Card className="overflow-hidden flex flex-col h-[600px]" style={{ border: '2px solid var(--border)', boxShadow: 'var(--elevation-sm)' }}>
           <div className="p-4 space-y-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <Input 
                       placeholder="Search spaces..." 
                       style={{ paddingLeft: 36, background: 'var(--input-background)', fontFamily: "'Inter', sans-serif" }}
                       value={search}
                       onChange={e => setSearch(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelected(MOCK_SPACES.map(s => s.id))}>Select All</Button>
                    <Button variant="outline" size="sm" onClick={() => setSelected([])}>Clear</Button>
                 </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded" style={{ fontSize: '11px', color: 'var(--muted-foreground)', background: 'color-mix(in srgb, var(--primary) 5%, var(--background))', border: '1px solid color-mix(in srgb, var(--primary) 12%, transparent)' }}>
                 <Shield className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                 Showing only spaces where you have Member or Lead access.
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                 {filteredSpaces.map(space => (
                    <div 
                       key={space.id}
                       className={cn(
                          "flex items-center gap-4 p-3 rounded-lg transition-all cursor-pointer",
                       )}
                       style={{
                          border: selected.includes(space.id) ? '1px solid color-mix(in srgb, var(--primary) 30%, transparent)' : '1px solid transparent',
                          background: selected.includes(space.id) ? 'color-mix(in srgb, var(--primary) 5%, var(--background))' : 'var(--background)',
                       }}
                       onClick={() => toggleSelection(space.id)}
                       onMouseEnter={e => { if (!selected.includes(space.id)) { e.currentTarget.style.background = 'var(--muted)'; e.currentTarget.style.border = '1px solid var(--border)'; } }}
                       onMouseLeave={e => { if (!selected.includes(space.id)) { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.border = '1px solid transparent'; } }}
                    >
                       <Checkbox 
                          checked={selected.includes(space.id)} 
                          onCheckedChange={() => toggleSelection(space.id)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                       />
                       
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <h3 className="font-semibold text-[length:var(--text-base)] truncate">{space.name}</h3>
                             {space.role === 'Lead' && <Badge variant="default" className="text-[10px] h-4 px-1">Lead</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-[length:var(--text-xs)] text-muted-foreground">
                             <span className="flex items-center gap-1">
                                <div className={cn("w-1.5 h-1.5 rounded-full", space.privacy === 'Public' ? "bg-success" : "bg-warning")} />
                                {space.privacy}
                             </span>
                             <span>•</span>
                             <span>Active {space.lastActive}</span>
                          </div>
                       </div>

                       <div className="text-right hidden sm:block">
                          <div className="text-[length:var(--text-xs)] font-medium text-muted-foreground uppercase tracking-wider mb-1">Health</div>
                          <Badge variant={space.health === 'High' ? 'default' : space.health === 'Medium' ? 'secondary' : 'outline'} className={cn("text-[10px]", space.health === 'High' && "bg-success/10 text-success hover:bg-success/10 border-transparent dark:bg-success/20 dark:text-success")}>
                             {space.health}
                          </Badge>
                       </div>
                    </div>
                 ))}

                 {filteredSpaces.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                       <p>No spaces found matching "{search}"</p>
                    </div>
                 )}
              </div>
           </div>

            <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
               <div className="flex items-center gap-2" style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                  <RefreshCw className="w-3 h-3" />
                  <span>We'll reuse cached data when available.</span>
               </div>

               <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => setSelected(selected.length > 0 ? [] : [])}>Load Last Selection</Button>
                  <Button onClick={handleGenerate} disabled={selected.length === 0 || isGenerating} className="min-w-[140px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                     {isGenerating ? (
                        <>Generating Graph...</>
                     ) : (
                        <>
                           Generate Graph <BarChart2 className="w-4 h-4 ml-2" />
                        </>
                     )}
                  </Button>
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
}