import { useState } from "react";
import { 
  X, Bold, Italic, List, ListOrdered, Image, 
  Smile, MoreHorizontal, Settings, Mic,
  Maximize2, Paperclip, Presentation, StickyNote, Megaphone,
  MessageSquare, MessageSquareOff, ChevronRight, Hash,
  Layout
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Separator } from "@/app/components/ui/separator";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { MarkdownEditor } from "@/app/components/ui/markdown-editor";

interface AddPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPostModal({ open, onOpenChange }: AddPostModalProps) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  
  // Attachments
  const [activeAttachment, setActiveAttachment] = useState<"none" | "whiteboard" | "memo" | "cta">("none");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [collectionType, setCollectionType] = useState<"none" | "links" | "posts" | "memos" | "whiteboards">("none");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-5xl p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background/50 backdrop-blur-sm z-10">
          <DialogTitle className="text-lg font-semibold tracking-tight">Create Post</DialogTitle>
          <DialogClose className="rounded-full p-2 hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">
          Compose and publish a new post to this space.
        </DialogDescription>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Inputs */}
          <div className="space-y-4">
            <Input
              placeholder="What's on your mind? (Title)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl md:text-2xl font-semibold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 h-auto"
            />
            
            <div className="relative">
              <MarkdownEditor
                value={content}
                onChange={setContent}
                className="border-none shadow-none"
                placeholder="Share your thoughts..."
                minHeight="200px"
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-3">
             <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add to post</Label>
             <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  {[
                    { id: 'whiteboard', label: 'Whiteboard', icon: Presentation, color: "text-primary bg-primary/10 hover:bg-primary/20 border-primary/20" },
                    { id: 'memo', label: 'Memo', icon: StickyNote, color: "text-chart-2 bg-chart-2/10 hover:bg-chart-2/20 border-chart-2/20" },
                    { id: 'cta', label: 'Call to Action', icon: Megaphone, color: "text-chart-3 bg-chart-3/10 hover:bg-chart-3/20 border-chart-3/20" },
                    { id: 'image', label: 'Image', icon: Image, color: "text-chart-1 bg-chart-1/10 hover:bg-chart-1/20 border-chart-1/20" },
                  ].map((item) => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActiveAttachment(activeAttachment === item.id ? 'none' : item.id as any)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                            activeAttachment === item.id 
                              ? cn(item.color, "ring-1 ring-offset-1") 
                              : "bg-background border-border text-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add {item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
             </div>

             {/* Active Attachment Editors */}
             {activeAttachment === 'whiteboard' && (
                <div className="mt-2 p-4 border rounded-xl bg-muted/30 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}><Presentation className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-sm">New Whiteboard</p>
                      <p className="text-xs text-muted-foreground">Ready to be created</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">Configure</Button>
                </div>
             )}
             
             {activeAttachment === 'cta' && (
                <div className="mt-2 p-4 border rounded-xl bg-muted/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                   <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                       <Label className="text-xs">Button Label</Label>
                       <Input value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="Click here" className="h-8 bg-background" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-xs">Target URL</Label>
                       <Input value={ctaLink} onChange={e => setCtaLink(e.target.value)} placeholder="https://" className="h-8 bg-background" />
                     </div>
                   </div>
                </div>
             )}
          </div>

          <Separator />

          {/* Settings Collapsible */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen} className="space-y-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between p-2 h-auto hover:bg-muted/50 font-normal">
                <div className="flex items-center gap-2 text-muted-foreground">
                   <Settings className="w-4 h-4" />
                   <span className="text-sm">Post Settings</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", settingsOpen && "rotate-90")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2 px-2">
              
              {/* Tags */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tags</Label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    value={tags} 
                    onChange={e => setTags(e.target.value)} 
                    placeholder="Add tags separated by commas..." 
                    className="pl-8 h-9 bg-background"
                  />
                </div>
              </div>

              {/* Comments */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                   <Label className="text-sm">Allow Comments</Label>
                   <p className="text-xs text-muted-foreground">Users can reply to this post</p>
                </div>
                <Switch checked={allowComments} onCheckedChange={setAllowComments} />
              </div>

              {/* Collection Type (Simplified) */}
              <div className="space-y-2">
                <Label className="text-sm">Collection Type</Label>
                <div className="grid grid-cols-3 gap-2">
                   {['none', 'links', 'posts', 'whiteboards'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setCollectionType(type as any)}
                        className={cn(
                          "px-3 py-2 rounded-md border text-xs font-medium capitalize transition-all",
                          collectionType === type 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-background hover:bg-muted"
                        )}
                      >
                        {type}
                      </button>
                   ))}
                </div>
                <p className="text-[10px] text-muted-foreground">Allows others to contribute content to this post.</p>
              </div>

            </CollapsibleContent>
          </Collapsible>

        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/10">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Save Draft</Button>
          <Button onClick={() => onOpenChange(false)} className="px-8">Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}