import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { User, Building, Layout, Globe, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { projectToPixel, coordsToPath, PROVINCES, CITIES, IJSSELMEER } from './netherlandsMap';

// --- Types ---
export interface Node {
  id: string;
  type: 'space' | 'org' | 'person';
  label: string;
  group: string;
  orgId?: string;
  level?: 'L0' | 'L1' | 'L2'; 
  imageUrl?: string;
  location?: { lat: number, lng: number };
  color?: string;
  data?: any;
}

export interface Link {
  source: string;
  target: string;
  type: 'parent-child' | 'member' | 'lead';
  weight?: number;
  activity?: number; // 0-100 contribution intensity (users only)
}

interface ForceGraphProps {
  nodes: Node[];
  links: Link[];
  width: number;
  height: number;
  clusterBy: 'space' | 'org';
  mapMode: boolean;
  selectedNodeId: string | null;
  onNodeClick: (node: Node) => void;
  onEmptyClick: () => void;
}

// --- Spring-animated position store ---
interface AnimatedPos {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number; // target x
  ty: number; // target y
  settled: boolean;
}

const SPRING_STIFFNESS = 120;
const SPRING_DAMPING = 18;
const SETTLE_THRESHOLD = 0.3;
const DT = 1 / 60;

function stepSpring(pos: AnimatedPos): boolean {
  if (pos.settled) return false;
  const fx = SPRING_STIFFNESS * (pos.tx - pos.x) - SPRING_DAMPING * pos.vx;
  const fy = SPRING_STIFFNESS * (pos.ty - pos.y) - SPRING_DAMPING * pos.vy;
  pos.vx += fx * DT;
  pos.vy += fy * DT;
  pos.x += pos.vx * DT;
  pos.y += pos.vy * DT;
  if (
    Math.abs(pos.tx - pos.x) < SETTLE_THRESHOLD &&
    Math.abs(pos.ty - pos.y) < SETTLE_THRESHOLD &&
    Math.abs(pos.vx) < SETTLE_THRESHOLD &&
    Math.abs(pos.vy) < SETTLE_THRESHOLD
  ) {
    pos.x = pos.tx;
    pos.y = pos.ty;
    pos.vx = 0;
    pos.vy = 0;
    pos.settled = true;
  }
  return true;
}

// --- Layout Logic ---

const getPriority = (n: Node): number => {
  if (n.type === 'space' && n.level === 'L0') return 0;
  if (n.type === 'space' && n.level === 'L1') return 1;
  if (n.type === 'space') return 1;
  if (n.type === 'org') return 2;
  return 3;
};

const calculateLayout = (
  nodes: Node[], 
  width: number, 
  height: number, 
  clusterBy: 'space' | 'org', 
  mapMode: boolean
): Record<string, { x: number, y: number }> => {
  const positions: Record<string, { x: number, y: number }> = {};

  if (mapMode) {
    // Use shared Mercator projection to place nodes on the Netherlands map
    const MAP_PADDING = 60;
    const unlocated: Node[] = [];
    
    nodes.forEach(node => {
      if (node.location) {
        const { x, y } = projectToPixel(node.location.lat, node.location.lng, width, height, MAP_PADDING);
        positions[node.id] = { x, y };
      } else {
        unlocated.push(node);
      }
    });

    // Place unlocated nodes in a tidy grid in the bottom-right corner
    if (unlocated.length > 0) {
      const cols = Math.ceil(Math.sqrt(unlocated.length));
      const spacing = 50;
      const startX = width - MAP_PADDING - (cols * spacing);
      const startY = height - MAP_PADDING - 20;

      unlocated.forEach((node, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions[node.id] = {
          x: startX + col * spacing,
          y: startY - row * spacing,
        };
      });
    }
    return positions;
  }

  // --- Cluster Layout ---
  const getGroupId = (n: Node): string => {
    if (clusterBy === 'space') return n.group;
    if (n.type === 'org') return n.id;
    if (n.orgId) return n.orgId;
    return 'unaffiliated';
  };

  const groups: Record<string, Node[]> = {};
  nodes.forEach(n => {
    const g = getGroupId(n);
    if (!groups[g]) groups[g] = [];
    groups[g].push(n);
  });

  const groupKeys = Object.keys(groups);
  const center = { x: width / 2, y: height / 2 };

  const maxClusterR = Math.min(width, height) * 0.36;
  const clusterRadius = groupKeys.length <= 1 ? 0 : 
    groupKeys.length <= 3 ? maxClusterR * 0.75 : maxClusterR;

  const baseRings = [0, 75, 128, 178];

  groupKeys.forEach((key, gi) => {
    const angle = (gi / groupKeys.length) * 2 * Math.PI - Math.PI / 2;
    const cx = center.x + Math.cos(angle) * clusterRadius;
    const cy = center.y + Math.sin(angle) * clusterRadius;

    const groupNodes = groups[key];

    const rings: Record<number, Node[]> = {};
    groupNodes.forEach(n => {
      const p = getPriority(n);
      if (!rings[p]) rings[p] = [];
      rings[p].push(n);
    });

    const totalNodes = groupNodes.length;
    const scale = totalNodes > 10 ? 1.2 : totalNodes > 5 ? 1.05 : 0.92;

    Object.entries(rings).forEach(([ringStr, nodesInRing]) => {
      const ringIdx = parseInt(ringStr);
      const r = baseRings[Math.min(ringIdx, baseRings.length - 1)] * scale;

      nodesInRing.forEach((node, i) => {
        if (r === 0) {
          positions[node.id] = { x: cx, y: cy };
        } else {
          const count = nodesInRing.length;
          const goldenAngle = 2.399963;
          const baseAngle = gi * 1.2;
          const a = baseAngle + i * (count <= 6 ? (2 * Math.PI / count) : goldenAngle);
          const jitter = (i % 2 === 0 ? 1 : -1) * (r * 0.08);
          positions[node.id] = {
            x: cx + Math.cos(a) * (r + jitter),
            y: cy + Math.sin(a) * (r + jitter)
          };
        }
      });
    });
  });

  return positions;
};

// Compute cluster centers for labels
const computeClusterCenters = (
  positions: Record<string, { x: number, y: number }>,
  nodes: Node[],
  clusterBy: 'space' | 'org'
): { id: string; label: string; x: number; y: number; radius: number }[] => {
  const getGroupId = (n: Node): string => {
    if (clusterBy === 'space') return n.group;
    if (n.type === 'org') return n.id;
    if (n.orgId) return n.orgId;
    return 'unaffiliated';
  };

  const groups: Record<string, { nodes: Node[]; label: string }> = {};
  nodes.forEach(n => {
    const g = getGroupId(n);
    if (!groups[g]) {
      const nameNode = nodes.find(nn => nn.id === g);
      groups[g] = { nodes: [], label: nameNode?.label || g };
    }
    groups[g].nodes.push(n);
  });

  return Object.entries(groups).map(([id, { nodes: gNodes, label }]) => {
    let cx = 0, cy = 0, count = 0;
    gNodes.forEach(n => {
      const p = positions[n.id];
      if (p) { cx += p.x; cy += p.y; count++; }
    });
    if (count > 0) { cx /= count; cy /= count; }

    let maxDist = 0;
    gNodes.forEach(n => {
      const p = positions[n.id];
      if (p) {
        const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
        if (d > maxDist) maxDist = d;
      }
    });

    return { id, label, x: cx, y: cy, radius: maxDist + 40 };
  });
};


// --- Curved path computation ---
function curvedPath(sx: number, sy: number, tx: number, ty: number): string {
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = dist < 100 ? 0.15 : 0.08;
  const cx = mx - dy * curvature;
  const cy = my + dx * curvature;
  return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
}

// --- Edge Component ---
const Edge = React.memo(({ 
  d, linkType, isActive, isDimmed, activity = 0
}: {
  d: string;
  linkType: string;
  isActive: boolean;
  isDimmed: boolean;
  activity?: number;
}) => {
  const strokeW = isActive ? 3 : (linkType === 'parent-child' ? 2 : (linkType === 'lead' ? 1.8 : 1.2));
  const baseOpacity = isActive ? 0.65 : (isDimmed ? 0.03 : 0.12);

  // Activity-based flow animation — highly visible, only for users
  const showFlow = (activity ?? 0) > 0 && !isDimmed;
  const activityVal = activity ?? 0;
  // Larger dashes for visibility
  const flowDash = Math.max(5, Math.min(14, activityVal / 8));
  // Tighter gaps for high activity = denser particles
  const flowGap = Math.max(8, 35 - activityVal * 0.28);
  // Faster speed for higher activity
  const flowSpeed = Math.max(0.4, 4.0 - (activityVal / 100) * 3.5);
  // Much higher opacity for visibility
  const flowOpacity = isActive
    ? Math.min(0.95, 0.35 + (activityVal / 100) * 0.6)
    : Math.min(0.65, 0.12 + (activityVal / 100) * 0.53);
  // Thicker flow lines
  const flowWidth = isActive ? 4 : (activityVal > 60 ? 3 : activityVal > 30 ? 2.5 : 2);

  return (
    <g>
      {/* Base edge line — only shown when there is NO animated flow */}
      {!showFlow && (
        <path
          d={d}
          fill="none"
          stroke={isActive ? 'var(--primary)' : 'var(--muted-foreground)'}
          strokeWidth={strokeW}
          strokeLinecap="round"
          opacity={baseOpacity}
          style={{ transition: 'opacity 0.4s ease' }}
        />
      )}
      {/* Glow underlay for active flow edges */}
      {showFlow && activityVal > 30 && (
        <path
          d={d}
          fill="none"
          stroke={isActive ? 'var(--primary)' : 'var(--chart-2)'}
          strokeWidth={flowWidth + 4}
          strokeLinecap="round"
          opacity={isActive ? 0.08 : 0.04}
          style={{
            filter: 'blur(4px)',
            transition: 'opacity 0.4s ease',
          }}
        />
      )}
      {/* Animated activity flow particles */}
      {showFlow && (
        <path
          d={d}
          fill="none"
          stroke={isActive ? 'var(--primary)' : 'var(--chart-2)'}
          strokeWidth={flowWidth}
          strokeDasharray={`${flowDash} ${flowGap}`}
          strokeLinecap="round"
          opacity={flowOpacity}
          style={{
            animation: `edgeFlow ${flowSpeed}s linear infinite`,
            transition: 'opacity 0.4s ease',
          } as React.CSSProperties}
        />
      )}
    </g>
  );
});
Edge.displayName = 'Edge';


// --- Node Component ---
const NodeItem = React.memo(({ 
  node, 
  posX,
  posY,
  isSelected, 
  isDimmed, 
  isHovered,
  isNeighbor,
  onClick, 
  onHover,
  onDrag,
}: { 
  node: Node;
  posX: number;
  posY: number;
  isSelected: boolean;
  isDimmed: boolean;
  isHovered: boolean;
  isNeighbor: boolean;
  onClick: (e: React.MouseEvent | React.PointerEvent) => void;
  onHover: (state: boolean) => void;
  onDrag: (dx: number, dy: number) => void;
}) => {
  const isDragging = useRef(false);
  const dragStart = useRef({ clientX: 0, clientY: 0 });
  const hasDragged = useRef(false);

  // Size by type/level
  let size = 32;
  if (node.type === 'space') size = node.level === 'L0' ? 64 : (node.level === 'L1' ? 42 : 34);
  if (node.type === 'org') size = 44;
  if (node.type === 'person') size = 34;

  const hitPadding = 14;
  const totalSize = size + hitPadding * 2;
  const shouldHighlight = isSelected || isHovered || isNeighbor;
  const showLabel = shouldHighlight || (node.type === 'space' && node.level === 'L0') || node.type === 'org';

  // --- Pointer-based drag ---
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    hasDragged.current = false;
    dragStart.current = { clientX: e.clientX, clientY: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.clientX;
    const dy = e.clientY - dragStart.current.clientY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
    if (hasDragged.current) {
      dragStart.current = { clientX: e.clientX, clientY: e.clientY };
      onDrag(dx, dy);
    }
  }, [onDrag]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (!hasDragged.current) {
      onClick(e);
    }
  }, [onClick]);

  // Node color based on type
  const getNodeBg = (): string => {
    if (node.color) return node.color;
    if (node.type === 'space' && node.level === 'L0') return 'var(--primary)';
    if (node.type === 'space') return 'var(--chart-2)';
    if (node.type === 'org') return 'var(--chart-3)';
    return 'var(--chart-4)';
  };

  return (
    <div
      className="absolute z-10"
      style={{ 
        transform: `translate(${posX - totalSize / 2}px, ${posY - totalSize / 2}px)`,
        width: totalSize, 
        height: totalSize,
        willChange: 'transform',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => { onHover(false); }}
    >
      {/* Visible Node (centered within hit area) */}
      <div
        className="absolute rounded-full overflow-hidden flex items-center justify-center pointer-events-none"
        style={{
          left: hitPadding,
          top: hitPadding,
          width: size,
          height: size,
          boxShadow: shouldHighlight 
            ? '0 0 0 3px var(--primary), 0 4px 20px color-mix(in srgb, var(--foreground) 15%, transparent)' 
            : isSelected 
              ? '0 0 0 4px var(--primary), 0 0 0 6px var(--background)' 
              : 'var(--elevation-sm)',
          border: shouldHighlight ? '2px solid var(--primary)' : '2px solid var(--border)',
          opacity: isDimmed && !shouldHighlight ? 0.15 : 1,
          filter: isDimmed && !shouldHighlight ? 'grayscale(0.8)' : 'none',
          transform: isHovered ? 'scale(1.12)' : (isDimmed && !shouldHighlight ? 'scale(0.88)' : 'scale(1)'),
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'grab',
          background: 'var(--background)',
        }}
      >
        {node.imageUrl ? (
          <img 
            src={node.imageUrl} 
            alt={node.label} 
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ background: getNodeBg(), color: 'var(--primary-foreground)' }}
          >
            {node.type === 'space' ? <Layout style={{ width: '45%', height: '45%' }} /> : 
             node.type === 'org' ? <Building style={{ width: '45%', height: '45%' }} /> : 
             <User style={{ width: '45%', height: '45%' }} />}
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && !isDimmed && (
        <div 
          className="absolute left-1/2 pointer-events-none whitespace-nowrap z-30"
          style={{
            top: hitPadding + size + 6,
            transform: 'translateX(-50%)',
            fontFamily: "'Inter', sans-serif",
            fontSize: isSelected ? 'var(--text-sm)' : '11px',
            fontWeight: isSelected ? 600 : (node.type === 'space' && node.level === 'L0' ? 600 : 500),
            color: isSelected ? 'var(--primary-foreground)' : 'var(--foreground)',
            background: isSelected ? 'var(--primary)' : 'var(--background)',
            padding: isSelected ? '3px 10px' : '2px 8px',
            borderRadius: 'var(--radius)',
            border: isSelected ? 'none' : '1px solid var(--border)',
            boxShadow: 'var(--elevation-sm)',
            opacity: shouldHighlight ? 1 : 0.85,
            transition: 'all 0.2s ease',
          }}
        >
          {node.label}
        </div>
      )}
    </div>
  );
});
NodeItem.displayName = 'NodeItem';


