import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import { 
  X, Share2, MoreHorizontal, PenTool, FileText, Link as LinkIcon, 
  Layout, ChevronLeft, ChevronRight, Send, Smile, AtSign, Trash2, Edit2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/app/components/ui/separator";

interface ResponseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  responseId?: string | null;
}

// Mock Data
const MOCK_RESPONSE = {
  id: "resp-1",
  type: "Whiteboard",
  title: "Logistics Map V1",
  author: {
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc2OTQ4MTEzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    initials: "SJ",
    date: "09/10/2025"
  },
  content: {
    image: "https://images.unsplash.com/photo-1758691736067-b309ee3ef7b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZWJvYXJkJTIwZGlhZ3JhbXxlbnwxfHx8fDE3Njk1OTc1MjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Here is the initial draft of the logistics map for the downtown district. I've highlighted the potential drop-off zones in red and the community fridge locations in green. We need to verify the truck access routes."
  },
  comments: [
    {
      id: "c1",
      author: { name: "Mike K.", avatar: "", initials: "MK" },
      text: "The drop-off zone on 4th street might be too tight for larger trucks.",
      date: "2 hours ago",
      reactions: 2
    },
    {
      id: "c2",
      author: { name: "Hoyte R.", avatar: "https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3Njk1ODYxMDR8MA&ixlib=rb-4.1.0&q=80&w=1080", initials: "HR" },
      text: "Good catch Mike. Let's move it to the loading dock behind the library.",
      date: "1 hour ago",
      reactions: 1
    }
  ],
  responseIndex: 3,
  totalResponses: 8
};

const PEER_RESPONSES = [
  { id: "1", type: "Text", title: "Legal Framework", author: "Mike K.", date: "1d ago" },
  { id: "2", type: "Whiteboard", title: "Logistics Map V1", author: "Sarah Jenkins", date: "2d ago", active: true },
  { id: "3", type: "Collection", title: "Existing Models", author: "Hoyte R.", date: "Today" },
  { id: "4", type: "Text", title: "Budget Draft", author: "Elena R.", date: "3d ago" },
  { id: "5", type: "Whiteboard", title: "User Journey", author: "David M.", date: "3d ago" },
];

