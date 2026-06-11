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
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Separator } from "@/app/components/ui/separator";
import { MarkdownEditor } from "@/app/components/ui/markdown-editor";
import { X, ImageIcon, GripVertical, Package, Layers, Settings2, ChevronLeft } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface CreateTemplatePackDialogV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TemplateItem {
  id: string;
  name: string;
  type: string;
  description: string;
}

const AVAILABLE_TEMPLATES: TemplateItem[] = [
  { id: "t1", name: "Challenge Space", type: "Space", description: "Template for running innovation challenges" },
  { id: "t2", name: "Project Workspace", type: "Space", description: "Structured workspace for project teams" },
  { id: "t3", name: "Weekly Update", type: "Post", description: "Standard format for weekly progress updates" },
  { id: "t4", name: "Brainstorm Session", type: "Whiteboard", description: "Canvas layout for collaborative brainstorming" },
  { id: "t5", name: "Decision Log", type: "Post", description: "Template for recording decisions and rationale" },
  { id: "t6", name: "Feedback Collection", type: "Callout", description: "Gather structured feedback from participants" },
  { id: "t7", name: "Sprint Retrospective", type: "Whiteboard", description: "Retro board with columns for what went well/improve" },
  { id: "t8", name: "Community Space", type: "Space", description: "Open space for community engagement" },
];

