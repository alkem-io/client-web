import { Link } from "react-router";

const BANNER_IMAGE = "https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjaGFsbGVuZ2UlMjBjcmVhdGl2ZSUyMHdvcmtzaG9wJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBpbm5vdmF0aW9uJTIwc3ByaW50JTIwZGVzaWduJTIwc3ByaW50fGVufDF8fHx8MTc2OTA5NDMxMHww&ixlib=rb-4.1.0&q=80&w=1920";

interface SpaceHeaderProps {
  spaceSlug: string;
  spaceName?: string;
  variant?: 1 | 2 | 3 | 4 | 5;
}

export function SpaceHeader({ spaceSlug, variant = 1 }: SpaceHeaderProps) {
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
                <h1
                  className="text-foreground truncate font-bold tracking-tight"
                  style={{ fontSize: "clamp(22px, 3vw, 32px)", lineHeight: 1.2 }}
                >
                  Steward-Ownership Field Builder Community
                </h1>
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
                  <h1
                    className="text-foreground truncate font-bold tracking-tight"
                    style={{ fontSize: "clamp(22px, 3vw, 32px)", lineHeight: 1.2 }}
                  >
                    Steward-Ownership Field Builder Community
                  </h1>
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
