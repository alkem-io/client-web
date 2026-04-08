import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Search, RefreshCw, LayoutGrid, Users, 
  ChevronRight, Share2, ExternalLink, User, Building, 
  X, Plus, Globe, Layers, Network, ArrowUpRight, Link2, ArrowLeft
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Separator } from "@/app/components/ui/separator";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { ForceGraph, Node, Link as GraphLink } from "./ForceGraph";
import { ORG_LOCATIONS } from "./netherlandsMap";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

// --- Images ---
const IMG = {
  // Spaces
  innovationHub: "https://images.unsplash.com/photo-1765728617352-895327fcf036?auto=format&fit=crop&w=200&q=80",
  urbanMobility: "https://images.unsplash.com/photo-1718777223394-a9caa3b529a6?auto=format&fit=crop&w=200&q=80",
  greenEnergy: "https://images.unsplash.com/photo-1765263857986-271b4923632d?auto=format&fit=crop&w=200&q=80",
  smartCities: "https://images.unsplash.com/photo-1699602050604-698045645108?auto=format&fit=crop&w=200&q=80",
  circularEcon: "https://images.unsplash.com/photo-1628638428099-48fc6fdb98c2?auto=format&fit=crop&w=200&q=80",
  digitalHealth: "https://images.unsplash.com/photo-1758691463203-cce9d415b2b5?auto=format&fit=crop&w=200&q=80",
  autoTransit: "https://images.unsplash.com/photo-1733073277493-c0c895544b75?auto=format&fit=crop&w=200&q=80",
  // People
  janBerg: "https://images.unsplash.com/photo-1758685734503-58a8accc24e8?auto=format&fit=crop&w=80&h=80",
  lisaVries: "https://images.unsplash.com/photo-1758685848602-09e52ef9c7d3?auto=format&fit=crop&w=80&h=80",
  sophieMulder: "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?auto=format&fit=crop&w=80&h=80",
  tomBakker: "https://images.unsplash.com/photo-1723537742563-15c3d351dbf2?auto=format&fit=crop&w=80&h=80",
  annaVisser: "https://images.unsplash.com/photo-1596441248825-45b1f60ce4b2?auto=format&fit=crop&w=80&h=80",
  erikDijk: "https://images.unsplash.com/photo-1627776880991-808c5996527b?auto=format&fit=crop&w=80&h=80",
  petraH: "https://images.unsplash.com/photo-1758518727888-ffa196002e59?auto=format&fit=crop&w=80&h=80",
  marcoGroot: "https://images.unsplash.com/photo-1662045678969-0702d5bbcf23?auto=format&fit=crop&w=80&h=80",
  userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64",
};

// --- Realistic, Correlated Ecosystem Data ---

interface SpaceDef {
  id: string; name: string; level: 'L0' | 'L1'; parent?: string;
  image?: string; location?: { lat: number; lng: number };
}
interface OrgDef {
  id: string; name: string; leads: string[]; memberOf: string[];
}
interface PersonDef {
  id: string; name: string; orgId: string; spaces: string[];
  image?: string;
}

const SPACE_DEFS: Record<string, SpaceDef[]> = {
  '1': [
    { id: 'green-energy', name: 'Green Energy Space', level: 'L0', image: IMG.innovationHub, location: { lat: 52.37, lng: 4.90 } },
    { id: 'smart-cities', name: 'Smart Cities Lab', level: 'L1', parent: 'green-energy', image: IMG.smartCities, location: { lat: 52.08, lng: 4.31 } },
    { id: 'circular-econ', name: 'Circular Economy', level: 'L1', parent: 'green-energy', image: IMG.circularEcon, location: { lat: 52.34, lng: 5.02 } },
    { id: 'digital-health', name: 'Digital Health', level: 'L1', parent: 'green-energy', image: IMG.digitalHealth, location: { lat: 52.43, lng: 4.82 } },
  ],
  '2': [
    { id: 'urban-mobility', name: 'Urban Mobility', level: 'L0', image: IMG.urbanMobility, location: { lat: 51.92, lng: 4.48 } },
    { id: 'autonomous-transit', name: 'Autonomous Transit', level: 'L1', parent: 'urban-mobility', image: IMG.autoTransit, location: { lat: 52.00, lng: 4.37 } },
    { id: 'bike-infra', name: 'Bike Infrastructure', level: 'L1', parent: 'urban-mobility', location: { lat: 51.85, lng: 4.55 } },
    { id: 'last-mile', name: 'Last Mile Delivery', level: 'L1', parent: 'urban-mobility', location: { lat: 51.95, lng: 4.62 } },
  ],
  '3': [
    { id: 'green-energy', name: 'Green Energy', level: 'L0', image: IMG.greenEnergy, location: { lat: 51.44, lng: 5.47 } },
    { id: 'solar-innovation', name: 'Solar Innovation', level: 'L1', parent: 'green-energy', location: { lat: 51.52, lng: 5.38 } },
    { id: 'wind-energy', name: 'Wind Farm Tech', level: 'L1', parent: 'green-energy', location: { lat: 51.38, lng: 5.57 } },
    { id: 'grid-storage', name: 'Grid Storage', level: 'L1', parent: 'green-energy', location: { lat: 51.48, lng: 5.65 } },
  ],
};

