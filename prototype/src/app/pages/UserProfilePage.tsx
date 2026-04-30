import { useState } from "react";
import { useParams } from "react-router";
import { UserProfileHeader } from "@/app/components/user/UserProfileHeader";
import { OrganizationCard } from "@/app/components/user/OrganizationCard";
import { SpaceGridCard } from "@/app/components/user/SpaceGridCard";
import { Badge } from "@/app/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserProfilePage() {
  const { userSlug } = useParams<{ userSlug: string }>();
  const [activeTab, setActiveTab] = useState("All Resources");
  
  // Mock Data
  const user = {
    name: "Alex Rivera",
    username: userSlug || "arivera",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    location: "San Francisco, CA",
    bio: `Passionate about sustainable urban planning and civic technology. Leading the transition to renewable energy grids at CityScale.
    
Always looking for collaborators on open source climate data projects. Feel free to reach out if you're interested in smart city infrastructure!`,
    isOwnProfile: true, // For demo purposes
  };

  const organizations = [
    { id: 1, name: "CityScale", role: "Director of Innovation", memberCount: 142, imageUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" },
    { id: 2, name: "Open Climate Fix", role: "Contributor", memberCount: 850, imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" },
    { id: 3, name: "Urban Tech Alliance", role: "Member", memberCount: 2400, imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" },
  ];

  const hostedSpaces = [
    { id: 1, title: "Renewable Energy Grid", description: "Collaborating on the future of distributed energy resources and microgrid implementation.", memberCount: 45, isPrivate: false, role: "host", imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    { id: 2, title: "Smart Traffic Systems", description: "AI-driven traffic management solutions for mid-sized cities.", memberCount: 12, isPrivate: true, role: "host", imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
  ];

  const virtualContributors = [
    { id: 1, name: "DataSynth Bot", description: "Generates synthetic datasets for urban modeling.", type: "AI Model" },
    { id: 2, name: "PolicyScanner", description: "Scans municipal meeting minutes for keywords.", type: "Scraper" },
  ];

  const leadingSpaces = [
    { id: 3, title: "Urban Green Spaces", description: "Designing accessible parks and recreational areas in dense urban environments.", memberCount: 89, isPrivate: false, role: "facilitator", imageUrl: "https://images.unsplash.com/photo-1448375240586-dfd8d3cd6052?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
  ];

  const memberSpaces = [
    { id: 4, title: "Public Transit Data", description: "Open data standards for public transportation systems.", memberCount: 230, isPrivate: false, role: "member", imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    { id: 5, title: "Community Gardens", description: "Local food production initiatives.", memberCount: 56, isPrivate: false, role: "member", imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    { id: 6, title: "Civic Hacking", description: "Weekly hackathons for civic tech projects.", memberCount: 120, isPrivate: false, role: "member", imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      <UserProfileHeader user={user} />

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Bio & Orgs */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
            {/* Bio Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">About</h2>
              <div className="prose prose-sm dark:prose-invert text-muted-foreground whitespace-pre-line">
                {user.bio}
              </div>
            </section>

            {/* Organizations Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Organizations</h2>
              <div className="flex flex-col gap-3">
                {organizations.map(org => (
                  <OrganizationCard 
                    key={org.id}
                    name={org.name}
                    role={org.role}
                    memberCount={org.memberCount}
                    imageUrl={org.imageUrl}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Resources & Spaces */}
          <div className="lg:col-span-8 flex flex-col min-w-0">
             {/* Sticky Navigation Tabs */}
            <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0 border-b border-border/40">
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {["All Resources", "Hosted Spaces", "Virtual Contributors", "Leading", "Member Of"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "text-sm font-medium border-b-2 pb-2 whitespace-nowrap transition-colors",
                      activeTab === tab
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-10">
            
            {/* Hosted Resources Section - Show if All Resources, Hosted Spaces, or Virtual Contributors is selected */}
            {(activeTab === "All Resources" || activeTab === "Hosted Spaces" || activeTab === "Virtual Contributors") && (
              <section>
                {/* Only show main header if showing "All Resources", otherwise context is clear from tabs */}
                {activeTab === "All Resources" && (
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Resources Hosted</h2>
                    <Badge variant="outline" className="text-muted-foreground">
                      {hostedSpaces.length + virtualContributors.length} Total
                    </Badge>
                  </div>
                )}

                {/* Hosted Spaces */}
                {(activeTab === "All Resources" || activeTab === "Hosted Spaces") && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Spaces</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hostedSpaces.map(space => (
                        // @ts-ignore
                        <SpaceGridCard 
                          key={space.id}
                          title={space.title}
                          description={space.description}
                          memberCount={space.memberCount}
                          isPrivate={space.isPrivate}
                          role={space.role as any}
                          imageUrl={space.imageUrl}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Virtual Contributors */}
                {(activeTab === "All Resources" || activeTab === "Virtual Contributors") && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Bot className="w-4 h-4" /> Virtual Contributors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {virtualContributors.map(vc => (
                        <div key={vc.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                          <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{vc.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{vc.description}</p>
                            <Badge variant="secondary" className="text-[10px] h-5">{vc.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {(activeTab === "All Resources") && <div className="h-px bg-border/50" />}

            {/* Spaces Leading */}
            {(activeTab === "All Resources" || activeTab === "Leading") && (
              <section>
                <h2 className="text-xl font-bold mb-4">Spaces Leading</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leadingSpaces.map(space => (
                    // @ts-ignore
                    <SpaceGridCard 
                      key={space.id}
                      title={space.title}
                      description={space.description}
                      memberCount={space.memberCount}
                      isPrivate={space.isPrivate}
                      role={space.role as any}
                      imageUrl={space.imageUrl}
                    />
                  ))}
                </div>
              </section>
            )}

            {(activeTab === "All Resources") && <div className="h-px bg-border/50" />}

            {/* Member Spaces */}
            {(activeTab === "All Resources" || activeTab === "Member Of") && (
              <section>
                <h2 className="text-xl font-bold mb-4">Member of</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memberSpaces.map(space => (
                    // @ts-ignore
                    <SpaceGridCard 
                      key={space.id}
                      title={space.title}
                      description={space.description}
                      memberCount={space.memberCount}
                      isPrivate={space.isPrivate}
                      role={space.role as any}
                      imageUrl={space.imageUrl}
                    />
                  ))}
                </div>
              </section>
            )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
