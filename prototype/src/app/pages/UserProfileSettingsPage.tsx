import { useState } from "react";
import { useParams, Link } from "react-router";
import { 
  User, Layout, CreditCard, Users, Bell, Settings, 
  Camera, Plus, Link as LinkIcon, Github, Twitter, Linkedin, Mail, MapPin, Check
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent } from "@/app/components/ui/card";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

export default function UserProfileSettingsPage() {
  const { userSlug } = useParams<{ userSlug: string }>();
  const slug = userSlug || "user";

  // Mock User Data
  const [formData, setFormData] = useState({
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex.rivera@alkemio.org",
    organization: "Alkemio Innovation Lab",
    bio: "<p>Passionate about <strong>collaborative innovation</strong> and open source software. I help teams build better products together.</p>",
    tagline: "Building the future of collaboration",
    city: "Amsterdam, Netherlands",
    links: {
      linkedin: "https://linkedin.com/in/arivera",
      twitter: "https://twitter.com/arivera",
      github: "https://github.com/arivera",
      website: "https://alexrivera.com"
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Navigation Tabs - Consistent with Account Page
  const tabs = [
    { label: "MY PROFILE", href: `/user/${slug}/settings/profile`, active: true, icon: User },
    { label: "ACCOUNT", href: `/user/${slug}/settings/account`, icon: Layout },
    { label: "MEMBERSHIP", href: `/user/${slug}/settings/membership`, icon: CreditCard },
    { label: "ORGANIZATIONS", href: `/user/${slug}/settings/organizations`, icon: Users },
    { label: "NOTIFICATIONS", href: `/user/${slug}/settings/notifications`, icon: Bell },
    { label: "SETTINGS", href: `/user/${slug}/settings/general`, icon: Settings },
  ];

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header / Navigation Area */}
      <div className="sticky top-16 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 md:px-8 pt-8 pb-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your personal profile and account preferences.</p>
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

      <div className="container mx-auto px-4 md:px-8 py-8">
        {/* Removed max-w-5xl mx-auto wrapper to fix spacing issue on the left */}
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Left Column: Avatar */}
          <div className="w-full md:w-64 flex-shrink-0 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              {/* Updated Avatar to match Profile Page EXACTLY (size, shadow, image crop) */}
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-lg text-4xl">
                <AvatarImage 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt={`${formData.firstName} ${formData.lastName}`}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {formData.firstName.substring(0, 1)}{formData.lastName.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold">{formData.firstName} {formData.lastName}</h2>
            {/* Nickname removed as requested */}
            
            <Button variant="outline" size="sm" className="w-full mt-4">
              Change Avatar
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center px-2">
              Recommended size: 400x400px. JPG, PNG or GIF.
            </p>
          </div>

          {/* Right Column: Profile Form */}
          <div className="flex-1 space-y-8 min-w-0 max-w-3xl">
            
            {/* Identity Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                <User className="w-5 h-5 text-primary" />
                Identity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      value={formData.email} 
                      readOnly 
                      className="pl-9 bg-muted/50 cursor-not-allowed" 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Contact support to change email.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="organization" 
                      value={formData.organization} 
                      onChange={(e) => setFormData({...formData, organization: e.target.value})} 
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Bio Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                <Layout className="w-5 h-5 text-primary" />
                About You
              </h3>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input 
                  id="tagline" 
                  placeholder="Brief description (e.g. Designer at Acme)"
                  value={formData.tagline}
                  onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                />
                <p className="text-[10px] text-muted-foreground">Displayed next to your name in lists.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">City / Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="location" 
                    value={formData.city} 
                    onChange={(e) => setFormData({...formData, city: e.target.value})} 
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <div className="prose-editor">
                  <ReactQuill 
                    theme="snow"
                    value={formData.bio}
                    onChange={(content) => setFormData({...formData, bio: content})}
                    modules={quillModules}
                    className="bg-card"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Markdown supported.</p>
              </div>
            </section>

            {/* Social Links Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                <LinkIcon className="w-5 h-5 text-primary" />
                Social Links
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5] shrink-0">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <Input 
                    placeholder="LinkedIn Profile URL" 
                    value={formData.links.linkedin}
                    onChange={(e) => setFormData({...formData, links: { ...formData.links, linkedin: e.target.value }})}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center text-info shrink-0">
                    <Twitter className="w-5 h-5" />
                  </div>
                  <Input 
                    placeholder="Twitter / X Profile URL" 
                    value={formData.links.twitter}
                    onChange={(e) => setFormData({...formData, links: { ...formData.links, twitter: e.target.value }})}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground shrink-0">
                    <Github className="w-5 h-5" />
                  </div>
                  <Input 
                    placeholder="GitHub Profile URL" 
                    value={formData.links.github}
                    onChange={(e) => setFormData({...formData, links: { ...formData.links, github: e.target.value }})}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <Input 
                    placeholder="Personal Website / Portfolio" 
                    value={formData.links.website}
                    onChange={(e) => setFormData({...formData, links: { ...formData.links, website: e.target.value }})}
                  />
                </div>
              </div>

              <Button variant="outline" size="sm" className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Reference
              </Button>
            </section>

            <Separator />

            <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t mt-8 -mx-4 px-4 md:mx-0 md:px-0 md:border-t-0 md:bg-transparent md:static">
              <Button 
                size="lg" 
                className="w-full md:w-auto md:min-w-[200px]" 
                onClick={handleSave} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}