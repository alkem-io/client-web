import { useState } from "react";
import { useParams, Link } from "react-router";
import { 
  Plus, MoreVertical, Layout, Search, Filter, 
  Settings, CreditCard, Users, Bell, User, 
  LogOut, ExternalLink, Folder
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function UserMembershipPage() {
  const { userSlug } = useParams<{ userSlug: string }>();
  const slug = userSlug || "user";
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Navigation Tabs
  const tabs = [
    { label: "MY PROFILE", href: `/user/${slug}/settings/profile`, icon: User },
    { label: "ACCOUNT", href: `/user/${slug}/settings/account`, icon: Layout },
    { label: "MEMBERSHIP", href: `/user/${slug}/settings/membership`, active: true, icon: CreditCard },
    { label: "ORGANIZATIONS", href: `/user/${slug}/settings/organizations`, icon: Users },
    { label: "NOTIFICATIONS", href: `/user/${slug}/settings/notifications`, icon: Bell },
    { label: "SETTINGS", href: `/user/${slug}/settings/general`, icon: Settings },
  ];

  // Mock Data: Memberships
  const memberships = [
    {
      id: 1,
      name: "Global Sustainability Alliance",
      type: "Space",
      description: "A collaborative network of organizations working towards the UN Sustainable Development Goals.",
      image: "https://images.unsplash.com/photo-1758519288948-e3c87d2d78d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsYWJvcmF0aXZlJTIwdGVhbSUyMG1lZXRpbmclMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MXx8fHwxNzY5MTc2MzkyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Member",
      members: 1240,
      status: "Active"
    },
    {
      id: 2,
      name: "Urban Mobility Lab",
      type: "Subspace",
      description: "Reimagining city transportation networks for better accessibility and reduced carbon footprint.",
      image: "https://images.unsplash.com/flagged/photo-1576485436509-a7d286952b65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGFyZWQlMjB3b3Jrc3BhY2UlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc2OTE3NjQwMHww&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Lead",
      members: 45,
      status: "Active"
    },
    {
      id: 3,
      name: "Digital Nomad Community",
      type: "Space",
      description: "Connecting remote workers worldwide to share tips, locations, and coordinate meetups.",
      image: "https://images.unsplash.com/photo-1562577309-2ca9a61ab410?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbm9tYWQlMjBjb21tdW5pdHklMjBldmVudHxlbnwxfHx8fDE3NjkxNzY0MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Member",
      members: 8500,
      status: "Active"
    },
    {
      id: 4,
      name: "Product Design Weekly",
      type: "Subspace",
      description: "Weekly design challenges and critiques for product designers.",
      image: "https://images.unsplash.com/photo-1676276374324-db790020bdbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwYnJhaW5zdG9ybWluZyUyMHNlc3Npb24lMjB3aGl0ZSUyMGJvYXJkfGVufDF8fHx8MTc2OTE3NjQwNnww&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Member",
      members: 120,
      status: "Archived"
    },
    {
      id: 5,
      name: "Innovation Summit 2024",
      type: "Space",
      description: "Planning committee for the annual innovation summit.",
      image: "https://images.unsplash.com/photo-1695067058684-da5a90013c57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbm5vdmF0aW9uJTIwbGFiJTIwZGl2ZXJzZSUyMHBlb3BsZXxlbnwxfHx8fDE3NjkxNzY0MDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Admin",
      members: 15,
      status: "Active"
    },
    {
      id: 6,
      name: "Local Community Garden",
      type: "Subspace",
      description: "Coordinating volunteers and planting schedules for the downtown community garden.",
      image: "https://images.unsplash.com/photo-1758275557142-e4e5e7842d52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwY29tbXVuaXR5JTIwZ3JvdXAlMjBoYXBweSUyMHBlb3BsZXxlbnwxfHx8fDE3NjkxNzYzOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      role: "Member",
      members: 78,
      status: "Active"
    }
  ];

  const filteredMemberships = memberships.filter(item => {
    const matchesFilter = filter === "All" || item.status === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header / Navigation Area */}
      <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="px-6 md:px-8 pt-8 pb-0">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Memberships</h1>
              <p className="text-muted-foreground mt-1">View and manage memberships across spaces and subspaces.</p>
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
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 space-y-8">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search memberships..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center border rounded-md p-1 bg-muted/20">
              {["All", "Active", "Archived"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cn(
                    "px-3 py-1.5 rounded-sm text-sm font-medium transition-all",
                    filter === status
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
            
            <Button size="sm" className="whitespace-nowrap ml-auto md:ml-0">
              <Plus className="w-4 h-4 mr-2" />
              Join Space
            </Button>
          </div>
        </div>

        {/* Results Info */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredMemberships.length} of {memberships.length} memberships
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemberships.map((item) => (
            <Card key={item.id} className="group overflow-hidden flex flex-col h-full border-border hover:border-primary/50 transition-colors">
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm shadow-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Leave {item.type}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="absolute bottom-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-foreground border-0">
                    {item.type}
                  </Badge>
                  {item.status === "Archived" && (
                    <Badge variant="destructive" className="backdrop-blur-md">
                      Archived
                    </Badge>
                  )}
                </div>
              </div>

              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal border-primary/20 text-primary bg-primary/5">
                    {item.role}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-2 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </CardContent>
              
              <CardFooter className="p-4 border-t bg-muted/30 text-xs text-muted-foreground flex justify-between items-center mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1" title="Members">
                    <Users className="w-3.5 h-3.5" />
                    <span>{item.members.toLocaleString()}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}

          {/* Empty State for Filters */}
          {filteredMemberships.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/10 border-dashed">
              <Folder className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">No memberships found</h3>
              <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search query.</p>
              <Button variant="outline" onClick={() => {setFilter("All"); setSearchQuery("");}}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Pagination / Load More */}
        {filteredMemberships.length > 0 && (
          <div className="flex justify-center pt-4">
             <Button variant="ghost" size="sm" className="text-muted-foreground">
                Load More
             </Button>
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}