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

interface CreateTemplatePackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTemplatePackDialog({
  open,
  onOpenChange,
}: CreateTemplatePackDialogProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setName("");
      setDescription("");
      setTags([]);
      setCurrentTag("");
      setCover(null);
    }, 200);
  };

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      const slug = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      navigate(`/templates/packs/${slug || "new-pack"}/settings`);
    }, 1500);
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

  const isFormValid = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>*]:min-w-0">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
          <DialogTitle>Create Template Pack</DialogTitle>
          <DialogDescription>
            Create a new pack, then add templates and details on the next page.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Innovation Workshop Pack"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-caption text-muted-foreground">The name of your template pack.</p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">Description</Label>
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe what this pack contains..."
              minHeight="120px"
            />
            <p className="text-caption text-muted-foreground">
              Describe what templates are in this pack and when to use them.
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
            <p className="text-caption text-muted-foreground">Help others discover this pack.</p>
          </div>

          {/* Cover Image */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-body-emphasis">Cover image</Label>
            <div
              className="relative group border border-input rounded-md overflow-hidden bg-muted/5 cursor-pointer hover:bg-accent/30 transition-colors aspect-video"
              onClick={() =>
                setCover(
                  cover
                    ? null
                    : "https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=820&h=460&q=80"
                )
              }
            >
              {cover ? (
                <>
                  <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      Change
                    </Button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-caption">Upload cover image</span>
                </div>
              )}
            </div>
            <p className="text-caption text-muted-foreground">Recommended: 820 × 460 px</p>
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
