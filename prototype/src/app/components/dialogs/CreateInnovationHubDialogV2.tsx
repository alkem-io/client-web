import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Separator } from "@/app/components/ui/separator";
import { MarkdownEditor } from "@/app/components/ui/markdown-editor";
import { X, ImageIcon, GripVertical, Globe2, Palette, LayoutGrid, ChevronLeft } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface CreateInnovationHubDialogV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SpaceItem {
  id: string;
  name: string;
  host: string;
  visibility: "public" | "private";
}

const HOSTED_SPACES: SpaceItem[] = [
  { id: "s1", name: "Climate Action Hub", host: "Alkemio Foundation", visibility: "public" },
  { id: "s2", name: "Innovation Workshop", host: "Alkemio Foundation", visibility: "public" },
  { id: "s3", name: "Product Development", host: "Tech Corp", visibility: "private" },
  { id: "s4", name: "Research Network", host: "Alkemio Foundation", visibility: "public" },
  { id: "s5", name: "Design Challenge", host: "Creative Studio", visibility: "public" },
  { id: "s6", name: "Internal Strategy", host: "Tech Corp", visibility: "private" },
];

export function CreateInnovationHubDialogV2({
  open,
  onOpenChange,
}: CreateInnovationHubDialogV2Props) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Hub Identity
  const [subdomain, setSubdomain] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Branding
  const [banner, setBanner] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // Step 3: Curate Spaces
  const [selectedSpaces, setSelectedSpaces] = useState<SpaceItem[]>([]);

  const steps = [
    { label: "Hub Identity", icon: Globe2, description: "Set your subdomain and name" },
    { label: "Branding", icon: Palette, description: "Add visuals and tags" },
    { label: "Curate Spaces", icon: LayoutGrid, description: "Choose spaces to feature" },
  ];

  const isValid = subdomain.trim().length > 0 && name.trim().length > 0;

  const handleClose = () => onOpenChange(false);

  const handleCreate = () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const slug = subdomain || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      handleClose();
      toast.success(`Innovation Hub "${name}" created successfully`);
      navigate(`/innovation-hub/${slug}/settings`);
    }, 1500);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const goToStep = (step: number) => setCurrentStep(step);

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-/, "");
    setSubdomain(formatted);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const addSpace = (space: SpaceItem) => {
    if (!selectedSpaces.some((s) => s.id === space.id)) {
      setSelectedSpaces([...selectedSpaces, space]);
    }
  };

  const removeSpace = (id: string) => {
    setSelectedSpaces(selectedSpaces.filter((s) => s.id !== id));
  };

  const moveSpace = (index: number, direction: number) => {
    const newList = [...selectedSpaces];
    const target = index + direction;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target], newList[index]];
    setSelectedSpaces(newList);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>*]:min-w-0">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
          <DialogTitle className="text-section-title">Create Innovation Hub</DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Launch a branded landing page showcasing your spaces.
          </DialogDescription>
          {/* Step indicator bar */}
          <div className="flex items-center gap-1 mt-3">
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all duration-300",
                  i === currentStep
                    ? "bg-primary"
                    : i < currentStep
                    ? "bg-primary/40"
                    : "bg-muted"
                )}
                aria-label={`Go to step ${i + 1}: ${step.label}`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Step title card */}
          <div className="px-6 py-3 bg-muted/30 border-b flex items-center gap-3">
            {(() => {
              const StepIcon = steps[currentStep].icon;
              return <StepIcon className="w-4 h-4 text-primary" />;
            })()}
            <div>
              <p className="text-body-emphasis">{steps[currentStep].label}</p>
              <p className="text-caption text-muted-foreground">{steps[currentStep].description}</p>
            </div>
            <div className="ml-auto text-caption text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-4">
          {currentStep === 0 && (
            <StepHubIdentity
              subdomain={subdomain} handleSubdomainChange={handleSubdomainChange}
              name={name} setName={setName}
              tagline={tagline} setTagline={setTagline}
              description={description} setDescription={setDescription}
            />
          )}
          {currentStep === 1 && (
            <StepBranding
              banner={banner} setBanner={setBanner}
              logo={logo} setLogo={setLogo}
              tags={tags} setTags={setTags}
              currentTag={currentTag} setCurrentTag={setCurrentTag}
              handleTagKeyDown={handleTagKeyDown}
            />
          )}
          {currentStep === 2 && (
            <StepCurateSpaces
              selectedSpaces={selectedSpaces}
              addSpace={addSpace}
              removeSpace={removeSpace}
              moveSpace={moveSpace}
              availableSpaces={HOSTED_SPACES}
            />
          )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <Button variant="ghost" size="sm" className="gap-1 px-2" onClick={() => setCurrentStep(currentStep - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
              )}
              <div className="flex items-center gap-2">
                {steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => goToStep(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i === currentStep
                        ? "bg-primary scale-125"
                        : i < currentStep
                        ? "bg-primary/50"
                        : "bg-muted-foreground/25"
                    )}
                    aria-label={`Step ${i + 1}: ${step.label}`}
                  />
                ))}
              </div>
              {currentStep > 0 && (
                <button
                  onClick={currentStep < steps.length - 1 ? nextStep : undefined}
                  className="text-caption text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Skip this step
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button
                variant={currentStep === steps.length - 1 ? "default" : "secondary"}
                onClick={handleCreate}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create Hub"
                )}
              </Button>
              {currentStep < steps.length - 1 && (
                <Button onClick={nextStep}>Next →</Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Step 1: Hub Identity ─── */

function StepHubIdentity({
  subdomain, handleSubdomainChange,
  name, setName,
  tagline, setTagline,
  description, setDescription,
}: {
  subdomain: string; handleSubdomainChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string; setName: (v: string) => void;
  tagline: string; setTagline: (v: string) => void;
  description: string; setDescription: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Subdomain */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">
          Subdomain <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center">
          <Input
            value={subdomain}
            onChange={handleSubdomainChange}
            placeholder="my-hub"
            className="rounded-r-none border-r-0"
            autoFocus
          />
          <span className="inline-flex items-center px-3 h-9 border border-l-0 rounded-r-md bg-muted text-caption text-muted-foreground whitespace-nowrap">
            .alkem.io
          </span>
        </div>
        {subdomain && (
          <p className="text-caption text-muted-foreground" aria-live="polite">
            Your hub will be available at <span className="text-body-emphasis">{subdomain}.alkem.io</span>
          </p>
        )}
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="e.g. Innovation Lab"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="text-caption text-muted-foreground">The display name shown to visitors</p>
      </div>

      {/* Tagline */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Tagline</Label>
        <Input
          placeholder="A short headline for your hub"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <p className="text-caption text-muted-foreground">Shown below the hub name on the landing page</p>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Description</Label>
        <MarkdownEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe what this hub is about..."
          minHeight="100px"
        />
        <p className="text-caption text-muted-foreground">Helps visitors understand the purpose of your hub</p>
      </div>
    </div>
  );
}

/* ─── Step 2: Branding ─── */

function StepBranding({
  banner, setBanner,
  logo, setLogo,
  tags, setTags,
  currentTag, setCurrentTag,
  handleTagKeyDown,
}: {
  banner: string | null; setBanner: (v: string | null) => void;
  logo: string | null; setLogo: (v: string | null) => void;
  tags: string[]; setTags: (v: string[]) => void;
  currentTag: string; setCurrentTag: (v: string) => void;
  handleTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Banner (full width, taller) */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Banner Image</Label>
        <div
          className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 min-h-[160px] cursor-pointer hover:border-muted-foreground/50 transition-colors"
          onClick={() => setBanner(banner ? null : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=300&fit=crop")}
        >
          {banner ? (
            <img src={banner} alt="Banner" className="max-h-24 w-full rounded object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageIcon className="w-8 h-8" />
              <span className="text-caption">Click to upload a wide banner image</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
            {banner ? "Change" : "Upload Banner"}
          </Button>
        </div>
        <p className="text-caption text-muted-foreground">Displayed at the top of your hub landing page</p>
      </div>

      {/* Logo + Tags side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-body-emphasis">Logo</Label>
          <div
            className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={() => setLogo(logo ? null : "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop")}
          >
            {logo ? (
              <img src={logo} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImageIcon className="w-6 h-6" />
                <span className="text-caption">Click to upload</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
              {logo ? "Change" : "Upload Logo"}
            </Button>
          </div>
          <p className="text-caption text-muted-foreground">Your hub's icon in navigation</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-body-emphasis">Tags</Label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <Input
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type a tag and press Enter"
          />
          <p className="text-caption text-muted-foreground">Help people discover your hub</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Curate Spaces ─── */

function StepCurateSpaces({
  selectedSpaces,
  addSpace,
  removeSpace,
  moveSpace,
  availableSpaces,
}: {
  selectedSpaces: SpaceItem[];
  addSpace: (s: SpaceItem) => void;
  removeSpace: (id: string) => void;
  moveSpace: (index: number, direction: number) => void;
  availableSpaces: SpaceItem[];
}) {
  const unselected = availableSpaces.filter(
    (s) => !selectedSpaces.some((sel) => sel.id === s.id)
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <Label className="text-body-emphasis">Featured Spaces</Label>
        <p className="text-caption text-muted-foreground mt-0.5">
          {selectedSpaces.length === 0
            ? "Select spaces to showcase on your hub (optional)"
            : `${selectedSpaces.length} space${selectedSpaces.length > 1 ? "s" : ""} selected`}
        </p>
      </div>

      {/* Selected spaces (reorderable) */}
      {selectedSpaces.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label className="text-caption text-muted-foreground">Display Order</Label>
          {selectedSpaces.map((space, i) => (
            <div key={space.id} className="flex items-center gap-2 p-2 border rounded-lg">
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab" />
              <div className="flex-1 min-w-0">
                <p className="text-body-emphasis truncate">{space.name}</p>
                <p className="text-caption text-muted-foreground">{space.host}</p>
              </div>
              <Badge variant="outline" className="shrink-0">{space.visibility}</Badge>
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => moveSpace(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => moveSpace(i, 1)}
                  disabled={i === selectedSpaces.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => removeSpace(space.id)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Available spaces */}
      <div className="flex flex-col gap-2">
        <Label className="text-caption text-muted-foreground">Available Spaces</Label>
        <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
          {unselected.map((space) => (
            <div
              key={space.id}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => addSpace(space)}
            >
              <Checkbox checked={false} />
              <div className="flex-1 min-w-0">
                <p className="text-body-emphasis truncate">{space.name}</p>
                <p className="text-caption text-muted-foreground">{space.host}</p>
              </div>
              <Badge variant="outline" className="shrink-0">{space.visibility}</Badge>
            </div>
          ))}
          {unselected.length === 0 && (
            <p className="text-caption text-muted-foreground text-center py-4">
              All your spaces are already selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
