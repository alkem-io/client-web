import { Link } from "react-router";
import { Settings } from "lucide-react";
import { SpaceCard, type SpaceCardData } from "@/app/components/space/SpaceCard";
import AlkemioSymbolSquare from "@/imports/AlkemioSymbolSquare";

/* ─── Sample Data (VNG Innovation Hub) ─── */
const hubData = {
  slug: "vng-innovation-hub",
  name: "VNG Innovation Hub",
  tagline: "innovatie met en door de gemeentes",
  bannerImage: "/banners/vng-innovation-hub.png",
  description: `De <strong>open innovatiehub</strong> voor <strong>samenwerking tussen en voor de gemeentes</strong> in Nederland.<br/>Hier vind je communities die werken aan nieuwe vormen van publieke dienstverlening die aansluiten bij de leefwereld van mensen.<br/>Een plek waar de <strong>overheid, markt, wetenschap</strong> en <strong>samenleving</strong> samen kunnen werken aan <em>maatschappelijke missies</em>.`,
};

const hubSpaces: SpaceCardData[] = [
  {
    id: "1",
    slug: "digitale-leefomgeving",
    name: "Digitale Leefomgeving",
    description: "De Digital Twin Community NL!",
    bannerImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    initials: "DL",
    avatarColor: "#1d384a",
    isPrivate: false,
    tags: ["digital twin", "3d"],
    memberCount: 42,
    leads: [
      { name: "User", avatar: "https://i.pravatar.cc/40?img=1", type: "person" },
      { name: "VNG", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/VNG_logo.svg/40px-VNG_logo.svg.png", type: "org" },
      { name: "IP", avatar: "https://i.pravatar.cc/40?img=3", type: "org" },
    ],
  },
  {
    id: "2",
    slug: "totaal-driedimensionaal",
    name: "Totaal Driedimensionaal (T3...)",
    description: "Praktische oplossingen voor het in 3D inwinnen, registreren en gebruiken van...",
    bannerImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    initials: "T3",
    avatarColor: "#2d6a4f",
    isPrivate: false,
    tags: ["geo-basisregistrat...", "BAG"],
    memberCount: 28,
    leads: [
      { name: "User", avatar: "https://i.pravatar.cc/40?img=5", type: "person" },
      { name: "VNG", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/VNG_logo.svg/40px-VNG_logo.svg.png", type: "org" },
    ],
  },
  {
    id: "3",
    slug: "dutch-societal-innovation-hub",
    name: "Dutch Societal Innovation ...",
    description: "De maatschappij vraagt erom dat het anders gaat en wij zetten samen de eers...",
    bannerImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    initials: "DS",
    avatarColor: "#4a1d6a",
    isPrivate: false,
    tags: ["innovation"],
    memberCount: 15,
    leads: [
      { name: "User1", avatar: "https://i.pravatar.cc/40?img=10", type: "person" },
      { name: "User2", avatar: "https://i.pravatar.cc/40?img=12", type: "person" },
      { name: "User3", avatar: "https://i.pravatar.cc/40?img=14", type: "person" },
    ],
  },
  {
    id: "4",
    slug: "slimme-mobiliteit",
    name: "Slimme Mobiliteit",
    description: "Samen werken aan slimme en duurzame mobiliteitsoplossingen voor gemeenten...",
    bannerImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    initials: "SM",
    avatarColor: "#1a5276",
    isPrivate: false,
    tags: ["mobiliteit", "smart city"],
    memberCount: 34,
    leads: [
      { name: "User", avatar: "https://i.pravatar.cc/40?img=15", type: "person" },
      { name: "VNG", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/VNG_logo.svg/40px-VNG_logo.svg.png", type: "org" },
    ],
  },
  {
    id: "5",
    slug: "open-data-gemeenten",
    name: "Open Data Gemeenten",
    description: "Het delen en hergebruiken van open data tussen gemeenten voor betere dienst...",
    bannerImage: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    initials: "OD",
    avatarColor: "#117a65",
    isPrivate: false,
    tags: ["open data", "transparantie"],
    memberCount: 56,
    leads: [
      { name: "User", avatar: "https://i.pravatar.cc/40?img=20", type: "person" },
      { name: "User2", avatar: "https://i.pravatar.cc/40?img=22", type: "person" },
    ],
  },
  {
    id: "6",
    slug: "energietransitie",
    name: "Energietransitie",
    description: "Gemeenten op weg naar een duurzame energievoorziening: warmtenetten, zon en...",
    bannerImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    initials: "ET",
    avatarColor: "#b7950b",
    isPrivate: false,
    tags: ["energie", "duurzaamheid"],
    memberCount: 63,
    leads: [
      { name: "User", avatar: "https://i.pravatar.cc/40?img=25", type: "person" },
      { name: "VNG", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/VNG_logo.svg/40px-VNG_logo.svg.png", type: "org" },
      { name: "User3", avatar: "https://i.pravatar.cc/40?img=27", type: "person" },
    ],
  },
  {
    id: "7",
    slug: "digitale-inclusie",
    name: "Digitale Inclusie",
    description: "Zorgen dat alle inwoners mee kunnen doen in de digitale samenleving...",
    bannerImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    initials: "DI",
    avatarColor: "#6c3483",
    isPrivate: true,
    tags: ["inclusie", "toegankelijkheid"],
    memberCount: 21,
    leads: [
      { name: "User", avatar: "https://i.pravatar.cc/40?img=30", type: "person" },
    ],
  },
  {
    id: "8",
    slug: "omgevingswet-implementatie",
    name: "Omgevingswet Implementatie",
    description: "Samenwerking rondom de invoering van de Omgevingswet en digitale dienstverlening...",
    bannerImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    initials: "OI",
    avatarColor: "#1b4f72",
    isPrivate: false,
    tags: ["omgevingswet", "regelgeving"],
    memberCount: 47,
    leads: [
      { name: "User", avatar: "https://i.pravatar.cc/40?img=33", type: "person" },
      { name: "User2", avatar: "https://i.pravatar.cc/40?img=35", type: "person" },
      { name: "VNG", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/VNG_logo.svg/40px-VNG_logo.svg.png", type: "org" },
    ],
  },
  {
    id: "9",
    slug: "cybersecurity-gemeenten",
    name: "Cybersecurity Gemeenten",
    description: "Kennisdeling en samenwerking op het gebied van informatiebeveiliging...",
    bannerImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    initials: "CG",
    avatarColor: "#1c2833",
    isPrivate: true,
    tags: ["security", "privacy"],
    memberCount: 38,
    leads: [
      { name: "User", avatar: "https://i.pravatar.cc/40?img=40", type: "person" },
      { name: "VNG", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/VNG_logo.svg/40px-VNG_logo.svg.png", type: "org" },
    ],
  },
];

/* ─── Innovation Hub Page ─── */
export default function InnovationHubPage() {
  const isAdmin = true; // For prototype purposes

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Banner (Space-style, full-width) ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ marginTop: "-64px", height: "256px" }}
      >
        <img
          src={hubData.bannerImage}
          alt={hubData.name}
          className="w-full h-full object-cover"
          style={{ display: "block" }}
        />
      </div>

      {/* ── Info Bar (title + tagline below banner, like SpaceHeader) ── */}
      <div
        className="w-full"
        style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 32, paddingBottom: 32 }}
      >
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h1
                className="text-foreground font-bold tracking-tight"
                style={{ fontSize: "clamp(22px, 3vw, 32px)", lineHeight: 1.2 }}
              >
                {hubData.name}
              </h1>
              {isAdmin && (
                <Link
                  to={`/innovation-hub/${hubData.slug}/settings`}
                  className="p-2 rounded-lg transition-colors hover:bg-accent"
                  style={{ color: "var(--muted-foreground)" }}
                  title="Hub settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              )}
            </div>
            <p
              className="text-muted-foreground italic"
              style={{ fontSize: "var(--text-body)", lineHeight: 1.4 }}
            >
              {hubData.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* ── Content area (12-col grid, col-start-2 col-span-10) ── */}
      <div className="w-full pb-8" style={{ paddingLeft: 32, paddingRight: 32 }}>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex flex-col gap-10">

      {/* ── Description Block ── */}
      <div>
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="text-body"
            style={{
              color: "var(--foreground)",
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: hubData.description }}
          />
        </div>
      </div>

      {/* ── Spaces Grid ── */}
      <div>
        <h2
          className="text-section-title mb-6"
          style={{ color: "var(--foreground)" }}
        >
          {hubData.name} Spaces
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubSpaces.map((space) => (
            <SpaceCard key={space.id} space={space} />
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div>
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          <div className="shrink-0 w-4 h-4">
            <AlkemioSymbolSquare />
          </div>
          <p style={{ fontSize: "var(--text-caption)" }}>
            Interested in other Spaces?{" "}
            <Link
              to="/spaces"
              className="underline underline-offset-2 hover:opacity-80"
              style={{ color: "var(--muted-foreground)" }}
            >
              Browse all Spaces on Alkemio
            </Link>
          </p>
        </div>
      </div>

          </div>
        </div>
      </div>

      {/* ── Footer ── */}
    </div>
  );
}
