import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "motion/react";
import {
  GripVertical,
  Pencil,
  RotateCcw,
  Save,
  Check,
  Loader2,
  Undo2,
  Plus,
  Trash2,

  ChevronDown,
  ChevronsRight,
  MoreHorizontal,
  ArrowRight,
  Eye,
  XCircle,
  Download,
  Upload,
  FileText,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/app/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PhaseItem {
  id: string;
  label: string;
  description: string;
  linkedToNext: boolean; // arrow → to the next phase
}

interface PostEntry {
  id: string;
  title: string;
  responses?: number;
}

type PhasePosts = Record<string, PostEntry[]>;

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_PHASES: PhaseItem[] = [
  {
    id: "explore",
    label: "Explore",
    description: "Diverge — gather ideas, research, and inspiration.",
    linkedToNext: true,
  },
  {
    id: "define",
    label: "Define",
    description: "Converge — synthesise insights into a clear problem statement.",
    linkedToNext: true,
  },
  {
    id: "ideate",
    label: "Ideate",
    description: "Diverge — brainstorm and generate creative solutions.",
    linkedToNext: true,
  },
  {
    id: "prototype",
    label: "Prototype",
    description: "Converge — build and test low-fidelity prototypes.",
    linkedToNext: false,
  },
];

const DEFAULT_POSTS: PhasePosts = {
  explore: [
    { id: "p-e1", title: "Research: Stakeholder Interviews", responses: 3 },
    { id: "p-e2", title: "Desk Research Summary" },
  ],
  define: [
    { id: "p-d1", title: "Problem Statement v1", responses: 5 },
  ],
  ideate: [
    { id: "p-i1", title: "Brainstorm: Solar Integration" },
    { id: "p-i2", title: "Concept Map: Grid Modernisation", responses: 2 },
  ],
  prototype: [],
};

// Innovation flow templates
interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  phases: Omit<PhaseItem, "id">[];
}

const FLOW_TEMPLATES: FlowTemplate[] = [
  {
    id: "double-diamond",
    name: "Double Diamond",
    description: "Discover → Define → Develop → Deliver",
    phases: [
      { label: "Discover", description: "Research and explore the problem space.", linkedToNext: true },
      { label: "Define", description: "Narrow down to a clear problem definition.", linkedToNext: true },
      { label: "Develop", description: "Co-create and iterate on possible solutions.", linkedToNext: true },
      { label: "Deliver", description: "Finalise and implement the solution.", linkedToNext: false },
    ],
  },
  {
    id: "design-thinking",
    name: "Design Thinking (Stanford d.school)",
    description: "Empathize → Define → Ideate → Prototype → Test",
    phases: [
      { label: "Empathize", description: "Understand users through observation and engagement.", linkedToNext: true },
      { label: "Define", description: "Frame the core problem to solve.", linkedToNext: true },
      { label: "Ideate", description: "Brainstorm a broad set of solutions.", linkedToNext: true },
      { label: "Prototype", description: "Build quick, low-cost prototypes.", linkedToNext: true },
      { label: "Test", description: "Gather feedback and refine.", linkedToNext: false },
    ],
  },
  {
    id: "lean-startup",
    name: "Lean Startup",
    description: "Build → Measure → Learn",
    phases: [
      { label: "Build", description: "Create a minimum viable product (MVP).", linkedToNext: true },
      { label: "Measure", description: "Collect data on how users interact.", linkedToNext: true },
      { label: "Learn", description: "Analyse results and decide on next steps.", linkedToNext: false },
    ],
  },
  {
    id: "challenge-driven",
    name: "Challenge-Driven Innovation",
    description: "Challenge → Knowledge → Propose → Pilot → Scale",
    phases: [
      { label: "Challenge", description: "Frame the challenge statement.", linkedToNext: true },
      { label: "Knowledge", description: "Gather relevant knowledge and research.", linkedToNext: true },
      { label: "Propose", description: "Generate and evaluate proposals.", linkedToNext: true },
      { label: "Pilot", description: "Run small-scale pilots.", linkedToNext: true },
      { label: "Scale", description: "Expand successful pilots.", linkedToNext: false },
    ],
  },
];

