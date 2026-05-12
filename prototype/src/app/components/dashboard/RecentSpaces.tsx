import { useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { MyMembershipsPanel } from "@/app/components/memberships/MyMembershipsPanel";

const recentSpaces = [
  {
    id: 1,
    name: "Innovation Lab",
    slug: "innovation-lab",
    image:
      "https://images.unsplash.com/photo-1623652554515-91c833e3080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsYWJvcmF0aW9uJTIwdGVhbXdvcmslMjBpbm5vdmF0aW9uJTIwZGVzaWduJTIwdGhpbmtpbmclMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjkwODc1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isPrivate: true,
    initials: "IL",
  },
  {
    id: 2,
    name: "Design Workshop",
    slug: "design-workshop",
    image:
      "https://images.unsplash.com/photo-1735639013995-086e648eaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFpbnN0b3JtaW5nJTIwY3JlYXRpdmUlMjB3b3Jrc2hvcCUyMHRlYW18ZW58MXx8fHwxNzY5MDg3NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isPrivate: false,
    initials: "DW",
  },
  {
    id: 3,
    name: "Team Sync",
    slug: "team-sync",
    image:
      "https://images.unsplash.com/photo-1768659347532-74d3b1efb0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBtZWV0aW5nJTIwY29sbGFib3JhdGlvbiUyMHRlYW18ZW58MXx8fHwxNzY5MDg3NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isPrivate: true,
    initials: "TS",
  },
  {
    id: 4,
    name: "Future Strategy",
    slug: "future-strategy",
    image:
      "https://images.unsplash.com/photo-1676276376052-dc9c9c0b6917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbm5vdmF0aW9uJTIwbGFiJTIwdGVhbXdvcmslMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MXx8fHwxNzY5MDg3NTg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isPrivate: false,
    initials: "FS",
  },
];

export function RecentSpaces() {
  const navigate = useNavigate();
  const [membershipsOpen, setMembershipsOpen] = useState(false);

  return (
    <div className="space-y-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-center justify-between">
        <h2
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            color: "var(--foreground)",
          }}
        >
          Recent Spaces
        </h2>
        <button
          onClick={() => setMembershipsOpen(true)}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-medium)" as any,
            color: "var(--primary)",
          }}
        >
          Explore all your Spaces <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentSpaces.map((space) => (
          <div
            key={space.id}
            onClick={() => navigate(`/space/${space.slug}`)}
            className="group relative overflow-hidden cursor-pointer transition-all duration-300"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              boxShadow: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "var(--elevation-sm)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow = "none")
            }
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={space.image}
                alt={space.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {space.isPrivate && (
                <div
                  className="absolute top-3 right-3 backdrop-blur-sm p-1.5 rounded-full"
                  style={{
                    background:
                      "color-mix(in srgb, var(--foreground) 50%, transparent)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </div>

            <div className="p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg shrink-0 overflow-hidden"
                style={{
                  border: "1.5px solid var(--border)",
                }}
              >
                <img src={space.image} alt={space.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className="truncate"
                  style={{
                    fontWeight: 600,
                    color: "var(--card-foreground)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {space.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MyMembershipsPanel
        open={membershipsOpen}
        onOpenChange={setMembershipsOpen}
      />
    </div>
  );
}
