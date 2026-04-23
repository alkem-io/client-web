import { useState } from "react";
import { 
  X, Image, 
  Settings, Presentation, StickyNote, Megaphone,
  ChevronRight, Hash,
  Link2, FileText, PenLine, BarChart3, Lightbulb,
  Globe, Shield, Trash2, Paperclip, Plus, MessageSquare,
  Users, Pencil, Search, Check, ChevronsUpDown,
  FileSpreadsheet, Upload
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogFooter, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Separator } from "@/app/components/ui/separator";
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
  const [references, setReferences] = useState<Array<{title: string, url: string, description: string}>>([
    { title: "", url: "", description: "" }
  ]);
  
  // Attachments
  const [activeAttachment, setActiveAttachment] = useState<"none" | "whiteboard" | "memo" | "cta" | "image" | "poll" | "document">("none");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");

  // Collection type — always visible
  const [collectionType, setCollectionType] = useState<"none" | "links" | "posts" | "memos" | "whiteboards" | "documents">("none");
  const [membersCanAdd, setMembersCanAdd] = useState(true);
  const [adminsCanAdd, setAdminsCanAdd] = useState(true);
  const [collectionDefaultTitle, setCollectionDefaultTitle] = useState("");
  const [collectionDefaultDescription, setCollectionDefaultDescription] = useState("");
  const [enableCollectionComments, setEnableCollectionComments] = useState(true);
  const [linkRows, setLinkRows] = useState([{ title: "", url: "", description: "" }]);
  const [linkDescription, setLinkDescription] = useState("");
  const [selectedPostTemplate, setSelectedPostTemplate] = useState("");
  const [postTemplateOpen, setPostTemplateOpen] = useState(false);
  const [selectedWbTemplate, setSelectedWbTemplate] = useState("");
  const [wbTemplateOpen, setWbTemplateOpen] = useState(false);
  const [defaultsDialogOpen, setDefaultsDialogOpen] = useState(false);

  // More options
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-5xl p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background/50 backdrop-blur-sm z-10">
          <DialogTitle className="text-lg font-semibold tracking-tight">Create Post</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Find Template
            </Button>
            <DialogClose className="rounded-full p-2 hover:bg-muted transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </DialogClose>
          </div>
        </div>
        <DialogDescription className="sr-only">
          Compose and publish a new post to this space.
        </DialogDescription>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ─── Zone 1: Content ─── */}
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl md:text-2xl font-semibold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60 h-auto"
            />
            
            <MarkdownEditor
              value={content}
              onChange={setContent}
              className="border-none shadow-none [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:bg-transparent [&_.ql-container]:border-0"
              placeholder="Description..."
              minHeight="200px"
            />
          </div>

          {/* ADD TO POST chip strip */}
          <div className="space-y-3">
             <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add to post</Label>
             <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  {[
                    { id: 'whiteboard', label: 'Whiteboard', icon: Presentation },
                    { id: 'memo', label: 'Memo', icon: StickyNote },
                    { id: 'document', label: 'Document', icon: FileSpreadsheet },
                    { id: 'cta', label: 'Call to Action', icon: Megaphone },
                    { id: 'image', label: 'Image', icon: Image },
                    { id: 'poll', label: 'Poll', icon: BarChart3 },
                  ].map((item) => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActiveAttachment(activeAttachment === item.id ? 'none' : item.id as any)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all",
                            activeAttachment === item.id 
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                          {activeAttachment === item.id && (
                            <X className="w-3 h-3 ml-0.5 opacity-70" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{activeAttachment === item.id ? `Remove ${item.label}` : `Add ${item.label}`}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
             </div>

             {/* Active Attachment Editors */}
             {activeAttachment === 'whiteboard' && (
                <div className="mt-2 p-4 border rounded-xl bg-muted/30 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary"><Presentation className="w-5 h-5" /></div>
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
                       <Label className="text-sm">Button Label</Label>
                       <Input value={ctaText} onChange={e => setCtaText(e.target.value)} placeholder="Button text" className="h-8 bg-background" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-sm">Target URL</Label>
                       <Input value={ctaLink} onChange={e => setCtaLink(e.target.value)} placeholder="https://" className="h-8 bg-background" />
                     </div>
                   </div>
                </div>
             )}

             {activeAttachment === 'memo' && (
                <div className="mt-2 p-4 border rounded-xl bg-muted/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-chart-2/10 text-chart-2"><StickyNote className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-sm">Memo</p>
                      <p className="text-xs text-muted-foreground">Rich text memo</p>
                    </div>
                  </div>
                  <MarkdownEditor
                    value=""
                    onChange={() => {}}
                    placeholder="Write your memo…"
                    minHeight="80px"
                    className="bg-background rounded-md border [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-container]:border-0"
                  />
                </div>
             )}

             {activeAttachment === 'image' && (
                <div className="mt-2 p-4 border rounded-xl bg-muted/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="border-2 border-dashed rounded-lg bg-background p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Image className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Drag & drop an image here, or click to browse</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">PNG, JPG, GIF up to 10 MB</p>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add another image
                  </button>
                </div>
             )}

             {activeAttachment === 'poll' && (
                <div className="mt-2 p-4 border rounded-xl bg-muted/30 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-chart-4/10 text-chart-4"><BarChart3 className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-sm">Poll</p>
                      <p className="text-xs text-muted-foreground">Add poll options</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Input placeholder="Option 1" className="h-8 bg-background" />
                    <Input placeholder="Option 2" className="h-8 bg-background" />
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">+ Add option</Button>
                  </div>
                </div>
             )}

             {activeAttachment === 'document' && (
                <div className="mt-2 p-4 border rounded-xl bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Create new</Label>
                    <div className="flex gap-2">
                      {[
                        { label: 'Word Document', icon: '📄' },
                        { label: 'Spreadsheet', icon: '📊' },
                        { label: 'Presentation', icon: '📑' },
                      ].map((doc) => (
                        <button
                          key={doc.label}
                          className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-background hover:bg-muted transition-colors"
                        >
                          <span className="text-xl">{doc.icon}</span>
                          <span className="text-xs text-muted-foreground">{doc.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <Separator className="flex-1" />
                  </div>
                  <div className="border-2 border-dashed rounded-lg bg-background p-5 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground/50 mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground">Drag & drop a file, or click to upload</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">.docx, .xlsx, .pptx up to 25 MB</p>
                  </div>
                </div>
             )}
          </div>

          <Separator />

          {/* ─── Zone 2: Response type (always visible) ─── */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Responses</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'links', label: 'Links & Files', icon: Link2 },
                { id: 'posts', label: 'Posts', icon: FileText },
                { id: 'memos', label: 'Memos', icon: PenLine },
                { id: 'documents', label: 'Documents', icon: FileSpreadsheet },
                { id: 'whiteboards', label: 'Whiteboards', icon: Presentation },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setCollectionType(collectionType === type.id ? 'none' : type.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all",
                    collectionType === type.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <type.icon className="w-4 h-4" />
                  <span>{type.label}</span>
                  {collectionType === type.id && (
                    <X className="w-3 h-3 ml-0.5 opacity-70" />
                  )}
                </button>
              ))}
            </div>

            {/* Inline collection settings panel — type-specific */}
            {collectionType === 'links' && (
              <div className="mt-2 px-4 pb-4 pt-6 border rounded-xl bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                {/* Pre-populate links */}
                <div className="space-y-2">
                  <Label className="text-sm">Pre-populate collection</Label>
                  {linkRows.map((row, i) => (
                    <div key={i} className="space-y-1.5 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <Input
                          value={row.title}
                          onChange={e => { const next = [...linkRows]; next[i].title = e.target.value; setLinkRows(next); }}
                          placeholder="Title"
                          className="h-8 bg-background flex-[2]"
                        />
                        <div className="relative flex-[3]">
                          <Input
                            value={row.url}
                            onChange={e => { const next = [...linkRows]; next[i].url = e.target.value; setLinkRows(next); }}
                            placeholder="URL"
                            className="h-8 bg-background pr-8"
                          />
                          <Paperclip className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setLinkRows(linkRows.filter((_, j) => j !== i))}
                          disabled={linkRows.length === 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={row.description}
                        onChange={e => { const next = [...linkRows]; next[i].description = e.target.value; setLinkRows(next); }}
                        placeholder="Description"
                        className="h-7 bg-background text-xs"
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => setLinkRows([...linkRows, { title: "", url: "", description: "" }])}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add another link
                  </button>
                </div>

                <Separator className="my-1" />
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <Label className="text-sm">Members can add</Label>
                  </div>
                  <Switch checked={membersCanAdd} onCheckedChange={setMembersCanAdd} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    <Label className="text-sm">Admins can add</Label>
                  </div>
                  <Switch checked={adminsCanAdd} onCheckedChange={setAdminsCanAdd} />
                </div>
              </div>
            )}

            {collectionType === 'posts' && (
              <div className="mt-2 px-4 pb-4 pt-5 border rounded-xl bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-sm">Members can add</Label>
                      </div>
                      <Switch checked={membersCanAdd} onCheckedChange={setMembersCanAdd} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-sm">Admins can add</Label>
                      </div>
                      <Switch checked={adminsCanAdd} onCheckedChange={setAdminsCanAdd} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-sm">Enable comments</Label>
                      </div>
                      <Switch checked={enableCollectionComments} onCheckedChange={setEnableCollectionComments} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={() => setDefaultsDialogOpen(true)}>Set Default Response</Button>
                </div>
              </div>
            )}

            {collectionType === 'memos' && (
              <div className="mt-2 px-4 pb-4 pt-5 border rounded-xl bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-sm">Members can add</Label>
                      </div>
                      <Switch checked={membersCanAdd} onCheckedChange={setMembersCanAdd} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-sm">Admins can add</Label>
                      </div>
                      <Switch checked={adminsCanAdd} onCheckedChange={setAdminsCanAdd} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={() => setDefaultsDialogOpen(true)}>Set Default Response</Button>
                </div>
              </div>
            )}

            {collectionType === 'whiteboards' && (
              <div className="mt-2 px-4 pb-4 pt-5 border rounded-xl bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-sm">Members can add</Label>
                      </div>
                      <Switch checked={membersCanAdd} onCheckedChange={setMembersCanAdd} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-sm">Admins can add</Label>
                      </div>
                      <Switch checked={adminsCanAdd} onCheckedChange={setAdminsCanAdd} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={() => setDefaultsDialogOpen(true)}>Set Default Response</Button>
                </div>
              </div>
            )}

            {collectionType === 'documents' && (
              <div className="mt-2 px-4 pb-4 pt-5 border rounded-xl bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-sm">Members can add</Label>
                      </div>
                      <Switch checked={membersCanAdd} onCheckedChange={setMembersCanAdd} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                        <Label className="text-sm">Admins can add</Label>
                      </div>
                      <Switch checked={adminsCanAdd} onCheckedChange={setAdminsCanAdd} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={() => setDefaultsDialogOpen(true)}>Set Default Response</Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* ─── Zone 3: More options (collapsed) ─── */}
          <Collapsible open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen} className="space-y-2">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between py-1 hover:opacity-80 transition-opacity">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer">More options</Label>
                <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", moreOptionsOpen && "rotate-90")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2 px-2">
              
              {/* Tags */}
              <div className="space-y-1.5">
                <Label className="text-sm">Tags</Label>
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
              <div className="flex items-center gap-6 py-2">
                <Label className="text-sm">Allow Comments</Label>
                <Switch checked={allowComments} onCheckedChange={setAllowComments} />
              </div>

              {/* References */}
              <div className="space-y-3">
                <Label className="text-sm">References</Label>
                {references.map((ref, index) => (
                  <div key={index} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={ref.title}
                            onChange={e => {
                              const updated = [...references];
                              updated[index] = { ...updated[index], title: e.target.value };
                              setReferences(updated);
                            }}
                            placeholder="Title"
                            className="h-8 bg-background text-sm flex-1"
                          />
                          <div className="relative flex-1">
                            <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                              value={ref.url}
                              onChange={e => {
                                const updated = [...references];
                                updated[index] = { ...updated[index], url: e.target.value };
                                setReferences(updated);
                              }}
                              placeholder="https://..."
                              className="pl-8 h-8 bg-background text-sm"
                            />
                          </div>
                        </div>
                        <Input
                          value={ref.description}
                          onChange={e => {
                            const updated = [...references];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setReferences(updated);
                          }}
                          placeholder="Short description (optional)"
                          className="h-8 bg-background text-sm"
                        />
                      </div>
                      {references.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setReferences(references.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8 text-xs"
                  onClick={() => setReferences([...references, { title: "", url: "", description: "" }])}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add another reference
                </Button>
              </div>

            </CollapsibleContent>
          </Collapsible>

        </div>

        {/* ─── Zone 4: Actions ─── */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/10">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Save Draft</Button>
          <Button onClick={() => onOpenChange(false)} className="px-8">Post</Button>
        </DialogFooter>
      </DialogContent>

      {/* ─── Nested: Response Defaults Dialog ─── */}
      <Dialog open={defaultsDialogOpen} onOpenChange={setDefaultsDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 rounded-xl border-0 shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3.5 border-b">
            <DialogTitle className="text-sm font-medium">
              {collectionType === 'posts' && 'Post defaults'}
              {collectionType === 'memos' && 'Memo defaults'}
              {collectionType === 'documents' && 'Document defaults'}
              {collectionType === 'whiteboards' && 'Whiteboard defaults'}
            </DialogTitle>
            <DialogClose className="rounded-full p-1.5 hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </DialogClose>
          </div>
          <DialogDescription className="sr-only">
            Configure default content for new responses in this collection.
          </DialogDescription>
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Template picker — Posts & Whiteboards only */}
            {(collectionType === 'posts' || collectionType === 'whiteboards') && (
              <div className="space-y-1.5">
                <Label className="text-sm">Template</Label>
                <div className="relative">
                  <button
                    onClick={() => collectionType === 'posts' ? setPostTemplateOpen(!postTemplateOpen) : setWbTemplateOpen(!wbTemplateOpen)}
                    className="flex items-center justify-between w-full h-9 px-3 rounded-md border bg-background text-sm text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <span className={
                      (collectionType === 'posts' ? selectedPostTemplate : selectedWbTemplate)
                        ? "text-foreground" : ""
                    }>
                      {(collectionType === 'posts' ? selectedPostTemplate : selectedWbTemplate) || "None"}
                    </span>
                    <ChevronsUpDown className="w-3.5 h-3.5" />
                  </button>
                  {((collectionType === 'posts' && postTemplateOpen) || (collectionType === 'whiteboards' && wbTemplateOpen)) && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md animate-in fade-in slide-in-from-top-1">
                      <div className="p-1.5 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input placeholder="Search…" className="h-7 pl-7 text-sm bg-transparent border-0 shadow-none focus-visible:ring-0" />
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto p-0.5">
                        {(collectionType === 'posts'
                          ? ["Blank Post", "Discussion Prompt", "Research Question", "Weekly Update", "Feedback Request"]
                          : ["Blank Canvas", "Business Model Canvas", "Lean Canvas", "SWOT Analysis", "Mind Map", "Stakeholder Map"]
                        ).map(t => {
                          const selected = collectionType === 'posts' ? selectedPostTemplate === t : selectedWbTemplate === t;
                          return (
                            <button
                              key={t}
                              onClick={() => {
                                if (collectionType === 'posts') { setSelectedPostTemplate(t); setPostTemplateOpen(false); }
                                else { setSelectedWbTemplate(t); setWbTemplateOpen(false); }
                              }}
                              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                            >
                              {selected && <Check className="w-3.5 h-3.5 text-primary" />}
                              <span className={selected ? "font-medium" : ""}>{t}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Default title */}
            <div className="space-y-1.5">
              <Label className="text-sm">Default title</Label>
              <Input
                value={collectionDefaultTitle}
                onChange={e => setCollectionDefaultTitle(e.target.value)}
                placeholder="Title"
                className="h-9 bg-background"
              />
            </div>

            {/* Default description — Posts & Memos */}
            {(collectionType === 'posts' || collectionType === 'memos') && (
              <div className="space-y-1.5">
                <Label className="text-sm">Default description</Label>
                <MarkdownEditor
                  value={collectionDefaultDescription}
                  onChange={setCollectionDefaultDescription}
                  placeholder="Description"
                  minHeight="120px"
                  className="bg-background rounded-md border [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-container]:border-0"
                />
              </div>
            )}

            {/* Whiteboard canvas preview */}
            {collectionType === 'whiteboards' && (
              <div className="space-y-1.5">
                <Label className="text-sm">Default whiteboard</Label>
                <div className="relative border rounded-lg bg-muted/30 min-h-[160px] flex items-center justify-center">
                  <Presentation className="w-10 h-10 text-muted-foreground/30" />
                  <Button variant="default" size="sm" className="absolute bottom-3 right-3 h-7 text-xs gap-1.5">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                </div>
              </div>
            )}

            {/* Document type & template */}
            {collectionType === 'documents' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Default document type</Label>
                  <div className="flex gap-2">
                    {[
                      { label: 'Word Document', icon: '\uD83D\uDCC4' },
                      { label: 'Spreadsheet', icon: '\uD83D\uDCCA' },
                      { label: 'Presentation', icon: '\uD83D\uDCD1' },
                    ].map((doc) => (
                      <button
                        key={doc.label}
                        className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-background hover:bg-muted transition-colors"
                      >
                        <span className="text-xl">{doc.icon}</span>
                        <span className="text-xs text-muted-foreground">{doc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Default template</Label>
                  <div className="border-2 border-dashed rounded-lg bg-background p-5 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground/50 mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground">Upload a template file</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">.docx, .xlsx, .pptx</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 px-5 py-3.5 border-t">
            <Button variant="ghost" size="sm" onClick={() => setDefaultsDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setDefaultsDialogOpen(false)}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}