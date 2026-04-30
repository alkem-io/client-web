import { useState, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { Upload, X, Plus, Loader2, Check, Pencil, Info as InfoIcon, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubspaceSettingsAboutProps {
  subspaceName: string;
  initials: string;
  avatarColor: string;
  parentInitials: string;
  parentAvatarColor: string;
  memberCount: number;
  tags?: string[];
}

const INITIAL_DATA = {
  name: "",
  what: "<p>This subspace focuses on developing strategies and practical solutions for this challenge area.</p>",
  why: "<p>Because collaboration across disciplines is essential to make real progress on this challenge.</p>",
  who: "<p>Subject matter experts, practitioners, and anyone passionate about contributing to this challenge.</p>",
  tags: ["Innovation", "Collaboration"],
  references: [
    { title: "Challenge Brief", url: "https://example.com/brief" },
  ],
};

// ─── Per-section save status ─────────────────────────────────────────────────
type SectionId = "name" | "branding" | "what" | "why" | "who" | "tags" | "references";
type SaveStatus = "idle" | "saving" | "saved";

function useSectionSave() {
  const [statuses, setStatuses] = useState<Record<SectionId, SaveStatus>>({
    name: "idle", branding: "idle", what: "idle", why: "idle",
    who: "idle", tags: "idle", references: "idle",
  });

  const save = useCallback((id: SectionId, onCommit: () => void) => {
    setStatuses(s => ({ ...s, [id]: "saving" }));
    setTimeout(() => {
      onCommit();
      setStatuses(s => ({ ...s, [id]: "saved" }));
      setTimeout(() => setStatuses(s => ({ ...s, [id]: "idle" })), 1800);
    }, 600);
  }, []);

  return { statuses, save };
}

// ─── Inline save button — appears when dirty ───────────────────
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
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 animate-in fade-in slide-in-from-left-1 duration-200">
        <Check className="w-3 h-3" /> Saved
      </span>
    );
  }
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
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
      className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 animate-in fade-in slide-in-from-left-1 duration-200"
    >
      Save
    </Button>
  );
}

// ─── Subtle pencil icon — decorative indicator inside editable fields ─────────
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

