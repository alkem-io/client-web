import { useState } from "react";
import { useParams, Link } from "react-router";
import { 
  Plus, MoreVertical, Layout, Search, Filter, 
  Settings, CreditCard, Users, Bell, User, 
  LogOut, ExternalLink, Building2, MapPin, 
  CheckCircle2, Globe, ShieldCheck, AlertCircle
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function UserOrganizationsPage() {
  const { userSlug } = useParams<{ userSlug: string }>();
  const slug = userSlug || "user";
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Navigation Tabs
  const tabs = [
    { label: "MY PROFILE", href: `/user/${slug}/settings/profile`, icon: User },
    { label: "ACCOUNT", href: `/user/${slug}/settings/account`, icon: Layout },
    { label: "MEMBERSHIP", href: `/user/${slug}/settings/membership`, icon: CreditCard },
    { label: "ORGANIZATIONS", href: `/user/${slug}/settings/organizations`, active: true, icon: Users },
    { label: "NOTIFICATIONS", href: `/user/${slug}/settings/notifications`, icon: Bell },
    { label: "SETTINGS", href: `/user/${slug}/settings/general`, icon: Settings },
  ];

  // Mock Data: Organizations
  const organizations = [
    {
      id: 1,
      name: "Alkemio Innovation Lab",
      description: "Driving collaborative innovation for a sustainable future.",
      location: "Amsterdam, Netherlands",
      role: "Admin",
      associates: 42,
      isVerified: true,
      website: "https://alkemio.org",
      image: "https://images.unsplash.com/photo-1571389244715-21e0e1a94bcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGNvcnBvcmF0ZSUyMGlkZW50aXR5JTIwYnJhbmRpbmd8ZW58MXx8fHwxNzY5MTc4NzkwfDA&ixlib=rb-4.1.0&q=80&w=400"
    },
    {
      id: 2,
      name: "Green Future Foundation",
      description: "Funding research and projects that combat climate change.",
      location: "Berlin, Germany",
      role: "Associate",
      associates: 128,
      isVerified: true,
      website: "https://example.org",
      image: "https://images.unsplash.com/photo-1692037198805-c7421032c5cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJpbGl0eSUyMGdyZWVuJTIwZW5lcmd5JTIwaWNvbiUyMGFic3RyYWN0fGVufDF8fHx8MTc2OTE3ODgwNHww&ixlib=rb-4.1.0&q=80&w=400"
    },
    {
      id: 3,
      name: "TechStart Inc.",
      description: "Incubating the next generation of tech unicorns in Silicon Valley.",
      location: "San Francisco, CA",
      role: "Associate",
      associates: 12,
      isVerified: false,
      website: "https://example.com",
      image: "https://images.unsplash.com/photo-1760611656615-db3fad24a314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNobm9sb2d5JTIwc3RhcnR1cCUyMG9mZmljZSUyMG9wZW4lMjBwbGFufGVufDF8fHx8MTc2OTE4MDMzOHww&ixlib=rb-4.1.0&q=80&w=400"
    },
    {
      id: 4,
      name: "Global Education Network",
      description: "Connecting universities and researchers worldwide.",
      location: "London, UK",
      role: "Associate",
      associates: 560,
      isVerified: true,
      website: "https://example.edu",
      image: "https://images.unsplash.com/photo-1723746571161-e45723f5db33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjB1bml2ZXJzaXR5JTIwYWJzdHJhY3QlMjBsb2dvfGVufDF8fHx8MTc2OTE3ODgwOHww&ixlib=rb-4.1.0&q=80&w=400"
    }
  ];

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    org.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDisassociate = (orgName: string) => {
    toast.success(`Disassociated from ${orgName}`);
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreateOpen(false);
    toast.success("Organization created successfully");
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header / Navigation Area */}
      <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="px-6 md:px-8 pt-8 pb-0">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
              <p className="text-muted-foreground mt-1">Manage your professional affiliations and organization memberships.</p>
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
              placeholder="Search organizations..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto md:ml-0">
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
                <DialogDescription>
                  Establish a new organization profile. You will become the administrator.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrg} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input id="name" placeholder="e.g. Acme Corp" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" placeholder="e.g. Innovation for everyone" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g. New York, NY" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input id="website" placeholder="https://" />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit">Create Organization</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map((org) => (
            <Card key={org.id} className="group overflow-hidden flex flex-col h-full border-border hover:border-primary/50 transition-colors">
              
              {/* Image Area - Aspect Video to match Space Cards */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img 
                  src={org.image} 
                  alt="Cover" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                
                {/* Actions Top Right */}
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
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                         <Settings className="w-4 h-4 mr-2" />
                         Manage Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDisassociate(org.name)}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Disassociate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Avatar and Verification on Image Area */}
                <div className="absolute bottom-3 left-3 flex items-end gap-3">
                  <Avatar className="w-12 h-12 border-2 border-background shadow-md rounded-lg">
                    <AvatarImage src={org.image} alt={org.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-lg">
                      {org.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {org.isVerified && (
                     <Badge variant="secondary" className="mb-0.5 backdrop-blur-md bg-background/80 text-foreground border-0 gap-1 pl-1.5 pr-2">
                       <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-white" />
                       Verified
                     </Badge>
                  )}
                </div>
              </div>

              {/* Header */}
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {org.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal border-primary/20 text-primary bg-primary/5">
                    {org.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {org.location}
                  </div>
                </div>
              </CardHeader>
              
              {/* Content */}
              <CardContent className="p-4 pt-2 flex-grow">
                 <p className="text-sm text-muted-foreground line-clamp-2">
                   {org.description}
                 </p>
              </CardContent>
              
              {/* Footer */}
              <CardFooter className="p-4 border-t bg-muted/30 text-xs text-muted-foreground flex justify-between items-center mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1" title="Associates">
                    <Users className="w-3.5 h-3.5" />
                    <span>{org.associates.toLocaleString()} Associates</span>
                  </div>
                </div>
                
                {org.website && (
                  <a 
                    href={org.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}

          {/* Empty State */}
          {filteredOrgs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 border rounded-lg bg-muted/10 border-dashed">
              <Building2 className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">No organizations found</h3>
              <p className="text-muted-foreground text-sm mb-4">Try searching for a different name.</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}