// ─── DnD Item Types ───────────────────────────────────────────────────────────
const POST_CARD = "SUBSPACE_POST_CARD";
const PHASE_COLUMN = "PHASE_COLUMN";

interface PostDragItem {
  id: string;
  index: number;
  sourcePhaseId: string;
}

interface ColumnDragItem {
  id: string;
  index: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Post Card (draggable)
// ═══════════════════════════════════════════════════════════════════════════════

interface PostCardProps {
  post: PostEntry;
  index: number;
  phaseId: string;
  allPhases: PhaseItem[];
  movePostInPhase: (phaseId: string, dragIdx: number, hoverIdx: number) => void;
  movePostBetweenPhases: (
    sourcePhaseId: string,
    dragIdx: number,
    targetPhaseId: string,
    targetIdx: number
  ) => void;
  onRemove: (postId: string, phaseId: string) => void;
  onMoveToPhase: (postId: string, fromPhase: string, toPhase: string) => void;
}

const PhasePostCard = ({
  post,
  index,
  phaseId,
  allPhases,
  movePostInPhase,
  movePostBetweenPhases,
  onRemove,
  onMoveToPhase,
}: PostCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    PostDragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: POST_CARD,
    collect: (monitor) => ({ handlerId: monitor.getHandlerId() }),
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (item.sourcePhaseId === phaseId && dragIndex === hoverIndex) return;
      const rect = ref.current.getBoundingClientRect();
      const midY = (rect.bottom - rect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverY = clientOffset.y - rect.top;
      if (item.sourcePhaseId === phaseId) {
        if (dragIndex < hoverIndex && hoverY < midY) return;
        if (dragIndex > hoverIndex && hoverY > midY) return;
        movePostInPhase(phaseId, dragIndex, hoverIndex);
        item.index = hoverIndex;
        return;
      }
      movePostBetweenPhases(item.sourcePhaseId, dragIndex, phaseId, hoverIndex);
      item.sourcePhaseId = phaseId;
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: POST_CARD,
    item: (): PostDragItem => ({ id: post.id, index, sourcePhaseId: phaseId }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(drop(ref));

  const otherPhases = allPhases.filter((p) => p.id !== phaseId);

  return (
    <motion.div
      ref={ref}
      data-handler-id={handlerId}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "flex items-center gap-2 px-2.5 py-2 bg-background border border-border rounded-lg",
        "cursor-grab active:cursor-grabbing group/post",
        "hover:border-primary/30 transition-all",
        isDragging && "opacity-30 border-dashed"
      )}
    >
      <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 group-hover/post:text-muted-foreground/60 shrink-0" />
      <span className="flex-1 min-w-0 text-xs font-medium leading-snug line-clamp-2 text-foreground">
        {post.title}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 shrink-0 opacity-0 group-hover/post:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowRight className="w-4 h-4 mr-2" />
              Move to
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {otherPhases.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => onMoveToPhase(post.id, phaseId, p.id)}
                >
                  {p.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Eye className="w-4 h-4 mr-2" />
            View Post
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onRemove(post.id, phaseId)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Remove from Phase
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Phase Column (collapsible, drop target, editable)
// ═══════════════════════════════════════════════════════════════════════════════

interface PhaseColumnProps {
  phase: PhaseItem;
  phaseIndex: number;
  posts: PostEntry[];
  allPhases: PhaseItem[];
  isOpen: boolean;
  onToggle: () => void;
  onAutoExpand: () => void;
  movePostInPhase: (phaseId: string, dragIdx: number, hoverIdx: number) => void;
  movePostBetweenPhases: (
    sourcePhaseId: string,
    dragIdx: number,
    targetPhaseId: string,
    targetIdx: number
  ) => void;
  onRemove: (postId: string, phaseId: string) => void;
  onMoveToPhase: (postId: string, fromPhase: string, toPhase: string) => void;
  onRename: (id: string, newName: string) => void;
  onDescriptionChange: (id: string, newDescription: string) => void;
  onDeletePhase: (id: string) => void;
  isEditing: boolean;
  setEditingId: (id: string | null) => void;
  isLast: boolean;
}

const PhaseColumn = ({
  phase,
  phaseIndex,
  posts,
  allPhases,
  isOpen,
  onToggle,
  onAutoExpand,
  movePostInPhase,
  movePostBetweenPhases,
  onRemove,
  onMoveToPhase,
  onRename,
  onDescriptionChange,
  onDeletePhase,
  isEditing,
  setEditingId,
  isLast,
}: PhaseColumnProps) => {
  const autoExpandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const descInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") setEditingId(null);
  };

  const [{ isOverColumn, canDropHere }, dropRef] = useDrop<
    PostDragItem,
    void,
    { isOverColumn: boolean; canDropHere: boolean }
  >({
    accept: POST_CARD,
    collect: (monitor) => ({
      isOverColumn: monitor.isOver({ shallow: true }),
      canDropHere: monitor.canDrop(),
    }),
    hover(item) {
      if (!isOpen && autoExpandTimer.current === null) {
        autoExpandTimer.current = setTimeout(() => {
          onAutoExpand();
          autoExpandTimer.current = null;
        }, 500);
      }
      if (item.sourcePhaseId !== phase.id && posts.length === 0) {
        movePostBetweenPhases(item.sourcePhaseId, item.index, phase.id, 0);
        item.sourcePhaseId = phase.id;
        item.index = 0;
      }
    },
    drop(item) {
      if (item.sourcePhaseId !== phase.id) {
        movePostBetweenPhases(
          item.sourcePhaseId,
          item.index,
          phase.id,
          posts.length
        );
        item.sourcePhaseId = phase.id;
        item.index = posts.length;
      }
    },
  });

  useEffect(() => {
    if (!isOverColumn && autoExpandTimer.current) {
      clearTimeout(autoExpandTimer.current);
      autoExpandTimer.current = null;
    }
  }, [isOverColumn]);

  useEffect(() => {
    return () => {
      if (autoExpandTimer.current) clearTimeout(autoExpandTimer.current);
    };
  }, []);

  return (
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <div
          className={cn(
            "border border-border rounded-xl bg-card overflow-hidden transition-all",
            isOverColumn && canDropHere && "ring-2 ring-primary/30 ring-inset"
          )}
        >
          <div className="px-3 py-3 bg-muted/30 space-y-2">
            <div className="flex items-center gap-2">
              {/* Phase number badge */}
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {phaseIndex + 1}
              </div>

              <div className="flex-1 min-w-0 flex items-center gap-1.5 group/header">
                {isEditing ? (
                  <Input
                    ref={inputRef}
                    value={phase.label}
                    onChange={(e) => onRename(phase.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={handleKeyDown}
                    className="h-6 py-0 px-1.5 text-sm font-semibold w-full max-w-[140px]"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="text-sm font-semibold text-foreground truncate cursor-pointer hover:underline decoration-dashed underline-offset-4"
                    onClick={() => setEditingId(phase.id)}
                  >
                    {phase.label}
                  </span>
                )}
                {!isEditing && (
                  <button
                    onClick={() => setEditingId(phase.id)}
                    className="opacity-0 group-hover/header:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>

              <Badge variant="secondary" className="text-xs tabular-nums shrink-0">
                {posts.length}
              </Badge>

              {/* Phase actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-0.5 rounded hover:bg-muted/50 transition-colors">
                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDeletePhase(phase.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Phase
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CollapsibleTrigger asChild>
                <button className="p-0.5 rounded hover:bg-muted/50 transition-colors">
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                      !isOpen && "-rotate-90"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
            </div>

            {/* Description — editable */}
            {isEditingDescription ? (
              <Input
                ref={descInputRef}
                value={phase.description}
                onChange={(e) => onDescriptionChange(phase.id, e.target.value)}
                onBlur={() => setIsEditingDescription(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") setIsEditingDescription(false);
                }}
                className="h-6 py-0 px-1.5 text-xs w-full"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="group/desc flex items-start gap-1">
                <p
                  className="text-xs text-muted-foreground leading-relaxed line-clamp-2 cursor-pointer hover:underline decoration-dashed underline-offset-4"
                  onClick={() => {
                    setIsEditingDescription(true);
                    setTimeout(() => descInputRef.current?.focus(), 0);
                  }}
                >
                  {phase.description}
                </p>
                <button
                  onClick={() => {
                    setIsEditingDescription(true);
                    setTimeout(() => descInputRef.current?.focus(), 0);
                  }}
                  className="opacity-0 group-hover/desc:opacity-100 transition-opacity text-muted-foreground hover:text-primary mt-0.5 shrink-0"
                >
                  <Pencil className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>

          <CollapsibleContent>
            <div
              ref={(node) => { dropRef(node); }}
              className={cn(
                "p-1.5 space-y-1.5 min-h-[60px] transition-colors",
                isOverColumn && canDropHere && "bg-primary/5"
              )}
            >
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <span className="text-xs text-muted-foreground/50">
                    No posts assigned
                  </span>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {posts.map((post, idx) => (
                    <PhasePostCard
                      key={post.id}
                      post={post}
                      index={idx}
                      phaseId={phase.id}
                      allPhases={allPhases}
                      movePostInPhase={movePostInPhase}
                      movePostBetweenPhases={movePostBetweenPhases}
                      onRemove={onRemove}
                      onMoveToPhase={onMoveToPhase}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Draggable Phase Wrapper (for reordering columns)
// ═══════════════════════════════════════════════════════════════════════════════

interface DraggablePhaseWrapperProps {
  phaseId: string;
  index: number;
  movePhase: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

const DraggablePhaseWrapper = ({
  phaseId,
  index,
  movePhase,
  children,
}: DraggablePhaseWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    ColumnDragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: PHASE_COLUMN,
    collect: (monitor) => ({ handlerId: monitor.getHandlerId() }),
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const rect = ref.current.getBoundingClientRect();
      const midX = (rect.right - rect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverX = clientOffset.x - rect.left;
      if (dragIndex < hoverIndex && hoverX < midX) return;
      if (dragIndex > hoverIndex && hoverX > midX) return;
      movePhase(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: PHASE_COLUMN,
    item: (): ColumnDragItem => ({ id: phaseId, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drop(ref);
  preview(ref);
  drag(ref);

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={cn("transition-opacity min-w-[220px]", isDragging && "opacity-40")}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main Layout Component
// ═══════════════════════════════════════════════════════════════════════════════

export function SubspaceSettingsLayout() {
  const [phases, setPhases] = useState<PhaseItem[]>(DEFAULT_PHASES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [phasePosts, setPhasePosts] = useState<PhasePosts>(DEFAULT_POSTS);
  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    DEFAULT_PHASES.forEach((p) => {
      initial[p.id] = (DEFAULT_POSTS[p.id]?.length ?? 0) > 0;
    });
    return initial;
  });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // ─── Change detection ──────────────────────────────────────────────────────
  const hasChanges = useMemo(() => {
    if (phases.length !== DEFAULT_PHASES.length) return true;
    const phasesChanged = phases.some((phase, i) => {
      const d = DEFAULT_PHASES[i];
      return (
        phase.id !== d.id ||
        phase.label !== d.label ||
        phase.description !== d.description ||
        phase.linkedToNext !== d.linkedToNext
      );
    });
    if (phasesChanged) return true;

    for (const phaseId of Object.keys(DEFAULT_POSTS)) {
      const cur = phasePosts[phaseId] ?? [];
      const orig = DEFAULT_POSTS[phaseId] ?? [];
      if (cur.length !== orig.length) return true;
      if (cur.some((p, i) => p.id !== orig[i]?.id)) return true;
    }
    return false;
  }, [phases, phasePosts]);

  // ─── Phase reorder ─────────────────────────────────────────────────────────
  const movePhase = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setPhases((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(hoverIndex, 0, moved);
        return next;
      });
    },
    []
  );

  // ─── Post reorder within a phase ──────────────────────────────────────────
  const movePostInPhase = useCallback(
    (phaseId: string, dragIdx: number, hoverIdx: number) => {
      setPhasePosts((prev) => {
        const list = [...(prev[phaseId] || [])];
        const [moved] = list.splice(dragIdx, 1);
        list.splice(hoverIdx, 0, moved);
        return { ...prev, [phaseId]: list };
      });
    },
    []
  );

  // ─── Cross-phase move ─────────────────────────────────────────────────────
  const movePostBetweenPhases = useCallback(
    (sourceId: string, dragIdx: number, targetId: string, targetIdx: number) => {
      setPhasePosts((prev) => {
        const source = [...(prev[sourceId] || [])];
        const target = sourceId === targetId ? source : [...(prev[targetId] || [])];
        const [moved] = source.splice(dragIdx, 1);
        if (sourceId === targetId) {
          source.splice(targetIdx, 0, moved);
          return { ...prev, [sourceId]: source };
        }
        target.splice(targetIdx, 0, moved);
        return { ...prev, [sourceId]: source, [targetId]: target };
      });
    },
    []
  );

  // ─── Menu-based move ──────────────────────────────────────────────────────
  const handleMoveToPhase = useCallback(
    (postId: string, fromPhase: string, toPhase: string) => {
      setPhasePosts((prev) => {
        const source = [...(prev[fromPhase] || [])];
        const idx = source.findIndex((p) => p.id === postId);
        if (idx === -1) return prev;
        const [moved] = source.splice(idx, 1);
        return {
          ...prev,
          [fromPhase]: source,
          [toPhase]: [...(prev[toPhase] || []), moved],
        };
      });
      setExpandedCols((prev) => ({ ...prev, [toPhase]: true }));
    },
    []
  );

  // ─── Remove post ──────────────────────────────────────────────────────────
  const handleRemovePost = useCallback(
    (postId: string, phaseId: string) => {
      setPhasePosts((prev) => ({
        ...prev,
        [phaseId]: (prev[phaseId] || []).filter((p) => p.id !== postId),
      }));
    },
    []
  );

  // ─── Phase operations ─────────────────────────────────────────────────────
  const handleRename = (id: string, newName: string) => {
    if (newName.length > 30) return;
    setPhases((prev) => prev.map((p) => (p.id === id ? { ...p, label: newName } : p)));
  };

  const handleDescriptionChange = (id: string, newDescription: string) => {
    setPhases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, description: newDescription } : p))
    );
  };



  const handleDeletePhase = (id: string) => {
    if (phases.length <= 1) return;
    setPhases((prev) => prev.filter((p) => p.id !== id));
    setPhasePosts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleAddPhase = () => {
    const newId = `phase-${Date.now()}`;
    // Set the previous last phase to link to this one
    setPhases((prev) => {
      const updated = prev.map((p, i) =>
        i === prev.length - 1 ? { ...p, linkedToNext: true } : p
      );
      return [
        ...updated,
        {
          id: newId,
          label: "New Phase",
          description: "Describe this phase's purpose.",
          linkedToNext: false,
        },
      ];
    });
    setPhasePosts((prev) => ({ ...prev, [newId]: [] }));
    setExpandedCols((prev) => ({ ...prev, [newId]: true }));
    setEditingId(newId);
  };

  const handleLoadTemplate = (template: FlowTemplate) => {
    const newPhases: PhaseItem[] = template.phases.map((p, i) => ({
      ...p,
      id: `${template.id}-${i}-${Date.now()}`,
    }));
    setPhases(newPhases);
    const newPosts: PhasePosts = {};
    newPhases.forEach((p) => {
      newPosts[p.id] = [];
    });
    setPhasePosts(newPosts);
    const newExpanded: Record<string, boolean> = {};
    newPhases.forEach((p) => {
      newExpanded[p.id] = true;
    });
    setExpandedCols(newExpanded);
    setShowTemplates(false);
  };

  // ─── Save / Discard ─────────────────────────────────────────────────────────
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedPhases([...phases]);
      setSavedPhasePosts({ ...phasePosts });
      setLastSaved(new Date());
    }, 1000);
  };

  const handleDiscard = () => {
    setPhases([...savedPhases]);
    setPhasePosts({ ...savedPhasePosts });
    const newExpanded: Record<string, boolean> = {};
    savedPhases.forEach((p) => {
      newExpanded[p.id] = (savedPhasePosts[p.id]?.length ?? 0) > 0;
    });
    setExpandedCols(newExpanded);
  };

  // ─── Column toggle helpers ────────────────────────────────────────────────
  const toggleColumn = useCallback((phaseId: string) => {
    setExpandedCols((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  }, []);

  const autoExpandColumn = useCallback((phaseId: string) => {
    setExpandedCols((prev) => ({ ...prev, [phaseId]: true }));
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Innovation Flow</h2>
            <p className="text-muted-foreground mt-2">
              Design your subspace's innovation flow. Add, remove, and reorder phases. Drag posts between phases.
            </p>
          </div>

          {/* Flow visualisation bar */}
          <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-2">
            {phases.map((phase, i) => (
              <div key={phase.id} className="flex items-center gap-1.5 shrink-0">
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    "bg-primary/10 text-primary border-primary/20"
                  )}
                >
                  {phase.label}
                </div>
                {i < phases.length - 1 && (
                  <ChevronsRight className="w-4 h-4 text-primary" />
                )}
              </div>
            ))}
          </div>

          {/* Template & Add actions */}
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowTemplates(true)}
            >
              <Download className="w-3.5 h-3.5" />
              Load Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowSaveTemplate(true)}
            >
              <Upload className="w-3.5 h-3.5" />
              Save as Template
            </Button>
            <div className="flex-1" />
            <Button
              size="sm"
              className="gap-2"
              onClick={handleAddPhase}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Phase
            </Button>
          </div>

          {/* Phase columns */}
          <div className="flex items-start gap-3 overflow-x-auto pb-2">
            {phases.map((phase, i) => (
              <DraggablePhaseWrapper
                key={phase.id}
                phaseId={phase.id}
                index={i}
                movePhase={movePhase}
              >
                <PhaseColumn
                  phase={phase}
                  phaseIndex={i}
                  posts={phasePosts[phase.id] || []}
                  allPhases={phases}
                  isOpen={!!expandedCols[phase.id]}
                  onToggle={() => toggleColumn(phase.id)}
                  onAutoExpand={() => autoExpandColumn(phase.id)}
                  movePostInPhase={movePostInPhase}
                  movePostBetweenPhases={movePostBetweenPhases}
                  onRemove={handleRemovePost}
                  onMoveToPhase={handleMoveToPhase}
                  onRename={handleRename}
                  onDescriptionChange={handleDescriptionChange}
                  onDeletePhase={handleDeletePhase}
                  isEditing={editingId === phase.id}
                  setEditingId={setEditingId}
                  isLast={i === phases.length - 1}
                />
              </DraggablePhaseWrapper>
            ))}
          </div>

          {/* Save / Reset bar */}
          <div className="mt-10 flex items-center justify-end gap-3">
            {lastSaved && (
              <span className="text-sm text-muted-foreground flex items-center gap-1.5 mr-auto">
                <Check className="w-4 h-4 text-success" /> Saved
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              disabled={!hasChanges}
              className="text-muted-foreground hover:text-destructive"
            >
              <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Discard Changes
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Load Template Dialog ── */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Innovation Flow Template</DialogTitle>
            <DialogDescription>
              Choose a template to replace the current flow. Existing post assignments will be cleared.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {FLOW_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleLoadTemplate(template)}
                className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {template.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {template.phases.length} phases
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  {template.phases.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                        {p.label}
                      </span>
                      {i < template.phases.length - 1 && p.linkedToNext && (
                        <ChevronsRight className="w-3 h-3 text-muted-foreground" />
                      )}
                      {i < template.phases.length - 1 && !p.linkedToNext && (
                        <span className="inline-block w-2 h-[1px] bg-border" />
                      )}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Save as Template Dialog ── */}
      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Flow as Template</DialogTitle>
            <DialogDescription>
              Save your current innovation flow for reuse in other subspaces.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground">Template Name</label>
              <Input
                className="mt-1.5"
                placeholder="e.g. My Custom Innovation Flow"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {phases.map((phase, i) => (
                <div key={phase.id} className="flex items-center gap-1 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                    {phase.label}
                  </span>
                  {i < phases.length - 1 && (
                    <span>
                      {phase.linkedToNext ? (
                        <ChevronsRight className="w-3 h-3 text-primary" />
                      ) : (
                        <span className="inline-block w-2 h-[1px] bg-border" />
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSaveTemplate(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!templateName.trim()}
                onClick={() => {
                  // Mock save
                  setShowSaveTemplate(false);
                  setTemplateName("");
                }}
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}
