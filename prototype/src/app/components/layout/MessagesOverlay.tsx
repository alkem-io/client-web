import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Search,
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useMessages } from "@/app/contexts/MessagesContext";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
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
    unread: 2,
  },
  {
    id: "2",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80",
    lastMessage: "The prototype is ready for review",
    time: "1h",
    unread: 1,
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

export function MessagesOverlay() {
  const { isOpen, closeMessages } = useMessages();
  const [selectedContact, setSelectedContact] = useState<string | null>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contact = CONTACTS.find((c) => c.id === selectedContact);
  const messages = selectedContact ? MESSAGES[selectedContact] ?? [] : [];

  const filteredContacts = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeMessages();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closeMessages]);

  // Scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedContact, messages.length]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setMessageInput("");
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{ background: "color-mix(in srgb, var(--foreground) 50%, transparent)", backdropFilter: "blur(2px)" }}
            onClick={closeMessages}
            aria-hidden
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Messages"
            className="fixed inset-0 z-[101] grid grid-cols-12 gap-6 px-6 md:px-8 py-[5vh] max-md:p-0 pointer-events-none"
          >
            <div
            className={cn(
              "col-span-12 lg:col-start-2 lg:col-span-10 max-md:col-start-1 max-md:col-span-12",
              "flex flex-col overflow-hidden pointer-events-auto",
            )}
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--elevation-sm)",
            }}
          >
            {/* Top bar */}
            <div
              className="shrink-0 flex items-center justify-between px-5 py-3 md:px-6"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "var(--secondary)" }}
                >
                  <MessageSquare className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                </div>
                <h2 className="text-lg font-semibold">Messages</h2>
              </div>
              <button
                onClick={closeMessages}
                className="p-1.5 rounded-full transition-colors hover:bg-accent"
                aria-label="Close messages"
              >
                <X className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
              </button>
            </div>

            {/* Body: Contact list + Chat */}
            <div className="flex-1 grid grid-cols-10 gap-6 min-h-0 overflow-hidden">
              {/* ─── Contact List (left panel) ─── */}
              <div
                className="col-span-2 flex flex-col border-r"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
              >
                {/* Search */}
                <div className="px-3 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div
                    className="flex items-center gap-2 px-3 h-9 rounded-md"
                    style={{ background: "var(--secondary)" }}
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
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

                {/* Contacts */}
                <div className="flex-1 overflow-y-auto">
                  {filteredContacts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedContact(c.id)}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 text-left transition-colors",
                        selectedContact === c.id ? "bg-accent" : "hover:bg-accent/50"
                      )}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-10 h-10" style={{ border: "1px solid var(--border)" }}>
                          <AvatarImage src={c.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {c.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{c.name}</span>
                          <span className="text-[11px] text-muted-foreground shrink-0">{c.time}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                          {c.unread && c.unread > 0 && (
                            <span
                              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ml-2"
                              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                            >
                              {c.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* New message */}
                <div className="shrink-0 p-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="w-4 h-4" />
                    New Message
                  </Button>
                </div>
              </div>

              {/* ─── Chat Area (right panel) ─── */}
              <div className="col-span-12 lg:col-span-8 flex flex-col min-w-0" style={{ background: "var(--background)" }}>
                {contact ? (
                  <>
                    {/* Chat Header */}
                    <div
                      className="flex items-center justify-between px-5 md:px-6 shrink-0"
                      style={{
                        height: 56,
                        borderBottom: "1px solid var(--border)",
                        background: "var(--card)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9" style={{ border: "1px solid var(--border)" }}>
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {contact.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-semibold">{contact.name}</span>
                          <p className="text-[11px] text-muted-foreground">Active now</p>
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
                    <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            "flex",
                            m.sender === "me" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className="max-w-[70%] px-4 py-2.5 rounded-xl"
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
                              className="flex items-center justify-end mt-1"
                              style={{ fontSize: "10px", opacity: 0.7 }}
                            >
                              {m.time}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Composer */}
                    <div
                      className="shrink-0 flex items-center gap-3 px-5 md:px-6"
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
                        className="flex-1 h-10 px-4 rounded-lg bg-transparent outline-none text-sm"
                        style={{
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && messageInput.trim()) {
                            e.preventDefault();
                            setMessageInput("");
                          }
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
                    <p className="text-sm text-muted-foreground">
                      Select a conversation to start messaging
                    </p>
                  </div>
                )}
              </div>
            </div>            </div>          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
