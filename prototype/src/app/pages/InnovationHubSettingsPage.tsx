import { useState, useCallback } from "react";
import { useParams, Link, Navigate } from "react-router";
import {
  Info,
  Layers,
  Settings,
  User,
  X,
  Plus,
  Upload,
  Check,
  Loader2,
  Pencil,
  GripVertical,
  Minus,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/lib/utils";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

/* ─── Types ─── */
type TabId = "about" | "spaces" | "settings" | "account";
type SaveStatus = "idle" | "saving" | "saved";

/* ─── Mock Data ─── */
const HUB_DATA = {
  name: "VNG Innovation Hub",
  subdomain: "VNG",
  tagline: "innovatie met en door de gemeentes",
  description:
    'De <strong>open innovatiehub</strong> voor <strong>samenwerking tussen en voor de gemeentes</strong> in Nederland.<br/>Hier vind je communities die werken aan nieuwe vormen van publieke dienstverlening die aansluiten bij de leefwereld van mensen.<br/>Een plek waar de <strong>overheid, markt, wetenschap</strong> en <strong>samenleving</strong> samen kunnen werken aan <em>maatschappelijke missies</em>.',
  tags: ["gemeenten", "vng", "digitale twin"],
  bannerImage: "/banners/vng-innovation-hub.png",
};

const AVAILABLE_SPACES = [
  { id: "1", name: "Digitale Leefomgeving", visibility: "ACTIVE" as const, hostAccount: "VNG Kenniscentrum Innovatie" },
  { id: "2", name: "Totaal Driedimensionaal (T3D)", visibility: "ACTIVE" as const, hostAccount: "VNG" },
  { id: "3", name: "Dutch Societal Innovation Hub", visibility: "INACTIVE" as const, hostAccount: "Dutch Societal Innovation Hub" },
  { id: "4", name: "Slimme Mobiliteit", visibility: "ACTIVE" as const, hostAccount: "VNG" },
  { id: "5", name: "Open Data Gemeenten", visibility: "ACTIVE" as const, hostAccount: "VNG Kenniscentrum Innovatie" },
  { id: "6", name: "Energietransitie", visibility: "ACTIVE" as const, hostAccount: "VNG" },
  { id: "7", name: "Digitale Inclusie", visibility: "ACTIVE" as const, hostAccount: "VNG" },
  { id: "8", name: "Omgevingswet Implementatie", visibility: "ACTIVE" as const, hostAccount: "VNG" },
  { id: "9", name: "Cybersecurity Gemeenten", visibility: "ACTIVE" as const, hostAccount: "VNG" },
];

/* ─── Save hook ─── */
function useSectionSave() {
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({});

  const save = useCallback((id: string, onCommit: () => void) => {
    setStatuses((s) => ({ ...s, [id]: "saving" }));
    setTimeout(() => {
      onCommit();
      setStatuses((s) => ({ ...s, [id]: "saved" }));
      setTimeout(() => setStatuses((s) => ({ ...s, [id]: "idle" })), 1800);
    }, 600);
  }, []);

  return { statuses, save };
}

/* ─── Inline Save Button ─── */
function InlineSaveButton({
  dirty,
  status,
  onSave,
}: {
  dirty: boolean;
  status: SaveStatus;
  onSave: () => void;
}) {
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

/* ─── Edit Pencil ─── */
function EditPencil({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center text-muted-foreground/50 pointer-events-none",
        className
      )}
      aria-hidden
    >
      <Pencil className="w-3.5 h-3.5" />
    </span>
  );
}

