import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Lock, Users, Globe, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpaceGridCardProps {
  title: string;
  description: string;
  memberCount: number;
  isPrivate?: boolean;
  role?: "host" | "facilitator" | "member";
  imageUrl?: string;
  className?: string;
}

export function SpaceGridCard({
  title,
  description,
  memberCount,
  isPrivate = false,
  role = "member",
  imageUrl,
  className,
}: SpaceGridCardProps) {
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer h-full flex flex-col", className)}>
      <div className="relative h-32 w-full bg-muted overflow-hidden">
        {imageUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary" />
        )}
        <div className="absolute top-2 right-2 flex gap-2">
           {role !== "member" && (
            <Badge variant="secondary" className="bg-background/90 backdrop-blur text-xs font-medium shadow-sm">
              {role === "host" ? "Host" : "Facilitator"}
            </Badge>
          )}
          {isPrivate && (
            <div className="h-6 w-6 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-muted-foreground shadow-sm">
              <Lock className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
      
      <CardHeader className="p-4 pb-2">
        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
          {title}
        </h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between gap-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{memberCount} members</span>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <Avatar key={i} className="w-6 h-6 border-2 border-background">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${title}${i}`} />
                <AvatarFallback className="text-[9px]">U{i}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
