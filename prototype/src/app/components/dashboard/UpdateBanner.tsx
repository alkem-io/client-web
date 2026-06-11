import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Megaphone, X } from "lucide-react";

interface UpdateBannerProps {
  id: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

const CURRENT_UPDATE: UpdateBannerProps = {
  id: "update-2026-06",
  title: "Platform Update v2.4 Released",
  description: "New collaboration features, improved navigation, and performance enhancements are now live.",
  ctaLabel: "Read more",
  ctaUrl: "/space/green-energy/forum",
};

export function UpdateBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(`banner-dismissed-${CURRENT_UPDATE.id}`) === "true";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(`banner-dismissed-${CURRENT_UPDATE.id}`, "true");
    } catch {
      // ignore storage errors
    }
  };

  return (
    <div
      className="relative flex items-center gap-4 px-5 py-4 rounded-lg border border-primary/15 bg-primary/[0.03]"
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
        <Megaphone className="w-4.5 h-4.5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-body-emphasis font-semibold text-foreground leading-tight">
          {CURRENT_UPDATE.title}
        </h4>
        <p className="text-caption text-muted-foreground mt-0.5 line-clamp-1">
          {CURRENT_UPDATE.description}
        </p>
      </div>

      {/* CTA */}
      {CURRENT_UPDATE.ctaUrl && (
        <Link to={CURRENT_UPDATE.ctaUrl}>
          <Button size="sm" variant="outline" className="shrink-0 text-caption font-medium">
            {CURRENT_UPDATE.ctaLabel || "Learn more"}
          </Button>
        </Link>
      )}

      {/* Dismiss */}
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Dismiss update"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
