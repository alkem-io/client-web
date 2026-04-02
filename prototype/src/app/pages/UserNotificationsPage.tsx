import { useState } from "react";
import { useParams, Link } from "react-router";
import { 
  Bell, Layout, CreditCard, Users, Settings, User, 
  Mail, Smartphone, Info
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Separator } from "@/app/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function UserNotificationsPage() {
  const { userSlug } = useParams<{ userSlug: string }>();
  const slug = userSlug || "user";

  // Navigation Tabs
  const tabs = [
    { label: "MY PROFILE", href: `/user/${slug}/settings/profile`, icon: User },
    { label: "ACCOUNT", href: `/user/${slug}/settings/account`, icon: Layout },
    { label: "MEMBERSHIP", href: `/user/${slug}/settings/membership`, icon: CreditCard },
    { label: "ORGANIZATIONS", href: `/user/${slug}/settings/organizations`, icon: Users },
    { label: "NOTIFICATIONS", href: `/user/${slug}/settings/notifications`, active: true, icon: Bell },
    { label: "SETTINGS", href: `/user/${slug}/settings/general`, icon: Settings },
  ];

  // Types
  type NotificationState = {
    inApp: boolean;
    email: boolean;
  };

  type NotificationItem = {
    id: string;
    label: string;
  };

  type NotificationSection = {
    id: string;
    title: string;
    description: string;
    items: NotificationItem[];
  };

  // Sections Configuration
  const sections: NotificationSection[] = [
    {
      id: "space",
      title: "Space Notifications",
      description: "Manage notifications for space-related events like posts, comments, and community updates.",
      items: [
        { id: "space_post", label: "Receive a notification when a post is published in a community I am a member of" },
        { id: "space_comment_add", label: "Receive a notification when a new comment is added to a post" },
        { id: "space_comm_share", label: "Receive a notification when a new communication is shared on a community" },
        { id: "space_comment_made", label: "Receive a notification when a comment is made on a post you follow" },
      ]
    },
    {
      id: "platform",
      title: "Platform Notifications",
      description: "Stay updated on platform-level discussions, new features, and announcements.",
      items: [
        { id: "plat_discussion_comment", label: "Receive a notification when a new comment is added to a discussion I follow" },
        { id: "plat_discussion_create", label: "Receive a notification when a new discussion is created" },
      ]
    },
    {
      id: "organization",
      title: "Organization Notifications",
      description: "Control alerts for organization mentions, messaging, and team updates.",
      items: [
        { id: "org_mention", label: "Receive a notification when my organization is mentioned" },
        { id: "org_dm", label: "Receive direct messages to my organization" },
      ]
    },
    {
      id: "user",
      title: "User Notifications",
      description: "Personalize alerts for interactions like replies, mentions, and invites.",
      items: [
        { id: "user_reply", label: "Receive a notification when someone replies to my comment" },
        { id: "user_mention", label: "Receive a notification when I am mentioned" },
        { id: "user_dm", label: "Receive a notification when someone sends me a direct message" },
        { id: "user_invite", label: "Receive a notification when someone invites me to join a community" },
        { id: "user_join", label: "Receive a notification when I join a new Space" },
      ]
    },
    {
      id: "vc",
      title: "Virtual Contributor Notifications",
      description: "Notifications regarding virtual contributor activities and assignments.",
      items: [
        { id: "vc_invite", label: "Receive a notification when a VC manager is invited to join a community" },
      ]
    }
  ];

  // State Management
  // Initializing with some random defaults for demonstration
  const [preferences, setPreferences] = useState<Record<string, NotificationState>>({
    space_post: { inApp: true, email: true },
    space_comment_add: { inApp: true, email: false },
    space_comm_share: { inApp: true, email: true },
    space_comment_made: { inApp: true, email: false },
    plat_discussion_comment: { inApp: true, email: true },
    plat_discussion_create: { inApp: false, email: true },
    org_mention: { inApp: true, email: true },
    org_dm: { inApp: true, email: true },
    user_reply: { inApp: true, email: true },
    user_mention: { inApp: true, email: true },
    user_dm: { inApp: true, email: true },
    user_invite: { inApp: true, email: true },
    user_join: { inApp: true, email: false },
    vc_invite: { inApp: true, email: true },
  });

  const handleToggle = (id: string, channel: 'inApp' | 'email') => {
    setPreferences(prev => {
      const newState = {
        ...prev,
        [id]: {
          ...prev[id],
          [channel]: !prev[id][channel]
        }
      };
      
      // Simulate auto-save or feedback
      // In a real app, this might be debounced
      return newState;
    });
    
    // Optional: Toast feedback (can be annoying if overused, maybe only on error or distinct save)
    // toast.success("Preference updated"); 
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
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="text-muted-foreground mt-1">Configure how you receive notifications across the platform.</p>
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
          <div className="col-span-12 lg:col-start-2 lg:col-span-10">
        <div className="space-y-8">
          
          <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground border">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p>Here you can edit your notification preferences. Changes are saved automatically.</p>
          </div>

          {sections.map((section) => (
            <div key={section.id} className="space-y-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>

              <Card>
                <CardHeader className="py-4 border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-muted-foreground uppercase tracking-wider pl-1">Activity</span>
                    <div className="flex items-center gap-8 md:gap-16 pr-4">
                      <div className="flex flex-col items-center gap-1 w-12">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">In-App</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-12">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Email</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {section.items.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "flex flex-col md:flex-row md:items-center justify-between p-4 md:px-6 gap-4 hover:bg-muted/10 transition-colors",
                        index !== section.items.length - 1 && "border-b border-border/50"
                      )}
                    >
                      <div className="flex-1 text-sm font-medium leading-normal pr-4">
                        {item.label}
                      </div>
                      
                      <div className="flex items-center justify-end gap-8 md:gap-16">
                        <div className="flex justify-center w-12">
                          <Switch 
                            checked={preferences[item.id]?.inApp ?? false}
                            onCheckedChange={() => handleToggle(item.id, 'inApp')}
                            aria-label={`Toggle in-app notification for ${item.label}`}
                          />
                        </div>
                        <div className="flex justify-center w-12">
                          <Switch 
                            checked={preferences[item.id]?.email ?? false}
                            onCheckedChange={() => handleToggle(item.id, 'email')}
                            aria-label={`Toggle email notification for ${item.label}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}

        </div>
        </div>
        </div>
      </div>
    </div>
  );
}