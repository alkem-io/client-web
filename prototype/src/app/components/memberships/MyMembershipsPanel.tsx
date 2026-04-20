import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Search,
  X,
  Lock,
  Globe,
  Layers,
  SearchX,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Separator } from "@/app/components/ui/separator";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  MOCK_MEMBERSHIPS,
  type MembershipItem,
  type MembershipRole,
} from "./membershipData";

interface MyMembershipsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PrivacyFilter = "All" | "Public" | "Private";

type MembershipGroup = {
  parent: MembershipItem;
  subspaces: MembershipItem[];
};

/** Subtle role colour — used as a dot + muted text colour */
function roleColor(role: MembershipRole) {
  switch (role) {
    case "Admin":
      return "var(--destructive)";
    case "Lead":
      return "var(--primary)";
    case "Member":
      return "var(--muted-foreground)";
  }
}

function initials(item: MembershipItem) {
  return (
    item.initials ||
    item.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  );
}

export function MyMembershipsPanel({
  open,
  onOpenChange,
}: MyMembershipsPanelProps) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | MembershipRole>("All");
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>("All");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  // Expand all groups by default when dialog opens
  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 350);

    const allIds: Record<string, boolean> = {};
    MOCK_MEMBERSHIPS.filter((i) => i.type === "space").forEach((s) => {
      allIds[s.id] = true;
    });
    setExpandedGroups(allIds);

    return () => clearTimeout(t);
  }, [open]);

  const groups = useMemo<MembershipGroup[]>(() => {
    const spaces = MOCK_MEMBERSHIPS.filter((i) => i.type === "space");
    const subspaces = MOCK_MEMBERSHIPS.filter((i) => i.type === "subspace");

    return spaces.map((parent) => ({
      parent,
      subspaces: subspaces
        .filter((s) => s.parentId === parent.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, []);

  const matchesFilters = (item: MembershipItem, parentName?: string) => {
    if (roleFilter !== "All" && item.role !== roleFilter) return false;
    if (privacyFilter === "Public" && item.isPrivate) return false;
    if (privacyFilter === "Private" && !item.isPrivate) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const haystack = [item.name, item.tagline || "", parentName || ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  };

  const filteredGroups = useMemo(() => {
    return groups
      .map((g) => {
        const filteredSubspaces = g.subspaces.filter((s) =>
          matchesFilters(s, g.parent.name)
        );
        const parentMatches = matchesFilters(g.parent);
        if (!parentMatches && filteredSubspaces.length === 0) return null;
        return { ...g, subspaces: filteredSubspaces };
      })
      .filter((g): g is MembershipGroup => Boolean(g))
      .sort((a, b) => a.parent.name.localeCompare(b.parent.name));
  }, [groups, roleFilter, privacyFilter, search]);

  const spaceCount = filteredGroups.length;
  const hasActiveFilters =
    Boolean(search.trim()) ||
    roleFilter !== "All" ||
    privacyFilter !== "All";
  const hasAnyMemberships = groups.length > 0;

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setPrivacyFilter("All");
  };

  const goToSpace = (slug: string) => {
    navigate(`/space/${slug}`);
    onOpenChange(false);
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  if (!open) return null;

  /* ── Role indicator — small dot + text ───────────────────── */
  const RoleIndicator = ({ role }: { role: MembershipRole }) => (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: roleColor(role) }}
      />
      {role}
    </span>
  );

  /* ── Parent space row ────────────────────────────────────── */
  const renderParentRow = (
    parent: MembershipItem,
    subspaceCount: number
  ) => {
    const isExpanded = Boolean(expandedGroups[parent.id]);

    return (
      <div
        key={parent.id}
        className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
      >
        {/* Expand / collapse */}
        {subspaceCount > 0 ? (
          <button
            type="button"
            onClick={() => toggleGroupExpand(parent.id)}
            className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-150 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Privacy icon — left side */}
        {parent.isPrivate ? (
          <Lock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <Globe className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
        )}

        {/* Banner thumbnail — only image for spaces */}
        <button
          type="button"
          onClick={() => goToSpace(parent.slug)}
          className="shrink-0 w-16 h-10 rounded-md overflow-hidden bg-muted"
        >
          {parent.image ? (
            <img
              src={parent.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, ${parent.color}, color-mix(in srgb, ${parent.color} 40%, black))`,
              }}
            />
          )}
        </button>

        {/* Name / tagline */}
        <button
          type="button"
          onClick={() => goToSpace(parent.slug)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-sm font-medium truncate">{parent.name}</p>
          {parent.tagline && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {parent.tagline}
            </p>
          )}
        </button>

        {/* Metadata — right side */}
        <div className="flex items-center gap-3 shrink-0">
          {subspaceCount > 0 && (
            <Badge variant="outline" className="text-[11px] font-normal px-2 py-0 h-5">
              {subspaceCount} subspace{subspaceCount > 1 ? "s" : ""}
            </Badge>
          )}
          <RoleIndicator role={parent.role} />
        </div>
      </div>
    );
  };

  /* ── Subspace row ────────────────────────────────────────── */
  const renderSubspaceRow = (sub: MembershipItem) => (
    <button
      key={sub.id}
      type="button"
      onClick={() => goToSpace(sub.slug)}
      className="flex items-center gap-3 py-2.5 pr-5 hover:bg-muted/40 transition-colors w-full text-left"
      style={{ paddingLeft: "5rem" }}
    >
      {/* Privacy icon — left side */}
      {sub.isPrivate ? (
        <Lock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      ) : (
        <Globe className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      )}

      {/* Avatar — only image for subspaces */}
      <Avatar className="w-8 h-8 shrink-0 rounded-md">
        <AvatarImage src={sub.image} alt={sub.name} />
        <AvatarFallback
          style={{ backgroundColor: sub.color }}
          className="text-white text-[10px] rounded-md"
        >
          {initials(sub)}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{sub.name}</p>
      </div>

      {/* Role */}
      <RoleIndicator role={sub.role} />
    </button>
  );

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{
          background:
            "color-mix(in srgb, var(--foreground) 50%, transparent)",
          backdropFilter: "blur(2px)",
        }}
        onClick={() => onOpenChange(false)}
        aria-hidden
      />

      {/* Overlay container — 12-col grid, content in col 2–11 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="My Spaces"
        className="fixed inset-0 z-[101] grid grid-cols-12 gap-6 px-6 md:px-8 py-[5vh] max-md:p-0 pointer-events-none"
      >
        <div
          className="col-span-12 lg:col-start-3 lg:col-span-8 max-md:col-start-1 max-md:col-span-12 flex flex-col overflow-hidden pointer-events-auto"
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--elevation-sm)",
          }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">My Spaces</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {spaceCount} space{spaceCount !== 1 ? "s" : ""} you&apos;re
                  part of
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search + filters */}
          <div className="px-6 py-3 border-b border-border flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 pr-9"
                placeholder="Search your spaces..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select
              value={roleFilter}
              onValueChange={(v) =>
                setRoleFilter(v as "All" | MembershipRole)
              }
            >
              <SelectTrigger className="w-[130px] shrink-0">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="All">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={privacyFilter}
              onValueChange={(v) =>
                setPrivacyFilter(v as PrivacyFilter)
              }
            >
              <SelectTrigger className="w-[120px] shrink-0">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Public">Public</SelectItem>
                <SelectItem value="Private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content — list layout */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="px-5 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 py-3">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="w-3.5 h-3.5 rounded-full" />
                      <Skeleton className="w-16 h-10 rounded-md" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-3 w-3/5" />
                      </div>
                      <Skeleton className="h-4 w-12" />
                    </div>
                    {i < 4 && <Separator />}
                  </div>
                ))}
              </div>
            ) : !hasAnyMemberships ? (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-4">
                <Layers className="w-10 h-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  You&apos;re not part of any spaces yet.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => goToSpace("spaces")}
                >
                  Browse all spaces
                </Button>
              </div>
            ) : spaceCount === 0 ? (
              <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-4">
                <SearchX className="w-10 h-10 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No spaces match your search.
                </p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div>
                {filteredGroups.map((group, gi) => {
                  const { parent, subspaces } = group;
                  const isExpanded = Boolean(expandedGroups[parent.id]);

                  return (
                    <div key={parent.id}>
                      {gi > 0 && <Separator />}
                      {renderParentRow(parent, subspaces.length)}

                      {isExpanded && subspaces.length > 0 && (
                        <div>
                          {subspaces.map((sub) => renderSubspaceRow(sub))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
