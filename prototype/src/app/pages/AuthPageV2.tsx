import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { Eye, EyeOff, Info, Fingerprint, HelpCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Footer } from "@/app/components/layout/Footer";
import AlkemioLogo from "@/imports/AlkemioLogo";

/* ─── Social Provider Icons ─── */
function PasskeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 1C8.1 1 5 4.1 5 8c0 2.4 1.2 4.5 3 5.7V22l4-2 4 2v-8.3c1.8-1.2 3-3.4 3-5.7 0-3.9-3.1-7-7-7zm0 10c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" className="w-5 h-5">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0077B5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function OryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">C</text>
    </svg>
  );
}

/* ─── Floating Label Input ─── */
function FloatingInput({
  label,
  type = "text",
  required = false,
  value,
  onChange,
  endIcon,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  endIcon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className="relative rounded"
        style={{
          border: `${focused ? "2px" : "1px"} solid ${focused ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "4px",
          transition: "border-color 0.2s",
        }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent outline-none"
          style={{
            height: "56px",
            padding: "20px 14px 8px",
            paddingRight: endIcon ? "48px" : "14px",
            fontSize: "var(--text-base)",
            color: "var(--foreground)",
          }}
        />
        <label
          className="absolute left-3 pointer-events-none transition-all duration-200"
          style={{
            top: isFloating ? "6px" : "50%",
            transform: isFloating ? "none" : "translateY(-50%)",
            fontSize: isFloating ? "12px" : "var(--text-base)",
            color: focused ? "var(--primary)" : "var(--muted-foreground)",
            background: "white",
            padding: "0 4px",
          }}
        >
          {label}{required && " *"}
        </label>
        {endIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: "var(--muted-foreground)" }}>
            {endIcon}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Social Login Buttons Row ─── */
function SocialButtons({ showPasskey = true }: { showPasskey?: boolean }) {
  const providers = [
    ...(showPasskey ? [{ icon: <PasskeyIcon />, label: "Passkey" }] : []),
    { icon: <MicrosoftIcon />, label: "Microsoft" },
    { icon: <LinkedInIcon />, label: "LinkedIn" },
    { icon: <GitHubIcon />, label: "GitHub" },
    { icon: <OryIcon />, label: "Ory" },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {providers.map((p) => (
        <button
          key={p.label}
          className="flex items-center justify-center rounded-full border hover:bg-accent transition-colors"
          style={{
            width: "48px",
            height: "48px",
            borderColor: "var(--border)",
            background: "var(--card)",
          }}
          title={`Continue with ${p.label}`}
        >
          {p.icon}
        </button>
      ))}
    </div>
  );
}

/* ─── Divider ─── */
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif" }}>
        or continue with
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

/* ─── Auth Card Wrapper ─── */
function AuthCard({
  children,
  title,
  showSignUp,
  showSignIn,
  onNavigate,
}: {
  children: React.ReactNode;
  title: string;
  showSignUp?: boolean;
  showSignIn?: boolean;
  onNavigate: (route: string) => void;
}) {
  return (
    <div
      className="w-full relative"
      style={{
        background: "var(--card)",
        borderRadius: "8px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        padding: "32px 36px",
      }}
    >
      {/* Logo + Account toggle row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="w-36 h-5 relative">
            <AlkemioLogo />
          </div>
          <p
            className="mt-1.5"
            style={{
              fontSize: "11px",
              color: "var(--muted-foreground)",
            }}
          >
            Safe Spaces for Collaboration
          </p>
        </div>
        {showSignUp && (
          <div className="text-right">
            <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>No account?</span>
            <br />
            <button
              onClick={() => onNavigate("sign-up")}
              className="font-semibold hover:underline"
              style={{ fontSize: "var(--text-sm)", color: "var(--foreground)" }}
            >
              Sign up
            </button>
          </div>
        )}
        {showSignIn && (
          <div className="text-right">
            <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>Have an account?</span>
            <br />
            <button
              onClick={() => onNavigate("sign-in")}
              className="font-semibold hover:underline"
              style={{ fontSize: "var(--text-sm)", color: "var(--foreground)" }}
            >
              Sign in
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h1
        className="mb-6"
        style={{
          fontSize: "var(--text-3xl)",
          fontWeight: 700,
          color: "var(--foreground)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>

      {children}
    </div>
  );
}

/* ─── Animated Network Background ─── */
interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  type: "person" | "dot";
  color: string;
  pulseOffset: number;
  img?: HTMLImageElement;
}

interface EmergentSpace {
  cx: number;
  cy: number;
  r: number;
  memberCount: number;
  age: number;             // frames alive
  phase: "forming" | "popping" | "formed";
  popStart: number;        // time when pop began
  color: string;
}

function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const emergentRef = useRef<EmergentSpace[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create nodes — more people than spaces (Alkemio has many people, fewer spaces)
    const nodeCount = 55;
    const nodes: Node[] = [];
    const personColors = [
      "rgba(29, 56, 74, 0.75)",    // primary dark
      "rgba(55, 80, 100, 0.7)",    // dark slate
      "rgba(60, 90, 110, 0.65)",   // medium slate
      "rgba(40, 70, 90, 0.7)",     // ocean
    ];
    const spaceColors = [
      "rgba(9, 188, 212, 0.5)",    // teal/cyan (Alkemio brand)
      "rgba(59, 130, 246, 0.4)",   // blue
      "rgba(34, 197, 94, 0.35)",   // green
      "rgba(168, 85, 247, 0.35)",  // purple
      "rgba(234, 179, 8, 0.4)",    // amber
      "rgba(100, 140, 200, 0.4)",  // soft blue
    ];

    for (let i = 0; i < nodeCount; i++) {
      const isPerson = i < 38; // ~38 people, ~17 spaces
      const node: Node = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.33,
        vy: (Math.random() - 0.5) * 0.33,
        r: isPerson ? 6 + Math.random() * 4 : 18 + Math.random() * 14,
        type: isPerson ? "person" : "dot",
        color: isPerson
          ? personColors[Math.floor(Math.random() * personColors.length)]
          : spaceColors[Math.floor(Math.random() * spaceColors.length)],
        pulseOffset: Math.random() * Math.PI * 2,
      };

      nodes.push(node);
    }
    nodesRef.current = nodes;

    const connectionDist = 180;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -40) n.vx = Math.abs(n.vx);
        if (n.x > canvas.width + 40) n.vx = -Math.abs(n.vx);
        if (n.y < -40) n.vy = Math.abs(n.vy);
        if (n.y > canvas.height + 40) n.vy = -Math.abs(n.vy);
      }

      const spaceNodes = nodes.filter(n => n.type === "dot");
      const personNodes = nodes.filter(n => n.type === "person");

      // ─── Emergent spaces: when 3+ people cluster without a nearby space, one spawns ───
      // Lifecycle: forming (dashed ring) → popping (scale pop) → formed (real space)
      const personClusterDist = 60;
      const personUsedInEmergent = new Set<number>();
      const formingThreshold = 120; // frames before a forming space "pops" into reality
      const popDuration = 400; // ms for pop animation

      // Detect current clusters
      interface ClusterInfo { cx: number; cy: number; r: number; memberCount: number; }
      const currentClusters: ClusterInfo[] = [];

      for (let i = 0; i < personNodes.length; i++) {
        if (personUsedInEmergent.has(i)) continue;
        const p = personNodes[i];

        let nearSpace = false;
        for (const s of spaceNodes) {
          const d = Math.sqrt((p.x - s.x) ** 2 + (p.y - s.y) ** 2);
          if (d < s.r + connectionDist * 0.5) { nearSpace = true; break; }
        }
        if (nearSpace) continue;

        const cluster = [i];
        for (let j = i + 1; j < personNodes.length; j++) {
          if (personUsedInEmergent.has(j)) continue;
          const p2 = personNodes[j];

          let p2NearSpace = false;
          for (const s of spaceNodes) {
            const d = Math.sqrt((p2.x - s.x) ** 2 + (p2.y - s.y) ** 2);
            if (d < s.r + connectionDist * 0.5) { p2NearSpace = true; break; }
          }
          if (p2NearSpace) continue;

          for (const ci of cluster) {
            const pc = personNodes[ci];
            const d = Math.sqrt((p2.x - pc.x) ** 2 + (p2.y - pc.y) ** 2);
            if (d < personClusterDist) {
              cluster.push(j);
              break;
            }
          }
        }

        if (cluster.length >= 3) {
          let cx = 0, cy = 0;
          for (const ci of cluster) {
            cx += personNodes[ci].x;
            cy += personNodes[ci].y;
            personUsedInEmergent.add(ci);
          }
          cx /= cluster.length;
          cy /= cluster.length;
          const r = 14 + cluster.length * 3;
          currentClusters.push({ cx, cy, r, memberCount: cluster.length });
        }
      }

      // Update persistent emergent spaces
      const emergent = emergentRef.current;
      const matchDist = 80; // how close a cluster must be to "continue" an existing emergent

      // Mark which emergent spaces still have a matching cluster
      const matchedEmergent = new Set<number>();
      const matchedCluster = new Set<number>();

      for (let ei = 0; ei < emergent.length; ei++) {
        const es = emergent[ei];
        if (es.phase === "formed") { matchedEmergent.add(ei); continue; } // formed ones persist
        for (let ci = 0; ci < currentClusters.length; ci++) {
          if (matchedCluster.has(ci)) continue;
          const c = currentClusters[ci];
          const d = Math.sqrt((es.cx - c.cx) ** 2 + (es.cy - c.cy) ** 2);
          if (d < matchDist) {
            // Update position smoothly
            es.cx += (c.cx - es.cx) * 0.1;
            es.cy += (c.cy - es.cy) * 0.1;
            es.r += (c.r - es.r) * 0.1;
            es.memberCount = c.memberCount;
            es.age++;
            matchedEmergent.add(ei);
            matchedCluster.add(ci);
            break;
          }
        }
      }

      // Remove unmatched forming spaces (cluster dispersed)
      emergentRef.current = emergent.filter((_, i) => matchedEmergent.has(i));

      // Add new emergent spaces for unmatched clusters
      for (let ci = 0; ci < currentClusters.length; ci++) {
        if (matchedCluster.has(ci)) continue;
        const c = currentClusters[ci];
        const spaceColorOptions = [
          "rgba(9, 188, 212, 0.5)",
          "rgba(59, 130, 246, 0.4)",
          "rgba(34, 197, 94, 0.35)",
          "rgba(168, 85, 247, 0.35)",
          "rgba(234, 179, 8, 0.4)",
        ];
        emergentRef.current.push({
          cx: c.cx, cy: c.cy, r: c.r,
          memberCount: c.memberCount,
          age: 0,
          phase: "forming",
          popStart: 0,
          color: spaceColorOptions[Math.floor(Math.random() * spaceColorOptions.length)],
        });
      }

      // Transition forming → popping → formed
      for (const es of emergentRef.current) {
        if (es.phase === "forming" && es.age >= formingThreshold) {
          es.phase = "popping";
          es.popStart = time;
        }
        if (es.phase === "popping" && (time - es.popStart) > popDuration) {
          es.phase = "formed";
          // Graduate to a real node in the nodes array
          const newNode: Node = {
            x: es.cx,
            y: es.cy,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            r: es.r,
            type: "dot",
            color: es.color,
            pulseOffset: Math.random() * Math.PI * 2,
          };
          nodes.push(newNode);
        }
      }

      // Remove fully formed ones from emergent tracking (they're now real nodes)
      emergentRef.current = emergentRef.current.filter(es => es.phase !== "formed");

      // ─── Determine merged space clusters ───
      // When spaces overlap, they form a single larger merged circle
      const mergedFlags = new Array(spaceNodes.length).fill(false);
      interface MergedSpace {
        cx: number;
        cy: number;
        r: number;
        color: string;
        members: number[];
      }
      const mergedSpaces: MergedSpace[] = [];

      for (let i = 0; i < spaceNodes.length; i++) {
        if (mergedFlags[i]) continue;
        const s = spaceNodes[i];
        const pulse = 1 + Math.sin(time * 0.001 + s.pulseOffset) * 0.05;
        const ri = s.r * pulse;

        // Find all spaces overlapping with this one (cluster)
        const cluster = [i];
        mergedFlags[i] = true;

        for (let j = i + 1; j < spaceNodes.length; j++) {
          if (mergedFlags[j]) continue;
          const s2 = spaceNodes[j];
          const pulse2 = 1 + Math.sin(time * 0.001 + s2.pulseOffset) * 0.05;
          const rj = s2.r * pulse2;

          // Check if this space overlaps with any in the current cluster
          for (const ci of cluster) {
            const sc = spaceNodes[ci];
            const rc = sc.r * (1 + Math.sin(time * 0.001 + sc.pulseOffset) * 0.05);
            const dx = s2.x - sc.x;
            const dy = s2.y - sc.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < rc + rj * 0.6) {
              cluster.push(j);
              mergedFlags[j] = true;
              break;
            }
          }
        }

        if (cluster.length === 1) {
          // Single space — count nearby people for growth
          let nearbyPeople = 0;
          for (const p of personNodes) {
            const dx = p.x - s.x;
            const dy = p.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ri + connectionDist * 0.6) nearbyPeople++;
          }
          const growFactor = 1 + nearbyPeople * 0.03; // Spaces grow slightly with people
          mergedSpaces.push({
            cx: s.x,
            cy: s.y,
            r: ri * growFactor,
            color: s.color,
            members: cluster,
          });
        } else {
          // Merged cluster — compute combined centroid and radius
          let totalArea = 0;
          let cx = 0, cy = 0;
          let dominantColor = spaceNodes[cluster[0]].color;
          let maxR = 0;

          for (const ci of cluster) {
            const sc = spaceNodes[ci];
            const rc = sc.r * (1 + Math.sin(time * 0.001 + sc.pulseOffset) * 0.05);
            const area = Math.PI * rc * rc;
            totalArea += area;
            cx += sc.x * area;
            cy += sc.y * area;
            if (rc > maxR) {
              maxR = rc;
              dominantColor = sc.color;
            }
          }
          cx /= totalArea;
          cy /= totalArea;

          // Merged radius from combined area (circle packing)
          const mergedR = Math.sqrt(totalArea / Math.PI);

          // Count nearby people for growth
          let nearbyPeople = 0;
          for (const p of personNodes) {
            const dx = p.x - cx;
            const dy = p.y - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mergedR + connectionDist * 0.5) nearbyPeople++;
          }
          const growFactor = 1 + nearbyPeople * 0.02;

          mergedSpaces.push({
            cx,
            cy,
            r: mergedR * growFactor,
            color: dominantColor,
            members: cluster,
          });
        }
      }

      // ─── Draw organic connections ───
      // Person-to-space: fluid curves
      for (const p of personNodes) {
        for (const ms of mergedSpaces) {
          const dx = ms.cx - p.x;
          const dy = ms.cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const reachDist = ms.r + connectionDist * 0.7;

          if (dist < reachDist && dist > ms.r * 0.8) {
            const strength = 1 - dist / reachDist;
            const opacity = strength * 0.14;

            // Organic curve with time-based wobble
            const midX = (p.x + ms.cx) / 2;
            const midY = (p.y + ms.cy) / 2;
            const perpX = -(dy / dist);
            const perpY = (dx / dist);
            const wobble = Math.sin(time * 0.0007 + p.pulseOffset + ms.members[0]) * dist * 0.06;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.quadraticCurveTo(midX + perpX * wobble, midY + perpY * wobble, ms.cx, ms.cy);
            ctx.strokeStyle = `rgba(29, 56, 74, ${opacity})`;
            ctx.lineWidth = 0.8 + strength * 0.4;
            ctx.stroke();
          }
        }
      }

      // Space-to-space (unmerged): soft connections between separate clusters
      for (let i = 0; i < mergedSpaces.length; i++) {
        for (let j = i + 1; j < mergedSpaces.length; j++) {
          const a = mergedSpaces[i];
          const b = mergedSpaces[j];
          const dx = b.cx - a.cx;
          const dy = b.cy - a.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const reachDist = a.r + b.r + connectionDist * 0.8;

          if (dist < reachDist && dist > a.r + b.r) {
            const strength = 1 - (dist - a.r - b.r) / (connectionDist * 0.8);
            const opacity = strength * 0.13;

            const midX = (a.cx + b.cx) / 2;
            const midY = (a.cy + b.cy) / 2;
            const perpX = -(dy / dist);
            const perpY = (dx / dist);
            const wobble = Math.sin(time * 0.0006 + i * 3 + j * 7) * dist * 0.05;

            ctx.beginPath();
            ctx.moveTo(a.cx, a.cy);
            ctx.quadraticCurveTo(midX + perpX * wobble, midY + perpY * wobble, b.cx, b.cy);
            ctx.strokeStyle = `rgba(29, 56, 74, ${opacity})`;
            ctx.lineWidth = 1.2 + strength * 0.5;
            ctx.stroke();
          }
        }
      }

      // Person-to-person: only when both are connected to a shared space
      // (people can't connect directly without a space in between — that's how Alkemio works)
      for (let i = 0; i < personNodes.length; i++) {
        for (let j = i + 1; j < personNodes.length; j++) {
          const p1 = personNodes[i];
          const p2 = personNodes[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > connectionDist * 0.7) continue;

          // Check if both people share a nearby space
          let sharedSpace = false;
          for (const ms of mergedSpaces) {
            const d1 = Math.sqrt((p1.x - ms.cx) ** 2 + (p1.y - ms.cy) ** 2);
            const d2 = Math.sqrt((p2.x - ms.cx) ** 2 + (p2.y - ms.cy) ** 2);
            if (d1 < ms.r + connectionDist * 0.6 && d2 < ms.r + connectionDist * 0.6) {
              sharedSpace = true;
              break;
            }
          }
          if (!sharedSpace) continue;

          const strength = 1 - dist / (connectionDist * 0.7);
          const opacity = strength * 0.08;

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const perpX = -(dy / dist);
          const perpY = (dx / dist);
          const wobble = Math.sin(time * 0.0009 + i + j * 5) * dist * 0.07;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(midX + perpX * wobble, midY + perpY * wobble, p2.x, p2.y);
          ctx.strokeStyle = `rgba(29, 56, 74, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // ─── Draw emergent spaces (forming + popping phases) ───
      for (const es of emergentRef.current) {
        const formProgress = Math.min(1, es.age / formingThreshold); // 0→1 over forming phase
        const alpha = formProgress * 0.7;

        let scale = 1;
        let ringAlpha = alpha * 0.5;
        let useDash = true;

        if (es.phase === "popping") {
          // Pop animation: quick scale up then settle
          const popProgress = Math.min(1, (time - es.popStart) / popDuration);
          // Elastic ease out: overshoot then settle
          const elastic = 1 + Math.sin(popProgress * Math.PI) * 0.35 * (1 - popProgress);
          scale = elastic;
          useDash = false; // solid ring during pop
          ringAlpha = 0.7 * (1 - popProgress * 0.3);
        }

        const r = es.r * scale;

        // Gentle glow behind
        const grd = ctx.createRadialGradient(es.cx, es.cy, 0, es.cx, es.cy, r * 1.5);
        const glowColor = es.color.replace(/[\d.]+\)$/, `${alpha * 0.3})`);
        grd.addColorStop(0, glowColor);
        grd.addColorStop(1, es.color.replace(/[\d.]+\)$/, "0)"));
        ctx.beginPath();
        ctx.arc(es.cx, es.cy, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Opaque base
        ctx.beginPath();
        ctx.arc(es.cx, es.cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(238, 244, 249, ${alpha})`;
        ctx.fill();

        // Colored fill
        ctx.beginPath();
        ctx.arc(es.cx, es.cy, r, 0, Math.PI * 2);
        ctx.fillStyle = es.color.replace(/[\d.]+\)$/, `${alpha * 0.35})`);
        ctx.fill();

        // Ring — dashed while forming, solid during pop
        ctx.beginPath();
        ctx.arc(es.cx, es.cy, r, 0, Math.PI * 2);
        if (useDash) {
          // Animate dash offset to show "activity"
          const dashOffset = (es.age * 0.5) % 8;
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = dashOffset;
        } else {
          ctx.setLineDash([]);
        }
        ctx.strokeStyle = es.color.replace(/[\d.]+\)$/, `${ringAlpha})`);
        ctx.lineWidth = es.phase === "popping" ? 2.5 : 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;

        // During pop: brief flash ring expanding outward
        if (es.phase === "popping") {
          const popProgress = Math.min(1, (time - es.popStart) / popDuration);
          const flashR = r * (1 + popProgress * 0.6);
          const flashAlpha = (1 - popProgress) * 0.4;
          ctx.beginPath();
          ctx.arc(es.cx, es.cy, flashR, 0, Math.PI * 2);
          ctx.strokeStyle = es.color.replace(/[\d.]+\)$/, `${flashAlpha})`);
          ctx.lineWidth = 2 * (1 - popProgress);
          ctx.stroke();
        }
      }

      // ─── Draw merged space circles ───
      for (const ms of mergedSpaces) {
        const r = ms.r;

        // Opaque base — covers lines cleanly
        ctx.beginPath();
        ctx.arc(ms.cx, ms.cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "#eef4f9";
        ctx.fill();

        // Soft outer glow
        ctx.beginPath();
        ctx.arc(ms.cx, ms.cy, r, 0, Math.PI * 2);
        ctx.fillStyle = ms.color.replace(/[\d.]+\)$/, "0.1)");
        ctx.fill();

        // Inner filled core
        ctx.beginPath();
        ctx.arc(ms.cx, ms.cy, r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = ms.color.replace(/[\d.]+\)$/, "0.2)");
        ctx.fill();

        // Soft ring
        ctx.beginPath();
        ctx.arc(ms.cx, ms.cy, r * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = ms.color.replace(/[\d.]+\)$/, "0.15)");
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // If merged (multi-member), show subtle internal structure
        if (ms.members.length > 1) {
          // Faint inner circles hinting at the original spaces within
          for (const ci of ms.members) {
            const sc = spaceNodes[ci];
            const innerR = sc.r * 0.3 * (1 + Math.sin(time * 0.001 + sc.pulseOffset) * 0.1);
            const dx = sc.x - ms.cx;
            const dy = sc.y - ms.cy;
            // Keep inner hints within the merged circle
            const maxOff = r * 0.35;
            const innerDist = Math.sqrt(dx * dx + dy * dy);
            const scale = innerDist > maxOff ? maxOff / innerDist : 1;
            const ix = ms.cx + dx * scale;
            const iy = ms.cy + dy * scale;

            ctx.beginPath();
            ctx.arc(ix, iy, innerR, 0, Math.PI * 2);
            ctx.fillStyle = sc.color.replace(/[\d.]+\)$/, "0.12)");
            ctx.fill();
          }
        }
      }

      // ─── Draw people on top ───
      for (const n of personNodes) {
        const pulse = 1 + Math.sin(time * 0.001 + n.pulseOffset) * 0.08;
        const r = n.r * pulse;

        // Clip to circle and draw profile image
        ctx.save();
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.closePath();

        // Solid background first (covers lines)
        ctx.fillStyle = "#eef4f9";
        ctx.fill();

        if (n.img && n.img.complete && n.img.naturalWidth > 0) {
          // Draw profile photo clipped to circle
          ctx.clip();
          ctx.drawImage(n.img, n.x - r, n.y - r, r * 2, r * 2);
        } else {
          // Fallback: colored circle with head/shoulders
          ctx.fillStyle = n.color;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(n.x, n.y - r * 0.28, r * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(n.x, n.y + r * 0.6, r * 0.45, Math.PI, 0);
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fill();
        }
        ctx.restore();

        // Subtle border ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(29, 56, 74, 0.15)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

/* ─── Main Auth Page V2 — Network Background ─── */
type AuthView = "sign-in" | "sign-up" | "sign-up-password" | "verify" | "recovery";

export default function AuthPageV2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<AuthView>("sign-in");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleNavigate = (route: string) => {
    setView(route as AuthView);
  };

  const handleSignIn = () => {
    setIsLoggingIn(true);
    setTimeout(() => navigate("/"), 1200);
  };

  const handleSignUpNext = () => {
    setView("sign-up-password");
  };

  const handleSignUpSubmit = () => {
    setView("verify");
  };

  const handleRecovery = () => {};

  return (
    <div
      className="min-h-screen flex flex-col relative"
    >
      {/* Background: Network visualization */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* Soft gradient base */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(241,245,249,1) 0%, rgba(224,237,244,1) 40%, rgba(237,242,248,1) 70%, rgba(241,245,249,1) 100%)",
          }}
        />

        {/* Animated canvas network */}
        <NetworkBackground />

        {/* Soft vignette overlay for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 70% 50%, transparent 30%, rgba(241,245,249,0.6) 100%)",
          }}
        />
      </div>

      {/* Main content area */}
      <div
        className="flex-1 flex items-center justify-end relative z-10 px-6 md:px-12 lg:px-24 xl:px-32 py-12"
        style={{
          opacity: isLoggingIn ? 0 : 1,
          transform: isLoggingIn ? "translateY(-40px) scale(0.97)" : "translateY(0) scale(1)",
          transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="w-full max-w-[420px]">
        {/* Auth Card */}
        {view === "sign-in" && (
          <AuthCard title="Sign in" showSignUp onNavigate={handleNavigate}>
            <div className="space-y-5">
              <FloatingInput
                label="E-Mail"
                type="email"
                required
                value={email}
                onChange={setEmail}
              />
              <FloatingInput
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={setPassword}
                endIcon={
                  <button onClick={() => setShowPassword(!showPassword)} className="p-1">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              <button
                onClick={() => setView("recovery")}
                className="hover:underline"
                style={{ fontSize: "var(--text-sm)", color: "var(--primary)" }}
              >
                Forgot password?
              </button>
              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                }}
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <OrDivider />
              <SocialButtons showPasskey />
            </div>
          </AuthCard>
        )}

        {view === "sign-up" && (
          <AuthCard title="Sign up" showSignIn onNavigate={handleNavigate}>
            <div className="space-y-5">
              <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                Alkemio is designed to benefit society. Please read and accept the{" "}
                <a href="#" className="underline font-medium" style={{ color: "var(--foreground)" }}>Terms of Use</a>{" "}
                and{" "}
                <a href="#" className="underline font-medium" style={{ color: "var(--foreground)" }}>Privacy Policy</a>{" "}
                before you continue.
              </p>

              <div className="flex items-start gap-2">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(v) => setTermsAccepted(!!v)}
                  className="mt-0.5"
                />
                <label style={{ fontSize: "var(--text-sm)", color: "var(--foreground)", lineHeight: 1.5 }}>
                  I accept the{" "}
                  <a href="#" className="underline font-medium">Terms of Use</a>{" "}
                  and{" "}
                  <a href="#" className="underline font-medium">Privacy Policy</a>.
                </label>
              </div>

              <FloatingInput
                label="E-Mail"
                type="email"
                required
                value={email}
                onChange={setEmail}
              />
              <FloatingInput
                label="First Name"
                required
                value={firstName}
                onChange={setFirstName}
              />
              <FloatingInput
                label="Last Name"
                required
                value={lastName}
                onChange={setLastName}
              />

              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  background: termsAccepted ? "var(--primary)" : "var(--muted)",
                  color: termsAccepted ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                  cursor: termsAccepted ? "pointer" : "not-allowed",
                }}
                disabled={!termsAccepted}
                onClick={handleSignUpNext}
              >
                Next
              </Button>

              <OrDivider />
              <SocialButtons showPasskey={false} />
            </div>
          </AuthCard>
        )}

        {view === "sign-up-password" && (
          <AuthCard title="Sign up" showSignIn onNavigate={handleNavigate}>
            <div className="space-y-5">
              <div
                className="flex items-center gap-3 p-3 rounded"
                style={{
                  background: "rgba(29, 56, 74, 0.06)",
                  border: "1px solid rgba(29, 56, 74, 0.12)",
                }}
              >
                <Info className="w-4 h-4 shrink-0" style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "var(--text-sm)", color: "var(--primary)" }}>
                  Pick a password for your account
                </span>
              </div>

              <FloatingInput
                label="Password"
                type={showSignUpPassword ? "text" : "password"}
                required
                value={signUpPassword}
                onChange={setSignUpPassword}
                endIcon={
                  <button onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="p-1">
                    {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />

              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                }}
                onClick={handleSignUpSubmit}
              >
                Next
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                }}
                onClick={() => setView("sign-up")}
              >
                Back
              </Button>

              <OrDivider />

              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold gap-2"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                }}
              >
                <Fingerprint className="w-4 h-4" />
                Sign Up with Passkey
              </Button>

              <OrDivider />
              <SocialButtons showPasskey={false} />
            </div>
          </AuthCard>
        )}

        {view === "verify" && (
          <AuthCard title="Sign up" showSignIn onNavigate={handleNavigate}>
            <div className="space-y-6">
              <p style={{ fontSize: "var(--text-base)", color: "var(--muted-foreground)", lineHeight: 1.7 }}>
                The last step is to verify your email address. Please check your inbox for an email with instructions.
              </p>
              <p style={{ fontSize: "var(--text-base)", color: "var(--foreground)", lineHeight: 1.7 }}>
                If you have not received an email,{" "}
                <button className="underline font-medium hover:opacity-80">
                  click here to send it again.
                </button>
              </p>
            </div>
          </AuthCard>
        )}

        {view === "recovery" && (
          <AuthCard title="Password recovery" showSignUp onNavigate={handleNavigate}>
            <div className="space-y-5">
              <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                Please enter your email address below to receive a recovery link that will allow you to reset your password.
              </p>
              <FloatingInput
                label="E-Mail"
                type="email"
                required
                value={email}
                onChange={setEmail}
              />
              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                }}
                onClick={handleRecovery}
              >
                Continue
              </Button>
            </div>
          </AuthCard>
        )}
        </div>
      </div>

      {/* Help widget */}
      <button
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg hover:scale-105 transition-transform"
        style={{
          width: "48px",
          height: "48px",
          background: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Footer */}
      <div className="relative z-10">
        <Footer className="bg-transparent border-t-0" />
      </div>
    </div>
  );
}
