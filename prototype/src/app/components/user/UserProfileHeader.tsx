import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Mail, MapPin, Settings } from "lucide-react";

interface UserProfileHeaderProps {
  user: {
    name: string;
    avatarUrl: string;
    location: string;
    username?: string; // Add username to interface for the link
    isOwnProfile?: boolean;
  };
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  // Use username from prop or fallback to 'arivera' as consistent with UserProfilePage
  const userSlug = user.username || "arivera"; 

  return (
    <div className="relative mb-20 md:mb-24 group">
      {/* Banner Image */}
      <div className="h-64 md:h-80 w-full relative overflow-hidden bg-muted">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ 
            backgroundImage: `url(https://images.unsplash.com/photo-1758630737361-ca7532fb5e7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzY5MDk2MDc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Profile Info Overlay */}
      <div className="absolute -bottom-16 md:-bottom-20 left-0 right-0 px-4 md:px-8">
        <div className="container mx-auto flex flex-col md:flex-row items-end gap-6">
          
          {/* Avatar */}
          <div className="relative shrink-0">
             <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-lg text-4xl">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-success border-4 border-background rounded-full" title="Online" />
          </div>

          {/* Info & Actions */}
          <div className="flex-1 pb-2 flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
            <div className="mb-2 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">{user.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
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
                  <Button variant="secondary" size="icon" className="shadow-sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}