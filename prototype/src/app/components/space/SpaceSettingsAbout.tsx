import { useState, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { Upload, X, Plus, Loader2, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for initial state
const INITIAL_DATA = {
  name: "Green Energy Space",
  what: "<h2>Green Energy Space</h2><p>This space is dedicated to exploring new technologies and sustainable solutions.</p>",
  why: "<p>We believe that collaboration is key to solving the world's biggest challenges.</p>",
  who: "<p>Engineers, Designers, and Product Managers who are passionate about the future.</p>",
  tags: ["Innovation", "Sustainability", "Tech"],
  references: [
    { title: "Company Vision 2030", url: "https://example.com/vision" },
    { title: "Design System Guidelines", url: "https://example.com/design" }
  ]
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

// ─── Inline save button — bottom-right, appears when dirty ───────────────────
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

export function SpaceSettingsAbout() {
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [savedData, setSavedData] = useState(INITIAL_DATA);
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

  const discardSection = (id: SectionId) => {
    setFormData(prev => ({ ...prev, [id]: (savedData as any)[id] }));
  };

  const handleQuillChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { title: "", url: "" }]
    }));
  };

  const updateReference = (index: number, field: "title" | "url", value: string) => {
    const newRefs = [...formData.references];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setFormData(prev => ({ ...prev, references: newRefs }));
  };

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: formData.references.filter((_, i) => i !== index)
    }));
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT COLUMN - CONTENT */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">About</h2>
          <p className="text-muted-foreground mt-2">
            Define your space's purpose, motivation, and target audience.
          </p>
        </div>

        <Separator />

        {/* ── Space Name ── */}
        <section>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Space Name</Label>
          <div className="mt-2 space-y-2">
            <div className="relative max-w-md">
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Green Energy Space"
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

        {/* ── Branding ── */}
        <section className="space-y-6">
          <h3 className="text-lg font-medium">Space Branding</h3>
          
          {/* Page Banner */}
          <div className="space-y-3">
            <Label>Page Banner (1536 x 256px)</Label>
            <div className="relative w-full h-48 rounded-xl overflow-hidden group border border-border bg-muted/50">
              <img 
                src="https://images.unsplash.com/photo-1632434722014-14ce152166cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBzaGFyZWQlMjB2aXNpb24lMjBnb2FscyUyMG1vZGVybiUyMGFydHxlbnwxfHx8fDE3Njk0Mzk2MTN8MA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Page Banner" 
                className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <Button variant="secondary" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" /> Change Banner
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Shown at the top of the Space and in Subspaces.</p>
          </div>

          {/* Card Banner */}
          <div className="space-y-3">
            <Label>Card Banner (416 x 256px)</Label>
            <div className="relative w-64 h-40 rounded-xl overflow-hidden group border border-border bg-muted/50">
              <img 
                src="https://images.unsplash.com/photo-1767258274212-bfe8c3ec50e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnNwaXJhdGlvbiUyMGJhbm5lciUyMGNyZWF0aXZlJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2OTQzOTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Card Banner" 
                className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <Button variant="secondary" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" /> Change
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Shown in search results and Space overviews.</p>
          </div>
        </section>

        <Separator />

        {/* ── What / Why / Who — Rich text sections ── */}
        {(["what", "why", "who"] as const).map((field) => {
          const labels: Record<string, { title: string; hint: string }> = {
            what: { title: "What", hint: "A clear description of the space's focus or subject matter." },
            why: { title: "Why", hint: "Why does this space exist? What problem does it solve?" },
            who: { title: "Who", hint: "Who should join this space? What are their roles or interests?" },
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
              <p className="text-xs text-muted-foreground">Tags help members discover your space.</p>
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
            {formData.references.map((ref, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="grid gap-2 flex-1 sm:grid-cols-2">
                  <Input 
                    placeholder="Link Title" 
                    value={ref.title}
                    onChange={(e) => updateReference(index, 'title', e.target.value)}
                    className="h-9"
                  />
                  <Input 
                    placeholder="URL (https://...)" 
                    value={ref.url}
                    onChange={(e) => updateReference(index, 'url', e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeReference(index)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
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

      {/* RIGHT COLUMN - PREVIEW */}
      <div className="hidden xl:block">
        <div className="sticky top-6 space-y-6">
          <div className="flex items-center justify-between mb-2">
             <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Preview</h3>
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

          {/* Preview Card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
             <div className="h-32 bg-muted relative">
               <img 
                 src="https://images.unsplash.com/photo-1767258274212-bfe8c3ec50e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnNwaXJhdGlvbiUyMGJhbm5lciUyMGNyZWF0aXZlJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2OTQzOTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080" 
                 alt="Preview" 
                 className="w-full h-full object-cover opacity-80"
               />
               <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm p-1.5 rounded-full text-white">
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
               </div>
             </div>
             <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                       {(formData.name || "Untitled").substring(0, 2).toUpperCase()}
                   </div>
                   <div>
                      <h4 className="font-semibold text-sm">{formData.name || "Untitled Space"}</h4>
                      <p className="text-xs text-muted-foreground">Last active just now</p>
                   </div>
                </div>
                
                <div className="space-y-1">
                   <p className="text-xs font-medium text-muted-foreground uppercase">What</p>
                   <div 
                     className="text-sm text-card-foreground line-clamp-3 prose prose-sm max-w-none"
                     dangerouslySetInnerHTML={{ __html: formData.what || "<p class='text-muted-foreground italic'>No description yet...</p>" }}
                   />
                </div>

                <div className="flex flex-wrap gap-1.5">
                   {formData.tags.length > 0 ? formData.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-secondary px-2 py-0.5 rounded text-[10px] text-secondary-foreground">{tag}</span>
                   )) : (
                      <span className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground">No Tags</span>
                   )}
                   {formData.tags.length > 3 && (
                      <span className="bg-muted px-2 py-0.5 rounded text-[10px] text-muted-foreground">+{formData.tags.length - 3}</span>
                   )}
                </div>
             </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-xs text-primary/80 space-y-2">
             <p className="font-semibold flex items-center gap-2">
                <InfoIcon className="w-3.5 h-3.5" />
                Live Preview
             </p>
             <p>This preview shows how your space card will appear in the "Explore Spaces" directory.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  )
}
