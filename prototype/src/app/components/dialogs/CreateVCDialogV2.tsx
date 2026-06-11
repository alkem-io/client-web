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
import { X, ImageIcon, Brain, Fingerprint, Zap, ChevronLeft } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface CreateVCDialogV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HOSTED_SPACES = [
  { id: "space-1", name: "Climate Action Hub" },
  { id: "space-2", name: "Innovation Workshop" },
  { id: "space-3", name: "Product Development" },
  { id: "space-4", name: "Research Network" },
];

export function CreateVCDialogV2({
  open,
  onOpenChange,
}: CreateVCDialogV2Props) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Knowledge Source
  const [sourceType, setSourceType] = useState<string>("");
  const [selectedSpace, setSelectedSpace] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");

  // Step 2: Identity
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  // Step 3: Capabilities & Test
  const [capAnswer, setCapAnswer] = useState(true);
  const [capPosts, setCapPosts] = useState(true);
  const [capSummarize, setCapSummarize] = useState(true);
  const [testQuestion, setTestQuestion] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [references, setReferences] = useState<string[]>([]);
  const [currentRef, setCurrentRef] = useState("");

  const steps = [
    { label: "Knowledge Source", icon: Brain, description: "Choose how your VC learns" },
    { label: "Identity", icon: Fingerprint, description: "Give it a personality" },
    { label: "Capabilities & Test", icon: Zap, description: "Configure and try it out" },
  ];

  const isValid = name.trim().length > 0 && sourceType !== "";

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleCreate = () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      handleClose();
      toast.success(`Virtual Contributor "${name}" created successfully`);
      navigate(`/vc/${slug}`);
    }, 1500);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const handleRefKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentRef.trim()) {
      e.preventDefault();
      if (!references.includes(currentRef.trim())) {
        setReferences([...references, currentRef.trim()]);
      }
      setCurrentRef("");
    }
  };

  const handleTestVC = () => {
    if (!testQuestion.trim()) return;
    setIsTesting(true);
    setTimeout(() => {
      setTestResponse(
        "Based on the knowledge I have access to, I can help with questions about collaboration methodologies, innovation frameworks, and best practices for community engagement."
      );
      setIsTesting(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>*]:min-w-0">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
          <DialogTitle className="text-section-title">Create Virtual Contributor</DialogTitle>
          <DialogDescription className="text-body text-muted-foreground">
            Build an AI assistant powered by your knowledge.
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
            <StepKnowledgeSource
              sourceType={sourceType} setSourceType={setSourceType}
              selectedSpace={selectedSpace} setSelectedSpace={setSelectedSpace}
              apiEndpoint={apiEndpoint} setApiEndpoint={setApiEndpoint}
              apiKey={apiKey} setApiKey={setApiKey}
            />
          )}
          {currentStep === 1 && (
            <StepIdentity
              name={name} setName={setName}
              tagline={tagline} setTagline={setTagline}
              description={description} setDescription={setDescription}
              avatar={avatar} setAvatar={setAvatar}
              tags={tags} setTags={setTags}
              currentTag={currentTag} setCurrentTag={setCurrentTag}
              handleTagKeyDown={handleTagKeyDown}
            />
          )}
          {currentStep === 2 && (
            <StepCapabilities
              capAnswer={capAnswer} setCapAnswer={setCapAnswer}
              capPosts={capPosts} setCapPosts={setCapPosts}
              capSummarize={capSummarize} setCapSummarize={setCapSummarize}
              testQuestion={testQuestion} setTestQuestion={setTestQuestion}
              testResponse={testResponse}
              isTesting={isTesting}
              handleTestVC={handleTestVC}
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
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
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
                  "Create VC"
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

/* ─── Step 1: Knowledge Source ─── */

function StepKnowledgeSource({
  sourceType, setSourceType,
  selectedSpace, setSelectedSpace,
  apiEndpoint, setApiEndpoint,
  apiKey, setApiKey,
}: {
  sourceType: string; setSourceType: (v: string) => void;
  selectedSpace: string; setSelectedSpace: (v: string) => void;
  apiEndpoint: string; setApiEndpoint: (v: string) => void;
  apiKey: string; setApiKey: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="text-body-emphasis">How will your VC learn?</Label>
        <p className="text-caption text-muted-foreground mt-1">
          Choose the knowledge source that powers your Virtual Contributor
        </p>
      </div>

      <RadioGroup value={sourceType} onValueChange={setSourceType} className="flex flex-col gap-3">
        {/* Written Knowledge */}
        <label
          className={cn(
            "flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200",
            sourceType === "knowledge" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
          )}
        >
          <RadioGroupItem value="knowledge" className="mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-body-emphasis">Written Knowledge</span>
            <span className="text-caption text-muted-foreground">
              Write knowledge posts and upload documents. Best for curated, specific expertise.
            </span>
          </div>
        </label>

        {/* Space Knowledge */}
        <label
          className={cn(
            "flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200",
            sourceType === "space" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
          )}
        >
          <RadioGroupItem value="space" className="mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-body-emphasis">Space Knowledge</span>
            <span className="text-caption text-muted-foreground">
              Learn from an existing space's content. Best for contextual community assistance.
            </span>
          </div>
        </label>

        {/* External AI */}
        <label
          className={cn(
            "flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200",
            sourceType === "external" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
          )}
        >
          <RadioGroupItem value="external" className="mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-body-emphasis">External AI Provider</span>
            <span className="text-caption text-muted-foreground">
              Connect your own AI model via API. Best for custom or enterprise setups.
            </span>
          </div>
        </label>
      </RadioGroup>

      {/* Contextual configuration */}
      {sourceType === "knowledge" && (
        <div className="pl-8 border-l-2 border-primary/20">
          <p className="text-caption text-muted-foreground">
            You'll be able to add knowledge posts and documents after creation.
          </p>
        </div>
      )}

      {sourceType === "space" && (
        <div className="flex flex-col gap-3 pl-8 border-l-2 border-primary/20">
          <Label className="text-body-emphasis">Select a space</Label>
          <Select value={selectedSpace} onValueChange={setSelectedSpace}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a hosted space..." />
            </SelectTrigger>
            <SelectContent>
              {HOSTED_SPACES.map((space) => (
                <SelectItem key={space.id} value={space.id}>
                  {space.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-caption text-muted-foreground">
            The VC will learn from this space's posts, discussions, and documents.
          </p>
        </div>
      )}

      {sourceType === "external" && (
        <div className="flex flex-col gap-3 pl-8 border-l-2 border-primary/20">
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">API Endpoint</Label>
            <Input
              placeholder="https://api.example.com/v1/chat"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">API Key</Label>
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <p className="text-caption text-muted-foreground">
            Your credentials are encrypted and stored securely.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Step 2: Identity ─── */

function StepIdentity({
  name, setName,
  tagline, setTagline,
  description, setDescription,
  avatar, setAvatar,
  tags, setTags,
  currentTag, setCurrentTag,
  handleTagKeyDown,
}: {
  name: string; setName: (v: string) => void;
  tagline: string; setTagline: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  avatar: string | null; setAvatar: (v: string | null) => void;
  tags: string[]; setTags: (v: string[]) => void;
  currentTag: string; setCurrentTag: (v: string) => void;
  handleTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Name (required) */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="e.g. Research Assistant"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <p className="text-caption text-muted-foreground">Give your VC a memorable name</p>
      </div>

      {/* Tagline */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Tagline</Label>
        <Input
          placeholder="Helps teams find relevant research papers"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <p className="text-caption text-muted-foreground">A short description shown on VC cards</p>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Description</Label>
        <MarkdownEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe what this VC can help with..."
          minHeight="100px"
        />
        <p className="text-caption text-muted-foreground">Detailed explanation of expertise and purpose</p>
      </div>

      {/* Avatar + Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-body-emphasis">Avatar</Label>
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] cursor-pointer transition-all duration-200",
              avatar
                ? "border-primary/30 bg-primary/5"
                : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/5"
            )}
            onClick={() => setAvatar(avatar ? null : "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop")}
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-caption">Upload avatar</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
              {avatar ? "Change" : "Upload Avatar"}
            </Button>
          </div>
          <p className="text-caption text-muted-foreground">The face of your Virtual Contributor</p>
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
          <p className="text-caption text-muted-foreground">Help people find your VC</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Capabilities & Test ─── */

function StepCapabilities({
  capAnswer, setCapAnswer,
  capPosts, setCapPosts,
  capSummarize, setCapSummarize,
  testQuestion, setTestQuestion,
  testResponse,
  isTesting,
  handleTestVC,
  references, setReferences,
  currentRef, setCurrentRef,
  handleRefKeyDown,
}: {
  capAnswer: boolean; setCapAnswer: (v: boolean) => void;
  capPosts: boolean; setCapPosts: (v: boolean) => void;
  capSummarize: boolean; setCapSummarize: (v: boolean) => void;
  testQuestion: string; setTestQuestion: (v: string) => void;
  testResponse: string;
  isTesting: boolean;
  handleTestVC: () => void;
  references: string[]; setReferences: (v: string[]) => void;
  currentRef: string; setCurrentRef: (v: string) => void;
  handleRefKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Capabilities */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">Capabilities</Label>
        <p className="text-caption text-muted-foreground">
          Control what your Virtual Contributor can do
        </p>
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-2">
            <Checkbox
              id="cap-answer"
              checked={capAnswer}
              onCheckedChange={(checked) => setCapAnswer(checked === true)}
            />
            <Label htmlFor="cap-answer" className="text-body cursor-pointer">
              Answer questions from community members
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="cap-posts"
              checked={capPosts}
              onCheckedChange={(checked) => setCapPosts(checked === true)}
            />
            <Label htmlFor="cap-posts" className="text-body cursor-pointer">
              Create posts and contributions
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="cap-summarize"
              checked={capSummarize}
              onCheckedChange={(checked) => setCapSummarize(checked === true)}
            />
            <Label htmlFor="cap-summarize" className="text-body cursor-pointer">
              Summarize discussions and content
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Test */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">Test Your VC</Label>
        <p className="text-caption text-muted-foreground">
          Ask a sample question to see how your VC responds
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question..."
            value={testQuestion}
            onChange={(e) => setTestQuestion(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTestVC();
              }
            }}
          />
          <Button
            variant="outline"
            onClick={handleTestVC}
            disabled={!testQuestion.trim() || isTesting}
          >
            {isTesting ? "Testing..." : "Ask"}
          </Button>
        </div>
        {testResponse && (
          <div className="mt-2 p-3 bg-muted rounded-lg" aria-live="polite">
            <p className="text-caption text-muted-foreground mb-1">Response preview:</p>
            <p className="text-body">{testResponse}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* References */}
      <div className="flex flex-col gap-2">
        <Label className="text-body-emphasis">References</Label>
        <p className="text-caption text-muted-foreground">
          Add links to documentation or resources related to this VC
        </p>
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
