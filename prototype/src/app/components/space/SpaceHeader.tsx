import { Link } from "react-router";

const BANNER_IMAGE = "https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjaGFsbGVuZ2UlMjBjcmVhdGl2ZSUyMHdvcmtzaG9wJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBpbm5vdmF0aW9uJTIwc3ByaW50JTIwZGVzaWduJTIwc3ByaW50fGVufDF8fHx8MTc2OTA5NDMxMHww&ixlib=rb-4.1.0&q=80&w=1920";

interface SpaceHeaderProps {
  spaceSlug: string;
  spaceName?: string;
}

export function SpaceHeader({ spaceSlug }: SpaceHeaderProps) {
  return (
    <div className="flex flex-col">
      {/* Banner — full-width, slides behind transparent header */}
      <div
        className="relative w-full overflow-hidden"
        style={{ marginTop: "-64px", aspectRatio: "6 / 1" }}
      >
        <img
          src={BANNER_IMAGE}
          alt="Space banner"
          className="w-full h-full object-cover"
          style={{ display: "block" }}
        />
      </div>

      {/* Compact info bar — title + tagline */}
      <div
        className="w-full px-6 md:px-8 pt-8 pb-8"
      >
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex flex-col gap-1">
            {/* Row 1: title */}
            <div className="flex items-center justify-between gap-4">
              <h1
                className="text-foreground truncate text-hero"
              >
                Steward-Ownership Field Builder Community
              </h1>
            </div>
            {/* Row 2: tagline */}
            <div className="flex items-center gap-4">
              <p
                className="text-muted-foreground truncate text-body"
              >
                The place for all field builders on steward-ownership to learn, connect, discuss and collaborate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
