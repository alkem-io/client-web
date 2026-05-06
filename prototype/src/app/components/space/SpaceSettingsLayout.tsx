import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Users,
  Layers,
  BookOpen,
  GripVertical,
  Pencil,
  RotateCcw,
  Save,
  Check,
  Loader2,
  Undo2,
  MessageSquare,
  Calendar,
  FileText,
  Image as ImageIcon,
  Video,
  Map,
  Globe,
  Smile,
  Star,
  Heart,
  Zap,
  Activity,
  Grid,
  List,
  Layout as LayoutIcon,
  Search,
  Settings,
  Bell,
  Mail,
  Briefcase,
  ChevronDown,
  MoreHorizontal,
  ArrowRight,
  Eye,
  XCircle,
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
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = "home" | "community" | "subspaces" | "knowledge";

interface TabItem {
  id: TabId;
  label: string;
  defaultLabel: string;
  icon: React.ElementType;
  description: string;
  defaultIndex: number;
}

interface PostEntry {
  id: string;
  title: string;
  responses?: number;
}

type TabPosts = Record<TabId, PostEntry[]>;

// ─── Constants ────────────────────────────────────────────────────────────────
const AVAILABLE_ICONS = [
  { icon: Home, label: "Home" },
  { icon: Users, label: "Users" },
  { icon: Layers, label: "Layers" },
  { icon: BookOpen, label: "Book" },
  { icon: MessageSquare, label: "Chat" },
  { icon: Calendar, label: "Calendar" },
  { icon: FileText, label: "Document" },
  { icon: ImageIcon, label: "Image" },
  { icon: Video, label: "Video" },
  { icon: Map, label: "Map" },
  { icon: Globe, label: "Globe" },
  { icon: Smile, label: "Smile" },
  { icon: Star, label: "Star" },
  { icon: Heart, label: "Heart" },
  { icon: Zap, label: "Zap" },
  { icon: Activity, label: "Activity" },
  { icon: Grid, label: "Grid" },
  { icon: List, label: "List" },
  { icon: LayoutIcon, label: "Layout" },
  { icon: Search, label: "Search" },
  { icon: Settings, label: "Settings" },
  { icon: Bell, label: "Bell" },
  { icon: Mail, label: "Mail" },
  { icon: Briefcase, label: "Briefcase" },
];

const DEFAULT_TABS: TabItem[] = [
  {
    id: "home",
    label: "Home",
    defaultLabel: "Home",
    icon: Home,
    description:
      "The main landing page for your space, showcasing highlights and pinned content.",
    defaultIndex: 0,
  },
  {
    id: "community",
    label: "Community",
    defaultLabel: "Community",
    icon: Users,
    description: "Member directory and profiles associated with this space.",
    defaultIndex: 1,
  },
  {
    id: "subspaces",
    label: "Subspaces",
    defaultLabel: "Subspaces",
    icon: Layers,
    description:
      "Child spaces and projects organized under this parent space.",
    defaultIndex: 2,
  },
  {
    id: "knowledge",
    label: "Knowledge",
    defaultLabel: "Knowledge",
    icon: BookOpen,
    description: "Wiki, documentation, and shared resources for members.",
    defaultIndex: 3,
  },
];

const DEFAULT_POSTS: TabPosts = {
  home: [
    { id: "p-h1", title: "Welcome to the Sandbox", responses: 1 },
    { id: "p-h2", title: "Backlog of Insanity", responses: 4 },
    { id: "p-h3", title: "Project Kickoff Notes" },
  ],
  community: [
    { id: "p-c1", title: "Softmann Radio #1" },
    { id: "p-c2", title: "Supreme Funk Playlist" },
    { id: "p-c3", title: "Cosmic Bangherz" },
  ],
  subspaces: [],
  knowledge: [
    { id: "p-k1", title: "Design Research Knowledge", responses: 3 },
  ],
};

// ─── DnD Item Types ───────────────────────────────────────────────────────────
const POST_CARD = "POST_CARD";
const TAB_COLUMN = "TAB_COLUMN";

interface PostDragItem {
  id: string;
  index: number;
  sourceTabId: TabId;
}

