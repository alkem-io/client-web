import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageSquare, MoreHorizontal, LayoutGrid, FileText, Presentation, Maximize2 } from "lucide-react";

export type PostType = "text" | "whiteboard" | "collection" | "call-for-whiteboards";

export interface PostProps {
  id: string;
  type: PostType;
  author: {
    name: string;
    avatarUrl?: string;
    role: string;
  };
  title: string;
  snippet: string;
  timestamp: string;
  contentPreview?: {
    imageUrl?: string;
    items?: Array<{ title: string; type: string }>;
    whiteboards?: Array<{ title: string; imageUrl: string; author: string }>;
  };
  stats: {
    comments: number;
  };
  onClick?: () => void;
}

export function PostCard({ post }: { post: PostProps }) {
  const getIcon = () => {
    switch (post.type) {
      case "whiteboard": return <LayoutGrid className="w-4 h-4" />;
      case "collection": return <LayoutGrid className="w-4 h-4" />;
      case "call-for-whiteboards": return <Presentation className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (post.type) {
      case "whiteboard": return "Whiteboard";
      case "collection": return "Collection";
      case "call-for-whiteboards": return "Call for Whiteboards";
      default: return "Post";
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300 border-border/60">
      <CardHeader className="flex flex-row items-start justify-between pb-3 pt-5 px-6 space-y-0">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{post.author.name}</span>
              <span className="text-xs text-muted-foreground">• {post.timestamp}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                {post.author.role}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {getIcon()} {getLabel()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              post.onClick?.();
            }}
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-3">
        <h3 
          className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors cursor-pointer"
          onClick={post.onClick}
        >
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {post.snippet}
        </p>

        {post.type === "whiteboard" && post.contentPreview?.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-border bg-muted/30 relative aspect-video">
            <ImageWithFallback 
              src={post.contentPreview.imageUrl} 
              alt="Whiteboard preview" 
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Button variant="secondary" className="shadow-sm">Open Whiteboard</Button>
            </div>
          </div>
        )}

        {post.type === "collection" && post.contentPreview?.items && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {post.contentPreview.items.slice(0, 4).map((item, idx) => (
              <div key={idx} className="bg-muted/30 rounded-md p-3 border border-border flex items-center gap-2">
                <div className="w-8 h-8 bg-background rounded flex items-center justify-center border border-border shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium truncate">{item.title}</span>
              </div>
            ))}
          </div>
        )}

        {post.type === "call-for-whiteboards" && post.contentPreview?.whiteboards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {post.contentPreview.whiteboards.slice(0, 4).map((wb, idx) => {
              const remainingCount = (post.contentPreview?.whiteboards?.length || 0) - 3;
              const isLastItem = idx === 3;
              const showMoreOverlay = isLastItem && remainingCount > 1;

              return (
                <div key={idx} className="group/wb relative rounded-lg overflow-hidden border border-border bg-muted/30 aspect-[4/3] cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <ImageWithFallback 
                    src={wb.imageUrl} 
                    alt={wb.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/wb:scale-105" 
                  />
                  
                  {/* Hover Overlay (Button & Dimming) - Visible on hover, unless it's the "More" block */}
                  {!showMoreOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/wb:opacity-100 transition-opacity duration-200 bg-primary/40">
                      <Button variant="secondary" size="sm" className="shadow-lg h-8 text-xs font-semibold">
                        Open Whiteboard
                      </Button>
                    </div>
                  )}

                  {/* Text Overlay (Title/Author) - Always visible unless "More" overlay is active */}
                  {!showMoreOverlay && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent p-3 flex flex-col justify-end pointer-events-none">
                      <p className="text-white text-xs font-semibold truncate">{wb.title}</p>
                      <p className="text-white/70 text-[10px] truncate">by {wb.author}</p>
                    </div>
                  )}

                  {/* "More" Overlay - Always visible for the 4th item if there are more */}
                  {showMoreOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/60 backdrop-blur-[2px]">
                      <span className="text-white font-bold text-lg">+{remainingCount} more</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-6 py-3 border-t bg-muted/5 flex items-center gap-4">
        <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs">{post.stats.comments} Comments</span>
        </Button>
      </CardFooter>
    </Card>
  );
}