export function ResponseDetailDialog({ open, onOpenChange, responseId }: ResponseDetailDialogProps) {
  const [commentText, setCommentText] = useState("");
  const isAuthor = true; // Mock author status

  const handleCopyLink = () => {
    toast.success("Link copied to clipboard");
  };

  const handleDelete = () => {
    toast.error("Delete functionality not implemented in demo");
  };

  const handleNav = (direction: "prev" | "next") => {
    toast.info(`Navigating to ${direction} response`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-5xl h-[95vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border-none shadow-2xl rounded-xl z-[60]">
        
        {/* 1. Modal Header (Sticky) */}
        <div className="h-14 shrink-0 bg-background flex items-center justify-between px-4 border-b border-border z-20">
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
              <DialogTitle className="text-sm font-bold text-foreground line-clamp-1">
                Response Detail
              </DialogTitle>
              <DialogDescription className="sr-only">
                View and interact with a response submission.
              </DialogDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 2. Response Navigation Controls */}
        <div className="h-12 shrink-0 bg-muted/20 border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
               <span>Response {MOCK_RESPONSE.responseIndex} of {MOCK_RESPONSE.totalResponses}</span>
            </div>
            
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-1 pl-2 pr-3 text-muted-foreground hover:text-foreground"
                    onClick={() => handleNav("prev")}
                >
                    <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
                <div className="w-px h-4 bg-border" />
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-1 pl-3 pr-2 text-muted-foreground hover:text-foreground"
                    onClick={() => handleNav("next")}
                >
                    Next <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>

        {/* 3. Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-5xl mx-auto w-full pb-20">
            
            {/* Peer Responses Preview Strip */}
            <div className="px-8 pt-8 pb-2">
               <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                 All Contributions ({MOCK_RESPONSE.totalResponses})
               </h3>
               <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 snap-x">
                  {PEER_RESPONSES.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "snap-start shrink-0 w-48 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm flex flex-col gap-2",
                        item.active 
                          ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" 
                          : "bg-background border-border hover:border-primary/50"
                      )}
                      onClick={() => !item.active && handleNav("next")}
                    >
                       <div className="flex items-start justify-between">
                          <Badge variant="outline" className="text-[10px] h-5 px-1 bg-transparent border-border/60 text-muted-foreground">
                             {item.type}
                          </Badge>
                          {item.type === "Whiteboard" ? (
                            <PenTool className="w-3 h-3 text-muted-foreground" />
                          ) : item.type === "Collection" ? (
                            <Layout className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <FileText className="w-3 h-3 text-muted-foreground" />
                          )}
                       </div>
                       <div className="space-y-1">
                          <div className={cn("font-semibold text-sm leading-tight line-clamp-2", item.active ? "text-primary" : "text-foreground")}>
                            {item.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <span>{item.author}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground" />
                            <span>{item.date}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                  
                  {/* View All Card */}
                  <div className="shrink-0 w-24 flex items-center justify-center rounded-lg border border-dashed border-border hover:bg-muted/30 cursor-pointer transition-colors">
                     <span className="text-xs font-medium text-muted-foreground">View All</span>
                  </div>
               </div>
               <Separator className="mt-2" />
            </div>

            {/* Response Content */}
            <div className="px-8 py-6 space-y-6">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="gap-1.5 py-1 pr-3 pl-2 font-normal text-muted-foreground bg-background border-border">
                   <PenTool className="w-3.5 h-3.5 text-primary" /> Whiteboard
                </Badge>
                
                <div className="flex items-center gap-1">
                    {isAuthor && (
                        <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full">
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        </>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-foreground leading-tight mb-4">
                  {MOCK_RESPONSE.title}
                </h1>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={MOCK_RESPONSE.author.avatar} />
                    <AvatarFallback>{MOCK_RESPONSE.author.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{MOCK_RESPONSE.author.name}</span>
                    <span className="text-xs text-muted-foreground">{MOCK_RESPONSE.author.date}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <p className="text-base text-foreground/90 leading-relaxed">
                   {MOCK_RESPONSE.content.description}
                 </p>
                 <div className="rounded-xl overflow-hidden border border-border bg-muted relative group cursor-pointer shadow-sm">
                    <img src={MOCK_RESPONSE.content.image} alt="Whiteboard" className="w-full max-h-[500px] object-cover" />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
                       <Button variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
                         Open Whiteboard
                       </Button>
                    </div>
                 </div>
              </div>
            </div>

            {/* 4. Comments Section */}
            <div className="bg-muted/30 border-t border-border p-8 min-h-[300px]">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-base font-bold flex items-center gap-2">
                   Comments on this response
                   <Badge variant="secondary" className="h-5 px-1.5 text-[10px] rounded-full">2</Badge>
                 </h3>
               </div>
               
               <div className="space-y-6">
                  {MOCK_RESPONSE.comments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                       <Avatar className="w-8 h-8 mt-1">
                         <AvatarImage src={comment.author.avatar} />
                         <AvatarFallback className="text-xs">{comment.author.initials}</AvatarFallback>
                       </Avatar>
                       <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{comment.author.name}</span>
                                <span className="text-xs text-muted-foreground">{comment.date}</span>
                             </div>
                          </div>
                          <p className="text-sm text-foreground/90">{comment.text}</p>
                          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                             <button className="hover:text-primary transition-colors">Reply</button>
                             <button className="hover:text-primary transition-colors flex items-center gap-1">
                               Like ({comment.reactions})
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

          </div>
        </div>

        {/* 5. Sticky Comment Input */}
        <div className="p-4 bg-background border-t border-border z-20 shrink-0">
          <div className="max-w-5xl mx-auto flex gap-3 items-end">
             <Avatar className="w-8 h-8 mb-1">
               <AvatarFallback className="bg-primary/10 text-primary">ME</AvatarFallback>
             </Avatar>
             <div className="flex-1 relative bg-muted/30 rounded-xl border border-border focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all">
                <Textarea 
                  placeholder="Comment on this response..." 
                  className="min-h-[48px] max-h-[120px] pr-14 resize-none py-3 bg-transparent border-none focus-visible:ring-0 shadow-none text-sm"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex items-center justify-between px-2 pb-2">
                   <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <Smile className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <AtSign className="w-4 h-4" />
                      </Button>
                   </div>
                   <Button size="icon" className="h-8 w-8 rounded-lg" disabled={!commentText.trim()}>
                     <Send className="w-4 h-4" />
                   </Button>
                </div>
             </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}