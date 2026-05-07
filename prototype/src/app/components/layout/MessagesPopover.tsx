import { useState } from "react";
import {
  Search,
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
}

interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

const CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    lastMessage: "That sounds great! Let me check the data...",
    time: "2m",
  },
  {
    id: "2",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    lastMessage: "The prototype is ready for review",
    time: "1h",
  },
  {
    id: "3",
    name: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    lastMessage: "Can we schedule a call tomorrow?",
    time: "3h",
  },
  {
    id: "4",
    name: "Tom Bakker",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    lastMessage: "I've shared the latest report in the space",
    time: "Yesterday",
  },
  {
    id: "5",
    name: "Anna Martinez",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    lastMessage: "Thanks for the feedback!",
    time: "Yesterday",
  },
];

const MESSAGES: Record<string, ChatMessage[]> = {
  "1": [
    { id: "m1", sender: "them", text: "Hey Alex! Have you looked at the latest sustainability report?", time: "10:30 AM" },
    { id: "m2", sender: "me", text: "Not yet, I was planning to review it this afternoon. Anything specific I should focus on?", time: "10:32 AM" },
    { id: "m3", sender: "them", text: "The section on renewable energy targets — there are some interesting projections we should discuss with the team.", time: "10:34 AM" },
    { id: "m4", sender: "me", text: "Great, I'll pay special attention to that section. Want to set up a quick call after I've reviewed it?", time: "10:36 AM" },
    { id: "m5", sender: "them", text: "That sounds great! Let me check the data and get back to you with some specific points.", time: "10:38 AM" },
    { id: "m6", sender: "them", text: "Also, there's a new dataset from the municipality we should incorporate.", time: "10:38 AM" },
  ],
  "2": [
    { id: "m7", sender: "them", text: "The prototype is ready for review. I've deployed it to the staging environment.", time: "9:15 AM" },
    { id: "m8", sender: "me", text: "Awesome, I'll take a look right away!", time: "9:20 AM" },
  ],
};

export function MessagesPopover() {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const contact = CONTACTS.find((c) => c.id === selectedContact);
  const messages = selectedContact ? MESSAGES[selectedContact] ?? [] : [];

  const filteredContacts = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          title="Messages"
        >
          <MessageSquare className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-background"
            style={{ background: "var(--primary)" }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[420px] p-0 overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
        sideOffset={8}
      >
        {!selectedContact ? (
          /* ─── Contact List View ─── */
          <div className="flex flex-col">
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--muted) 30%, transparent)",
              }}
            >
              <h3 className="text-sm font-semibold">Messages</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
              <div
                className="flex items-center gap-2 px-3 h-8 rounded-md"
                style={{ background: "var(--secondary)" }}
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
            </div>

            {/* Contact list */}
            <div className="max-h-[60vh] overflow-y-auto">
              {filteredContacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c.id)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-accent/50"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <Avatar className="w-9 h-9 shrink-0" style={{ border: "1px solid var(--border)" }}>
                    <AvatarImage src={c.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {c.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{c.name}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {c.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ─── Chat View ─── */
          <div className="flex flex-col h-[500px]">
            {/* Chat Header */}
            <div
              className="flex items-center justify-between px-3 shrink-0"
              style={{
                height: 48,
                borderBottom: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--muted) 30%, transparent)",
              }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-1 -ml-1 rounded hover:bg-accent"
                >
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <Avatar className="w-7 h-7" style={{ border: "1px solid var(--border)" }}>
                  <AvatarImage src={contact?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                    {contact?.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold">{contact?.name}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <Video className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.sender === "me" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className="max-w-[80%] px-3 py-2 rounded-lg"
                    style={{
                      background:
                        m.sender === "me"
                          ? "var(--primary)"
                          : "var(--secondary)",
                      color:
                        m.sender === "me"
                          ? "var(--primary-foreground)"
                          : "var(--foreground)",
                    }}
                  >
                    <p className="text-sm leading-relaxed">{m.text}</p>
                    <div
                      className="flex items-center justify-end mt-0.5"
                      style={{ fontSize: "10px", opacity: 0.7 }}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <div
              className="shrink-0 flex items-center gap-2 px-3"
              style={{
                height: 52,
                borderTop: "1px solid var(--border)",
                background: "color-mix(in srgb, var(--muted) 30%, transparent)",
              }}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground">
                <Paperclip className="w-4 h-4" />
              </Button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 h-8 px-3 rounded-md bg-transparent outline-none text-sm"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <Button
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={!messageInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
