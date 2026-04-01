import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Settings, Share2, Video, FileText } from "lucide-react";
import { Link } from "react-router";

interface SpaceHeaderProps {
  spaceSlug: string;
  spaceName?: string;
}

export function SpaceHeader({ spaceSlug, spaceName = "Green Energy Space" }: SpaceHeaderProps) {
  return (
    <div className="flex flex-col bg-background">
      {/* Hero Banner */}
      <div className="relative w-full h-[320px] overflow-hidden group">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjaGFsbGVuZ2UlMjBjcmVhdGl2ZSUyMHdvcmtzaG9wJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBpbm5vdmF0aW9uJTIwc3ByaW50JTIwZGVzaWduJTIwc3ByaW50fGVufDF8fHx8MTc2OTA5NDMxMHww&ixlib=rb-4.1.0&q=80&w=1080)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(29,56,74,0.4), rgba(102,102,102,0.08))",
          }}
        />

        {/* Breadcrumb + Actions overlay — top of banner */}
        <div
          className="absolute top-0 left-0 right-0 z-10 px-6 md:px-8"
          style={{
            paddingTop: 32,
          }}
        >
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex items-center justify-end">
          {/* Action icons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded hover:opacity-100"
              style={{ color: "white" }}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded hover:opacity-100"
              style={{ color: "white" }}
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded hover:opacity-100"
              style={{ color: "white" }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Link to={`/space/${spaceSlug}/settings`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded hover:opacity-100"
                style={{ color: "white" }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
            </div>
          </div>
        </div>

        {/* Content Container — title & members aligned to grid */}
        <div
          className="relative h-full flex flex-col justify-end w-full px-6 md:px-8"
          style={{
            paddingBottom: 24,
          }}
        >
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
          {/* Bottom: Title & Members */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl" style={{ color: "var(--primary-foreground)" }}>
              <h1
                className="mb-4"
                style={{
                  fontSize: "clamp(28px, 5vw, 48px)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  color: "var(--primary-foreground)",
                  fontFamily: "var(--font-family, 'Inter', sans-serif)",
                }}
              >
                Green Energy Space
              </h1>
              <p
                className="max-w-xl"
                style={{
                  fontSize: "var(--text-base)",
                  color: "var(--primary-foreground)",
                  opacity: 0.9,
                  lineHeight: 1.6,
                  fontFamily: "var(--font-family, 'Inter', sans-serif)",
                }}
              >
                Collaborating on the future of sustainable energy solutions and
                urban transformation.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar
                    key={i}
                    className="w-10 h-10 transition-transform hover:z-10 hover:scale-110"
                    style={{
                      border: "2px solid var(--background)",
                    }}
                  >
                    <AvatarImage
                      src={`https://i.pravatar.cc/150?u=${i + 10}`}
                    />
                    <AvatarFallback
                      style={{
                        background: "color-mix(in srgb, var(--primary) 20%, transparent)",
                        color: "var(--primary-foreground)",
                        fontSize: "12px",
                      }}
                    >
                      U{i}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-sm cursor-pointer transition-colors"
                  style={{
                    background: "color-mix(in srgb, var(--primary-foreground) 20%, transparent)",
                    border: "2px solid var(--background)",
                    color: "var(--primary-foreground)",
                    fontSize: "12px",
                    fontWeight: "var(--font-weight-medium)" as any,
                    fontFamily: "var(--font-family, 'Inter', sans-serif)",
                  }}
                >
                  +24
                </div>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