/* ─── About Tab ─── */
function AboutTab() {
  const [formData, setFormData] = useState(HUB_DATA);
  const [savedData, setSavedData] = useState(HUB_DATA);
  const [tagInput, setTagInput] = useState("");
  const { statuses, save } = useSectionSave();

  const dirty = {
    subdomain: formData.subdomain !== savedData.subdomain,
    name: formData.name !== savedData.name,
    tagline: formData.tagline !== savedData.tagline,
    description: formData.description !== savedData.description,
    tags: JSON.stringify(formData.tags) !== JSON.stringify(savedData.tags),
    banner: false,
  };

  const saveSection = (id: string) => {
    save(id, () => {
      setSavedData((prev) => ({ ...prev, [id]: (formData as any)[id] }));
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "blockquote", "code-block"],
      ["clean"],
    ],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-page-title">About</h2>
        <p className="text-muted-foreground mt-2">
          Configure the basic information for your Innovation Hub.
        </p>
      </div>

      <Separator />

      {/* Subdomain */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">Subdomain</Label>
        <div className="mt-2 space-y-2">
          <div className="relative max-w-md">
            <Input
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              placeholder="e.g. vng"
            />
            <EditPencil className="absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <InlineSaveButton
              dirty={dirty.subdomain}
              status={statuses.subdomain || "idle"}
              onSave={() => saveSection("subdomain")}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Name */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">Name</Label>
        <div className="mt-2 space-y-2">
          <div className="relative max-w-md">
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. VNG Innovation Hub"
            />
            <EditPencil className="absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <InlineSaveButton
              dirty={dirty.name}
              status={statuses.name || "idle"}
              onSave={() => saveSection("name")}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Tagline */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">Tagline</Label>
        <div className="mt-2 space-y-2">
          <div className="relative max-w-md">
            <Input
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. innovatie met en door de gemeentes"
            />
            <EditPencil className="absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <InlineSaveButton
              dirty={dirty.tagline}
              status={statuses.tagline || "idle"}
              onSave={() => saveSection("tagline")}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Description */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">Description</Label>
        <div className="mt-2 space-y-2">
          <ReactQuill
            value={formData.description}
            onChange={(v) => setFormData((prev) => ({ ...prev, description: v }))}
            modules={quillModules}
            theme="snow"
            className="[&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px]"
          />
          <div className="flex items-center justify-end gap-2">
            <InlineSaveButton
              dirty={dirty.description}
              status={statuses.description || "idle"}
              onSave={() => saveSection("description")}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Tags */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">Tags</Label>
        <p className="text-caption text-muted-foreground mt-1">Default</p>
        <div className="mt-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption"
                style={{
                  background: "color-mix(in srgb, var(--primary) 10%, var(--card))",
                  border: "1px solid color-mix(in srgb, var(--primary) 20%, var(--border))",
                  color: "var(--foreground)",
                }}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="relative max-w-sm">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter"
              className="text-sm"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <InlineSaveButton
              dirty={dirty.tags}
              status={statuses.tags || "idle"}
              onSave={() => saveSection("tags")}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Banner */}
      <section>
        <Label className="text-label uppercase text-muted-foreground">Banner</Label>
        <div className="mt-3 space-y-3">
          <div className="relative w-full h-48 rounded-xl overflow-hidden group border border-border bg-muted/50">
            <img
              src={formData.bannerImage}
              alt="Hub Banner"
              className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <Button variant="secondary" size="sm" className="gap-2">
                <Upload className="w-4 h-4" /> Change Banner
              </Button>
            </div>
          </div>
          <p className="text-caption text-muted-foreground">
            Shown at the top of the Innovation Hub page.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─── Spaces Tab ─── */
function SpacesTab() {
  const [selectedSpaces, setSelectedSpaces] = useState(AVAILABLE_SPACES.slice(0, 3));
  const [showAddModal, setShowAddModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const handleRemove = (id: string) => {
    setSelectedSpaces((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAdd = (space: (typeof AVAILABLE_SPACES)[number]) => {
    if (!selectedSpaces.find((s) => s.id === space.id)) {
      setSelectedSpaces((prev) => [...prev, space]);
    }
    setShowAddModal(false);
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1800);
    }, 600);
  };

  const availableToAdd = AVAILABLE_SPACES.filter(
    (s) => !selectedSpaces.find((sel) => sel.id === s.id)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-page-title">Spaces</h2>
          <p className="text-muted-foreground mt-2">
            Manage which Spaces are visible on the Custom Homepage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" /> Add
          </Button>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveStatus === "saved" ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saveStatus === "saved" ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Current Selection */}
      <div>
        <h3 className="text-subsection-title mb-1">Current Selection</h3>
        <p className="text-caption text-muted-foreground mb-4">
          The order below is the order in which the Spaces will be visible on the Custom Homepage.
        </p>

        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-12 gap-4 px-4 py-3 text-caption text-muted-foreground uppercase"
            style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}
          >
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Visibility</div>
            <div className="col-span-3">Host Account</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table rows */}
          {selectedSpaces.map((space) => (
            <div
              key={space.id}
              className="grid grid-cols-12 gap-4 px-4 py-3 items-center"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="col-span-5 flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
                <span className="text-body truncate">{space.name}</span>
              </div>
              <div className="col-span-3">
                <span
                  className="text-caption px-2 py-0.5 rounded"
                  style={{
                    background:
                      space.visibility === "ACTIVE"
                        ? "color-mix(in srgb, var(--chart-2) 15%, transparent)"
                        : "color-mix(in srgb, var(--muted-foreground) 10%, transparent)",
                    color:
                      space.visibility === "ACTIVE"
                        ? "var(--chart-2)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {space.visibility}
                </span>
              </div>
              <div className="col-span-3 text-body text-muted-foreground truncate">
                {space.hostAccount}
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => handleRemove(space.id)}
                  className="p-1 rounded hover:bg-destructive/10 transition-colors"
                  title="Remove from hub"
                >
                  <Minus className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}

          {selectedSpaces.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground text-body">
              No spaces selected. Click "Add" to include spaces.
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="w-full max-w-lg rounded-xl p-6 shadow-xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-subsection-title">Add Space</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-caption text-muted-foreground mb-4">
              Select a space to add to the Innovation Hub homepage.
            </p>
            <div
              className="space-y-1 max-h-64 overflow-y-auto rounded-lg"
              style={{ border: "1px solid var(--border)" }}
            >
              {availableToAdd.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-caption">
                  All spaces are already added.
                </div>
              ) : (
                availableToAdd.map((space) => (
                  <button
                    key={space.id}
                    onClick={() => handleAdd(space)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent/50 transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div>
                      <span className="text-body">{space.name}</span>
                      <span className="text-caption text-muted-foreground ml-3">
                        {space.hostAccount}
                      </span>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Settings Tab (placeholder) ─── */
function SettingsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-page-title">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure visibility and access for this Innovation Hub.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col justify-center min-h-[300px] space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "var(--muted)" }}
        >
          <div
            className="w-8 h-8 rounded-md"
            style={{ background: "color-mix(in srgb, var(--muted-foreground) 20%, transparent)" }}
          />
        </div>
        <div>
          <h3 className="text-section-title">General Settings</h3>
          <p className="max-w-sm text-body text-muted-foreground mt-2">
            This section is under development. Please check back later for
            general configuration options.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Account Tab (placeholder) ─── */
function AccountTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-page-title">Account</h2>
        <p className="text-muted-foreground mt-2">
          Manage ownership and danger zone actions for this Innovation Hub.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col justify-center min-h-[300px] space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "var(--muted)" }}
        >
          <div
            className="w-8 h-8 rounded-md"
            style={{ background: "color-mix(in srgb, var(--muted-foreground) 20%, transparent)" }}
          />
        </div>
        <div>
          <h3 className="text-section-title">Account Settings</h3>
          <p className="max-w-sm text-body text-muted-foreground mt-2">
            This section is under development. Please check back later for
            account management options.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function InnovationHubSettingsPage() {
  const { slug, tab } = useParams<{ slug: string; tab: string }>();

  // Default to 'about' tab
  if (!tab) {
    return <Navigate to={`/innovation-hub/${slug}/settings/about`} replace />;
  }

  const tabs: { label: string; icon: typeof Info; id: TabId }[] = [
    { label: "About", icon: Info, id: "about" },
    { label: "Spaces", icon: Layers, id: "spaces" },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Sticky header with title + tabs */}
      <div className="sticky top-16 z-20 border-b border-border bg-card">
        <div className="px-6 md:px-8 pt-8 pb-0">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="w-12 h-12 rounded-full shrink-0 overflow-hidden"
                  style={{ border: "2px solid var(--border)" }}
                >
                  <img
                    src={HUB_DATA.bannerImage}
                    alt={HUB_DATA.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-page-title">{HUB_DATA.name}</h1>
                  <p className="text-muted-foreground text-body mt-0.5">
                    {HUB_DATA.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {tabs.map((item) => {
                  const isActive = tab === item.id;
                  return (
                    <Link
                      key={item.id}
                      to={`/innovation-hub/${slug}/settings/${item.id}`}
                      className={cn(
                        "flex items-center gap-2 pb-4 text-control border-b-2 transition-colors whitespace-nowrap",
                        isActive
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
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
              className="w-full min-h-[500px] p-6 md:p-8 shadow-sm"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              {tab === "about" ? (
                <AboutTab />
              ) : tab === "spaces" ? (
                <SpacesTab />
              ) : (
                <AboutTab />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
