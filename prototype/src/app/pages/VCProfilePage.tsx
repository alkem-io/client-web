import { useParams, Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import {
  Bot,
  Settings,
  Check,
  Minus,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Globe,
  Shield,
  Brain,
  FileText,
  Upload,
  Lock,
  ExternalLink,
  BookOpen,
  Users,
  CircuitBoard,
  Eye,
  Database,
  ShieldCheck,
} from "lucide-react";

export default function VCProfilePage() {
  const { vcSlug } = useParams<{ vcSlug: string }>();

  // Mock Data
  const vc = {
    name: "Softmann",
    slug: vcSlug || "softmann",
    avatarUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80",
    description: "A secret UX helper tool",
    tags: ["UX", "UI", "Design Research", "HCI"],
    isOwner: true, // Demo: viewing as owner
    host: {
      name: "Jeroen Nijkamp",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      slug: "jnijkamp",
    },
    references: [
      { name: "UX Design Guidelines", url: "#" },
      { name: "Research Methodology", url: "#" },
    ],
    bodyOfKnowledge: {
      type: "space" as const,
      sourceName: "Lux-Lab",
      sourceAvatarUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      sourceSlug: "lux-lab",
    },
    functionality: {
      capabilities: [
        { label: "Answer questions in comments", enabled: true },
        { label: "Create new posts", enabled: false },
        { label: "Invite other contributors", enabled: false },
      ],
      dataAccess: [
        { label: "About page", enabled: true },
        { label: "Posts & Contributions", enabled: false },
        { label: "Subspaces", enabled: false },
      ],
      roleRequirements: "This VC needs to be granted **member rights** to function correctly",
    },
    aiEngine: {
      name: "Alkemio AI",
      openModel: true,
      dataUsedForTraining: false,
      knowledgeRestriction: true,
      webAccess: false,
      physicalLocation: "Sweden, EU",
      technicalReferencesUrl: "#",
    },
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Profile Header — No Banner */}
      <div className="px-6 md:px-8 pt-8 pb-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-background shadow-lg text-3xl">
                  <AvatarImage src={vc.avatarUrl} alt={vc.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info & Actions */}
              <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-hero text-foreground">{vc.name}</h1>
                    <Badge variant="secondary" className="gap-1.5 font-medium">
                      <Bot className="w-3.5 h-3.5" />
                      Virtual Contributor
                    </Badge>
                  </div>
                  {/* Skill Tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vc.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-caption font-medium bg-primary/5 border-primary/20 text-primary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Settings Button (owner only) */}
                {vc.isOwner && (
                  <Link to={`/vc/${vc.slug}/settings`}>
                    <Button variant="outline" size="icon" className="shadow-sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content — 12-col grid */}
      <div className="px-6 md:px-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-12 lg:col-start-2 lg:col-span-3 space-y-6 lg:sticky lg:top-24 self-start">
            {/* Description */}
            <section>
              <h2 className="text-subsection-title font-bold mb-2">Description</h2>
              <p className="text-body text-muted-foreground">{vc.description}</p>
            </section>

            {/* Host */}
            <section>
              <h2 className="text-subsection-title font-bold mb-3">Host</h2>
              <Link to={`/user/${vc.host.slug}`} className="flex items-center gap-3 group">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={vc.host.avatarUrl} alt={vc.host.name} />
                  <AvatarFallback>{vc.host.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-body-emphasis group-hover:text-primary transition-colors">{vc.host.name}</span>
              </Link>
            </section>

            {/* References */}
            <section>
              <h2 className="text-subsection-title font-bold mb-3">References</h2>
              {vc.references.length > 0 ? (
                <ul className="space-y-2">
                  {vc.references.map((ref) => (
                    <li key={ref.name}>
                      <a
                        href={ref.url}
                        className="text-body text-primary hover:underline flex items-center gap-1.5"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {ref.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body text-muted-foreground italic">No references added</p>
              )}
            </section>

            {/* Body of Knowledge */}
            <section>
              <h2 className="text-subsection-title font-bold mb-3">Body of Knowledge</h2>
              <p className="text-caption text-muted-foreground mb-3">
                Answers Softmann gives are based on the body of knowledge coming from:
              </p>
              <Link
                to={`/space/${vc.bodyOfKnowledge.sourceSlug}`}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors group"
              >
                <Avatar className="w-9 h-9 rounded-lg">
                  <AvatarImage src={vc.bodyOfKnowledge.sourceAvatarUrl} alt={vc.bodyOfKnowledge.sourceName} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-caption">
                    <BookOpen className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-body-emphasis group-hover:text-primary transition-colors">
                    {vc.bodyOfKnowledge.sourceName}
                  </span>
                </div>
              </Link>
            </section>
          </div>

          {/* Right Main Content */}
          <div className="col-span-12 lg:col-span-7 space-y-8">
            {/* Functionality Section */}
            <section>
              <h2 className="text-section-title mb-4">Functionality</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Functional Capabilities */}
                <Card className="text-center">
                  <CardHeader className="pb-2 pt-5 px-4 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <CircuitBoard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-card-title">Functional Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-5 pt-2">
                    <ul className="space-y-1.5 text-left">
                      {vc.functionality.capabilities.map((item) => (
                        <li key={item.label} className="flex items-start gap-2 text-caption">
                          {item.enabled ? (
                            <Check className="w-3.5 h-3.5 mt-0.5 text-foreground shrink-0" />
                          ) : (
                            <Minus className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          )}
                          <span className={item.enabled ? "text-foreground" : "text-muted-foreground"}>
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Data Access */}
                <Card className="text-center">
                  <CardHeader className="pb-2 pt-5 px-4 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-card-title">
                      Data access from the Space where it is a member
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-5 pt-2">
                    <ul className="space-y-1.5 text-left">
                      {vc.functionality.dataAccess.map((item) => (
                        <li key={item.label} className="flex items-start gap-2 text-caption">
                          {item.enabled ? (
                            <Check className="w-3.5 h-3.5 mt-0.5 text-foreground shrink-0" />
                          ) : (
                            <Minus className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          )}
                          <span className={item.enabled ? "text-foreground" : "text-muted-foreground"}>
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Role Requirements */}
                <Card className="text-center">
                  <CardHeader className="pb-2 pt-5 px-4 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-card-title">Role Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-5 pt-2">
                    <p className="text-caption text-muted-foreground text-left">
                      This VC needs to be granted <strong className="text-foreground">member rights</strong> to function correctly
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* AI Engine Section */}
            <section>
              <h2 className="text-section-title mb-4">AI Engine: {vc.aiEngine.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Open Model Transparency */}
                <TransparencyCard
                  icon={<Eye className="w-5 h-5" />}
                  title="Open Model Transparency"
                  description="Does the VC use an open-weight model?"
                  value={vc.aiEngine.openModel}
                />

                {/* Data Usage Disclosure */}
                <TransparencyCard
                  icon={<Database className="w-5 h-5" />}
                  title="Data Usage Disclosure"
                  description="Is interaction data used in any way for model training?"
                  value={vc.aiEngine.dataUsedForTraining}
                />

                {/* Knowledge Restriction */}
                <TransparencyCard
                  icon={<ShieldCheck className="w-5 h-5" />}
                  title="Knowledge Restriction"
                  description="Is the VC prompted to limit the responses to a specific body of knowledge?"
                  value={vc.aiEngine.knowledgeRestriction}
                />

                {/* Web Access */}
                <TransparencyCard
                  icon={<Globe className="w-5 h-5" />}
                  title="Web Access"
                  description="Can the VC access or search the web?"
                  value={vc.aiEngine.webAccess}
                  noIcon={<Clock className="w-4 h-4" />}
                />

                {/* Physical Location */}
                <TransparencyCard
                  icon={<MapPin className="w-5 h-5" />}
                  title="Physical Location"
                  description="Where is the AI service hosted?"
                  textValue={vc.aiEngine.physicalLocation}
                />

                {/* Technical References */}
                <Card className="text-center flex flex-col">
                  <CardHeader className="pb-2 pt-5 px-4 flex flex-col items-center flex-grow">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-card-title">Technical References</CardTitle>
                    <p className="text-caption text-muted-foreground mt-1">
                      Access to detailed information on the underlying models specifications
                    </p>
                  </CardHeader>
                  <CardContent className="px-4 pb-5 pt-2">
                    {vc.aiEngine.technicalReferencesUrl ? (
                      <a
                        href={vc.aiEngine.technicalReferencesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-1.5 text-caption">
                          <FileText className="w-3.5 h-3.5" />
                          SEE DOCUMENTATION
                        </Button>
                      </a>
                    ) : (
                      <p className="text-caption text-muted-foreground italic">Not available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Monitoring Section */}
            <section>
              <Separator className="mb-6" />
              <h2 className="text-section-title mb-3">Monitoring by Alkemio</h2>
              <p className="text-body text-muted-foreground">
                Since Alkemio facilitates the interaction with the external provider, it holds an operational responsibility to monitor the service. As with all data and interactions on the platform, these are governed by our Terms & Conditions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TransparencyCard Sub-component ─── */

interface TransparencyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value?: boolean;
  textValue?: string;
  noIcon?: React.ReactNode;
}

function TransparencyCard({ icon, title, description, value, textValue, noIcon }: TransparencyCardProps) {
  return (
    <Card className="text-center flex flex-col">
      <CardHeader className="pb-2 pt-5 px-4 flex flex-col items-center flex-grow">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
          {icon}
        </div>
        <CardTitle className="text-card-title">{title}</CardTitle>
        <p className="text-caption text-muted-foreground mt-1">{description}</p>
      </CardHeader>
      <CardContent className="px-4 pb-5 pt-2">
        {textValue ? (
          <span className="text-body-emphasis text-foreground">{textValue}</span>
        ) : value !== undefined ? (
          <div className="flex items-center justify-center gap-1.5">
            {value ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-body-emphasis">Yes</span>
              </>
            ) : (
              <>
                {noIcon || <XCircle className="w-4 h-4 text-muted-foreground" />}
                <span className="text-body-emphasis text-muted-foreground">No</span>
              </>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