// --- Main ForceGraph ---

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.15;

export function ForceGraph({ 
  nodes, 
  links, 
  width, 
  height, 
  clusterBy, 
  mapMode, 
  selectedNodeId, 
  onNodeClick, 
  onEmptyClick 
}: ForceGraphProps) {
  
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [, forceRender] = useState(0);

  // --- Pan & Zoom state ---
  const viewRef = useRef({ panX: 0, panY: 0, zoom: 1 });
  const [viewState, setViewState] = useState({ panX: 0, panY: 0, zoom: 1 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0 });
  const hasPannedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync view ref → state (batched)
  const commitView = useCallback(() => {
    const v = viewRef.current;
    setViewState({ panX: v.panX, panY: v.panY, zoom: v.zoom });
  }, []);

  // Reset pan/zoom when layout changes (space selection, map mode toggle)
  useEffect(() => {
    viewRef.current = { panX: 0, panY: 0, zoom: 1 };
    commitView();
  }, [clusterBy, mapMode, commitView]);

  // --- Wheel zoom (zoom toward cursor) ---
  const handleWheelRef = useRef<(e: WheelEvent) => void>();
  handleWheelRef.current = (e: WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const v = viewRef.current;
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Determine zoom direction
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * (1 + delta)));
    const scaleFactor = newZoom / v.zoom;

    // Zoom toward cursor
    v.panX = cursorX - (cursorX - v.panX) * scaleFactor;
    v.panY = cursorY - (cursorY - v.panY) * scaleFactor;
    v.zoom = newZoom;
    commitView();
  };

  // Attach wheel listener imperatively with { passive: false } so preventDefault works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => handleWheelRef.current?.(e);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // --- Canvas pan (pointer events on outer container) ---
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    // Only pan with left button on empty space
    if (e.button !== 0) return;
    // If event originated from a node, don't pan (nodes call stopPropagation)
    isPanningRef.current = true;
    hasPannedRef.current = false;
    panStartRef.current = { clientX: e.clientX, clientY: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.clientX;
    const dy = e.clientY - panStartRef.current.clientY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasPannedRef.current = true;
    if (hasPannedRef.current) {
      panStartRef.current = { clientX: e.clientX, clientY: e.clientY };
      viewRef.current.panX += dx;
      viewRef.current.panY += dy;
      commitView();
    }
  }, [commitView]);

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isPanningRef.current) return;
    isPanningRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    // Only trigger empty-click if user didn't pan
    if (!hasPannedRef.current) {
      onEmptyClick();
    }
  }, [onEmptyClick]);

  // --- Zoom controls ---
  const handleZoomIn = useCallback(() => {
    const v = viewRef.current;
    const newZoom = Math.min(MAX_ZOOM, v.zoom * (1 + ZOOM_STEP));
    const scaleFactor = newZoom / v.zoom;
    // Zoom toward center
    const cx = width / 2;
    const cy = height / 2;
    v.panX = cx - (cx - v.panX) * scaleFactor;
    v.panY = cy - (cy - v.panY) * scaleFactor;
    v.zoom = newZoom;
    commitView();
  }, [width, height, commitView]);

  const handleZoomOut = useCallback(() => {
    const v = viewRef.current;
    const newZoom = Math.max(MIN_ZOOM, v.zoom * (1 - ZOOM_STEP));
    const scaleFactor = newZoom / v.zoom;
    const cx = width / 2;
    const cy = height / 2;
    v.panX = cx - (cx - v.panX) * scaleFactor;
    v.panY = cy - (cy - v.panY) * scaleFactor;
    v.zoom = newZoom;
    commitView();
  }, [width, height, commitView]);

  const handleFitToScreen = useCallback(() => {
    // Compute bounding box of all current node positions
    const posMap = positionsRef.current;
    if (posMap.size === 0) {
      viewRef.current = { panX: 0, panY: 0, zoom: 1 };
      commitView();
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    posMap.forEach(pos => {
      if (pos.x < minX) minX = pos.x;
      if (pos.y < minY) minY = pos.y;
      if (pos.x > maxX) maxX = pos.x;
      if (pos.y > maxY) maxY = pos.y;
    });
    const padding = 80;
    const contentW = (maxX - minX) + padding * 2;
    const contentH = (maxY - minY) + padding * 2;
    const zoom = Math.min(1.5, Math.max(MIN_ZOOM, Math.min(width / contentW, height / contentH)));
    const contentCx = (minX + maxX) / 2;
    const contentCy = (minY + maxY) / 2;
    const panX = width / 2 - contentCx * zoom;
    const panY = height / 2 - contentCy * zoom;
    viewRef.current = { panX, panY, zoom };
    commitView();
  }, [width, height, commitView]);

  // Animated positions stored in a ref for performance
  const positionsRef = useRef<Map<string, AnimatedPos>>(new Map());
  const animFrameRef = useRef<number>(0);

  // Calculate target layout positions
  const targetPositions = useMemo(() => 
    calculateLayout(nodes, width, height, clusterBy, mapMode),
  [nodes, width, height, clusterBy, mapMode]);

  // Cluster metadata for labels/hulls
  const clusterCenters = useMemo(() => 
    computeClusterCenters(targetPositions, nodes, clusterBy),
  [targetPositions, nodes, clusterBy]);

  // Initialize / update target positions and kick off spring animation
  useEffect(() => {
    const posMap = positionsRef.current;
    
    // Add new nodes, update targets for existing
    nodes.forEach(node => {
      const target = targetPositions[node.id];
      if (!target) return;
      
      const existing = posMap.get(node.id);
      if (existing) {
        existing.tx = target.x;
        existing.ty = target.y;
        existing.settled = false;
      } else {
        posMap.set(node.id, {
          x: target.x,
          y: target.y,
          vx: 0,
          vy: 0,
          tx: target.x,
          ty: target.y,
          settled: true,
        });
      }
    });

    // Remove stale nodes
    const currentIds = new Set(nodes.map(n => n.id));
    posMap.forEach((_, key) => {
      if (!currentIds.has(key)) posMap.delete(key);
    });

    // Start animation loop
    const tick = () => {
      let anyMoving = false;
      posMap.forEach(pos => {
        if (stepSpring(pos)) anyMoving = true;
      });
      if (anyMoving) {
        forceRender(c => c + 1);
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [targetPositions, nodes]);

  // Get current position for a node
  const getPos = useCallback((id: string) => {
    const p = positionsRef.current.get(id);
    return p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
  }, []);

  // Handle drag: update position directly, accounting for zoom scale
  const handleDrag = useCallback((nodeId: string, dx: number, dy: number) => {
    const pos = positionsRef.current.get(nodeId);
    if (pos) {
      // Convert screen-space delta to graph-space delta
      const z = viewRef.current.zoom;
      pos.x += dx / z;
      pos.y += dy / z;
      pos.tx = pos.x;
      pos.ty = pos.y;
      pos.vx = 0;
      pos.vy = 0;
      pos.settled = true;
      forceRender(c => c + 1);
    }
  }, []);

  // Derived state
  const activeNodeId = hoveredNodeId || selectedNodeId;
  
  const neighbors = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const s = new Set<string>();
    links.forEach(l => {
      if (l.source === activeNodeId) s.add(l.target);
      if (l.target === activeNodeId) s.add(l.source);
    });
    return s;
  }, [activeNodeId, links]);

  // Node lookup
  const nodeMap = useMemo(() => {
    const m = new Map<string, Node>();
    nodes.forEach(n => m.set(n.id, n));
    return m;
  }, [nodes]);

  // Zoom percentage for display
  const zoomPercent = Math.round(viewState.zoom * 100);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ 
        width, 
        height, 
        background: 'var(--background)',
        cursor: isPanningRef.current ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
    >
      {/* Dot Grid Pattern — fixed background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
        <defs>
          <pattern id="dotGrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.8" fill="var(--muted-foreground)" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>

      {/* Subtle radial vignette — fixed background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, var(--muted) 120%)',
          opacity: 0.15,
        }}
      />

      {/* ============ PANNABLE / ZOOMABLE TRANSFORM LAYER ============ */}
      <div
        className="absolute pointer-events-none"
        style={{
          transformOrigin: '0 0',
          transform: `translate(${viewState.panX}px, ${viewState.panY}px) scale(${viewState.zoom})`,
          width,
          height,
          willChange: 'transform',
        }}
      >
        {/* Map Overlay — Real Netherlands GeoJSON provinces */}
        {mapMode && (
          <svg
            className="absolute pointer-events-none"
            style={{ overflow: 'visible', width, height }}
          >
            {/* Province polygons with alternating fills */}
            {PROVINCES.map((prov, i) => (
              <path
                key={prov.id}
                d={coordsToPath(prov.coords, width, height)}
                fill={i % 2 === 0 ? 'var(--muted)' : 'var(--accent)'}
                stroke="var(--border)"
                strokeWidth={0.8}
                opacity={0.5}
              />
            ))}
            {/* IJsselmeer water body (cut out) */}
            <path
              d={coordsToPath(IJSSELMEER, width, height)}
              fill="var(--background)"
              stroke="var(--border)"
              strokeWidth={0.5}
              opacity={0.7}
            />
            {/* Province labels */}
            {PROVINCES.map(prov => {
              const { x, y } = projectToPixel(prov.center[1], prov.center[0], width, height);
              return (
                <text
                  key={`label-${prov.id}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: '8px',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    fill: 'var(--muted-foreground)',
                    opacity: 0.35,
                    textTransform: 'uppercase',
                  } as React.CSSProperties}
                >
                  {prov.name}
                </text>
              );
            })}
            {/* City markers */}
            {CITIES.map(city => {
              const { x, y } = projectToPixel(city.lat, city.lng, width, height);
              return (
                <g key={city.name}>
                  <circle
                    cx={x}
                    cy={y}
                    r={city.capital ? 3.5 : 2}
                    fill={city.capital ? 'var(--foreground)' : 'var(--muted-foreground)'}
                    opacity={0.35}
                  />
                  <text
                    x={x + 6}
                    y={y + 1}
                    style={{
                      fontSize: city.capital ? '9px' : '7px',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: city.capital ? 600 : 400,
                      fill: 'var(--muted-foreground)',
                      opacity: 0.4,
                    }}
                    dominantBaseline="central"
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* Cluster Background Halos */}
        {!mapMode && clusterCenters.map(cluster => (
          <div
            key={`halo-${cluster.id}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: cluster.x - cluster.radius,
              top: cluster.y - cluster.radius,
              width: cluster.radius * 2,
              height: cluster.radius * 2,
              background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
              opacity: 0.25,
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        ))}

        {/* Cluster Labels */}
        {!mapMode && clusterCenters.map(cluster => (
          <div
            key={`label-${cluster.id}`}
            className="absolute pointer-events-none"
            style={{
              left: cluster.x,
              top: cluster.y - cluster.radius - 8,
              transform: 'translateX(-50%)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--muted-foreground)',
              opacity: 0.45,
              whiteSpace: 'nowrap',
              transition: 'all 0.6s ease',
            }}
          >
            {cluster.label}
          </div>
        ))}

        {/* Edges Layer (SVG) */}
        <svg 
          className="absolute pointer-events-none z-[1]"
          style={{ overflow: 'visible', width, height }}
        >
          <defs>
            <style>{`
              @keyframes edgeFlow {
                to { stroke-dashoffset: -60; }
              }
            `}</style>
          </defs>
          {links.map((link) => {
            if (!nodeMap.has(link.source) || !nodeMap.has(link.target)) return null;
            const sPos = getPos(link.source);
            const tPos = getPos(link.target);
            const d = curvedPath(sPos.x, sPos.y, tPos.x, tPos.y);
            const isActive = !!activeNodeId && (link.source === activeNodeId || link.target === activeNodeId);
            const isDimmed = !!activeNodeId && !isActive;

            return (
              <Edge
                key={`${link.source}-${link.target}-${link.type}`}
                d={d}
                linkType={link.type}
                isActive={isActive}
                isDimmed={isDimmed}
                activity={link.activity}
              />
            );
          })}
        </svg>

        {/* Nodes Layer — re-enable pointer events for nodes */}
        <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
          {nodes.map(node => {
            const pos = getPos(node.id);
            const isNeighbor = neighbors.has(node.id);
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isDimmed = !!activeNodeId && !isSelected && !isHovered && !isNeighbor;

            return (
              <NodeItem
                key={node.id}
                node={node}
                posX={pos.x}
                posY={pos.y}
                isSelected={isSelected}
                isHovered={isHovered}
                isNeighbor={isNeighbor}
                isDimmed={isDimmed}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick(node);
                }}
                onHover={(hover) => setHoveredNodeId(hover ? node.id : null)}
                onDrag={(dx, dy) => handleDrag(node.id, dx, dy)}
              />
            );
          })}
        </div>
      </div>
      {/* ============ END TRANSFORM LAYER ============ */}

      {/* ============ FIXED UI OVERLAYS (outside transform) ============ */}

      {/* Map Mode Notice */}
      {mapMode && (
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full pointer-events-none z-30"
          style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--elevation-sm)',
            fontFamily: "'Inter', sans-serif",
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
            opacity: 0.9,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Globe style={{ width: 14, height: 14 }} />
          <span>Geographic view — Netherlands</span>
        </div>
      )}

      {/* Zoom Controls */}
      <div
        className="absolute bottom-4 left-4 flex flex-col items-center gap-1 z-30"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--elevation-sm)',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            color: 'var(--foreground)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          title="Zoom in"
        >
          <ZoomIn style={{ width: 16, height: 16 }} />
        </button>
        <div
          style={{
            width: '100%',
            height: 1,
            background: 'var(--border)',
          }}
        />
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px',
            fontWeight: 500,
            color: 'var(--muted-foreground)',
            padding: '2px 0',
            userSelect: 'none',
          }}
        >
          {zoomPercent}%
        </div>
        <div
          style={{
            width: '100%',
            height: 1,
            background: 'var(--border)',
          }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            color: 'var(--foreground)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          title="Zoom out"
        >
          <ZoomOut style={{ width: 16, height: 16 }} />
        </button>
        <div
          style={{
            width: '100%',
            height: 1,
            background: 'var(--border)',
          }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); handleFitToScreen(); }}
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            color: 'var(--foreground)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          title="Fit to screen"
        >
          <Maximize2 style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Stats Badge */}
      <div 
        className="absolute bottom-4 right-4 flex items-center gap-3 px-3 py-1.5 rounded-full pointer-events-none z-20"
        style={{
          background: 'var(--background)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--elevation-sm)',
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          color: 'var(--muted-foreground)',
          opacity: 0.7,
        }}
      >
        <span>{nodes.length} nodes</span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>{links.length} edges</span>
      </div>
    </div>
  );
}