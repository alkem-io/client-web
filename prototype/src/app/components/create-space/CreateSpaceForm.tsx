import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Check, Settings, ChevronRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";

interface CreateSpaceFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function CreateSpaceForm({ onCancel, onSuccess }: CreateSpaceFormProps) {
  const [title, setTitle] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [tagline, setTagline] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [pageBanner, setPageBanner] = useState<string | null>(null);
  const [cardBanner, setCardBanner] = useState<string | null>(null);
  const [addTutorials, setAddTutorials] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Auto-generate URL slug from title
  useEffect(() => {
    if (title && !isSlugEdited) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setUrlSlug(slug);
    }
  }, [title, isSlugEdited]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlSlug(e.target.value);
    setIsSlugEdited(true);
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

  const isFormValid = title.length > 0 && urlSlug.length > 0 && acceptedTerms;

  const handleCreate = () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background">
       {/* Scrollable Main Content */}
       <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Inputs */}
          <div className="space-y-4">
            <Input
              placeholder="Space Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-semibold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 h-auto text-[length:var(--text-xl)] md:text-[length:var(--text-2xl)]"
            />
            
            <Input
              placeholder="Tagline (Short description)"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="border-none px-0 shadow-none focus-visible:ring-0 text-[length:var(--text-base)] leading-relaxed placeholder:text-muted-foreground/60 h-auto"
            />

            <div className="flex items-center gap-0.5 h-9">
              <span className="text-muted-foreground/60 select-none shrink-0 font-normal text-[length:var(--text-base)]">
                alkem.io/
              </span>
              <div className="relative flex-1 min-w-0">
                <Input
                  placeholder="space-url-slug"
                  value={urlSlug}
                  onChange={handleSlugChange}
                  className="border-none shadow-none focus-visible:ring-0 h-full p-0 bg-transparent w-full font-medium text-[length:var(--text-base)]"
                />
              </div>
              {urlSlug && (
                <div className="flex items-center gap-1 text-success font-medium shrink-0 pl-2 text-[length:var(--text-sm)]">
                  <Check className="w-3 h-3" /> Available
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Settings / Additional Info */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen} className="space-y-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between p-2 h-auto hover:bg-muted/50 font-normal">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Settings className="w-4 h-4" />
                   <span className="text-[length:var(--text-sm)]">Space Details & Assets</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", settingsOpen && "rotate-90")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-2 px-2">
              
              {/* Tags */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    value={currentTag} 
                    onChange={e => setCurrentTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags separated by Enter..." 
                    className="pl-8 h-9 bg-background text-[length:var(--text-sm)]"
                  />
                </div>
              </div>

              {/* Image Uploads */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="font-semibold text-muted-foreground uppercase tracking-wider text-[length:var(--text-sm)]">Page Banner</Label>
                  <div 
                    className="relative group border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden transition-colors hover:border-primary/50 bg-muted/5"
                    style={{ aspectRatio: "6/1" }}
                  >
                    {pageBanner ? (
                      <>
                        <img src={pageBanner} alt="Page banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" onClick={() => setPageBanner(null)}>Change Image</Button>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => setPageBanner("https://images.unsplash.com/photo-1696041757950-62e2c030283b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsYWJvcmF0aW9uJTIwY29tbXVuaXR5JTIwYmFubmVyJTIwYWJzdHJhY3R8ZW58MXx8fHwxNzY5NDMxODQyfDA&ixlib=rb-4.1.0&q=80&w=1080")}>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-[length:var(--text-xs)]">Upload Page Banner</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold text-muted-foreground uppercase tracking-wider text-[length:var(--text-sm)]">Card Banner</Label>
                  <div 
                    className="relative group border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden transition-colors hover:border-primary/50 bg-muted/5 max-w-[300px]"
                    style={{ aspectRatio: "1.6/1" }}
                  >
                    {cardBanner ? (
                      <>
                        <img src={cardBanner} alt="Card banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" onClick={() => setCardBanner(null)}>Change</Button>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => setCardBanner("https://images.unsplash.com/photo-1548728560-b6adb671a69f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWFtd29yayUyMG9mZmljZSUyMGFic3RyYWN0fGVufDF8fHx8MTc2OTQzMTg0Mnww&ixlib=rb-4.1.0&q=80&w=1080")}>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-[length:var(--text-xs)]">Upload Card Banner</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Options Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="tutorials" 
                    checked={addTutorials}
                    onCheckedChange={(checked) => setAddTutorials(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="tutorials" className="font-medium cursor-pointer text-[length:var(--text-sm)]">
                      Add Tutorials to this Space
                    </Label>
                    <p className="text-[length:var(--text-xs)] text-muted-foreground">
                      Automatically add onboarding content for new members
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="font-medium cursor-pointer text-[length:var(--text-sm)]">
                      I accept the terms and agreements <span className="text-destructive">*</span>
                    </Label>
                  </div>
                </div>
              </div>

            </CollapsibleContent>
          </Collapsible>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/10 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} className="text-[length:var(--text-base)]">Cancel</Button>
          <Button 
            onClick={handleCreate} 
            disabled={!isFormValid || isSubmitting}
            className="px-8 text-[length:var(--text-base)]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Space"
            )}
          </Button>
        </div>
    </div>
  );
}