interface ColumnDragItem {
  id: string;
  index: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Post Card (draggable within & between columns)
// ═══════════════════════════════════════════════════════════════════════════════

interface PostCardProps {
  post: PostEntry;
  index: number;
  tabId: TabId;
  allTabs: TabItem[];
  movePostInColumn: (tabId: TabId, dragIdx: number, hoverIdx: number) => void;
  movePostBetweenColumns: (
    sourceTabId: TabId,
    dragIdx: number,
    targetTabId: TabId,
    targetIdx: number
  ) => void;
  onRemove: (postId: string, tabId: TabId) => void;
  onMoveToTab: (postId: string, fromTab: TabId, toTab: TabId) => void;
}

const PostCard = ({
  post,
  index,
  tabId,
  allTabs,
  movePostInColumn,
  movePostBetweenColumns,
  onRemove,
  onMoveToTab,
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

      if (item.sourceTabId === tabId && dragIndex === hoverIndex) return;

      const rect = ref.current.getBoundingClientRect();
      const midY = (rect.bottom - rect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverY = clientOffset.y - rect.top;

      // Same column — simple reorder
      if (item.sourceTabId === tabId) {
        if (dragIndex < hoverIndex && hoverY < midY) return;
        if (dragIndex > hoverIndex && hoverY > midY) return;
        movePostInColumn(tabId, dragIndex, hoverIndex);
        item.index = hoverIndex;
        return;
      }

      // Cross-column — insert at hoverIndex position
      movePostBetweenColumns(item.sourceTabId, dragIndex, tabId, hoverIndex);
      item.sourceTabId = tabId;
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: POST_CARD,
    item: (): PostDragItem => ({ id: post.id, index, sourceTabId: tabId }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(drop(ref));

  const otherTabs = allTabs.filter((t) => t.id !== tabId);

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
              {otherTabs.map((t) => {
                const TIcon = t.icon;
                return (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => onMoveToTab(post.id, tabId, t.id)}
                  >
                    <TIcon className="w-3.5 h-3.5 mr-2" />
                    {t.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <Eye className="w-4 h-4 mr-2" />
            View Post
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onRemove(post.id, tabId)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Remove from Tab
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Kanban Column (collapsible, drop target)
// ═══════════════════════════════════════════════════════════════════════════════

interface KanbanColumnProps {
  tab: TabItem;
  posts: PostEntry[];
  allTabs: TabItem[];
  isOpen: boolean;
  onToggle: () => void;
  onAutoExpand: () => void;
  movePostInColumn: (tabId: TabId, dragIdx: number, hoverIdx: number) => void;
  movePostBetweenColumns: (
    sourceTabId: TabId,
    dragIdx: number,
    targetTabId: TabId,
    targetIdx: number
  ) => void;
  onRemove: (postId: string, tabId: TabId) => void;
  onMoveToTab: (postId: string, fromTab: TabId, toTab: TabId) => void;
  onRename: (id: TabId, newName: string) => void;
  onDescriptionChange: (id: TabId, newDescription: string) => void;
  onIconChange: (id: TabId, newIcon: React.ElementType) => void;
  isEditing: boolean;
  setEditingId: (id: TabId | null) => void;
}

const KanbanColumn = ({
  tab,
  posts,
  allTabs,
  isOpen,
  onToggle,
  onAutoExpand,
  movePostInColumn,
  movePostBetweenColumns,
  onRemove,
  onMoveToTab,
  onRename,
  onDescriptionChange,
  onIconChange,
  isEditing,
  setEditingId,
}: KanbanColumnProps) => {
  const autoExpandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const descInputRef = useRef<HTMLInputElement>(null);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const Icon = tab.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        iconPickerRef.current &&
        !iconPickerRef.current.contains(event.target as Node)
      ) {
        setShowIconPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      if (item.sourceTabId !== tab.id && posts.length === 0) {
        movePostBetweenColumns(item.sourceTabId, item.index, tab.id, 0);
        item.sourceTabId = tab.id;
        item.index = 0;
      }
    },
    drop(item) {
      if (item.sourceTabId !== tab.id) {
        movePostBetweenColumns(
          item.sourceTabId,
          item.index,
          tab.id,
          posts.length
        );
        item.sourceTabId = tab.id;
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
          isOverColumn &&
            canDropHere &&
            "ring-2 ring-primary/30 ring-inset"
        )}
      >
        <div className="px-3 py-3 bg-muted/30 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIconPicker(!showIconPicker);
                }}
                className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-colors"
                title="Change Icon"
              >
                <Icon className="w-4 h-4" />
              </button>
              {showIconPicker && (
                <div
                  ref={iconPickerRef}
                  className="absolute left-0 top-9 z-50 w-64 bg-popover text-popover-foreground rounded-lg border border-border shadow-md p-2 grid grid-cols-6 gap-1"
                >
                  {AVAILABLE_ICONS.map((item, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        onIconChange(tab.id, item.icon);
                        setShowIconPicker(false);
                      }}
                      className={cn(
                        "p-1.5 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center",
                        tab.icon === item.icon && "bg-accent text-accent-foreground"
                      )}
                      title={item.label}
                    >
                      <item.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex items-center gap-1.5 group/header">
              {isEditing ? (
                <Input
                  ref={inputRef}
                  value={tab.label}
                  onChange={(e) => onRename(tab.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={handleKeyDown}
                  className="h-6 py-0 px-1.5 text-sm font-semibold w-full max-w-[140px]"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="text-sm font-semibold text-foreground truncate cursor-pointer hover:underline decoration-dashed underline-offset-4"
                  onClick={() => setEditingId(tab.id)}
                >
                  {tab.label}
                </span>
              )}
              {!isEditing && (
                <button
                  onClick={() => setEditingId(tab.id)}
                  className="text-muted-foreground/50 hover:text-primary transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>

            <Badge variant="secondary" className="text-xs tabular-nums shrink-0">
              {posts.length}
            </Badge>

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

          {isEditingDescription ? (
            <Input
              ref={descInputRef}
              value={tab.description}
              onChange={(e) => onDescriptionChange(tab.id, e.target.value)}
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
                {tab.description}
              </p>
              <button
                onClick={() => {
                  setIsEditingDescription(true);
                  setTimeout(() => descInputRef.current?.focus(), 0);
                }}
                className="text-muted-foreground/50 hover:text-primary transition-colors mt-0.5 shrink-0"
              >
                <Pencil className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        <CollapsibleContent>
          <div
            ref={(node) => {
              dropRef(node);
            }}
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
                  <PostCard
                    key={post.id}
                    post={post}
                    index={idx}
                    tabId={tab.id}
                    allTabs={allTabs}
                    movePostInColumn={movePostInColumn}
                    movePostBetweenColumns={movePostBetweenColumns}
                    onRemove={onRemove}
                    onMoveToTab={onMoveToTab}
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
// SECTION 2b — Draggable Column Wrapper (for reordering kanban columns / tabs)
// ═══════════════════════════════════════════════════════════════════════════════

interface DraggableColumnWrapperProps {
  tabId: TabId;
  index: number;
  moveTab: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

const DraggableColumnWrapper = ({
  tabId,
  index,
  moveTab,
  children,
}: DraggableColumnWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    ColumnDragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: TAB_COLUMN,
    collect: (monitor) => ({ handlerId: monitor.getHandlerId() }),
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const rect = ref.current.getBoundingClientRect();
      // Use horizontal midpoint for grid layout
      const midX = (rect.right - rect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverX = clientOffset.x - rect.left;

      if (dragIndex < hoverIndex && hoverX < midX) return;
      if (dragIndex > hoverIndex && hoverX > midX) return;

      moveTab(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: TAB_COLUMN,
    item: (): ColumnDragItem => ({ id: tabId, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  // Entire wrapper is drop target + preview; drag initiated from the whole column
  drop(ref);
  preview(ref);
  drag(ref);

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={cn(
        "transition-opacity",
        isDragging && "opacity-40"
      )}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — Main Layout Component
// ═══════════════════════════════════════════════════════════════════════════════

export function SpaceSettingsLayout() {
  const [tabs, setTabs] = useState<TabItem[]>(DEFAULT_TABS);
  const [editingId, setEditingId] = useState<TabId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [tabPosts, setTabPosts] = useState<TabPosts>(DEFAULT_POSTS);
  const [savedTabs, setSavedTabs] = useState<TabItem[]>(DEFAULT_TABS);
  const [savedTabPosts, setSavedTabPosts] = useState<TabPosts>(DEFAULT_POSTS);
  const [expandedCols, setExpandedCols] = useState<Record<TabId, boolean>>({
    home: true,
    community: true,
    subspaces: false, // empty → collapsed by default
    knowledge: true,
  });

  // ─── Change detection (tabs + posts) ───────────────────────────────────────
  const hasChanges = useMemo(() => {
    const tabsChanged = tabs.some((tab, i) => {
      const d = savedTabs[i];
      if (!d) return true;
      return tab.id !== d.id || tab.label !== d.label || tab.icon !== d.icon || tab.description !== d.description;
    });
    if (tabsChanged) return true;
    if (tabs.length !== savedTabs.length) return true;

    for (const tabId of Object.keys(savedTabPosts) as TabId[]) {
      const cur = tabPosts[tabId];
      const orig = savedTabPosts[tabId];
      if (!cur || !orig) return true;
      if (cur.length !== orig.length) return true;
      if (cur.some((p, i) => p.id !== orig[i]?.id)) return true;
    }
    return false;
  }, [tabs, tabPosts, savedTabs, savedTabPosts]);

  // ─── Tab reorder ───────────────────────────────────────────────────────────
  const moveTab = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setTabs((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(hoverIndex, 0, moved);
        return next;
      });
    },
    []
  );

  // ─── Post reorder within a column ──────────────────────────────────────────
  const movePostInColumn = useCallback(
    (tabId: TabId, dragIdx: number, hoverIdx: number) => {
      setTabPosts((prev) => {
        const list = [...prev[tabId]];
        const [moved] = list.splice(dragIdx, 1);
        list.splice(hoverIdx, 0, moved);
        return { ...prev, [tabId]: list };
      });
    },
    []
  );

  // ─── Cross-column move ─────────────────────────────────────────────────────
  const movePostBetweenColumns = useCallback(
    (
      sourceTabId: TabId,
      dragIdx: number,
      targetTabId: TabId,
      targetIdx: number
    ) => {
      setTabPosts((prev) => {
        const source = [...prev[sourceTabId]];
        const target = sourceTabId === targetTabId ? source : [...prev[targetTabId]];
        const [moved] = source.splice(dragIdx, 1);
        if (sourceTabId === targetTabId) {
          source.splice(targetIdx, 0, moved);
          return { ...prev, [sourceTabId]: source };
        }
        target.splice(targetIdx, 0, moved);
        return { ...prev, [sourceTabId]: source, [targetTabId]: target };
      });
    },
    []
  );

  // ─── Menu-based move to tab ────────────────────────────────────────────────
  const handleMoveToTab = useCallback(
    (postId: string, fromTab: TabId, toTab: TabId) => {
      setTabPosts((prev) => {
        const source = [...prev[fromTab]];
        const idx = source.findIndex((p) => p.id === postId);
        if (idx === -1) return prev;
        const [moved] = source.splice(idx, 1);
        return {
          ...prev,
          [fromTab]: source,
          [toTab]: [...prev[toTab], moved],
        };
      });
      // Auto-expand target column
      setExpandedCols((prev) => ({ ...prev, [toTab]: true }));
    },
    []
  );

  // ─── Remove from tab ──────────────────────────────────────────────────────
  const handleRemovePost = useCallback(
    (postId: string, tabId: TabId) => {
      setTabPosts((prev) => ({
        ...prev,
        [tabId]: prev[tabId].filter((p) => p.id !== postId),
      }));
    },
    []
  );

  // ─── Tab rename / icon ────────────────────────────────────────────────────
  const handleRename = (id: TabId, newName: string) => {
    if (newName.length > 20) return;
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, label: newName } : tab))
    );
  };

  const handleDescriptionChange = (id: TabId, newDescription: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, description: newDescription } : tab))
    );
  };

  const handleIconChange = (id: TabId, newIcon: React.ElementType) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, icon: newIcon } : tab))
    );
  };

  // ─── Save / Discard ─────────────────────────────────────────────────────────
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedTabs([...tabs]);
      setSavedTabPosts({ ...tabPosts });
      setLastSaved(new Date());
    }, 1000);
  };

  const handleDiscard = () => {
    setTabs([...savedTabs]);
    setTabPosts({ ...savedTabPosts });
    setExpandedCols({
      home: true,
      community: true,
      subspaces: false,
      knowledge: true,
    });
  };

  // ─── Column toggle helpers ────────────────────────────────────────────────
  const toggleColumn = useCallback((tabId: TabId) => {
    setExpandedCols((prev) => ({ ...prev, [tabId]: !prev[tabId] }));
  }, []);

  const autoExpandColumn = useCallback((tabId: TabId) => {
    setExpandedCols((prev) => ({ ...prev, [tabId]: true }));
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full">
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Layout</h2>
            <p className="text-muted-foreground mt-2">
              Customize your Space's navigation tabs. Rename, reorder, and manage post assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
            {tabs.map((tab) => (
              <DraggableColumnWrapper
                key={tab.id}
                tabId={tab.id}
                index={tabs.findIndex((t) => t.id === tab.id)}
                moveTab={moveTab}
              >
                <KanbanColumn
                  tab={tab}
                  posts={tabPosts[tab.id] || []}
                  allTabs={tabs}
                  isOpen={!!expandedCols[tab.id]}
                  onToggle={() => toggleColumn(tab.id)}
                  onAutoExpand={() => autoExpandColumn(tab.id)}
                  movePostInColumn={movePostInColumn}
                  movePostBetweenColumns={movePostBetweenColumns}
                  onRemove={handleRemovePost}
                  onMoveToTab={handleMoveToTab}
                  onRename={handleRename}
                  onDescriptionChange={handleDescriptionChange}
                  onIconChange={handleIconChange}
                  isEditing={editingId === tab.id}
                  setEditingId={setEditingId}
                />
              </DraggableColumnWrapper>
            ))}
          </div>

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
    </DndProvider>
  );
}