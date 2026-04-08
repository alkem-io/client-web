import { Database, Info } from "lucide-react";

export function SpaceSettingsStorage() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            color: "var(--foreground)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Storage
        </h2>
        <p
          className="mt-1"
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--muted-foreground)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Storage for this space is managed at the platform level.
        </p>
      </div>

      <div
        className="flex items-start gap-4 p-6 rounded-lg"
        style={{
          background: "color-mix(in srgb, var(--primary) 5%, transparent)",
          border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "color-mix(in srgb, var(--primary) 10%, transparent)",
            color: "var(--primary)",
          }}
        >
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--foreground)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Platform-Managed Storage
          </h3>
          <p
            className="mt-1"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1.6,
            }}
          >
            Documents, images, and whiteboards uploaded to this space are stored
            and managed as part of your Alkemio platform account. Contact your
            platform administrator for storage-related questions.
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-2 p-4 rounded-lg"
        style={{
          background: "var(--muted)",
          fontSize: "var(--text-sm)",
          color: "var(--muted-foreground)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Info className="w-4 h-4 shrink-0" />
        <span>
          Files are accessible through the posts, whiteboards, and callouts
          where they were originally shared.
        </span>
      </div>
    </div>
  );
}
