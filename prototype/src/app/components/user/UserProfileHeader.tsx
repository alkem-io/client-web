import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Mail, MapPin, Settings } from "lucide-react";

interface UserProfileHeaderProps {
  user: {
    name: string;
    avatarUrl: string;
    location: string;
    username?: string;
    isOwnProfile?: boolean;
  };
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  const userSlug = user.username || "arivera"; 

  return (
    <div className="px-6 md:px-8 pt-8 pb-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-start-2 lg:col-span-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-background shadow-lg text-4xl">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-success border-3 border-background rounded-full" title="Online" />
            </div>

            {/* Info & Actions */}
            <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 w-full pt-2">
              <div>
                <h1 className="text-hero text-foreground mb-1">{user.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-body-emphasis">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4 md:mt-0">
                <Button className="gap-2 shadow-sm">
                  <Mail className="w-4 h-4" />
                  Message
                </Button>
                {user.isOwnProfile && (
                  <Link to={`/user/${userSlug}/settings/account`}>
                    <Button variant="outline" size="icon" className="shadow-sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}