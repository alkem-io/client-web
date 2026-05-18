import { Link } from "react-router";

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
  avatarImage,
}: SubspaceHeaderProps) {
  return (
    <div
      className="flex flex-col"
    >
      {/* Banner — full-width, slides behind transparent header */}
      <div
        className="relative w-full overflow-hidden"
        style={{ marginTop: "-64px", aspectRatio: "6 / 1" }}
      >
        <img
          src={imageUrl}
          alt="Subspace banner"
          className="w-full h-full object-cover"
          style={{ display: "block" }}
        />
      </div>

      {/* Compact info bar */}
      <div
        className="w-full px-6 md:px-8 pt-8 pb-8"
      >
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex items-center gap-4">
            {/* Subspace avatar — spans full info bar height */}
            <div
              className="shrink-0 overflow-hidden flex items-center justify-center self-stretch"
              style={{
                width: 56,
                aspectRatio: "1",
                borderRadius: "var(--radius-md, 6px)",
                border: "2px solid var(--border)",
                background: avatarImage ? undefined : avatarColor
              }}
            >
              {avatarImage ? (
                <img src={avatarImage} alt={title} className="w-full h-full object-cover" />
              ) : (
                <span style={{ color: "var(--primary-foreground)", fontSize: "18px", fontWeight: 600 }}>
                  {initials}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <h1
                className="text-foreground truncate text-hero"
              >
                {title}
              </h1>
              <p
                className="text-muted-foreground truncate"
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
