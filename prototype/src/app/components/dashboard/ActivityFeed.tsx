import { MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

const mockActivities: Record<string, ActivityItem[]> = {
  spaces: [
    {
      id: "1",
      user: { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" },
      action: "posted a new challenge in",
      target: "Innovation Lab",
      timestamp: "2 hours ago"
    },
    {
      id: "2",
      user: { name: "Mike Ross", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=64&h=64" },
      action: "commented on",
      target: "Design Review",
      timestamp: "4 hours ago"
    },
    {
      id: "3",
      user: { name: "Anna Smith", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=64&h=64" },
      action: "shared a file in",
      target: "Marketing Strategy",
      timestamp: "Yesterday"
    },
    {
      id: "4",
      user: { name: "David Kim", avatar: "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3Njk0Nzg0NTZ8MA&ixlib=rb-4.1.0&q=80&w=64&h=64" },
      action: "updated the description of",
      target: "Product Roadmap",
      timestamp: "Yesterday"
    },
    {
      id: "5",
      user: { name: "Elena Rodriguez", avatar: "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc2OTQ3ODMzMnww&ixlib=rb-4.1.0&q=80&w=64&h=64" },
      action: "added 5 new members to",
      target: "Community Hub",
      timestamp: "2 days ago"
    },
    {
      id: "6",
      user: { name: "James Wilson", avatar: "https://images.unsplash.com/photo-1603143704710-99d6011f107e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBoZWFkc2hvdHxlbnwxfHx8fDE3Njk1MzI5NjB8MA&ixlib=rb-4.1.0&q=80&w=64&h=64" },
      action: "archived",
      target: "Q3 Goals",
      timestamp: "3 days ago"
    },
    {
      id: "7",
      user: { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64" },
      action: "scheduled a meeting in",
      target: "Innovation Lab",
      timestamp: "3 days ago"
    }
  ],
  personal: [
    {
      id: "8",
      user: { name: "You", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64" },
      action: "created a new space",
      target: "Project Alpha",
      timestamp: "1 day ago"
    },
    {
      id: "9",
      user: { name: "You", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64" },
      action: "invited 3 members to",
      target: "Team Sync",
      timestamp: "2 days ago"
    },
    {
      id: "10",
      user: { name: "You", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64" },
      action: "joined",
      target: "Data Science Team",
      timestamp: "3 days ago"
    },
    {
      id: "11",
      user: { name: "You", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64" },
      action: "replied to a comment in",
      target: "Design Review",
      timestamp: "4 days ago"
    },
    {
      id: "12",
      user: { name: "You", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64" },
      action: "downloaded a report from",
      target: "Analytics Dashboard",
      timestamp: "1 week ago"
    },
    {
      id: "13",
      user: { name: "You", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64" },
      action: "updated your settings",
      target: "Profile",
      timestamp: "1 week ago"
    }
  ]
};

interface ActivityFeedProps {
  title: string;
  type: "spaces" | "personal";
}

export function ActivityFeed({ title, type }: ActivityFeedProps) {
  const activities = mockActivities[type] || [];

  return (
    <div
      className="h-full"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "24px",
        boxShadow: "var(--elevation-sm)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          style={{
            fontWeight: 700,
            fontSize: "var(--text-base)",
            color: "var(--foreground)",
          }}
        >
          {title}
        </h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Filter dropdowns */}
      <div className="flex gap-2 mb-6">
        <Select defaultValue="all-spaces">
          <SelectTrigger
            className="h-8 w-auto min-w-[140px]"
            style={{ fontSize: "var(--text-sm)" }}
          >
            <SelectValue placeholder="Space: All Spaces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-spaces">Space: All Spaces</SelectItem>
            <SelectItem value="green-energy">Green Energy Space</SelectItem>
            <SelectItem value="community-garden">Community Garden</SelectItem>
          </SelectContent>
        </Select>
        {type === "spaces" && (
          <Select defaultValue="all-roles">
            <SelectTrigger
              className="h-8 w-auto min-w-[130px]"
              style={{ fontSize: "var(--text-sm)" }}
            >
              <SelectValue placeholder="My role: All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-roles">My role: All roles</SelectItem>
              <SelectItem value="facilitator">Facilitator</SelectItem>
              <SelectItem value="contributor">Contributor</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4 group">
            <div className="shrink-0">
              <img 
                src={activity.user.avatar} 
                alt={activity.user.name} 
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground line-clamp-2">
                <span className="font-semibold">{activity.user.name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium text-primary">{activity.target}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">No recent activity.</p>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2">
          Show more
        </button>
      </div>
    </div>
  );
}