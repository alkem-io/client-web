import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { useNavigate, Link } from "react-router";
import {
  Activity,
  Video,
  FileText,
  Settings,
  Share2,
} from "lucide-react";

interface SubspaceHeaderProps {
  spaceSlug: string;
  subspaceSlug: string;
  title: string;
  description: string;
  parentSpaceName: string;
  imageUrl: string;
  initials: string;
  avatarColor: string;
  parentInitials: string;
  parentAvatarColor: string;
  parentBannerImage?: string;
  avatarImage?: string;
  memberCount?: number;
  onCommunityClick?: () => void;
}

export function SubspaceHeader({
  spaceSlug,
  subspaceSlug,
  title,
  description,
  parentSpaceName,
  imageUrl,
  initials,
  avatarColor,
  parentInitials,
  parentAvatarColor,
  parentBannerImage,
  avatarImage,
  memberCount = 16,
  onCommunityClick,
}: SubspaceHeaderProps) {
  const navigate = useNavigate();
  const avatarCount = Math.min(memberCount, 5);
  const overflow = memberCount - avatarCount;

  return (
    <div className="relative group">
      {/* Banner Image */}
      <div className="h-52 md:h-64 w-full relative overflow-hidden bg-muted">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Action icons overlay — top-right of banner */}
        <div
          className="absolute top-0 left-0 right-0 z-10 px-6 md:px-8"
          style={{ paddingTop: 32 }}
        >
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex items-center justify-end">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded hover:opacity-100"
                  style={{ color: "white" }}
                  title="Recent Activity"
                >
                  <Activity className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded hover:opacity-100"
                  style={{ color: "white" }}
                  title="Video Call"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded hover:opacity-100"
                  style={{ color: "white" }}
                  title="Documents"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded hover:opacity-100"
                  style={{ color: "white" }}
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Link to={`/space/${spaceSlug}/subspaces/${subspaceSlug}/settings/about`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded hover:opacity-100"
                    style={{ color: "white" }}
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* "SUBSPACE" badge — top-right */}
        <Badge
          variant="secondary"
          className="absolute top-4 right-4 backdrop-blur-sm border-0"
          style={{
            background:
              "color-mix(in srgb, var(--background) 80%, transparent)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            fontFamily: "var(--font-family, 'Inter', sans-serif)",
          }}
        >
          SUBSPACE
        </Badge>

        {/* Member avatars — bottom-right of banner */}
        <div className="absolute bottom-6 right-6 md:right-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex justify-end">
              <button
                onClick={onCommunityClick}
                className="flex items-center gap-4 cursor-pointer transition-opacity hover:opacity-90"
                title="View community"
              >
                <div className="flex -space-x-2">
                  {Array.from({ length: avatarCount }).map((_, i) => (
                    <Avatar
                      key={i}
                      className="w-10 h-10 transition-transform hover:z-10 hover:scale-110"
                      style={{ border: "2px solid var(--background)" }}
                    >
                      <AvatarImage
                        src={`https://i.pravatar.cc/150?u=sub-${i + 20}`}
                      />
                      <AvatarFallback
                        style={{
                          background:
                            "color-mix(in srgb, var(--primary) 20%, transparent)",
                          color: "var(--primary-foreground)",
                          fontSize: "12px",
                        }}
                      >
                        U{i}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {overflow > 0 && (
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-sm cursor-pointer transition-colors"
                      style={{
                        background:
                          "color-mix(in srgb, var(--primary-foreground) 20%, transparent)",
                        border: "2px solid var(--background)",
                        color: "var(--primary-foreground)",
                        fontSize: "12px",
                        fontWeight: "var(--font-weight-medium)" as any,
                        fontFamily: "var(--font-family, 'Inter', sans-serif)",
                      }}
                    >
                      +{overflow}
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Below-banner section: avatar overlaps upward, text stays below */}
      <div className="px-6 md:px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex flex-col md:flex-row items-start gap-5">

            {/* Two-layered avatar: overlaps banner via negative margin */}
            <div className="relative shrink-0 -mt-12" style={{ width: 112, height: 112 }}>
              {/* Parent space avatar (behind, top-left) — derived from banner */}
              <div
                className="absolute top-0 left-0 overflow-hidden flex items-center justify-center"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "var(--radius-xl)",
                  border: "3px solid var(--background)",
                  background: parentBannerImage ? undefined : parentAvatarColor,
                  zIndex: 1,
                }}
              >
                {parentBannerImage ? (
                  <img src={parentBannerImage} alt={parentSpaceName} className="w-full h-full object-cover" />
                ) : (
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "var(--primary-foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {parentInitials}
                  </span>
                )}
              </div>

              {/* Subspace avatar (in front, bottom-right) — picture avatar */}
              <div
                className="absolute overflow-hidden flex items-center justify-center"
                style={{
                  width: 88,
                  height: 88,
                  top: 24,
                  left: 24,
                  borderRadius: "var(--radius-xl)",
                  border: "3px solid var(--background)",
                  background: avatarImage ? undefined : avatarColor,
                  zIndex: 2,
                  boxShadow: "var(--elevation-sm)",
                }}
              >
                {avatarImage ? (
                  <img src={avatarImage} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "var(--primary-foreground)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Info — below the banner, not overlapping */}
            <div className="flex-1 pt-4">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold text-foreground mb-1"
                  style={{
                    letterSpacing: "-0.02em",
                    fontFamily: "var(--font-family, 'Inter', sans-serif)",
                  }}
                >
                  {title}
                </h1>
                <p
                  className="text-sm text-muted-foreground max-w-xl"
                  style={{
                    lineHeight: 1.5,
                    fontFamily: "var(--font-family, 'Inter', sans-serif)",
                  }}
                >
                  {description}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