export function SubspaceSettingsAbout({
  subspaceName,
  initials,
  avatarColor,
  parentInitials,
  parentAvatarColor,
  memberCount,
}: SubspaceSettingsAboutProps) {
  const initialFormData = { ...INITIAL_DATA, name: subspaceName };
  const [formData, setFormData] = useState(initialFormData);
  const [savedData, setSavedData] = useState(initialFormData);
  const [tagInput, setTagInput] = useState("");
  const { statuses, save } = useSectionSave();

  // ─── Per-field dirty checks ────────────────────────────────────────────────
  const dirty = {
    name: formData.name !== savedData.name,
    branding: false,
    what: formData.what !== savedData.what,
    why: formData.why !== savedData.why,
    who: formData.who !== savedData.who,
    tags: JSON.stringify(formData.tags) !== JSON.stringify(savedData.tags),
    references: JSON.stringify(formData.references) !== JSON.stringify(savedData.references),
  };

  const saveSection = (id: SectionId) => {
    save(id, () => {
      setSavedData(prev => ({ ...prev, [id]: (formData as any)[id] }));
    });
  };

  const handleQuillChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addReference = () => {
    setFormData((prev) => ({
      ...prev,
      references: [...prev.references, { title: "", url: "" }],
    }));
  };

  const updateReference = (index: number, field: "title" | "url", value: string) => {
    const newRefs = [...formData.references];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setFormData((prev) => ({ ...prev, references: newRefs }));
  };

  const removeReference = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index),
    }));
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT — CONTENT */}
      <div className="xl:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">About</h2>
          <p className="text-muted-foreground mt-2">
            Define this subspace's purpose, motivation, and target audience.
          </p>
        </div>

        <Separator />

        {/* ── Subspace Name ── */}
        <section>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Subspace Name</Label>
          <div className="mt-2 space-y-2">
            <div className="relative max-w-md">
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Renewable Energy Transition"
                className="pr-8"
              />
              <EditPencil className="absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <InlineSaveButton dirty={dirty.name} status={statuses.name} onSave={() => saveSection("name")} />
            </div>
          </div>
        </section>

        <Separator />

        {/* Branding */}
        <section className="space-y-6">
          <h3 className="text-lg font-medium">Subspace Branding</h3>

          {/* Avatar */}
          <div className="space-y-3">
            <div className="flex items-start gap-5">
              <div className="relative group shrink-0">
                <div
                  className="w-[140px] h-[140px] rounded-xl overflow-hidden flex items-center justify-center"
                  style={{
                    background: avatarColor,
                    border: "2px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 700,
                      color: "#fff",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {initials}
                  </span>
                </div>
                <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-7 px-2">
                    <Upload className="w-3.5 h-3.5" /> Change
                  </Button>
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <Label className="text-base font-medium">Avatar</Label>
                <p className="text-xs text-muted-foreground">
                  Resolution: 410 width × 410 height (pixels)
                </p>
              </div>
            </div>
          </div>

          {/* Card Banner */}
          <div className="space-y-3">
            <div className="flex items-start gap-5">
              <div className="relative w-[200px] h-[125px] rounded-xl overflow-hidden group border border-border bg-muted/50 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjaGFsbGVuZ2UlMjBjcmVhdGl2ZSUyMHdvcmtzaG9wJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBpbm5vdmF0aW9uJTIwc3ByaW50JTIwZGVzaWduJTIwc3ByaW50fGVufDF8fHx8MTc2OTA5NDMxMHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Card Banner"
                  className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-7 px-2">
                    <Upload className="w-3.5 h-3.5" /> Change
                  </Button>
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <Label className="text-base font-medium">Card Banner</Label>
                <p className="text-xs text-muted-foreground">
                  Resolution: 410 width × 256 height (pixels)
                </p>
                <p className="text-xs text-muted-foreground">
                  Shown in search results and Space overviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* ── What / Why / Who — Rich text sections ── */}
        {(["what", "why", "who"] as const).map((field) => {
          const labels: Record<string, { title: string; hint: string }> = {
            what: { title: "What", hint: "A clear description of the subspace's focus or subject matter." },
            why: { title: "Why", hint: "Why does this subspace exist? What problem does it solve?" },
            who: { title: "Who", hint: "Who should join this subspace? What are their roles or interests?" },
          };
          const { title, hint } = labels[field];
          const htmlContent = formData[field] as string;

          return (
            <section key={field} className="space-y-1">
              <Label className="text-base font-semibold">{title}</Label>

              <div className="space-y-2">
                <div className="prose-editor">
                  <ReactQuill
                    theme="snow"
                    value={htmlContent}
                    onChange={(val) => handleQuillChange(field, val)}
                    modules={quillModules}
                    placeholder={hint}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{hint}</p>
                  <InlineSaveButton dirty={dirty[field]} status={statuses[field]} onSave={() => saveSection(field as SectionId)} />
                </div>
              </div>
              {field !== "who" && <Separator className="mt-6" />}
            </section>
          );
        })}

        <Separator />

        {/* ── Tags ── */}
        <section>
          <Label>Tags</Label>

          <div className="mt-2 space-y-2">
            <div className="relative flex flex-wrap gap-2 p-3 pr-8 bg-background border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 min-h-[50px]">
              <EditPencil className="absolute right-2.5 top-3" />
              {formData.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px]"
                placeholder="Type a tag and press Enter…"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Tags help members discover your subspace.</p>
              <InlineSaveButton dirty={dirty.tags} status={statuses.tags} onSave={() => saveSection("tags")} />
            </div>
          </div>
        </section>

        <Separator />

        {/* ── References ── */}
        <section>
          <div className="flex items-center justify-between">
            <Label>References & Links</Label>
            <Button variant="outline" size="sm" onClick={addReference} className="gap-1 h-7 text-xs">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>

          <div className="mt-3 space-y-3">
            {formData.references.map((ref, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="grid gap-2 flex-1 sm:grid-cols-2">
                  <Input
                    placeholder="Link Title"
                    value={ref.title}
                    onChange={(e) => updateReference(i, "title", e.target.value)}
                    className="h-9"
                  />
                  <Input
                    placeholder="URL (https://...)"
                    value={ref.url}
                    onChange={(e) => updateReference(i, "url", e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeReference(i)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {formData.references.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No references added yet. Click "Add" above.</p>
            )}
            <div className="flex items-center justify-end gap-2">
              <InlineSaveButton dirty={dirty.references} status={statuses.references} onSave={() => saveSection("references")} />
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN — PREVIEW */}
      <div className="hidden xl:block">
        <div className="sticky top-6 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Preview
            </h3>
            {Object.values(dirty).some(Boolean) ? (
              <span className="text-xs text-amber-500 flex items-center gap-1.5">
                Unsaved changes
              </span>
            ) : Object.values(statuses).some(s => s === "saved") ? (
              <span className="text-xs text-success flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Saved
              </span>
            ) : null}
          </div>

          {/* Subspace Card Preview */}
          <div
            className="bg-card border border-border rounded-xl shadow-sm"
          >
            {/* Card banner */}
            <div className="h-28 relative bg-muted rounded-t-xl overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${avatarColor}44 0%, ${parentAvatarColor}44 100%)`,
                }}
              />
            </div>

            {/* Two-layered avatar — overlaps banner, NOT clipped */}
            <div className="relative px-4" style={{ height: 0 }}>
              <div className="absolute bottom-0 left-4" style={{ width: 48, height: 48 }}>
                {/* Parent (behind, top-left) */}
                <div
                  className="absolute top-0 left-0 flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    border: "2px solid var(--card)",
                    background: parentAvatarColor,
                    zIndex: 1,
                  }}
                >
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: "'Inter', sans-serif" }}>
                    {parentInitials}
                  </span>
                </div>
                {/* Subspace (front, bottom-right) */}
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    width: 38,
                    height: 38,
                    top: 10,
                    left: 10,
                    borderRadius: 8,
                    border: "2px solid var(--card)",
                    background: avatarColor,
                    zIndex: 2,
                    boxShadow: "0 1px 3px rgba(0,0,0,.12)",
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'Inter', sans-serif" }}>
                    {initials}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-8 space-y-3">
              <div>
                <h4 className="font-semibold text-sm">
                  {formData.name || "Untitled Subspace"}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">Last active just now</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">What</p>
                <div
                  className="text-sm text-card-foreground line-clamp-3 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      formData.what ||
                      "<p class='text-muted-foreground italic'>No description yet…</p>",
                  }}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {formData.tags.length > 0 ? (
                  formData.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-secondary px-2 py-0.5 rounded text-[10px] text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground">
                    No Tags
                  </span>
                )}
                {formData.tags.length > 3 && (
                  <span className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground">
                    +{formData.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Members */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Users className="w-3.5 h-3.5" />
                <span>{memberCount} members</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-4 text-xs space-y-2"
            style={{
              background: "color-mix(in srgb, var(--primary) 5%, transparent)",
              border: "1px solid color-mix(in srgb, var(--primary) 10%, transparent)",
              color: "color-mix(in srgb, var(--primary) 80%, var(--foreground))",
            }}
          >
            <p className="font-semibold flex items-center gap-2">
              <InfoIcon className="w-3.5 h-3.5" />
              Live Preview
            </p>
            <p>
              This preview shows how this subspace card will appear in space
              overviews and search results.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
