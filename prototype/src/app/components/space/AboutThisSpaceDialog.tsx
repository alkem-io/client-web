import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/app/components/ui/dialog";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Button } from "@/app/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  X,
  Pencil,
  Target,
  Users,
  Globe,
  MapPin,
  Mail,
  BookOpen,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */

interface SpaceLead {
  name: string;
  location: string;
  avatar: string;
  initials: string;
}

interface SpaceReference {
  title: string;
  url: string;
}

interface SpaceHost {
  name: string;
  location: string;
  avatar: string;
  initials: string;
  email: string;
}

interface AboutThisSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Whether the current user can edit (admin / facilitator) */
  isAdmin?: boolean;
  /** Space slug for settings navigation */
  spaceSlug?: string;
}

/* ─── Mock data ──────────────────────────────────────────── */

const SPACE_DATA = {
  name: "The Sandbox",
  tagline:
    "To try and play around with various Alkemio features; to gain a better understanding of the platform, its flows and experience",
  description:
    "SANDY! A place to try and play around with various Alkemio features, to gain a better understanding of the platform, its flows, experiences, and how to improve it. To test out new features and try new things. To boldly go where no user has gone before.",
  bannerImage:
    "https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjaGFsbGVuZ2UlMjBjcmVhdGl2ZSUyMHdvcmtzaG9wJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBpbm5vdmF0aW9uJTIwc3ByaW50JTIwZGVzaWduJTIwc3ByaW50fGVufDF8fHx8MTc2OTA5NDMxMHww&ixlib=rb-4.1.0&q=80&w=1080",
  location: "'s-gravenhage",
  memberCount: 16,
  whyText: "this is the description of why",
  whoText: "this is who can join us",
  guidelines: {
    title: "United in Knowledge: Key Guidelines for Success",
    body: `**Community Guidelines for The Sandbox**

Introduction
Welcome to The Sandbox!

Key Guidelines

**Respect and Empathy**
Treat all community members with respect. Engage in constructive dialogue and be empathetic to differing viewpoints. Personal attacks, harassment, or discrimination of any kind will not be tolerated.

**Collaboration Over Competition**
We are here to build together. Share your knowledge generously and support other members in achieving shared goals.

**Quality Contributions**
Strive to provide thoughtful and well-researched contributions. Cite sources where possible and be transparent about assumptions.`,
  },
  references: [
    {
      title: "New reference",
      url: "asdflasdf",
    },
  ],
};

const LEADS: SpaceLead[] = [
  {
    name: "Jeroen Nijkamp",
    location: "'s-gravenhage",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzIxMDQyMjl8MA&ixlib=rb-4.1.0&q=80&w=256",
    initials: "JN",
  },
];

const HOST: SpaceHost = {
  name: "Jeroen Nijkamp",
  location: "'s-gravenhage",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzIxMDQyMjl8MA&ixlib=rb-4.1.0&q=80&w=256",
  initials: "JN",
  email: "jeroen@alkemio.org",
};

/* ─── Component ──────────────────────────────────────────── */