export function CreateTemplatePackDialogV2({
  open,
  onOpenChange,
}: CreateTemplatePackDialogV2Props) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Pack Identity
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Step 2: Add Templates
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateItem[]>([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Step 3: Publish Settings
  const [visibility, setVisibility] = useState("listed");
  const [providerName, setProviderName] = useState("");
  const [references, setReferences] = useState<string[]>([]);
  const [currentRef, setCurrentRef] = useState("");

  const steps = [
    { label: "Pack Identity", icon: Package, description: "Name and describe your pack" },
    { label: "Add Templates", icon: Layers, description: "Choose what to include" },
    { label: "Publish Settings", icon: Settings2, description: "Configure visibility" },
  ];

  const isValid = name.trim().length > 0;

  const handleClose = () => onOpenChange(false);

  const handleCreate = () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      handleClose();
      toast.success(`Template Pack "${name}" created successfully`);
      navigate(`/templates/packs/${slug}/settings`);
    }, 1500);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const goToStep = (step: number) => setCurrentStep(step);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRefKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentRef.trim()) {
      e.preventDefault();
      if (!references.includes(currentRef.trim())) setReferences([...references, currentRef.trim()]);
      setCurrentRef("");
    }
  };

  const toggleTemplate = (template: TemplateItem) => {
    const exists = selectedTemplates.some((t) => t.id === template.id);
    if (exists) {
      setSelectedTemplates(selectedTemplates.filter((t) => t.id !== template.id));
    } else {
      setSelectedTemplates([...selectedTemplates, template]);
    }
  };

  const removeTemplate = (id: string) => {
    setSelectedTemplates(selectedTemplates.filter((t) => t.id !== id));
  };

  const moveTemplate = (index: number, direction: number) => {
    const newList = [...selectedTemplates];
    const target = index + direction;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target], newList[index]];
    setSelectedTemplates(newList);
  };

  const filteredTemplates = AVAILABLE_TEMPLATES.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesType = typeFilter === "all" || t.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>*]:min-w-0">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
          <DialogTitle className="text-section-title">Create Template Pack</DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Bundle templates together for others to discover and use.
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
            <StepPackIdentity
              name={name} setName={setName}
              description={description} setDescription={setDescription}
              tags={tags} setTags={setTags}
              currentTag={currentTag} setCurrentTag={setCurrentTag}
              handleTagKeyDown={handleTagKeyDown}
              coverImage={coverImage} setCoverImage={setCoverImage}
            />
          )}
          {currentStep === 1 && (
            <StepAddTemplates
              selectedTemplates={selectedTemplates}
              toggleTemplate={toggleTemplate}
              removeTemplate={removeTemplate}
              moveTemplate={moveTemplate}
              templateSearch={templateSearch} setTemplateSearch={setTemplateSearch}
              typeFilter={typeFilter} setTypeFilter={setTypeFilter}
              filteredTemplates={filteredTemplates}
            />
          )}
          {currentStep === 2 && (
            <StepPublishSettings
              visibility={visibility} setVisibility={setVisibility}
              providerName={providerName} setProviderName={setProviderName}
              references={references} setReferences={setReferences}
              currentRef={currentRef} setCurrentRef={setCurrentRef}
              handleRefKeyDown={handleRefKeyDown}
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
                  "Create Pack"
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

/* ─── Step 1: Pack Identity ─── */

function StepPackIdentity({
  name, setName,
  description, setDescription,
  tags, setTags,
  currentTag, setCurrentTag,
  handleTagKeyDown,
  coverImage, setCoverImage,
}: {
  name: string; setName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  tags: string[]; setTags: (v: string[]) => void;
  currentTag: string; setCurrentTag: (v: string) => void;
  handleTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  coverImage: string | null; setCoverImage: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="e.g. Innovation Workshop Kit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <p className="text-caption text-muted-foreground">Give your template pack a clear name</p>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Description</Label>
        <MarkdownEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe what templates are included and when to use them..."
          minHeight="100px"
        />
        <p className="text-caption text-muted-foreground">Helps others understand the purpose of this pack</p>
      </div>

      {/* Tags + Cover side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <p className="text-caption text-muted-foreground">Help others find your pack</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-body-emphasis">Cover Image</Label>
          <div
            className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={() => setCoverImage(coverImage ? null : "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop")}
          >
            {coverImage ? (
              <img src={coverImage} alt="Cover" className="max-h-20 rounded object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImageIcon className="w-6 h-6" />
                <span className="text-caption">Click to upload</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
              {coverImage ? "Change" : "Upload Image"}
            </Button>
          </div>
          <p className="text-caption text-muted-foreground">Displayed in the template library</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Add Templates ─── */

function StepAddTemplates({
  selectedTemplates,
  toggleTemplate,
  removeTemplate,
  moveTemplate,
  templateSearch, setTemplateSearch,
  typeFilter, setTypeFilter,
  filteredTemplates,
}: {
  selectedTemplates: TemplateItem[];
  toggleTemplate: (t: TemplateItem) => void;
  removeTemplate: (id: string) => void;
  moveTemplate: (index: number, direction: number) => void;
  templateSearch: string; setTemplateSearch: (v: string) => void;
  typeFilter: string; setTypeFilter: (v: string) => void;
  filteredTemplates: TemplateItem[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header with count */}
      <div>
        <Label className="text-body-emphasis">Templates</Label>
        <p className="text-caption text-muted-foreground mt-0.5">
          {selectedTemplates.length === 0
            ? "Add templates to your pack (optional)"
            : `${selectedTemplates.length} template${selectedTemplates.length > 1 ? "s" : ""} selected`}
        </p>
      </div>

      {/* Selected templates */}
      {selectedTemplates.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label className="text-caption text-muted-foreground">Display Order</Label>
          <div className="flex flex-col gap-1.5">
            {selectedTemplates.map((template, i) => (
              <div key={template.id} className="flex items-center gap-2 p-2 border rounded-lg">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab" />
                <div className="flex-1 min-w-0">
                  <p className="text-body-emphasis truncate">{template.name}</p>
                </div>
                <Badge variant="outline" className="shrink-0">{template.type}</Badge>
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => moveTemplate(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => moveTemplate(i, 1)}
                    disabled={i === selectedTemplates.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => removeTemplate(template.id)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Search and filter */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search templates..."
          value={templateSearch}
          onChange={(e) => setTemplateSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="space">Space</SelectItem>
            <SelectItem value="post">Post</SelectItem>
            <SelectItem value="whiteboard">Whiteboard</SelectItem>
            <SelectItem value="callout">Callout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Available templates */}
      <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplates.some((t) => t.id === template.id);
          return (
            <div
              key={template.id}
              className={cn(
                "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                isSelected ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
              )}
              onClick={() => toggleTemplate(template)}
            >
              <Checkbox checked={isSelected} />
              <div className="flex-1 min-w-0">
                <p className="text-body-emphasis truncate">{template.name}</p>
                <p className="text-caption text-muted-foreground truncate">{template.description}</p>
              </div>
              <Badge variant="outline" className="shrink-0">{template.type}</Badge>
            </div>
          );
        })}
        {filteredTemplates.length === 0 && (
          <p className="text-caption text-muted-foreground text-center py-4">
            No templates found matching your search
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Step 3: Publish Settings ─── */

function StepPublishSettings({
  visibility, setVisibility,
  providerName, setProviderName,
  references, setReferences,
  currentRef, setCurrentRef,
  handleRefKeyDown,
}: {
  visibility: string; setVisibility: (v: string) => void;
  providerName: string; setProviderName: (v: string) => void;
  references: string[]; setReferences: (v: string[]) => void;
  currentRef: string; setCurrentRef: (v: string) => void;
  handleRefKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Visibility */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">Visibility</Label>
        <RadioGroup value={visibility} onValueChange={setVisibility} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="listed" id="vis-listed" />
            <Label htmlFor="vis-listed" className="text-body cursor-pointer">
              Listed — visible in the template library
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="private" id="vis-private" />
            <Label htmlFor="vis-private" className="text-body cursor-pointer">
              Private — only you can see this pack
            </Label>
          </div>
        </RadioGroup>
        <p className="text-caption text-muted-foreground">You can change this later in Settings</p>
      </div>

      <Separator />

      {/* Provider Name */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Provider Name</Label>
        <Input
          placeholder="e.g. Your Organization Name"
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
        />
        <p className="text-caption text-muted-foreground">Shown as the author of this template pack</p>
      </div>

      <Separator />

      {/* References */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">References</Label>
        <p className="text-caption text-muted-foreground">Add links to documentation or resources</p>
        {references.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-1">
            {references.map((ref, i) => (
              <Badge key={i} variant="outline" className="flex items-center gap-1 w-fit max-w-full">
                <span className="truncate">{ref}</span>
                <button onClick={() => setReferences(references.filter((_, idx) => idx !== i))} className="hover:text-destructive shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Input
          value={currentRef}
          onChange={(e) => setCurrentRef(e.target.value)}
          onKeyDown={handleRefKeyDown}
          placeholder="https://docs.example.com"
        />
      </div>
    </div>
  );
}