const ORG_DEFS: OrgDef[] = [
  { id: 'tu-delft', name: 'TU Delft', leads: ['smart-cities'], memberOf: ['autonomous-transit', 'solar-innovation', 'digital-health'] },
  { id: 'philips-health', name: 'Philips Health', leads: ['digital-health'], memberOf: ['smart-cities', 'green-energy'] },
  { id: 'tno', name: 'TNO', leads: ['circular-econ'], memberOf: ['solar-innovation', 'smart-cities', 'grid-storage'] },
  { id: 'ns-railways', name: 'NS (Dutch Railways)', leads: ['autonomous-transit'], memberOf: ['bike-infra', 'smart-cities', 'last-mile'] },
  { id: 'postnl', name: 'PostNL', leads: [], memberOf: ['last-mile', 'bike-infra'] },
  { id: 'eneco', name: 'Eneco', leads: ['grid-storage'], memberOf: ['wind-energy', 'solar-innovation', 'circular-econ'] },
  { id: 'shell-ventures', name: 'Shell Ventures', leads: [], memberOf: ['solar-innovation', 'grid-storage', 'autonomous-transit'] },
  { id: 'gemeente-adam', name: 'Municipality Amsterdam', leads: ['bike-infra'], memberOf: ['smart-cities', 'circular-econ', 'green-energy'] },
  { id: 'rabobank', name: 'Rabobank', leads: [], memberOf: ['circular-econ', 'green-energy', 'green-energy'] },
];

const PERSON_DEFS: PersonDef[] = [
  { id: 'jan-berg', name: 'Prof. Jan van der Berg', orgId: 'tu-delft', spaces: ['smart-cities', 'autonomous-transit', 'solar-innovation'], image: IMG.janBerg },
  { id: 'lisa-vries', name: 'Dr. Lisa de Vries', orgId: 'tno', spaces: ['circular-econ', 'solar-innovation', 'smart-cities', 'grid-storage'], image: IMG.lisaVries },
  { id: 'sophie-mulder', name: 'Sophie Mulder', orgId: 'gemeente-adam', spaces: ['bike-infra', 'smart-cities', 'green-energy', 'circular-econ'], image: IMG.sophieMulder },
  { id: 'tom-bakker', name: 'Tom Bakker', orgId: 'ns-railways', spaces: ['autonomous-transit', 'last-mile', 'bike-infra'], image: IMG.tomBakker },
  { id: 'anna-visser', name: 'Anna Visser', orgId: 'shell-ventures', spaces: ['solar-innovation', 'grid-storage', 'autonomous-transit'], image: IMG.annaVisser },
  { id: 'erik-dijk', name: 'Erik van Dijk', orgId: 'eneco', spaces: ['grid-storage', 'wind-energy', 'solar-innovation', 'circular-econ'], image: IMG.erikDijk },
  { id: 'petra-h', name: 'Petra Hendriks', orgId: 'postnl', spaces: ['last-mile', 'bike-infra'], image: IMG.petraH },
  { id: 'marco-groot', name: 'Marco de Groot', orgId: 'rabobank', spaces: ['green-energy', 'circular-econ', 'urban-mobility', 'green-energy'], image: IMG.marcoGroot },
  { id: 'marie-janssen', name: 'Dr. Marie Janssen', orgId: 'philips-health', spaces: ['digital-health', 'smart-cities', 'green-energy'], image: IMG.sophieMulder },
];

