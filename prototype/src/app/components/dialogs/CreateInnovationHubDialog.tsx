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
import { useState } from "react";
import { useNavigate } from "react-router";
import { X, ImageIcon } from "lucide-react";
import { MarkdownEditor } from "@/app/components/ui/markdown-editor";

interface CreateInnovationHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInnovationHubDialog({
  open,
  onOpenChange,
}: CreateInnovationHubDialogProps) {
  const navigate = useNavigate();
  const [subdomain, setSubdomain] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubdomain("");
      setName("");
      setTagline("");
      setDescription("");
      setTags([]);
      setCurrentTag("");
      setBanner(null);
    }, 200);
  };

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      const slug = subdomain || "new-hub";
      navigate(`/innovation-hub/${slug}/settings`);
    }, 1500);
  };

  const handleSubdomainChange = (value: string) => {
    // Auto-format: lowercase, no spaces, only alphanumeric + hyphens
    const formatted = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setSubdomain(formatted);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const isFormValid = subdomain.length > 0 && name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>*]:min-w-0">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
          <DialogTitle>Create Innovation Hub</DialogTitle>
          <DialogDescription>
            Set up a branded landing page with a custom subdomain. Add spaces and configure details on the next page.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 flex flex-col gap-4">
          {/* Subdomain */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">
              Subdomain <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. my-hub"
              value={subdomain}
              onChange={(e) => handleSubdomainChange(e.target.value)}
            />
            {subdomain && (
              <div className="text-caption font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
                {subdomain}.alkem.io
              </div>
            )}
            <p className="text-caption text-muted-foreground">This will be the URL of your Innovation Hub.</p>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. VNG Innovation Hub"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-caption text-muted-foreground">The display name of your Innovation Hub.</p>
          </div>

          {/* Tagline */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">Tagline</Label>
            <Input
              placeholder="A short tagline..."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
            <p className="text-caption text-muted-foreground">Shown below the name on your landing page.</p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">Description</Label>
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe what this hub is about..."
              minHeight="120px"
            />
            <p className="text-caption text-muted-foreground">
              Explain the purpose of this Innovation Hub. Markdown supported.
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">Tags</Label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Input
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add a tag and press Enter"
            />
            <p className="text-caption text-muted-foreground">Help others discover this hub.</p>
          </div>

          {/* Banner Image */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">Banner image</Label>
            <div
              className="relative group border border-input rounded-md overflow-hidden bg-muted/5 cursor-pointer hover:bg-accent/30 transition-colors aspect-video"
              onClick={() =>
                setBanner(
                  banner
                    ? null
                    : "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=1920&h=480&q=80"
                )
              }
            >
              {banner ? (
                <>
                  <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      Change
                    </Button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-caption">Upload banner image</span>
                </div>
              )}
            </div>
            <p className="text-caption text-muted-foreground">Recommended: 1920 × 480 px. This appears at the top of your hub page.</p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
