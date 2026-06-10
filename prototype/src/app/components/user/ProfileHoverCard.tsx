import React from "react";
import { Link } from "react-router";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/app/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { MapPin, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProfileHoverCardUser {
  name: string;
  avatarUrl?: string | null;
  initials?: string;
  location?: string;
  tags?: string[];
  bio?: string;
  profileUrl?: string;
}

interface ProfileHoverCardProps {
  user: ProfileHoverCardUser;
  children: React.ReactNode;
  /** Side offset from trigger */
  sideOffset?: number;
  /** Alignment relative to trigger */
  align?: "start" | "center" | "end";
  /** Open delay in ms (default 200) */
  openDelay?: number;
  /** Close delay in ms (default 0) */
  closeDelay?: number;
  /** Called when Message button is clicked */
  onMessage?: () => void;
}

const MAX_VISIBLE_TAGS = 4;

export function ProfileHoverCard({
  user,
  children,
  sideOffset = 8,
  align = "center",
  openDelay = 200,
  closeDelay = 0,
  onMessage,
}: ProfileHoverCardProps) {
  const profileUrl = user.profileUrl || `/user/${user.name.toLowerCase().replace(/\s+/g, "-")}`;
  const visibleTags = user.tags?.slice(0, MAX_VISIBLE_TAGS) ?? [];
  const overflowCount = (user.tags?.length ?? 0) - MAX_VISIBLE_TAGS;

  return (
    <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        className="w-72 p-0 overflow-hidden"
        sideOffset={sideOffset}
        align={align}
      >
        <Link
          to={profileUrl}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          {/* Content */}
          <div className="p-4 pb-3">
            <div className="flex items-start gap-3">
              <Avatar className="w-14 h-14 shrink-0 border border-border shadow-sm">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="text-body-emphasis bg-muted font-medium">
                  {user.initials || user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 pt-0.5">
                {/* Name */}
                <h4 className="text-body-emphasis font-semibold text-foreground leading-tight line-clamp-2">
                  {user.name}
                </h4>

                {/* Location */}
                {user.location && (
                  <div className="flex items-center gap-1.5 mt-1 text-caption text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="mt-3 text-caption text-muted-foreground line-clamp-2 leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Tags */}
            {visibleTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 text-caption font-medium rounded-full",
                      "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {tag}
                  </span>
                ))}
                {overflowCount > 0 && (
                  <span className="text-caption text-muted-foreground font-medium px-1">
                    +{overflowCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>

        {/* Message button — outside the link to prevent navigation */}
        <div className="px-4 pb-4 -mt-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2 text-caption"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMessage?.();
            }}
          >
            <Mail className="w-3.5 h-3.5" />
            Message
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
