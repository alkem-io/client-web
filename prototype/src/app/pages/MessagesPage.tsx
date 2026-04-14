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

export default function MessagesPage() {
  const [selectedContact, setSelectedContact] = useState<string | null>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [showMobileList, setShowMobileList] = useState(true);

  const contact = CONTACTS.find((c) => c.id === selectedContact);
  const messages = selectedContact ? MESSAGES[selectedContact] ?? [] : [];

  const filteredContacts = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContact = (id: string) => {
    setSelectedContact(id);
    setShowMobileList(false);
  };

  return (
    <div
      className="flex h-[calc(100vh-128px)] overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        margin: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ─── Contact List ─── */}
      <div
        className={cn(
          "flex flex-col w-full md:w-80 shrink-0",
          !showMobileList && "hidden md:flex"
        )}
        style={{
          borderRight: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0 px-4"
          style={{
            height: 56,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--text-base)",
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            Messages
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 shrink-0">
          <div
            className="flex items-center gap-2 px-3 h-9 rounded-md"
            style={{
              background: "var(--secondary)",
            }}
          >
            <Search className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectContact(c.id)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 text-left transition-colors",
                selectedContact === c.id ? "bg-accent" : "hover:bg-accent/50"
              )}
            >
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10" style={{ border: "1px solid var(--border)" }}>
                  <AvatarImage src={c.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">{c.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className="truncate"
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: "var(--font-weight-normal)" as any,
                      color: "var(--foreground)",
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {c.time}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span
                    className="truncate"
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      maxWidth: "180px",
                    }}
                  >
                    {c.lastMessage}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Chat Area ─── */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          showMobileList && "hidden md:flex"
        )}
        style={{ background: "var(--background)" }}
      >
        {contact ? (
          <>
            {/* Chat Header */}
            <div
              className="flex items-center justify-between shrink-0 px-4"
              style={{
                height: 56,
                borderBottom: "1px solid var(--border)",
                background: "var(--card)",
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden p-1 -ml-1"
                >
                  <ArrowLeft className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                </button>
                <Avatar className="w-8 h-8" style={{ border: "1px solid var(--border)" }}>
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">{contact.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  >
                    {contact.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    m.sender === "me" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className="max-w-[75%] px-3.5 py-2.5"
                    style={{
                      borderRadius: "var(--radius)",
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
                    <p
                      style={{
                        fontSize: "var(--text-sm)",
                        lineHeight: 1.5,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {m.text}
                    </p>
                    <div
                      className="flex items-center justify-end gap-1 mt-1"
                      style={{
                        fontSize: "10px",
                        opacity: 0.7,
                      }}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <div
              className="shrink-0 flex items-center gap-2 px-4"
              style={{
                height: 64,
                borderTop: "1px solid var(--border)",
                background: "var(--card)",
              }}
            >
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground">
                <Paperclip className="w-4 h-4" />
              </Button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 h-9 px-3 rounded-md bg-transparent outline-none"
                style={{
                  border: "1px solid var(--border)",
                  fontSize: "var(--text-sm)",
                  color: "var(--foreground)",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={!messageInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "var(--muted)" }}
            >
              <MessageSquare className="w-7 h-7" style={{ color: "var(--muted-foreground)", opacity: 0.5 }} />
            </div>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--muted-foreground)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Select a conversation to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