// Build graph from structured data
// Deterministic activity level — first space in list = highest engagement
const computeActivity = (entityId: string, spaceId: string, relType: 'lead' | 'member', index: number): number => {
  const base = relType === 'lead' ? 78 : 40;
  const indexPenalty = index * 18;
  // Simple hash for per-pair variation
  let hash = 0;
  for (let i = 0; i < entityId.length; i++) hash = (hash * 31 + entityId.charCodeAt(i)) | 0;
  for (let i = 0; i < spaceId.length; i++) hash = (hash * 31 + spaceId.charCodeAt(i)) | 0;
  const variation = (Math.abs(hash) % 20) - 10;
  return Math.max(5, Math.min(100, base - indexPenalty + variation));
};

const generateGraphData = (selectedSpaceIds: string[]): { nodes: Node[]; links: GraphLink[] } => {
  const nodes: Node[] = [];
  const links: GraphLink[] = [];
  const nodeIds = new Set<string>();
  const linkKeys = new Set<string>();

  const addNode = (n: Node) => {
    if (!nodeIds.has(n.id)) { nodes.push(n); nodeIds.add(n.id); }
  };
  const addLink = (l: GraphLink) => {
    const key = `${l.source}→${l.target}→${l.type}`;
    if (!linkKeys.has(key)) { links.push(l); linkKeys.add(key); }
  };

  // Collect all relevant space IDs
  const allSpaces: SpaceDef[] = [];
  const l0Ids = new Set<string>();

  selectedSpaceIds.forEach(sid => {
    const defs = SPACE_DEFS[sid];
    if (defs) {
      defs.forEach(s => allSpaces.push(s));
      l0Ids.add(defs[0].id);
    }
  });

  const spaceIdSet = new Set(allSpaces.map(s => s.id));

  // Build parent lookup: subspace ID → parent space ID
  const parentLookup = new Map<string, string>();
  allSpaces.forEach(s => {
    if (s.parent) parentLookup.set(s.id, s.parent);
  });

  // Helper: expand a list of subspace IDs to include their parent spaces
  // (a member of a subspace is automatically a member of the parent space)
  const expandWithParents = (spaceIds: string[]): string[] => {
    const expanded = new Set(spaceIds);
    spaceIds.forEach(sid => {
      const parent = parentLookup.get(sid);
      if (parent && spaceIdSet.has(parent)) {
        expanded.add(parent);
      }
    });
    return Array.from(expanded);
  };

  // Add space nodes
  allSpaces.forEach(s => {
    addNode({
      id: s.id,
      type: 'space',
      level: s.level,
      label: s.name,
      group: s.parent || s.id,
      imageUrl: s.image,
      location: s.location,
    });
    // Parent-child links
    if (s.parent && spaceIdSet.has(s.parent)) {
      addLink({ source: s.parent, target: s.id, type: 'parent-child' });
    }
  });

  // Add orgs that are connected to selected spaces
  const relevantOrgs = ORG_DEFS.filter(o =>
    o.leads.some(s => spaceIdSet.has(s)) || o.memberOf.some(s => spaceIdSet.has(s))
  );

  relevantOrgs.forEach(o => {
    // Determine group: find the L0 parent of the first led space, or first memberOf
    const primarySpace = [...o.leads, ...o.memberOf].find(s => spaceIdSet.has(s));
    const space = allSpaces.find(s => s.id === primarySpace);
    const group = space?.parent || space?.id || 'misc';

    // Look up real-world HQ location for this org
    const orgLoc = ORG_LOCATIONS[o.id];

    addNode({
      id: o.id,
      type: 'org',
      label: o.name,
      group,
      orgId: o.id,
      location: orgLoc,
    });

    o.leads.filter(s => spaceIdSet.has(s)).forEach((s, index) => {
      addLink({ source: o.id, target: s, type: 'lead' });
    });
    o.memberOf.filter(s => spaceIdSet.has(s)).forEach((s, index) => {
      addLink({ source: o.id, target: s, type: 'member' });
    });
  });

  // Add people connected to relevant orgs/spaces
  const relevantOrgIds = new Set(relevantOrgs.map(o => o.id));

  PERSON_DEFS.forEach(p => {
    if (!relevantOrgIds.has(p.orgId)) return;
    // Expand subspace memberships to include parent spaces automatically
    const expandedSpaces = expandWithParents(p.spaces);
    const relevantSpaces = expandedSpaces.filter(s => spaceIdSet.has(s));
    if (relevantSpaces.length === 0) return;

    const primarySpace = relevantSpaces[0];
    const space = allSpaces.find(s => s.id === primarySpace);
    const group = space?.parent || space?.id || 'misc';

    // Inherit location from org HQ with deterministic jitter
    const orgLoc = ORG_LOCATIONS[p.orgId];
    let personLoc: { lat: number; lng: number } | undefined;
    if (orgLoc) {
      // Deterministic jitter based on person id
      let hash = 0;
      for (let i = 0; i < p.id.length; i++) hash = (hash * 31 + p.id.charCodeAt(i)) | 0;
      const jitterLat = ((Math.abs(hash) % 100) - 50) * 0.003;
      const jitterLng = ((Math.abs(hash * 7) % 100) - 50) * 0.004;
      personLoc = { lat: orgLoc.lat + jitterLat, lng: orgLoc.lng + jitterLng };
    }

    addNode({
      id: p.id,
      type: 'person',
      label: p.name,
      group,
      orgId: p.orgId,
      imageUrl: p.image,
      location: personLoc,
    });

    // Person ↔ Org link
    addLink({ source: p.id, target: p.orgId, type: 'member', activity: computeActivity(p.id, p.orgId, 'member', 0) });

    // Person ↔ Space links (first space = most active, decreasing)
    // Parent spaces inherited from subspace membership get lower activity (appended at end)
    relevantSpaces.forEach((s, index) => {
      addLink({ source: p.id, target: s, type: 'member', activity: computeActivity(p.id, s, 'member', index) });
    });
  });

  return { nodes, links };
};

