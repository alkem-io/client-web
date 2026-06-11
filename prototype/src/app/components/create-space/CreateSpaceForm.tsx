import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { useState } from "react";
import { X, LayoutTemplate, ImageIcon, Upload } from "lucide-react";
import { MarkdownEditor } from "@/app/components/ui/markdown-editor";

interface CreateSpaceFormProps {
  showTemplates?: boolean;
  onToggleTemplates?: () => void;
}

export function CreateSpaceForm(_props: CreateSpaceFormProps) {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [cardBanner, setCardBanner] = useState<string | null>(null);

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

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 flex flex-col gap-4">

      {/* Template selector */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Template</Label>
        <button className="w-full flex items-center gap-3 px-3 h-10 border border-input rounded-md bg-background hover:bg-accent/50 transition-colors text-left">
          <LayoutTemplate className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-caption text-muted-foreground">Choose a template</span>
        </button>
        <p className="text-caption text-muted-foreground">Optional — pick a space template to pre-fill content.</p>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="e.g. Climate Action Network"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="text-caption text-muted-foreground">The name of your space, visible to members.</p>
      </div>

      {/* Tagline */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Tagline</Label>
        <Input
          placeholder="A short tagline..."
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
        <p className="text-caption text-muted-foreground">A short subtitle describing the space.</p>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-body-emphasis">Description</Label>
        <MarkdownEditor
          value={description}
          onChange={setDescription}
          placeholder="Explain what this space is about..."
          minHeight="120px"
        />
        <p className="text-caption text-muted-foreground">Explain what this space is about. Markdown supported.</p>
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
          onChange={e => setCurrentTag(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add a tag and press Enter"
        />
        <p className="text-caption text-muted-foreground">Tags help members find this space.</p>
      </div>

      {/* Visuals — Avatar + Card Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Avatar */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-body-emphasis">Avatar</Label>
          <div
            className="relative group border border-input rounded-md overflow-hidden bg-muted/5 cursor-pointer hover:bg-accent/30 transition-colors"
            style={{ aspectRatio: "1/1" }}
            onClick={() => setAvatar(avatar ? null : "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=410&h=410&q=80")}
          >
            {avatar ? (
              <>
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm">Change</Button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span className="text-caption">Upload avatar</span>
              </div>
            )}
          </div>
          <p className="text-caption text-muted-foreground">Recommended: 410 × 410 px</p>
        </div>

        {/* Card Banner */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-body-emphasis">Card banner</Label>
          <div
            className="relative group border border-input rounded-md overflow-hidden bg-muted/5 cursor-pointer hover:bg-accent/30 transition-colors"
            style={{ aspectRatio: "410/256" }}
            onClick={() => setCardBanner(cardBanner ? null : "https://images.unsplash.com/photo-1548728560-b6adb671a69f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=410&h=256&q=80")}
          >
            {cardBanner ? (
              <>
                <img src={cardBanner} alt="Card banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm">Change</Button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span className="text-caption">Upload card banner</span>
              </div>
            )}
          </div>
          <p className="text-caption text-muted-foreground">Recommended: 410 × 256 px</p>
        </div>
      </div>

    </div>
  );
}