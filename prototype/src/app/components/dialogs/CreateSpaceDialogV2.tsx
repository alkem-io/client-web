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
import { Separator } from "@/app/components/ui/separator";
import { MarkdownEditor } from "@/app/components/ui/markdown-editor";
import { X, ImageIcon, ChevronLeft, Sparkles, Palette, Users, Globe, Lock, UserPlus, BookOpen } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface CreateSpaceDialogV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpaceDialogV2({
  open,
  onOpenChange,
}: CreateSpaceDialogV2Props) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Identity
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("blank");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Branding & Discovery
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  // Step 3: Purpose & Context
  const [why, setWhy] = useState("");
  const [who, setWho] = useState("");

  // Step 4: Access & Members
  const [visibility, setVisibility] = useState("public");
  const [membershipMode, setMembershipMode] = useState("open");
  const [invitees, setInvitees] = useState<string[]>([]);
  const [currentInvitee, setCurrentInvitee] = useState("");

  const steps = [
    { label: "Identity", icon: Sparkles, description: "Name your space", optional: false },
    { label: "Branding", icon: Palette, description: "Make it yours", optional: true },
    { label: "Purpose", icon: BookOpen, description: "Why & who", optional: true },
    { label: "Access", icon: Users, description: "Set who can join", optional: true },
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
      toast.success(`Space "${name}" created successfully`);
      navigate(`/space/${slug}`);
    }, 1500);
  };

  const nextStep = () => {
    if (!isValid) return;
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const goToStep = (step: number) => {
    // Can only advance past step 0 if name is filled
    if (step > 0 && !isValid) return;
    setCurrentStep(step);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleInviteeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentInvitee.trim()) {
      e.preventDefault();
      if (!invitees.includes(currentInvitee.trim())) setInvitees([...invitees, currentInvitee.trim()]);
      setCurrentInvitee("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>*]:min-w-0">
        {/* Header with step indicator */}
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
          <DialogTitle className="text-section-title">Create new Space</DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Set up a new collaborative space on the platform.
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
            {steps[currentStep].optional && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">Optional</Badge>
            )}
            <div className="ml-auto text-caption text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          <div className="px-6 py-5 flex flex-col gap-5">
            {currentStep === 0 && (
              <StepIdentity
                name={name} setName={setName}
                template={template} setTemplate={setTemplate}
                tagline={tagline} setTagline={setTagline}
                description={description} setDescription={setDescription}
              />
            )}
            {currentStep === 1 && (
              <StepBranding
                tags={tags} setTags={setTags}
                currentTag={currentTag} setCurrentTag={setCurrentTag}
                handleTagKeyDown={handleTagKeyDown}
                avatar={avatar} setAvatar={setAvatar}
                banner={banner} setBanner={setBanner}
              />
            )}
            {currentStep === 2 && (
              <StepPurpose
                why={why} setWhy={setWhy}
                who={who} setWho={setWho}
              />
            )}
            {currentStep === 3 && (
              <StepAccess
                visibility={visibility} setVisibility={setVisibility}
                membershipMode={membershipMode} setMembershipMode={setMembershipMode}
                invitees={invitees} setInvitees={setInvitees}
                currentInvitee={currentInvitee} setCurrentInvitee={setCurrentInvitee}
                handleInviteeKeyDown={handleInviteeKeyDown}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between w-full">
            {/* Left: Back + Step dots + skip */}
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

            {/* Right: Actions */}
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
                  "Create Space"
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

/* ═══════════════════════════════════════════════════════════════════════════════
   Step 1: Identity
   ═══════════════════════════════════════════════════════════════════════════════ */

function StepIdentity({
  name, setName,
  template, setTemplate,
  tagline, setTagline,
  description, setDescription,
}: {
  name: string; setName: (v: string) => void;
  template: string; setTemplate: (v: string) => void;
  tagline: string; setTagline: (v: string) => void;
  description: string; setDescription: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Name — hero field with prominent styling */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="e.g. Climate Action Hub"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="h-11 text-base"
        />
        <p className="text-caption text-muted-foreground">
          Give your space a clear, descriptive name
        </p>
      </div>

      {/* Template selector — card-style */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">Template</Label>
        <Select value={template} onValueChange={setTemplate}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Start from scratch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blank">Start from scratch</SelectItem>
            <SelectItem value="challenge">Challenge</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="community">Community</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-caption text-muted-foreground">
          Pick a template to pre-fill content, or start from scratch
        </p>
      </div>

      {/* Tagline */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">Tagline</Label>
        <Input
          placeholder="A short one-line summary"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <p className="text-caption text-muted-foreground">
          Shown on space cards throughout the platform
        </p>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">Description</Label>
        <MarkdownEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe what this space is about..."
          minHeight="100px"
        />
        <p className="text-caption text-muted-foreground">
          Rich text — supports headings, links, and lists
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Step 2: Branding & Discovery
   ═══════════════════════════════════════════════════════════════════════════════ */

function StepBranding({
  tags, setTags,
  currentTag, setCurrentTag,
  handleTagKeyDown,
  avatar, setAvatar,
  banner, setBanner,
}: {
  tags: string[]; setTags: (v: string[]) => void;
  currentTag: string; setCurrentTag: (v: string) => void;
  handleTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  avatar: string | null; setAvatar: (v: string | null) => void;
  banner: string | null; setBanner: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Tags */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">Tags</Label>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-1">
                {tag}
                <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-destructive ml-0.5">
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
        <p className="text-caption text-muted-foreground">
          Help people discover your space through search
        </p>
      </div>

      {/* Visual identity — card-style upload zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avatar */}
        <div className="flex flex-col gap-2">
          <Label className="text-body-emphasis">Avatar</Label>
          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 min-h-[160px] cursor-pointer transition-all duration-200",
              avatar
                ? "border-primary/30 bg-primary/5"
                : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
            )}
            onClick={() => setAvatar(avatar ? null : "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop")}
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary/20" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-caption">Upload avatar</span>
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-1" onClick={(e) => e.stopPropagation()}>
              {avatar ? "Change" : "Upload"}
            </Button>
          </div>
          <p className="text-caption text-muted-foreground">Square image shown as the space icon</p>
        </div>

        {/* Card Banner */}
        <div className="flex flex-col gap-2">
          <Label className="text-body-emphasis">Card Banner</Label>
          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 min-h-[160px] cursor-pointer transition-all duration-200",
              banner
                ? "border-primary/30 bg-primary/5"
                : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
            )}
            onClick={() => setBanner(banner ? null : "https://images.unsplash.com/photo-1548728560-b6adb671a69f?w=400&h=200&fit=crop")}
          >
            {banner ? (
              <img src={banner} alt="Banner" className="max-h-20 rounded-lg object-cover ring-1 ring-primary/20" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-caption">Upload banner</span>
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-1" onClick={(e) => e.stopPropagation()}>
              {banner ? "Change" : "Upload"}
            </Button>
          </div>
          <p className="text-caption text-muted-foreground">Wide image shown on the space card</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Step 3: Purpose & Context
   ═══════════════════════════════════════════════════════════════════════════════ */

function StepPurpose({
  why, setWhy,
  who, setWho,
}: {
  why: string; setWhy: (v: string) => void;
  who: string; setWho: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Why */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">Why does this space exist?</Label>
        <MarkdownEditor
          value={why}
          onChange={setWhy}
          placeholder="The purpose and mission of this space..."
          minHeight="100px"
        />
        <p className="text-caption text-muted-foreground">
          Help members understand the space's purpose and motivation
        </p>
      </div>

      {/* Who */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">Who is this for?</Label>
        <MarkdownEditor
          value={who}
          onChange={setWho}
          placeholder="Describe the target audience or participants..."
          minHeight="100px"
        />
        <p className="text-caption text-muted-foreground">
          Help the right people find and join your space
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Step 4: Access & Members
   ═══════════════════════════════════════════════════════════════════════════════ */

function StepAccess({
  visibility, setVisibility,
  membershipMode, setMembershipMode,
  invitees, setInvitees,
  currentInvitee, setCurrentInvitee,
  handleInviteeKeyDown,
}: {
  visibility: string; setVisibility: (v: string) => void;
  membershipMode: string; setMembershipMode: (v: string) => void;
  invitees: string[]; setInvitees: (v: string[]) => void;
  currentInvitee: string; setCurrentInvitee: (v: string) => void;
  handleInviteeKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Visibility — card-style radio options */}
      <div className="flex flex-col gap-3">
        <Label className="text-body-emphasis">Visibility</Label>
        <RadioGroup value={visibility} onValueChange={setVisibility} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
              visibility === "public"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <RadioGroupItem value="public" className="mt-0.5" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-body-emphasis">Public</span>
              </div>
              <span className="text-caption text-muted-foreground">Anyone can see this space</span>
            </div>
          </label>
          <label
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
              visibility === "private"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <RadioGroupItem value="private" className="mt-0.5" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-body-emphasis">Private</span>
              </div>
              <span className="text-caption text-muted-foreground">Only members can see this space</span>
            </div>
          </label>
        </RadioGroup>
        <p className="text-caption text-muted-foreground">You can change this later in Settings</p>
      </div>

      <Separator />

      {/* Membership Mode — card-style radio */}
      <div className="flex flex-col gap-3">
        <Label className="text-body-emphasis">Membership</Label>
        <RadioGroup value={membershipMode} onValueChange={setMembershipMode} className="flex flex-col gap-2">
          <label
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
              membershipMode === "open"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <RadioGroupItem value="open" />
            <div>
              <span className="text-body-emphasis">Open</span>
              <span className="text-caption text-muted-foreground ml-2">— anyone can join</span>
            </div>
          </label>
          <label
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
              membershipMode === "application"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <RadioGroupItem value="application" />
            <div>
              <span className="text-body-emphasis">By application</span>
              <span className="text-caption text-muted-foreground ml-2">— users request to join</span>
            </div>
          </label>
          <label
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
              membershipMode === "invite"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            )}
          >
            <RadioGroupItem value="invite" />
            <div>
              <span className="text-body-emphasis">Invite only</span>
              <span className="text-caption text-muted-foreground ml-2">— members must be invited</span>
            </div>
          </label>
        </RadioGroup>
        <p className="text-caption text-muted-foreground">Controls how people join your space</p>
      </div>

      <Separator />

      {/* Invite Members */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-muted-foreground" />
          <Label className="text-body-emphasis">Invite Members</Label>
        </div>
        <p className="text-caption text-muted-foreground">
          Add email addresses or usernames to invite people right away
        </p>
        {invitees.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {invitees.map((invitee) => (
              <Badge key={invitee} variant="secondary" className="flex items-center gap-1 py-1">
                {invitee}
                <button onClick={() => setInvitees(invitees.filter((i) => i !== invitee))} className="hover:text-destructive ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <Input
          value={currentInvitee}
          onChange={(e) => setCurrentInvitee(e.target.value)}
          onKeyDown={handleInviteeKeyDown}
          placeholder="email@example.com or username"
        />
      </div>
    </div>
  );
}
