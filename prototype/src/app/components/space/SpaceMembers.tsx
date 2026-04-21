import React, { useState } from "react";
import { Search, MoreHorizontal, UserPlus, Shield, User, CheckCircle2, Building2, ExternalLink, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

// ── Types ──
interface MemberEntry {
  kind: "user";
  id: string;
  name: string;
  role: string;
  roleType: string;
  joinDate: string;
  avatar: string | null;
  initials: string;
  bio: string;
}

interface OrgEntry {
  kind: "org";
  id: string;
  name: string;
  type: string;
  description: string;
  avatar: string;
  initials: string;
  members: number;
  website: string;
}

type CommunityEntry = MemberEntry | OrgEntry;

// ── Mock Data: Users ──
const RAW_MEMBERS: Omit<MemberEntry, "kind">[] = [
  {
    id: "u1",
    name: "Elena Martinez",
    role: "Host",
    roleType: "admin",
    joinDate: "Oct 2023",
    avatar: "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256",
    initials: "EM",
    bio: "Community Host. Driving sustainable innovation in urban planning.",
  },
  {
    id: "u2",
    name: "Sarah Chen",
    role: "Admin",
    roleType: "admin",
    joinDate: "Nov 2023",
    avatar: "https://images.unsplash.com/photo-1757347398206-7425300ef990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256",
    initials: "SC",
    bio: "Energy systems analyst with a passion for green tech.",
  },
  {
    id: "u3",
    name: "Maya Ross",
    role: "Lead",
    roleType: "moderator",
    joinDate: "Dec 2023",
    avatar: "https://images.unsplash.com/photo-1589332911105-a6b59f2e4c4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBkYXJrJTIwaGFpciUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256",
    initials: "MR",
    bio: "Focusing on community engagement and policy.",
  },
  {
    id: "u4",
    name: "David Kim",
    role: "Member",
    roleType: "member",
    joinDate: "Jan 2024",
    avatar: "https://images.unsplash.com/photo-1651634099348-e4c38cfaa6d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBiZWFyZCUyMHN1bnNldCUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTQ0MjUzN3ww&ixlib=rb-4.1.0&q=80&w=256",
    initials: "DK",
    bio: "",
  },
  {
    id: "u5",
    name: "Robert Fox",
    role: "Member",
    roleType: "member",
    joinDate: "Jan 2024",
    avatar: "https://images.unsplash.com/photo-1651097681268-851acda33b18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGRlciUyMG1hbiUyMHdoaXRlJTIwYmVhcmQlMjBnbGFzc2VzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256",
    initials: "RF",
    bio: "",
  },
  ...Array.from({ length: 24 }).map((_, i) => ({
    id: `m${i + 6}`,
    name:
      [
        "James Wilson", "Emma Thompson", "Lucas Oliveira", "Sophia Li", "Oliver Smith",
        "Ava Patel", "William Chen", "Isabella Garcia", "Henry Wilson", "Mia Kim",
        "Alexander Wright", "Charlotte Davis", "Daniel Lee", "Amelia White", "Matthew Clark",
        "Harper Lewis", "Joseph Hall", "Evelyn Young", "Samuel Allen", "Abigail King",
        "Benjamin Scott", "Elizabeth Green", "Jack Baker", "Victoria Adams",
      ][i] || `Member ${i + 6}`,
    role: i < 3 ? "Lead" : "Member",
    roleType: i < 3 ? "moderator" : "member",
    joinDate: "Feb 2024",
    avatar: null as string | null,
    initials:
      [
        "JW", "ET", "LO", "SL", "OS", "AP", "WC", "IG", "HW", "MK",
        "AW", "CD", "DL", "AW", "MC", "HL", "JH", "EY", "SA", "AK",
        "BS", "EG", "JB", "VA",
      ][i] || `M${i + 6}`,
    bio: i % 3 === 0 ? "" : "Passionate about contributing to the community space.",
  })),
];

export const SPACE_MEMBERS = RAW_MEMBERS; // keep export for sidebar etc.

// ── Mock Data: Organizations ──
const RAW_ORGS: Omit<OrgEntry, "kind">[] = [
  {
    id: "org1",
    name: "Green Future Labs",
    type: "Research Institute",
    description: "Leading research in renewable energy systems and sustainable urban planning.",
    avatar: "https://images.unsplash.com/photo-1769697264314-28f093151bbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW5ld2FibGUlMjBlbmVyZ3klMjBjb21wYW55JTIwZ3JlZW4lMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MjEwNDU4MXww&ixlib=rb-4.1.0&q=80&w=256",
    initials: "GF",
    members: 12,
    website: "https://greenfuturelabs.org",
  },
  {
    id: "org2",
    name: "City of Amsterdam",
    type: "Municipality",
    description: "Municipal government driving sustainable urban transformation across the Netherlands.",
    avatar: "https://images.unsplash.com/photo-1760246964044-1384f71665b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBidWlsZGluZyUyMG1vZGVybnxlbnwxfHx8fDE3NzIwMTQ2Mjd8MA&ixlib=rb-4.1.0&q=80&w=256",
    initials: "CA",
    members: 8,
    website: "https://amsterdam.nl",
  },
  {
    id: "org3",
    name: "Utrecht University",
    type: "Academic",
    description: "Faculty of Geosciences contributing research on climate adaptation and energy transition.",
    avatar: "https://images.unsplash.com/photo-1631599143424-5bc234fbebf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcyMDQ1OTQwfDA&ixlib=rb-4.1.0&q=80&w=256",
    initials: "UU",
    members: 5,
    website: "https://uu.nl",
  },
  {
    id: "org4",
    name: "Sustainable Cities Fund",
    type: "NGO",
    description: "Non-profit funding innovative urban sustainability projects across Europe.",
    avatar: "https://images.unsplash.com/photo-1763050234301-b623bdf88749?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub25wcm9maXQlMjBjaGFyaXR5JTIwY29tbXVuaXR5JTIwb3JnYW5pemF0aW9ufGVufDF8fHx8MTc3MjEwNDU4Mnww&ixlib=rb-4.1.0&q=80&w=256",
    initials: "SC",
    members: 3,
    website: "https://sustainablecitiesfund.eu",
  },
];

// ── Merged list ──
const ALL_ENTRIES: CommunityEntry[] = [
  ...RAW_ORGS.map((o): OrgEntry => ({ ...o, kind: "org" })),
  ...RAW_MEMBERS.map((m): MemberEntry => ({ ...m, kind: "user" })),
];

const FILTERS = ["All", "Host", "Admin", "Lead", "Member", "Organization"];

// ── Component ──
export function SpaceMembers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const totalUsers = RAW_MEMBERS.length;
  const totalOrgs = RAW_ORGS.length;

  const filteredEntries = ALL_ENTRIES.filter((entry) => {
    // Search match
    const nameMatch = entry.name.toLowerCase().includes(searchQuery.toLowerCase());
    const extraMatch =
      entry.kind === "user"
        ? entry.role.toLowerCase().includes(searchQuery.toLowerCase())
        : entry.type.toLowerCase().includes(searchQuery.toLowerCase());
    if (!nameMatch && !extraMatch) return false;

    // Filter match
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Organization") return entry.kind === "org";
    return entry.kind === "user" && entry.role === selectedFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEntries = filteredEntries.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters/search change
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const getRoleBadgeColor = (roleType: string) => {
    switch (roleType) {
      case "admin":
        return "bg-primary/10 text-primary border-primary/20";
      case "moderator":
        return "bg-chart-2/10 text-chart-2 border-chart-2/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case "admin":
        return <Shield className="w-3 h-3 mr-1" />;
      case "moderator":
        return <CheckCircle2 className="w-3 h-3 mr-1" />;
      default:
        return <User className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--muted-foreground)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {totalUsers} members and {totalOrgs} organizations in this space.
        </p>
        <Button className="shrink-0">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members or organizations..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-4 transition-all"
            style={{
              fontSize: "var(--text-sm)",
              fontFamily: "'Inter', sans-serif",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              background: "var(--input-background)",
              color: "var(--foreground)",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.boxShadow = "0 0 0 1px var(--ring)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={cn(
                "px-3 py-2 whitespace-nowrap transition-colors",
                selectedFilter === filter
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              )}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)" as any,
                fontFamily: "'Inter', sans-serif",
                borderRadius: "var(--radius)",
                border: `1px solid ${selectedFilter === filter ? "var(--primary)" : "var(--border)"}`,
                background: selectedFilter === filter ? "var(--primary)" : "var(--background)",
                color: selectedFilter === filter ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Unified Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginatedEntries.map((entry) =>
          entry.kind === "user" ? (
            <UserCard
              key={entry.id}
              member={entry}
              getRoleBadgeColor={getRoleBadgeColor}
              getRoleIcon={getRoleIcon}
            />
          ) : (
            <OrgCard key={entry.id} org={entry} />
          )
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="mx-2 text-sm text-muted-foreground">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Empty state */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <div
            className="inline-flex items-center justify-center w-12 h-12 mb-4"
            style={{
              borderRadius: "999px",
              background: "var(--muted)",
            }}
          >
            <User className="w-6 h-6" style={{ color: "var(--muted-foreground)" }} />
          </div>
          <h3
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--font-weight-medium)" as any,
              color: "var(--foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            No results found
          </h3>
          <p
            className="mt-1"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Try adjusting your search or filters.
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("All");
              setCurrentPage(1);
            }}
            className="mt-2 text-primary"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

// ── User Card ──
function UserCard({
  member,
  getRoleBadgeColor,
  getRoleIcon,
}: {
  member: MemberEntry;
  getRoleBadgeColor: (rt: string) => string;
  getRoleIcon: (rt: string) => React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div className="p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link
              to={`/user/${member.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="transition-opacity hover:opacity-80"
            >
              <Avatar className="w-12 h-12" style={{ border: "1px solid var(--border)" }}>
                {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
                <AvatarFallback
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                to={`/user/${member.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-primary transition-colors block"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "var(--text-sm)",
                  color: "var(--foreground)",
                }}
              >
                {member.name}
              </Link>
              <div
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1",
                  getRoleBadgeColor(member.roleType)
                )}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {getRoleIcon(member.roleType)}
                {member.role}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Remove from Space</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="px-4 pb-4">
          {member.bio && (
            <p
              className="line-clamp-2"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {member.bio}
            </p>
          )}
          <div
            className={cn("flex items-center gap-1", member.bio ? "mt-4" : "mt-1")}
            style={{
              fontSize: "12px",
              color: "var(--muted-foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span>Joined {member.joinDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Organization Card ──
function OrgCard({ org }: { org: OrgEntry }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-0">
        <div className="p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link
              to={`/organization/${org.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="transition-opacity hover:opacity-80"
            >
              <Avatar
                className="w-12 h-12"
                style={{
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                }}
              >
                <AvatarImage
                  src={org.avatar}
                  alt={org.name}
                  style={{ borderRadius: "var(--radius)" }}
                />
                <AvatarFallback
                  style={{
                    borderRadius: "var(--radius)",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: "12px",
                    background: "color-mix(in srgb, var(--info) 15%, transparent)",
                    color: "var(--info)",
                  }}
                >
                  {org.initials}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                to={`/organization/${org.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-primary transition-colors block"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "var(--text-sm)",
                  color: "var(--foreground)",
                }}
              >
                {org.name}
              </Link>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5"
                  style={{
                    fontSize: "11px",
                    fontWeight: "var(--font-weight-medium)" as any,
                    fontFamily: "'Inter', sans-serif",
                    color: "var(--info)",
                    background: "color-mix(in srgb, var(--info) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--info) 20%, transparent)",
                    borderRadius: "999px",
                  }}
                >
                  <Building2 className="w-3 h-3" />
                  {org.type}
                </span>
              </div>
            </div>
          </div>

          <a
            href={org.website}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-1.5 transition-colors"
            style={{
              color: "var(--muted-foreground)",
              borderRadius: "var(--radius)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="px-4 pb-4">
          <p
            className="line-clamp-2 min-h-[2.5rem]"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {org.description}
          </p>
          <div
            className="flex items-center gap-1 mt-4"
            style={{
              fontSize: "12px",
              color: "var(--muted-foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Users className="w-3 h-3" />
            <span>{org.members} members in this space</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}