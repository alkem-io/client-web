import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Search,
  Settings,
  Share2,
  Maximize2,
} from "lucide-react";

interface SubspaceHeaderProps {
  spaceSlug: string;
  subspaceSlug: string;
  title: string;
  description: string;
  parentSpaceName: string;
  imageUrl: string;
  memberCount?: number;
}

export function SubspaceHeader({
  spaceSlug,
  title,
  description,
  parentSpaceName,
  imageUrl,
  memberCount = 16,
}: SubspaceHeaderProps) {
  const avatarCount = Math.min(memberCount, 5);
  const overflow = memberCount - avatarCount;

  return (
    <div className="relative w-full h-[320px] overflow-hidden group">
      {/* Background image with hover parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "color-mix(in srgb, var(--foreground) 50%, transparent)",
        }}
      />

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

      {/* Content container */}
      <div className="relative h-full px-6 md:px-8 py-8 flex flex-col justify-between pb-12">
        {/* Top row: utility icons — aligned to grid col 2-11 */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10">
            <div className="flex items-center justify-end">

              <div className="flex items-center gap-1">
                {[
                  { icon: Search, label: "Search" },
                  { icon: Maximize2, label: "Open" },
                  { icon: Settings, label: "Settings" },
                  { icon: Share2, label: "Share" },
                ].map(({ icon: Icon, label }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="icon"
                    title={label}
                    className="hover:opacity-100"
                    style={{
                      color: "var(--primary-foreground)",
                      opacity: 0.8,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: title + members — aligned to grid col 2-11 */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div
            className="max-w-3xl"
            style={{ color: "var(--primary-foreground)" }}
          >
            <h1
              className="mb-4"
              style={{
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                fontFamily: "var(--font-family, 'Inter', sans-serif)",
              }}
            >
              {title}
            </h1>
            <p
              className="max-w-xl"
              style={{
                fontSize: "var(--text-base)",
                opacity: 0.9,
                lineHeight: 1.6,
                fontFamily: "var(--font-family, 'Inter', sans-serif)",
              }}
            >
              {description}
            </p>
          </div>

          {/* Member avatars */}
          <div className="flex items-center gap-4 shrink-0">
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
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