// --- Connection stats ---
const getConnectionStats = (nodeId: string, links: GraphLink[], nodes: Node[]) => {
  const connected = new Set<string>();
  links.forEach(l => {
    if (l.source === nodeId) connected.add(l.target);
    if (l.target === nodeId) connected.add(l.source);
  });
  let spaces = 0, orgs = 0, people = 0;
  nodes.forEach(n => {
    if (connected.has(n.id)) {
      if (n.type === 'space') spaces++;
      else if (n.type === 'org') orgs++;
      else people++;
    }
  });
  return { spaces, orgs, people, total: connected.size };
};

// --- Suggested related items for drawer ---
const SUGGESTED_SPACES = [
  { id: 'policy-b', name: 'Policy Group B', level: 'L1', access: true },
  { id: 'strategy-z', name: 'Strategy Zone', level: 'L0', access: false },
  { id: 'health-data', name: 'Health Data Exchange', level: 'L1', access: true },
];

// --- Component ---

interface AnalyticsGraphExplorerProps {
  selectedSpaceIds: string[];
}

export function AnalyticsGraphExplorer({ selectedSpaceIds }: AnalyticsGraphExplorerProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<{ nodes: Node[]; links: GraphLink[] }>({ nodes: [], links: [] });
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [clusterMode, setClusterMode] = useState<'space' | 'org'>('space');
  const [mapMode, setMapMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showPeople, setShowPeople] = useState(true);
  const [showOrgs, setShowOrgs] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    updateSize();
    setTimeout(updateSize, 150);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { simulateLoad(); }, [selectedSpaceIds]);

  const simulateLoad = () => {
    setLoadingStep(1);
    setTimeout(() => setLoadingStep(2), 500);
    setTimeout(() => {
      setLoadingStep(3);
      setData(generateGraphData(selectedSpaceIds));
    }, 1000);
    setTimeout(() => {
      setLoadingStep(0);
      setLastUpdated(new Date());
    }, 1500);
  };

  const handleAddRelatedSpace = (suggestedId: string) => {
    if (!selectedNode) return;
    const suggested = SUGGESTED_SPACES.find(s => s.id === suggestedId);
    if (!suggested) return;
    const newNode: Node = {
      id: suggestedId,
      type: 'space',
      level: 'L1',
      label: suggested.name,
      group: selectedNode.group,
    };
    const newLink: GraphLink = { source: selectedNode.id, target: suggestedId, type: 'parent-child' };
    setData(prev => ({
      nodes: [...prev.nodes, newNode],
      links: [...prev.links, newLink]
    }));
  };

  // Filtered data
  const visibleNodes = useMemo(() => data.nodes.filter(n => {
    if (!showPeople && n.type === 'person') return false;
    if (!showOrgs && n.type === 'org') return false;
    if (searchQuery && !n.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }), [data.nodes, showPeople, showOrgs, searchQuery]);

  const visibleLinks = useMemo(() => data.links.filter(l =>
    visibleNodes.find(n => n.id === l.source) && visibleNodes.find(n => n.id === l.target)
  ), [data.links, visibleNodes]);

  // Stats for selected node
  const selectedStats = selectedNode 
    ? getConnectionStats(selectedNode.id, data.links, data.nodes) 
    : null;

  // Count by type
  const typeCounts = useMemo(() => {
    const counts = { space: 0, org: 0, person: 0 };
    visibleNodes.forEach(n => counts[n.type]++);
    return counts;
  }, [visibleNodes]);

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Bar */}
      <header 
        className="h-12 flex items-center justify-between px-4 z-20 shrink-0"
        style={{ 
          borderBottom: '1px solid var(--border)', 
          background: 'var(--background)',
          boxShadow: 'var(--elevation-sm)',
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            style={{ 
              height: 28, 
              padding: '0 10px', 
              fontSize: '12px', 
              gap: 6, 
              color: 'var(--muted-foreground)',
              fontFamily: "'Inter', sans-serif",
            }}
            title="Return to Alkemio Platform"
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span className="hidden sm:inline">Alkemio</span>
          </Button>
          <Separator orientation="vertical" style={{ height: 20 }} />
          <div 
            className="flex items-center justify-center rounded-md"
            style={{ width: 28, height: 28, background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Network style={{ width: 16, height: 16 }} />
          </div>
          <div className="flex items-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            <span className="cursor-pointer" style={{ transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--foreground)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}>
              Ecosystem Analytics
            </span>
            <ChevronRight style={{ width: 14, height: 14, margin: '0 4px' }} />
            <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>Portfolio Network</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block" style={{ width: 220 }}>
            <Search className="absolute top-1/2 -translate-y-1/2" style={{ left: 10, width: 14, height: 14, color: 'var(--muted-foreground)' }} />
            <Input 
              placeholder="Search nodes..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: 32,
                height: 32,
                fontSize: '12px',
                borderRadius: '999px',
                background: 'var(--muted)',
                border: '1px solid transparent',
                color: 'var(--foreground)',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
          <Separator orientation="vertical" style={{ height: 20 }} />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={simulateLoad} style={{ width: 32, height: 32, padding: 0 }} title="Refresh Data">
              <RefreshCw className={cn(loadingStep > 0 && "animate-spin")} style={{ width: 14, height: 14 }} />
            </Button>
            <div className="hidden sm:block text-right" style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>Last sync</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--foreground)' }}>{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <Avatar style={{ width: 28, height: 28, marginLeft: 4, border: '1px solid var(--border)' }}>
              <AvatarImage src={IMG.userAvatar} />
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Controls */}
        <div 
          className="hidden md:flex flex-col overflow-y-auto z-10 shrink-0"
          style={{ 
            width: 240, 
            borderRight: '1px solid var(--border)', 
            background: 'var(--card)', 
            padding: 16,
            gap: 20,
          }}
        >
          {/* Scope */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>Scope</h3>
            <div className="flex flex-wrap gap-1.5">
              {selectedSpaceIds.map(id => {
                const defs = SPACE_DEFS[id];
                const name = defs ? defs[0].name : `Space ${id}`;
                return (
                  <Badge key={id} variant="secondary" style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)', fontFamily: "'Inter', sans-serif" }}>
                    {name} <X style={{ width: 10, height: 10, marginLeft: 4, cursor: 'pointer', opacity: 0.5 }} />
                  </Badge>
                );
              })}
              <Button variant="outline" size="sm" style={{ height: 22, padding: '0 8px', fontSize: '10px', borderStyle: 'dashed' }}>+ Add</Button>
            </div>
          </div>

          {/* Clustering */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>Clustering</h3>
            <div className="grid grid-cols-2 gap-1.5">
              <Button 
                variant={clusterMode === 'space' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setClusterMode('space')}
                style={{ fontSize: '11px', justifyContent: 'flex-start', height: 30, gap: 6, fontFamily: "'Inter', sans-serif" }}
              >
                <LayoutGrid style={{ width: 12, height: 12 }} /> Space
              </Button>
              <Button 
                variant={clusterMode === 'org' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setClusterMode('org')}
                style={{ fontSize: '11px', justifyContent: 'flex-start', height: 30, gap: 6, fontFamily: "'Inter', sans-serif" }}
              >
                <Building style={{ width: 12, height: 12 }} /> Org
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>Filters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  <Users style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
                  <span>People</span>
                  <span style={{ fontSize: '10px', color: 'var(--muted-foreground)', marginLeft: 2 }}>({typeCounts.person})</span>
                </div>
                <Switch checked={showPeople} onCheckedChange={setShowPeople} className="scale-75 origin-right" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                  <Building style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
                  <span>Organizations</span>
                  <span style={{ fontSize: '10px', color: 'var(--muted-foreground)', marginLeft: 2 }}>({typeCounts.org})</span>
                </div>
                <Switch checked={showOrgs} onCheckedChange={setShowOrgs} className="scale-75 origin-right" />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>Legend</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '11px' }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 20, height: 2, background: 'var(--foreground)', opacity: 0.6 }} />
                <span style={{ color: 'var(--muted-foreground)' }}>Parent → Child</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: 20, height: 2, background: 'var(--primary)', opacity: 0.6 }} />
                <span style={{ color: 'var(--muted-foreground)' }}>Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: 20, height: 2, background: 'var(--muted-foreground)', opacity: 0.4, borderTop: '1px dashed var(--muted-foreground)' }} />
                <span style={{ color: 'var(--muted-foreground)' }}>Member</span>
              </div>
              <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <svg width="20" height="6" style={{ overflow: 'visible' }}>
                    <line x1="0" y1="3" x2="20" y2="3" stroke="var(--chart-2)" strokeWidth="1.5" strokeDasharray="3 5" strokeLinecap="round" style={{ animation: 'edgeFlow 1s linear infinite' } as React.CSSProperties} />
                  </svg>
                  <span style={{ color: 'var(--muted-foreground)' }}>High activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="20" height="6" style={{ overflow: 'visible' }}>
                    <line x1="0" y1="3" x2="20" y2="3" stroke="var(--chart-2)" strokeWidth="1" strokeDasharray="3 14" strokeLinecap="round" opacity="0.4" style={{ animation: 'edgeFlow 4s linear infinite' } as React.CSSProperties} />
                  </svg>
                  <span style={{ color: 'var(--muted-foreground)' }}>Low activity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map overlay at bottom */}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>
                <Globe style={{ width: 12, height: 12 }} /> Map Overlay
              </h3>
              <Switch checked={mapMode} onCheckedChange={setMapMode} className="scale-75 origin-right" />
            </div>
            {mapMode && (
              <Select defaultValue="europe">
                <SelectTrigger style={{ height: 30, fontSize: '11px', fontFamily: "'Inter', sans-serif" }}>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="world">World</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="netherlands">Netherlands</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Main Canvas */}
        <div 
          className="flex-1 relative overflow-hidden" 
          ref={containerRef}
          style={{ background: 'var(--background)' }}
        >
          <ForceGraph 
            nodes={visibleNodes} 
            links={visibleLinks} 
            width={dimensions.width} 
            height={dimensions.height}
            clusterBy={clusterMode}
            mapMode={mapMode}
            selectedNodeId={selectedNode?.id || null}
            onNodeClick={setSelectedNode}
            onEmptyClick={() => setSelectedNode(null)}
          />

          {/* Loading Overlay */}
          {loadingStep > 0 && (
            <div 
              className="absolute inset-0 flex items-center justify-center z-50 animate-in fade-in duration-300"
              style={{ background: 'color-mix(in srgb, var(--background) 70%, transparent)', backdropFilter: 'blur(6px)' }}
            >
              <div 
                className="text-center"
                style={{ 
                  background: 'var(--background)', 
                  border: '1px solid var(--border)', 
                  boxShadow: 'var(--elevation-sm)',
                  borderRadius: 'calc(var(--radius) + 4px)',
                  padding: '32px 40px',
                  minWidth: 300,
                }}
              >
                <div className="relative mx-auto" style={{ width: 48, height: 48, marginBottom: 16 }}>
                  <div className="absolute inset-0 rounded-full" style={{ border: '3px solid var(--muted)' }} />
                  <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '3px solid transparent', borderTopColor: 'var(--primary)' }} />
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 'var(--text-base)', marginBottom: 4, color: 'var(--foreground)' }}>
                  {loadingStep === 1 ? "Acquiring Data" : loadingStep === 2 ? "Clustering Entities" : "Rendering Graph"}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                  Processing {data.nodes.length || '…'} entities
                </p>
                <div className="flex gap-1.5 justify-center" style={{ marginTop: 16 }}>
                  {[1, 2, 3].map(step => (
                    <div key={step} style={{ 
                      height: 4, 
                      borderRadius: 2,
                      background: loadingStep >= step ? 'var(--primary)' : 'var(--muted)',
                      width: loadingStep >= step ? 28 : 8,
                      transition: 'all 0.4s ease',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details Drawer */}
        <div 
          className="absolute top-0 right-0 h-full z-30"
          style={{ 
            width: 320,
            background: 'var(--background)', 
            borderLeft: '1px solid var(--border)',
            boxShadow: selectedNode ? 'var(--elevation-sm)' : 'none',
            transform: selectedNode ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          {selectedNode && (
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="relative" style={{ padding: '16px 16px 14px', borderBottom: '1px solid var(--border)' }}>
                <Button 
                  variant="ghost" size="icon" 
                  className="absolute top-2 right-2" 
                  style={{ width: 28, height: 28 }} 
                  onClick={() => setSelectedNode(null)}
                >
                  <X style={{ width: 14, height: 14 }} />
                </Button>

                <div className="flex items-start gap-3">
                  <div 
                    className="rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                    style={{ 
                      width: 48, 
                      height: 48,
                      background: selectedNode.type === 'space' ? 'var(--primary)' : (selectedNode.type === 'org' ? 'var(--chart-2)' : 'var(--chart-3)'),
                      color: 'var(--primary-foreground)',
                      boxShadow: 'var(--elevation-sm)',
                    }}
                  >
                    {selectedNode.imageUrl ? (
                      <img src={selectedNode.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-xl)' }}>{selectedNode.label.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0" style={{ paddingTop: 2 }}>
                    <h2 className="truncate" style={{ fontWeight: 700, fontSize: 'var(--text-base)', lineHeight: 1.3, color: 'var(--foreground)' }}>{selectedNode.label}</h2>
                    <div className="flex items-center gap-1.5" style={{ marginTop: 6 }}>
                      <Badge variant="outline" style={{ fontSize: '10px', textTransform: 'capitalize', height: 20, padding: '0 6px', background: 'var(--background)', fontFamily: "'Inter', sans-serif" }}>{selectedNode.type}</Badge>
                      {selectedNode.level && <Badge variant="secondary" style={{ fontSize: '10px', height: 20, padding: '0 6px', fontFamily: "'Inter', sans-serif" }}>{selectedNode.level}</Badge>}
                    </div>
                  </div>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Connection Summary */}
                  {selectedStats && (
                    <div style={{ padding: 12, background: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 10 }}>
                        Connections
                      </h4>
                      <div className="flex justify-between">
                        {[
                          { label: 'Spaces', count: selectedStats.spaces },
                          { label: 'Orgs', count: selectedStats.orgs },
                          { label: 'People', count: selectedStats.people },
                        ].map((stat, i) => (
                          <React.Fragment key={stat.label}>
                            {i > 0 && <div style={{ width: 1, background: 'var(--border)' }} />}
                            <div className="text-center flex-1">
                              <div style={{ fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--foreground)' }}>{stat.count}</div>
                              <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{stat.label}</div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connected Entities */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h3 style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>Direct Connections</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {data.links
                        .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                        .slice(0, 6)
                        .map((link, i) => {
                          const otherId = link.source === selectedNode.id ? link.target : link.source;
                          const otherNode = data.nodes.find(n => n.id === otherId);
                          if (!otherNode) return null;
                          return (
                            <div 
                              key={i} 
                              className="flex items-center gap-2 cursor-pointer"
                              style={{ 
                                padding: '6px 8px', 
                                borderRadius: 'var(--radius)', 
                                border: '1px solid var(--border)',
                                background: 'var(--card)',
                                transition: 'background 0.15s',
                                fontSize: 'var(--text-sm)',
                              }}
                              onClick={() => setSelectedNode(otherNode)}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'var(--card)')}
                            >
                              <div 
                                className="rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                                style={{ 
                                  width: 24, height: 24,
                                  background: otherNode.type === 'space' ? 'var(--primary)' : (otherNode.type === 'org' ? 'var(--chart-2)' : 'var(--chart-3)'),
                                  color: 'var(--primary-foreground)',
                                }}
                              >
                                {otherNode.imageUrl ? (
                                  <img src={otherNode.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <span style={{ fontSize: '9px', fontWeight: 700 }}>{otherNode.label.charAt(0)}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="truncate" style={{ fontWeight: 500, color: 'var(--foreground)', fontSize: '12px' }}>{otherNode.label}</div>
                              </div>
                              <Badge variant="outline" style={{ fontSize: '9px', height: 16, padding: '0 4px', fontFamily: "'Inter', sans-serif" }}>
                                {link.type === 'parent-child' ? 'child' : link.type}
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Suggested Related Spaces */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h3 style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>Suggested to Add</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {SUGGESTED_SPACES.map(space => (
                        <div 
                          key={space.id}
                          className="flex items-center justify-between"
                          style={{ 
                            padding: '6px 8px', 
                            borderRadius: 'var(--radius)', 
                            border: space.access ? '1px solid var(--border)' : '1px dashed var(--border)',
                            background: space.access ? 'var(--card)' : 'var(--muted)',
                            opacity: space.access ? 1 : 0.6,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="rounded flex items-center justify-center"
                              style={{ width: 24, height: 24, background: 'var(--muted)', fontSize: '9px', fontWeight: 700, color: 'var(--muted-foreground)', fontFamily: "'Inter', sans-serif" }}
                            >
                              {space.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--foreground)' }}>{space.name}</div>
                              <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>
                                {space.level} · {space.access ? 'Accessible' : 'No Access'}
                              </div>
                            </div>
                          </div>
                          {space.access ? (
                            <Button 
                              size="sm" variant="secondary" 
                              style={{ height: 24, fontSize: '10px', gap: 4, fontFamily: "'Inter', sans-serif" }}
                              onClick={() => handleAddRelatedSpace(space.id)}
                            >
                              <Plus style={{ width: 10, height: 10 }} /> Add
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" disabled style={{ height: 24, fontSize: '10px', fontFamily: "'Inter', sans-serif" }}>
                              Locked
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h3 style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>Metadata</h3>
                    <div style={{ background: 'var(--muted)', borderRadius: 'var(--radius)', padding: 10, fontSize: 'var(--text-sm)' }}>
                      {[
                        { label: 'ID', value: selectedNode.id },
                        { label: 'Status', value: 'Active', isActive: true },
                        { label: 'Group', value: selectedNode.group },
                      ].map((row, i) => (
                        <div 
                          key={row.label}
                          className="flex justify-between items-center"
                          style={{ 
                            padding: '6px 0', 
                            borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                          }}
                        >
                          <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{row.label}</span>
                          {row.isActive ? (
                            <span className="flex items-center gap-1" style={{ color: 'var(--chart-1)', fontWeight: 500, fontSize: '12px' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--chart-1)', display: 'inline-block' }} />
                              {row.value}
                            </span>
                          ) : (
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--foreground)' }}>{row.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              {/* Footer Actions */}
              <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedNode.type === 'space' && (
                  <Button style={{ width: '100%', gap: 8, fontFamily: "'Inter', sans-serif" }} variant="default">
                    <ExternalLink style={{ width: 14, height: 14 }} /> Open in Alkemio
                  </Button>
                )}
                <Button variant="outline" style={{ width: '100%', gap: 8, color: 'var(--muted-foreground)', fontFamily: "'Inter', sans-serif" }}>
                  <Share2 style={{ width: 14, height: 14 }} /> Share Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}