import { Link } from "react-router";
import { Info, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";

const BANNER_IMAGE = "https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjaGFsbGVuZ2UlMjBjcmVhdGl2ZSUyMHdvcmtzaG9wJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBpbm5vdmF0aW9uJTIwc3ByaW50JTIwZGVzaWduJTIwc3ByaW50fGVufDF8fHx8MTc2OTA5NDMxMHww&ixlib=rb-4.1.0&q=80&w=1920";

interface SpaceHeaderProps {
  spaceSlug: string;
  spaceName?: string;
  variant?: 1 | 2 | 3 | 4 | 5;
  onInfoClick?: () => void;
}

export function SpaceHeader({ spaceSlug, variant = 1, onInfoClick }: SpaceHeaderProps) {

  // V2+ use a max-width container so content scales into margins on zoom
  const scaledContainer = { maxWidth: 1536, margin: "0 auto", width: "100%" };
  const usesScaling = variant !== 1;

  return (
    <div className="flex flex-col">
      {/* Banner */}
      {variant === 4 ? (
        <div style={{ marginTop: "-64px", height: "64px" }} />
      ) : (variant === 2 || variant === 3) ? (
        <div
          className="w-full"
          style={{ marginTop: "-64px" }}
        >
          <div className="px-4">
            <div
              className="relative overflow-hidden"
              style={{ ...scaledContainer, ...(variant === 3 ? { height: "77px" } : { aspectRatio: "6 / 1" }) }}
            >
              <img
                src={BANNER_IMAGE}
                alt="Space banner"
                className="w-full h-full object-cover"
                style={{ display: "block" }}
              />
              {/* Gradient wing overlays on left and right edges */}
              {variant === 2 && (
                <>
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: "15%",
                      background: "linear-gradient(to right, rgba(44, 24, 16, 0.85), transparent)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    className="absolute inset-y-0 right-0"
                    style={{
                      width: "15%",
                      background: "linear-gradient(to left, rgba(44, 24, 16, 0.85), transparent)",
                      pointerEvents: "none",
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative w-full overflow-hidden"
          style={{ marginTop: "-64px", height: "256px" }}
        >
          <img
            src={BANNER_IMAGE}
            alt="Space banner"
            className="w-full h-full object-cover"
            style={{ display: "block" }}
          />
        </div>
      )}

      {/* Compact info bar — title + tagline */}
      <div
        className="w-full px-4"
        style={{
          paddingTop: (variant === 5 || variant === 1) ? 32 : 16,
          paddingBottom: (variant === 5 || variant === 1) ? 32 : 16,
          ...(!usesScaling ? { paddingLeft: 32, paddingRight: 32 } : {}),
        }}
      >
        <div style={usesScaling ? scaledContainer : undefined}>
          {usesScaling ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <h1
                    className="text-foreground truncate font-bold tracking-tight"
                    style={{ fontSize: "clamp(22px, 3vw, 32px)", lineHeight: 1.2 }}
                  >
                    Steward-Ownership Field Builder Community
                  </h1>
                  {onInfoClick && (
                    <button
                      onClick={onInfoClick}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-muted/60"
                      style={{
                        color: "var(--muted-foreground)",
                      }}
                      title="About this Space"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LeadChip />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-muted-foreground truncate text-sm" style={{ lineHeight: 1.4 }}>
                  The place for all field builders on steward-ownership to learn, connect, discuss and collaborate.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <h1
                      className="text-foreground truncate font-bold tracking-tight"
                      style={{ fontSize: "clamp(22px, 3vw, 32px)", lineHeight: 1.2 }}
                    >
                      Steward-Ownership Field Builder Community
                    </h1>
                    {onInfoClick && (
                      <button
                        onClick={onInfoClick}
                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-muted/60"
                        style={{
                          color: "var(--muted-foreground)",
                        }}
                        title="About this Space"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <LeadChip />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-muted-foreground truncate text-sm" style={{ lineHeight: 1.4 }}>
                    The place for all field builders on steward-ownership to learn, connect, discuss and collaborate.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const leads = [
  { name: "Elena Martinez", initials: "EM", location: "Amsterdam, NL", src: "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGdsYXNzZXMlMjBibGFjayUyMGFuZCUyMHdoaXRlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzY5NDQyNTM3fDA&ixlib=rb-4.1.0&q=80&w=256" },
  { name: "Thomas Berg", initials: "TB", location: "Rotterdam, NL", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=256" },
  { name: "Sarah Chen", initials: "SC", location: "Berlin, DE", src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=256" },
];

function LeadChip() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-2.5 rounded-lg px-3 py-1.5 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
          style={{ background: "var(--background)" }}
        >
          {/* Stacked avatars */}
          <div className="flex items-center -space-x-1.5">
            {leads.map((lead) => (
              <Avatar key={lead.initials} className="w-6 h-6 ring-2 ring-background">
                <AvatarImage src={lead.src} alt={lead.name} />
                <AvatarFallback style={{ fontSize: "10px", fontWeight: 700 }}>{lead.initials}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="min-w-0 hidden lg:block text-left">
            <p className="text-caption whitespace-nowrap">
              {leads.length === 1
                ? `Lead: ${leads[0].name}`
                : `${leads.length} Leads`}
            </p>
            <p className="text-caption text-muted-foreground whitespace-nowrap">
              {leads.length === 1
                ? leads[0].location
                : leads.map((l) => l.name.split(" ")[0]).join(", ")}
            </p>
          </div>
          <p className="text-caption lg:hidden whitespace-nowrap">
            {leads.length === 1 ? "Lead" : `${leads.length} Leads`}
          </p>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Space Leads</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {leads.map((lead) => (
            <div key={lead.initials} className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={lead.src} alt={lead.name} />
                <AvatarFallback style={{ fontSize: "12px", fontWeight: 700 }}>{lead.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-body font-medium text-foreground truncate">{lead.name}</p>
                <p className="text-caption text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {lead.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