export function AboutThisSpaceDialog({
  open,
  onOpenChange,
  isAdmin = true,
  spaceSlug = "default-space",
}: AboutThisSpaceDialogProps) {
  const navigate = useNavigate();
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const guidelinesRef = useRef<HTMLDivElement>(null);
  const [isGuidelinesTruncated, setIsGuidelinesTruncated] = useState(false);

  useEffect(() => {
    const el = guidelinesRef.current;
    if (el) {
      setIsGuidelinesTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [open]);

  const goToSettings = (tab: string) => {
    onOpenChange(false);
    navigate(`/space/${spaceSlug}/settings/${tab}`);
  };

  return (
    <>
      {/* ── Main About dialog ── */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100%-3rem)] sm:w-[50vw] sm:max-w-none p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background flex flex-col max-h-[85vh]">
          {/* Fixed header */}
          <div
            className="px-6 pt-5 pb-4 border-b shrink-0"
            style={{ background: "var(--background)" }}
          >
            <div className="flex items-start justify-between">
              <div className="pr-8">
                <DialogTitle
                  className="text-xl font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {SPACE_DATA.name}
                </DialogTitle>
                <DialogDescription className="mt-1 italic text-sm text-muted-foreground leading-relaxed">
                  {SPACE_DATA.tagline}
                </DialogDescription>
              </div>
              <DialogClose className="rounded-full p-2 hover:bg-muted transition-colors shrink-0 -mt-1 -mr-2">
                <X className="w-5 h-5 text-muted-foreground" />
              </DialogClose>
            </div>
          </div>

          {/* Scrollable body */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-6">
              {/* ── Space info card — description + leads ── */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  background: "rgb(29, 56, 74)",
                  color: "white",
                }}
              >
                {/* Admin edit icons */}
                {isAdmin && (
                  <div className="flex justify-end gap-1 px-4 pt-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-white/10"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                            onClick={() => goToSettings("about")}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit space profile</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-white/10"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                            onClick={() => goToSettings("community")}
                          >
                            <Users className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Manage community</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}

                {/* Description — full, not truncated, white text on dark blue */}
                <div className={isAdmin ? "px-5 pb-5 pt-2" : "p-5"}>
                  <p
                    className="mb-4"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "rgba(255,255,255,0.9)",
                      lineHeight: 1.7,
                    }}
                  >
                    {SPACE_DATA.description}
                  </p>

                  {/* Meta row: location + members */}
                  <div className="flex items-center gap-4 mb-4">
                    <span
                      className="flex items-center gap-1"
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <MapPin className="w-3 h-3" />
                      {SPACE_DATA.location}
                    </span>
                    <span
                      className="flex items-center gap-1"
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      <Users className="w-3 h-3" />
                      {SPACE_DATA.memberCount} members
                    </span>
                  </div>

                  {/* Leads — below description */}
                  <div
                    className="pt-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    <h4
                      className="mb-3"
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.6)",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Leads
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      {LEADS.map((lead) => (
                        <div
                          key={lead.name}
                          className="flex items-center gap-3"
                        >
                          <Avatar
                            className="w-9 h-9"
                            style={{ border: "2px solid rgba(255,255,255,0.25)" }}
                          >
                            <AvatarImage
                              src={lead.avatar}
                              alt={lead.name}
                            />
                            <AvatarFallback
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                background: "rgba(255,255,255,0.15)",
                                color: "white",
                              }}
                            >
                              {lead.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p
                              style={{
                                fontSize: "var(--text-sm)",
                                fontWeight: 600,
                                color: "white",
                              }}
                            >
                              {lead.name}
                            </p>
                            <p
                              className="flex items-center gap-1"
                              style={{
                                fontSize: "12px",
                                color: "rgba(255,255,255,0.6)",
                              }}
                            >
                              <MapPin className="w-3 h-3" />
                              {lead.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Why section ── */}
              <ContextSection
                icon={<Target className="w-4 h-4" />}
                title="Why"
                isAdmin={isAdmin}
                onEdit={() => goToSettings("about")}
              >
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                  }}
                >
                  {SPACE_DATA.whyText}
                </p>
              </ContextSection>

              {/* ── Who section ── */}
              <ContextSection
                icon={<Users className="w-4 h-4" />}
                title="Who"
                isAdmin={isAdmin}
                onEdit={() => goToSettings("about")}
              >
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.6,
                  }}
                >
                  {SPACE_DATA.whoText}
                </p>
              </ContextSection>

              {/* ── Guidelines section ── */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen
                        className="w-4 h-4"
                        style={{ color: "var(--muted-foreground)" }}
                      />
                      <h3
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: 600,
                          color: "var(--foreground)",
                        }}
                      >
                        {SPACE_DATA.guidelines.title}
                      </h3>
                    </div>
                    {isAdmin && <EditButton tooltip="Edit guidelines" onClick={() => goToSettings("about")} />}
                  </div>
                  <div
                    ref={guidelinesRef}
                    className="line-clamp-6 space-y-1"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--muted-foreground)",
                      lineHeight: 1.6,
                    }}
                  >
                    {SPACE_DATA.guidelines.body
                      .split("\n")
                      .filter(Boolean)
                      .map((line, i) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p key={i} className="font-semibold" style={{ color: "var(--foreground)" }}>
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        }
                        return <p key={i}>{line.replace(/\*\*/g, "")}</p>;
                      })}
                  </div>
                  {isGuidelinesTruncated && (
                    <button
                      onClick={() => setGuidelinesOpen(true)}
                      className="mt-3 hover:underline"
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
                        color: "var(--primary)",
                      }}
                    >
                      Read more
                    </button>
                  )}
                </div>
              </div>

              {/* ── References section ── */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 600,
                        color: "var(--foreground)",
                      }}
                    >
                      References
                    </h3>
                    {isAdmin && <EditButton tooltip="Edit references" onClick={() => goToSettings("about")} />}
                  </div>
                  <div className="space-y-3">
                    {SPACE_DATA.references.map((ref, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className="shrink-0 flex items-center justify-center rounded-full"
                          style={{
                            width: 36,
                            height: 36,
                            background:
                              "color-mix(in srgb, var(--primary) 10%, transparent)",
                          }}
                        >
                          <Globe
                            className="w-4 h-4"
                            style={{ color: "var(--primary)" }}
                          />
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "var(--text-sm)",
                              fontWeight: 500,
                              color: "var(--foreground)",
                            }}
                          >
                            {ref.title}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--muted-foreground)",
                            }}
                          >
                            {ref.url}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Hosted by section ── */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
              >
                <div className="p-5">
                  <h3
                    className="mb-3"
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  >
                    Hosted by
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar
                      className="w-10 h-10"
                      style={{ border: "2px solid var(--border)" }}
                    >
                      <AvatarImage src={HOST.avatar} alt={HOST.name} />
                      <AvatarFallback
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          background:
                            "color-mix(in srgb, var(--primary) 15%, transparent)",
                          color: "var(--primary)",
                        }}
                      >
                        {HOST.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: 600,
                          color: "var(--foreground)",
                        }}
                      >
                        {HOST.name}
                      </p>
                      <p
                        className="flex items-center gap-1"
                        style={{
                          fontSize: "12px",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        <MapPin className="w-3 h-3" />
                        {HOST.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => setContactOpen(true)}
                      className="shrink-0 mt-0.5 hover:opacity-80 transition-opacity"
                    >
                      <Mail
                        className="w-4 h-4"
                        style={{ color: "var(--muted-foreground)" }}
                      />
                    </button>
                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        color: "var(--muted-foreground)",
                        lineHeight: 1.5,
                      }}
                    >
                      The hosts are responsible for the content of the Space. Any
                      questions or comments, please reach out.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Guidelines full dialog (nested) ── */}
      <Dialog open={guidelinesOpen} onOpenChange={setGuidelinesOpen}>
        <DialogContent className="w-[calc(100%-3rem)] sm:w-[50vw] sm:max-w-none p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background flex flex-col max-h-[85vh]">
          <div
            className="px-6 pt-5 pb-4 border-b shrink-0 flex items-center justify-between"
            style={{ background: "var(--background)" }}
          >
            <DialogTitle className="text-lg font-semibold">
              {SPACE_DATA.guidelines.title}
            </DialogTitle>
            <DialogClose className="rounded-full p-2 hover:bg-muted transition-colors -mr-2">
              <X className="w-5 h-5 text-muted-foreground" />
            </DialogClose>
          </div>
          <DialogDescription className="sr-only">
            Full community guidelines for {SPACE_DATA.name}.
          </DialogDescription>
          <ScrollArea className="flex-1 overflow-y-auto">
            <div
              className="px-6 py-5 space-y-3"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
                lineHeight: 1.7,
              }}
            >
              {SPACE_DATA.guidelines.body
                .split("\n")
                .filter(Boolean)
                .map((line, i) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <p
                        key={i}
                        className="font-semibold mt-2"
                        style={{ color: "var(--foreground)" }}
                      >
                        {line.replace(/\*\*/g, "")}
                      </p>
                    );
                  }
                  return <p key={i}>{line.replace(/\*\*/g, "")}</p>;
                })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Contact host dialog (nested) ── */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="w-full sm:max-w-md p-0 gap-0 overflow-hidden rounded-xl border-0 shadow-2xl bg-background">
          <div
            className="px-6 pt-5 pb-4 border-b flex items-center justify-between"
            style={{ background: "var(--background)" }}
          >
            <DialogTitle className="text-lg font-semibold">
              Contact Host
            </DialogTitle>
            <DialogClose className="rounded-full p-2 hover:bg-muted transition-colors -mr-2">
              <X className="w-5 h-5 text-muted-foreground" />
            </DialogClose>
          </div>
          <DialogDescription className="sr-only">
            Send a message to the space host.
          </DialogDescription>
          <div className="px-6 py-5 space-y-4">
            {/* Recipient */}
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={HOST.avatar} alt={HOST.name} />
                <AvatarFallback
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    background:
                      "color-mix(in srgb, var(--primary) 15%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  {HOST.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  To: {HOST.name}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {HOST.email}
                </p>
              </div>
            </div>

            {/* Message input */}
            <div>
              <label
                htmlFor="contact-message"
                className="block mb-1.5"
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--foreground)",
                }}
              >
                Message
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Write your message..."
                className="w-full rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2"
                style={{
                  fontSize: "var(--text-sm)",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  focusRingColor: "var(--ring)",
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setContactOpen(false);
                  setContactMessage("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // In production this would send an in-app message
                  setContactOpen(false);
                  setContactMessage("");
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */

interface ContextSectionProps {
  icon: React.ReactNode;
  title: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
}

function ContextSection({
  icon,
  title,
  isAdmin,
  onEdit,
  children,
}: ContextSectionProps) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--muted-foreground)" }}>{icon}</span>
            <h3
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              {title}
            </h3>
          </div>
          {isAdmin && <EditButton tooltip={`Edit ${title.toLowerCase()}`} onClick={onEdit} />}
        </div>
        {children}
      </div>
    </div>
  );
}

function EditButton({ tooltip, onClick }: { tooltip: string; onClick?: () => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={onClick}
          >
            <Pencil
              className="w-3.5 h-3.5"
              style={{ color: "var(--muted-foreground)" }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
