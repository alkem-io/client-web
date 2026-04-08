import { useState } from "react";
import {
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  PenTool,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

// Mock Data
const RESOURCES = [
  {
    id: 1,
    name: "Q1 Sustainability Report",
    description:
      "Comprehensive report covering environmental impact metrics and sustainability goals for Q1 2026.",
    type: "doc",
    uploadedBy: "Alex Contributor",
    initials: "AC",
    date: "3 days ago",
  },
  {
    id: 2,
    name: "Project Roadmap 2024",
    description:
      "Strategic roadmap outlining key milestones, deliverables, and timelines for the year ahead.",
    type: "doc",
    uploadedBy: "Sarah Chen",
    initials: "SC",
    date: "1 week ago",
  },
  {
    id: 3,
    name: "Community Workshop Guidelines",
    description:
      "Best practices and facilitation guide for running effective community engagement workshops.",
    type: "doc",
    uploadedBy: "James Wilson",
    initials: "JW",
    date: "2 weeks ago",
  },
  {
    id: 4,
    name: "Urban Design Inspiration Board",
    description:
      "Curated collection of design references and visual inspiration for the urban renewal project.",
    type: "link",
    uploadedBy: "Elena Rodriguez",
    initials: "ER",
    date: "3 weeks ago",
  },
  {
    id: 5,
    name: "Brainstorming: Infrastructure Upgrades",
    description:
      "Collaborative whiteboard capturing ideas from the infrastructure modernization brainstorm.",
    type: "whiteboard",
    uploadedBy: "Michael Chang",
    initials: "MC",
    date: "1 month ago",
  },
  {
    id: 6,
    name: "Site Survey Photos",
    description:
      "Collection of photographs from the on-site survey of proposed development locations.",
    type: "image",
    uploadedBy: "Alex Contributor",
    initials: "AC",
    date: "1 month ago",
  },
  {
    id: 7,
    name: "Stakeholder Meeting Notes",
    description:
      "Summary and action items from the quarterly stakeholder alignment meeting.",
    type: "doc",
    uploadedBy: "David Miller",
    initials: "DM",
    date: "2 months ago",
  },
  {
    id: 8,
    name: "Energy Transition Whiteboard",
    description:
      "Visual mapping of energy transition pathways and policy intervention points.",
    type: "whiteboard",
    uploadedBy: "Sarah Chen",
    initials: "SC",
    date: "2 months ago",
  },
];

const TYPE_ICON_MAP: Record<string, { icon: typeof FileText; color: string }> = {
  doc: { icon: FileText, color: "var(--chart-1)" },
  link: { icon: LinkIcon, color: "var(--chart-2)" },
  whiteboard: { icon: PenTool, color: "var(--chart-3)" },
  image: { icon: ImageIcon, color: "var(--chart-4)" },
};

export function SpaceResourcesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredResources = RESOURCES.filter((resource) => {
    const matchesSearch = resource.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  const shownResources = filteredResources.slice(0, visibleCount);
  const hasMore = filteredResources.length > visibleCount;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            Knowledge Base
          </h2>
          <p
            className="mt-1"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
            }}
          >
            Access shared documents, whiteboards, and resources for this space.
          </p>
        </div>
        <Button className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Add Resource
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="relative flex-1 w-full md:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--muted-foreground)" }}
          />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(6);
            }}
            className="pl-9"
            style={{ background: "var(--input-background)" }}
          />
        </div>

        <Select
          value={selectedType}
          onValueChange={(v) => {
            setSelectedType(v);
            setVisibleCount(6);
          }}
        >
          <SelectTrigger
            className="h-9 w-auto min-w-[160px]"
            style={{ fontSize: "var(--text-sm)" }}
          >
            <SelectValue placeholder="Type: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="doc">Documents</SelectItem>
            <SelectItem value="link">Links</SelectItem>
            <SelectItem value="whiteboard">Whiteboards</SelectItem>
            <SelectItem value="image">Images</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Card Grid */}
      {shownResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shownResources.map((resource) => {
            const typeInfo = TYPE_ICON_MAP[resource.type] || TYPE_ICON_MAP.doc;
            const Icon = typeInfo.icon;

            return (
              <Card
                key={resource.id}
                className="group cursor-pointer transition-all hover:shadow-md"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
              >
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors"
                    style={{
                      background: `color-mix(in srgb, ${typeInfo.color} 12%, transparent)`,
                      color: typeInfo.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-2 line-clamp-2 group-hover:text-primary transition-colors"
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      lineHeight: 1.4,
                    }}
                  >
                    {resource.name}
                  </h3>

                  {/* Description */}
                  <p
                    className="line-clamp-2 flex-1 mb-4"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--muted-foreground)",
                      lineHeight: 1.5,
                    }}
                  >
                    {resource.description}
                  </p>

                  {/* Author Row */}
                  <div className="flex items-center gap-2 mt-auto pt-3"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback
                        style={{
                          background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                          color: "var(--primary)",
                          fontSize: "9px",
                          fontWeight: 700,
                        }}
                      >
                        {resource.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="truncate"
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {resource.uploadedBy}
                    </span>
                    <span
                      className="ml-auto shrink-0"
                      style={{
                        fontSize: "12px",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {resource.date}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div
          className="flex flex-col items-center justify-center py-16"
          style={{
            border: "2px dashed var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <Search
            className="mb-3"
            style={{
              width: 32,
              height: 32,
              color: "var(--muted-foreground)",
              opacity: 0.5,
            }}
          />
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
            }}
          >
            No resources found matching your search.
          </p>
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((c) => c + 6)}
          >
            Show more
          </Button>
        </div>
      )}
    </div>
  );
}
