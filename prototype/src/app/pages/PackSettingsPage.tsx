import { useState, useCallback } from "react";
import { useParams } from "react-router";
import { Lightbulb, Plus, MoreHorizontal, Trash2, Eye, Search, ChevronDown, ChevronRight, Check, Loader2, Pencil, Upload, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Switch } from "@/app/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { useNavigate } from "react-router";
import { toast } from "sonner";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const PACK_DATA = {
  id: "pack-1",
  name: "Design Sprint Kit",
  provider: "Google Ventures",
  description: "<p>A complete set of tools to run a 5-day Design Sprint. Validate ideas, solve big problems, and test prototypes with customers.</p>",
  tags: ["Innovation", "Product", "Strategy", "Workshop"],
  listedInStore: true,
  searchVisibility: "public" as const,
  avatar: "https://images.unsplash.com/photo-1554103210-26d928978fb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  references: [
    { title: "Sprint Book", url: "https://www.thesprintbook.com" },
    { title: "GV Design Sprint", url: "https://designsprintkit.withgoogle.com" },
  ],
};

const PACK_TEMPLATES = [
  // Space Templates
  { id: "t1", name: "Sprint Space", type: "Space" as const, tags: ["Sprint", "Workshop"], image: "https://images.unsplash.com/photo-1554103210-26d928978fb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
  { id: "t2", name: "Tackling Complex Problems", type: "Space" as const, tags: ["Innovation", "Design Thinking"], image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
  // Collaboration Tool Templates
  { id: "t3", name: "Business Model Canvas", type: "Collaboration Tool" as const, tags: ["Strategy", "Canvas"], image: "" },
  { id: "t4", name: "MoSCoW Prioritization", type: "Collaboration Tool" as const, tags: ["Prioritization"], image: "" },
  { id: "t5", name: "Low-Tech Social Network", type: "Collaboration Tool" as const, tags: ["Networking", "Workshop"], image: "" },
  { id: "t6", name: "Empathy Map", type: "Collaboration Tool" as const, tags: ["UX", "Research"], image: "" },
  // Whiteboard Templates
  { id: "t7", name: "SWOT Analysis", type: "Whiteboard" as const, tags: ["Strategy"], image: "https://images.unsplash.com/photo-1731924532579-d23ed102496c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
  { id: "t8", name: "Notes", type: "Whiteboard" as const, tags: ["Ideation", "Workshop"], image: "https://images.unsplash.com/photo-1768796370577-c6e8b708b980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
  { id: "t11", name: "Preparation Canvas", type: "Whiteboard" as const, tags: ["Planning"], image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
  { id: "t12", name: "Stakeholder Map", type: "Whiteboard" as const, tags: ["Stakeholders"], image: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
  // Post Templates
  { id: "t9", name: "Sprint Retro", type: "Post" as const, tags: ["Retro"], image: "" },
  { id: "t13", name: "Idea Collection", type: "Post" as const, tags: ["Ideation", "Brainstorm"], image: "" },
  // Community Guidelines Templates
  { id: "t10", name: "Knowledge Sharing Community", type: "Community Guidelines" as const, tags: ["Knowledge Sharing", "Online Community"], image: "" },
  { id: "t14", name: "Innovation Community Code", type: "Community Guidelines" as const, tags: ["Innovation", "Conduct"], image: "" },
];

type TemplateType = "Space" | "Collaboration Tool" | "Whiteboard" | "Post" | "Community Guidelines";

const TEMPLATE_SECTIONS: { id: TemplateType; title: string }[] = [
  { id: "Space", title: "Space Templates" },
  { id: "Collaboration Tool", title: "Collaboration Tool Templates" },
  { id: "Whiteboard", title: "Whiteboard Templates" },
  { id: "Post", title: "Post Templates" },
  { id: "Community Guidelines", title: "Community Guidelines Templates" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved";

function useSectionSave() {
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({});

  const save = useCallback((id: string, onCommit: () => void) => {
    setStatuses(s => ({ ...s, [id]: "saving" }));
    setTimeout(() => {
      onCommit();
      setStatuses(s => ({ ...s, [id]: "saved" }));
      setTimeout(() => setStatuses(s => ({ ...s, [id]: "idle" })), 1800);
    }, 600);
  }, []);

  return { statuses, save };
}

function InlineSaveButton({ dirty, status, onSave }: { dirty: boolean; status: SaveStatus; onSave: () => void }) {
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-caption text-emerald-600 animate-in fade-in slide-in-from-left-1 duration-200">
        <Check className="w-3 h-3" /> Saved
      </span>
    );
  }
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-caption text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (!dirty) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSave}
      className="h-6 px-2 text-caption text-primary hover:text-primary hover:bg-primary/10 animate-in fade-in slide-in-from-left-1 duration-200"
    >
      Save
    </Button>
  );
}

// ─── About Tab ───────────────────────────────────────────────────────────────

function PackSettingsAbout() {
  const [formData, setFormData] = useState({
    name: PACK_DATA.name,
    provider: PACK_DATA.provider,
    description: PACK_DATA.description,
    tags: PACK_DATA.tags,
    listedInStore: PACK_DATA.listedInStore,
    searchVisibility: PACK_DATA.searchVisibility,
    references: PACK_DATA.references,
  });
  const [savedData, setSavedData] = useState({ ...formData });
  const [tagInput, setTagInput] = useState("");
  const { statuses, save } = useSectionSave();

  const dirty = {
    name: formData.name !== savedData.name,
    description: formData.description !== savedData.description,
    tags: JSON.stringify(formData.tags) !== JSON.stringify(savedData.tags),
    visibility: formData.listedInStore !== savedData.listedInStore || formData.searchVisibility !== savedData.searchVisibility,
    references: JSON.stringify(formData.references) !== JSON.stringify(savedData.references),
  };

  const saveSection = (id: string) => {
    save(id, () => {
      setSavedData({ ...formData });
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const addReference = () => {
    setFormData(prev => ({ ...prev, references: [...prev.references, { title: "", url: "" }] }));
  };

  const updateReference = (index: number, field: "title" | "url", value: string) => {
    const newRefs = [...formData.references];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setFormData(prev => ({ ...prev, references: newRefs }));
  };

  const removeReference = (index: number) => {
    setFormData(prev => ({ ...prev, references: prev.references.filter((_, i) => i !== index) }));
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'blockquote'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-page-title">About</h2>
        <p className="text-muted-foreground mt-2">
          Manage the profile and visibility of this template pack.
        </p>
      </div>

      <Separator />

      {/* Avatar + Name */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Pack Identity</Label>
          <InlineSaveButton dirty={dirty.name} status={statuses["name"] || "idle"} onSave={() => saveSection("name")} />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
              {PACK_DATA.avatar ? (
                <img src={PACK_DATA.avatar} alt="Pack avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Pack name"
              className="bg-muted/50 border-border"
            />
            <p className="text-caption text-muted-foreground">Provider: {formData.provider}</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Visibility */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Visibility</Label>
          <InlineSaveButton dirty={dirty.visibility} status={statuses["visibility"] || "idle"} onSave={() => saveSection("visibility")} />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-emphasis">Listed in Store</p>
              <p className="text-caption text-muted-foreground">Make this pack discoverable in the template library</p>
            </div>
            <Switch
              checked={formData.listedInStore}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, listedInStore: checked }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-body">Search Visibility</Label>
            <Select
              value={formData.searchVisibility}
              onValueChange={(value: "public" | "private") => setFormData(prev => ({ ...prev, searchVisibility: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator />

      {/* Description */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Description</Label>
          <InlineSaveButton dirty={dirty.description} status={statuses["description"] || "idle"} onSave={() => saveSection("description")} />
        </div>
        <div className="[&_.ql-editor]:min-h-[120px]">
          <ReactQuill
            theme="snow"
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            modules={quillModules}
          />
        </div>
      </section>

      <Separator />

      {/* Tags */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Tags</Label>
          <InlineSaveButton dirty={dirty.tags} status={statuses["tags"] || "idle"} onSave={() => saveSection("tags")} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag…"
            className="w-32 h-7 text-body bg-muted/50 border-border"
          />
        </div>
      </section>

      <Separator />

      {/* References */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">References</Label>
          <InlineSaveButton dirty={dirty.references} status={statuses["references"] || "idle"} onSave={() => saveSection("references")} />
        </div>
        <div className="space-y-3">
          {formData.references.map((ref, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={ref.title}
                onChange={(e) => updateReference(i, "title", e.target.value)}
                placeholder="Title"
                className="flex-1 bg-muted/50 border-border"
              />
              <Input
                value={ref.url}
                onChange={(e) => updateReference(i, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-muted/50 border-border"
              />
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeReference(i)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addReference} className="gap-1">
            <Plus className="w-3 h-3" /> Add Reference
          </Button>
        </div>
      </section>
    </div>
  );
}

// ─── Templates Tab ───────────────────────────────────────────────────────────

function PackSettingsTemplates() {
  const navigate = useNavigate();
  const { packSlug } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(TEMPLATE_SECTIONS.map(s => [s.id, true]))
  );

  const filteredTemplates = PACK_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateNew = (type: TemplateType) => {
    toast.success(`Create new ${type} template (placeholder)`);
  };

  const handleDelete = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Template deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-page-title">Templates</h2>
          <p className="text-muted-foreground mt-2">
            Manage the templates included in this pack.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search templates..."
          className="pl-9 bg-muted/50 border-border"
        />
      </div>

      <Separator />

      {/* Sections */}
      {TEMPLATE_SECTIONS.map(section => {
        const sectionTemplates = filteredTemplates.filter(t => t.type === section.id);
        const isOpen = openSections[section.id] ?? true;

        return (
          <div key={section.id} className="space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-2">
                {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <h3 className="text-card-title">{section.title}</h3>
                <span className="text-caption text-muted-foreground">({sectionTemplates.length})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={(e) => { e.stopPropagation(); handleCreateNew(section.id); }}
              >
                <Plus className="w-3 h-3" /> Create New
              </Button>
            </div>

            {isOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-6">
                {sectionTemplates.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-muted-foreground text-body">
                    No templates in this section.
                    <Button variant="link" size="sm" className="ml-1" onClick={() => handleCreateNew(section.id)}>
                      Create one
                    </Button>
                  </div>
                ) : (
                  sectionTemplates.map(template => (
                    <div
                      key={template.id}
                      className="group relative rounded-md border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                      onClick={() => navigate(`/templates/packs/${packSlug}/settings/templates/${template.id}`)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-[4/3] bg-muted overflow-hidden">
                        {template.image ? (
                          <img src={template.image} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                            <Lightbulb className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <p className="text-body-emphasis truncate">{template.name}</p>
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {template.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-badge font-normal px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* Overflow menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/templates/packs/${packSlug}/${template.id}`); }}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(template.id, e)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PackSettingsPage() {
  const { packSlug } = useParams<{ packSlug: string }>();

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Sticky header with title */}
      <div className="sticky top-16 z-20 border-b border-border bg-card">
        <div className="px-6 md:px-8 pt-8 pb-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border shrink-0">
                  {PACK_DATA.avatar ? (
                    <img src={PACK_DATA.avatar} alt={PACK_DATA.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-page-title">{PACK_DATA.name}</h1>
                  <p className="text-muted-foreground text-body mt-0.5">{PACK_DATA.provider}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="px-6 md:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10">
            <div
              className="w-full p-6 md:p-8 shadow-sm"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <div className="space-y-10">
                <PackSettingsAbout />
                <Separator />
                <PackSettingsTemplates />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
