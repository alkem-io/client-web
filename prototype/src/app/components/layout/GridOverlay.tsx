import { useGridOverlay } from "@/app/contexts/GridOverlayContext";

export function GridOverlay() {
  const { isVisible } = useGridOverlay();

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    >
      <div
        className="h-full grid grid-cols-12 gap-6 px-6 md:px-8"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-full"
            style={{
              background: "rgba(255, 0, 0, 0.07)",
              borderLeft: "1px solid rgba(255, 0, 0, 0.15)",
              borderRight: "1px solid rgba(255, 0, 0, 0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
