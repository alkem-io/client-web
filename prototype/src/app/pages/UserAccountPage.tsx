import { useParams, Link } from "react-router";
import { Plus, MoreVertical, Layout, Bot, FileBox, Home, Settings, CreditCard, Users, Bell, User } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/lib/utils";

export default function UserAccountPage() {
  const { userSlug } = useParams<{ userSlug: string }>();
  const slug = userSlug || "user";

  // Navigation Tabs
  const tabs = [
    { label: "MY PROFILE", href: `/user/${slug}/settings/profile`, icon: User },
    { label: "ACCOUNT", href: `/user/${slug}/settings/account`, active: true, icon: Layout },
    { label: "MEMBERSHIP", href: `/user/${slug}/settings/membership`, icon: CreditCard },
    { label: "ORGANIZATIONS", href: `/user/${slug}/settings/organizations`, icon: Users },
    { label: "NOTIFICATIONS", href: `/user/${slug}/settings/notifications`, icon: Bell },
    { label: "SETTINGS", href: `/user/${slug}/settings/general`, icon: Settings },
  ];

  // Mock Data: Hosted Spaces
  const hostedSpaces = [
    {
      id: 1,
      name: "Green Energy Space Alpha",
      description: "Central collaborative workspace for the Q1 innovation sprint.",
      image: "https://images.unsplash.com/photo-1765728617352-895327fcf036?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBjb2xsYWJvcmF0aW9uJTIwc3BhY2V8ZW58MXx8fHwxNzY5MTczMjEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 2,
      name: "Design System Workshop",
      description: "A dedicated room for auditing and updating our design tokens.",
      image: "https://images.unsplash.com/photo-1568992688243-52608227497d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMG1lZXRpbmd8ZW58MXx8fHwxNzY5MTczMjEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      id: 3,
      name: "Remote Team Lounge",
      description: "Casual hangout space for distributed team members.",
      image: "https://images.unsplash.com/photo-1623251606108-512c7c4a3507?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbm9tYWQlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzY5MTczMjEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    }
  ];

  // Mock Data: Virtual Contributors
  const virtualContributors = [
    {
      id: 1,
      name: "Research Assistant Bot",
      description: "AI agent specialized in summarizing lengthy documents and reports.",
    },
    {
      id: 2,
      name: "Data Visualizer",
      description: "Automatically generates charts from CSV uploads.",
    }
  ];

  // Mock Data: Template Packs
  const templatePacks = [
    {
      id: 1,
      name: "Agile Sprint Pack",
      description: "Complete set of templates for running agile ceremonies.",
    }
  ];

  // Mock Data: Custom Homepages
  const customHomepages = []; // Empty state example

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header / Navigation Area */}
      <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="px-6 md:px-8 pt-8 pb-0">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your resources, subscription, and account preferences.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                to={tab.href}
                className={cn(
                  "flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  tab.active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Link>
            ))}
          </div>
          </div>
        </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 space-y-12">
        {/* Help Text */}
        <div className="flex items-center gap-2 p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary/80 max-w-3xl">
          <Layout className="w-4 h-4" />
          <p>Here you can view your active resources and manage your account allocation limits.</p>
        </div>

        {/* Section: Hosted Spaces */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Hosted Spaces
              <Badge variant="secondary" className="ml-2 font-normal text-xs">
                {hostedSpaces.length} Active
              </Badge>
            </h2>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Space
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostedSpaces.map((space) => (
              <Card key={space.id} className="group overflow-hidden flex flex-col h-full border-border hover:border-primary/50 transition-colors">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img 
                    src={space.image} 
                    alt={space.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                    {space.name}
                  </h3>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {space.description}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {/* Create New Space Card */}
            <button className="flex flex-col items-center justify-center h-full min-h-[280px] rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group bg-muted/5">
              <div className="h-12 w-12 rounded-full bg-muted group-hover:bg-background flex items-center justify-center mb-4 transition-colors shadow-sm">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">Create New Space</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[200px] text-center">
                Launch a new collaborative environment for your team.
              </p>
            </button>
          </div>
        </section>

        {/* Section: Virtual Contributors */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Virtual Contributors
              <Badge variant="secondary" className="ml-2 font-normal text-xs">
                {virtualContributors.length} Active
              </Badge>
            </h2>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Contributor
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {virtualContributors.map((vc) => (
              <Card key={vc.id} className="group overflow-hidden flex flex-col h-full hover:border-primary/50 transition-colors">
                <CardHeader className="p-5 pb-2 flex flex-row items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors truncate">
                      {vc.name}
                    </h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-5 pt-2 flex-grow">
                  <p className="text-sm text-muted-foreground">
                    {vc.description}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {/* Create New Card (Inline option) */}
             <button className="flex flex-col items-center justify-center h-full min-h-[160px] rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group">
              <div className="h-10 w-10 rounded-full bg-muted group-hover:bg-background flex items-center justify-center mb-3 transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Create New Contributor</span>
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section: Template Packs */}
          <section className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">Template Packs</h2>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Pack
              </Button>
            </div>

            <div className="space-y-4">
               {templatePacks.map((pack) => (
                <Card key={pack.id} className="flex items-center p-4 gap-4 hover:border-primary/50 transition-colors group">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--chart-2) 15%, transparent)', color: 'var(--chart-2)' }}>
                    <FileBox className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{pack.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{pack.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </Card>
               ))}
               
               {/* Empty Slots */}
               {Array.from({ length: Math.max(0, 3 - templatePacks.length) }).map((_, i) => (
                 <div key={i} className="flex items-center p-4 gap-4 border border-dashed rounded-xl opacity-60">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Empty Slot</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Section: Custom Homepages (Now below Template Packs in same column) */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight">Custom Homepages</h2>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Page
                </Button>
              </div>

              <div className="space-y-4">
                {customHomepages.length > 0 ? (
                  customHomepages.map((page: any) => (
                    <Card key={page.id} className="p-4">
                      {page.name}
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[240px] border border-dashed rounded-xl bg-muted/5 text-center p-6">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Layout className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">No Custom Homepages</h3>
                    <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
                      Create a personalized landing page for your account.
                    </p>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3.5 h-3.5 mr-2" />
                      Create Homepage
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-4">
                      Capacity: 0/1 Used
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}