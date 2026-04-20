import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent } from "@/app/components/ui/card";
import { Users } from "lucide-react";

interface OrganizationCardProps {
  name: string;
  role: string;
  memberCount: number;
  imageUrl?: string;
}

export function OrganizationCard({ name, role, memberCount, imageUrl }: OrganizationCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer border-border/50">
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 rounded-lg border border-border">
          <AvatarImage src={imageUrl} alt={name} className="object-cover" />
          <AvatarFallback className="rounded-lg bg-secondary text-secondary-foreground">
            {name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <p className="text-sm text-muted-foreground truncate">{role}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
          <Users className="w-3 h-3" />
          <span>{memberCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
