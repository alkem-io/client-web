import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Separator } from "@/app/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import {
  Plus,
  Megaphone,
  Pin,
  Trash2,
  Calendar,
  MoreHorizontal,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Update {
  id: string;
  author: string;
  authorInitials: string;
  authorAvatar: string | null;
  role: string;
  date: string;
  title: string;
  body: string;
  pinned: boolean;
}

const MOCK_UPDATES: Update[] = [
  {
    id: "u1",
    author: "Elena Martinez",
    authorInitials: "EM",
    authorAvatar:
      "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=256",
    role: "Host",
    date: "2024-02-18",
    title: "2024 Roadmap & Community Goals",
    body: "<p>We've finalized the 2024 roadmap for this space. Our three strategic pillars this year are:</p><ul><li><strong>Decarbonization:</strong> Accelerating the transition to net-zero energy systems</li><li><strong>Community Building:</strong> Growing from 150 to 500 active contributors</li><li><strong>Knowledge Sharing:</strong> Publishing quarterly insight reports</li></ul><p>Stay tuned for detailed challenge briefs rolling out over the next two weeks.</p>",
    pinned: true,
  },
  {
    id: "u2",
    author: "Sarah Chen",
    authorInitials: "SC",
    authorAvatar:
      "https://images.unsplash.com/photo-1757347398206-7425300ef990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=256",
    role: "Admin",
    date: "2024-02-10",
    title: "New Subspaces Now Open",
    body: "<p>We've launched three new subspaces based on community feedback:</p><ol><li>Urban Mobility Lab — focused on sustainable city transport</li><li>Green Infrastructure — planning urban green spaces</li><li>Circular Economy — reducing waste through systemic design</li></ol><p>Each subspace has dedicated leads and an innovation flow already set up. Jump in!</p>",
    pinned: false,
  },
  {
    id: "u3",
    author: "Elena Martinez",
    authorInitials: "EM",
    authorAvatar:
      "https://images.unsplash.com/photo-1623853589874-864b1dd4d922?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=256",
    role: "Host",
    date: "2024-01-15",
    title: "Welcome to the Green Energy Space!",
    body: "<p>Welcome to all new members! This space is our shared home for exploring sustainable energy solutions. Check out the knowledge base for background reading, and introduce yourself in the community feed.</p>",
    pinned: false,
  },
];

export function SpaceSettingsUpdates() {
  const [updates, setUpdates] = useState(MOCK_UPDATES);
  const [composing, setComposing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  const togglePin = (id: string) => {
    setUpdates((prev) =>
      prev.map((u) => (u.id === id ? { ...u, pinned: !u.pinned } : u))
    );
  };

  const removeUpdate = (id: string) => {
    setUpdates((prev) => prev.filter((u) => u.id !== id));
  };

  const handlePost = () => {
    if (!newTitle.trim()) return;
    const update: Update = {
      id: `u-new-${Date.now()}`,
      author: "You",
      authorInitials: "YO",
      authorAvatar: null,
      role: "Host",
      date: new Date().toISOString().slice(0, 10),
      title: newTitle,
      body: newBody,
      pinned: false,
    };
    setUpdates((prev) => [update, ...prev]);
    setNewTitle("");
    setNewBody("");
    setComposing(false);
  };

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Updates from the Leads
          </h2>
          <p className="text-muted-foreground mt-2">
            Post announcements, milestones, and progress updates visible to all
            space members.
          </p>
        </div>
        {!composing && (
          <Button className="gap-2" size="sm" onClick={() => setComposing(true)}>
            <Plus className="w-4 h-4" /> New Update
          </Button>
        )}
      </div>

      <Separator />

      {/* Compose */}
      {composing && (
        <div
          className="rounded-lg p-5 space-y-4"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 className="text-sm font-semibold">New Update</h3>
          <Input
            placeholder="Update title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="font-semibold"
          />
          <div className="prose-editor">
            <ReactQuill
              theme="snow"
              value={newBody}
              onChange={setNewBody}
              modules={quillModules}
              placeholder="Write your update…"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="gap-2" onClick={handlePost}>
              <Send className="w-4 h-4" /> Publish
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setComposing(false);
                setNewTitle("");
                setNewBody("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Update List */}
      <div className="space-y-4">
        {updates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No updates yet. Click "New Update" to post the first one.
          </div>
        )}
        {updates.map((update) => (
          <div
            key={update.id}
            className={cn(
              "rounded-lg p-5 space-y-3 transition-colors",
              update.pinned && "ring-1 ring-amber-300 dark:ring-amber-700"
            )}
            style={{
              background: "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Top row — author + badges + actions */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  {update.authorAvatar && (
                    <AvatarImage src={update.authorAvatar} />
                  )}
                  <AvatarFallback className="text-xs">
                    {update.authorInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{update.author}</span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {update.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {update.date}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {update.pinned && (
                  <Pin className="w-3.5 h-3.5 text-amber-500 rotate-45" />
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => togglePin(update.id)}>
                      <Pin className="w-4 h-4 mr-2" />
                      {update.pinned ? "Unpin" : "Pin to Top"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => removeUpdate(update.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold">{update.title}</h3>

            {/* Body */}
            <div
              className="text-sm text-muted-foreground prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: update.body }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
