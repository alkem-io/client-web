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
import { Separator } from "@/app/components/ui/separator";
import { useState } from "react";
import { FileText, Users, Cloud, ImageIcon, Upload, FilePlus, Plus, X } from "lucide-react";
import { MarkdownEditor } from "@/app/components/ui/markdown-editor";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export type AISource = "knowledge" | "space" | "external" | null;

interface CreateVCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const aiOptions = [
  {
    id: "knowledge" as const,
    icon: FileText,
    title: "Written knowledge",
    description: "Provide text-based knowledge in posts or documents",
    badge: "AI Powered by Alkemio",
  },
  {
    id: "space" as const,
    icon: Users,
    title: "Content of a Space",
    description: "Use the content from a Space or Subspace you host",
    badge: "AI Powered by Alkemio",
  },
  {
    id: "external" as const,
    icon: Cloud,
    title: "External AI",
    description: "Connect an external AI provider via API key",
    badge: "External",
  },
];

const spaces = [
  { name: "Business & Data Management", subspaces: ["Data Governance Sprint", "Analytics Workshop"] },
  { name: "The Sandbox", subspaces: ["Playground Alpha", "Testing Ground"] },
  { name: "Green Energy Space", subspaces: ["Solar Initiative", "Wind Power Lab"] },
];

export function CreateVCDialog({ open, onOpenChange }: CreateVCDialogProps) {
  const [aiSource, setAiSource] = useState<AISource>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screen, setScreen] = useState<"create" | "populate">("create");

  // Knowledge state
  const [posts, setPosts] = useState([{ id: 1, title: "", content: "" }]);

  // Space state
  const [selectedSpace, setSelectedSpace] = useState("");

  // External state
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setAiSource(null);
      setName("");
      setTagline("");
      setDescription("");
      setAvatar(null);
      setPosts([{ id: 1, title: "", content: "" }]);
      setSelectedSpace("");
      setApiKey("");
      setScreen("create");
    }, 200);
  };

  const handleCreate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setScreen("populate");
    }, 1500);
  };

  const handleFinish = () => {
    handleClose();
  };

  const isFormValid = name.length > 0 && aiSource !== null;

  const addPost = () => {
    setPosts([...posts, { id: Date.now(), title: "", content: "" }]);
  };

  const updatePost = (id: number, field: "title" | "content", value: string) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removePost = (id: number) => {
    if (posts.length > 1) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>*]:min-w-0">
        {screen === "create" ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
              <DialogTitle>Create a Virtual Contributor</DialogTitle>
              <DialogDescription>
                Set up an AI-powered contributor. Choose a knowledge source, then customize its identity.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 flex flex-col gap-6">

              {/* ─── Identity ─── */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-body-emphasis">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Research Assistant"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="text-caption text-muted-foreground">The display name of your Virtual Contributor.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-body-emphasis">Tagline</Label>
                  <Input
                    placeholder="A short tagline..."
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-body-emphasis">Description</Label>
                  <MarkdownEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="What does this Virtual Contributor do?"
                    minHeight="80px"
                  />
                </div>

                {/* Avatar */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-body-emphasis">Avatar</Label>
                  <div
                    className="w-24 h-24 border border-input rounded-md overflow-hidden bg-muted/10 flex items-center justify-center cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => setAvatar(avatar ? null : "https://images.unsplash.com/photo-1535378917042-10a22c95931a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=410&h=410&q=80")}
                  >
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <p className="text-caption text-muted-foreground">Recommended: 410 × 410 px. You can change this later.</p>
                </div>
              </div>

              {/* ─── AI Source Selection ─── */}
              <Separator />

              <div className="flex flex-col gap-3">
                <Label className="text-body-emphasis">
                  Knowledge source <span className="text-destructive">*</span>
                </Label>
                <p className="text-caption text-muted-foreground">
                  What do you want to make available through your Virtual Contributor?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {aiOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = aiSource === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setAiSource(option.id)}
                        className={cn(
                          "flex flex-col items-center gap-2.5 p-5 rounded-lg border text-center transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-input hover:border-primary/40 hover:bg-accent/30"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                        <span className={cn("text-body-emphasis leading-tight", isSelected && "text-primary")}>
                          {option.title}
                        </span>
                        <span className="text-caption text-muted-foreground leading-snug">{option.description}</span>
                        <span className="text-badge uppercase tracking-wide text-muted-foreground/70 font-medium mt-1">
                          {option.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
              <DialogTitle>Add Knowledge — {name}</DialogTitle>
              <DialogDescription>
                Your Virtual Contributor has been created. Now populate its knowledge base.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 flex flex-col gap-6">

              {aiSource === "knowledge" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-body-emphasis">Knowledge content</Label>
                    <p className="text-caption text-muted-foreground">
                      Write knowledge in posts or upload documents. You can add more later.
                    </p>
                  </div>
                  {posts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-3 p-4 border border-input rounded-lg relative">
                      {posts.length > 1 && (
                        <button
                          onClick={() => removePost(post.id)}
                          className="absolute top-3 right-3 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <Input
                        placeholder="Post title"
                        value={post.title}
                        onChange={(e) => updatePost(post.id, "title", e.target.value)}
                      />
                      <MarkdownEditor
                        value={post.content}
                        onChange={(val) => updatePost(post.id, "content", val)}
                        placeholder="Write your knowledge content here..."
                        minHeight="100px"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={addPost}>
                      <Plus className="w-3.5 h-3.5" />
                      Add Post
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FilePlus className="w-3.5 h-3.5" />
                      Add Document
                    </Button>
                  </div>
                </div>
              )}

              {aiSource === "space" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-body-emphasis">Select a Space or Subspace</Label>
                    <p className="text-caption text-muted-foreground">
                      Choose from Spaces and Subspaces that you host.
                    </p>
                  </div>
                  <Select value={selectedSpace} onValueChange={setSelectedSpace}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a Space or Subspace..." />
                    </SelectTrigger>
                    <SelectContent>
                      {spaces.map((space) => (
                        <SelectGroup key={space.name}>
                          <SelectLabel className="text-label text-muted-foreground uppercase">
                            {space.name}
                          </SelectLabel>
                          <SelectItem value={space.name}>{space.name}</SelectItem>
                          {space.subspaces.map((sub) => (
                            <SelectItem key={sub} value={`${space.name}/${sub}`} className="pl-6">
                              {sub}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {aiSource === "external" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-body-emphasis">Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="openai-assistant">OpenAI Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-body-emphasis">API Key</Label>
                    <Input
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      type="password"
                    />
                    <p className="text-caption text-muted-foreground">Your key is encrypted and stored securely.</p>
                  </div>
                </div>
              )}

            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button variant="ghost" onClick={handleFinish}>
                Skip for now
              </Button>
              <Button onClick={handleFinish}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
