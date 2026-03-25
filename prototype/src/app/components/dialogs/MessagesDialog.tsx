import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Search, Send, Plus, MoreVertical, Phone, Video } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const conversations = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150", initials: "SC", status: "online" },
    lastMessage: "Can we review the Q1 goals?",
    time: "2m",
    unread: 1
  },
  {
    id: 2,
    user: { name: "Marc Johnson", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150", initials: "MJ", status: "offline" },
    lastMessage: "Thanks for the update!",
    time: "1h",
    unread: 0
  },
  {
    id: 3,
    user: { name: "Design Team", avatar: "", initials: "DT", isGroup: true, status: "online" },
    lastMessage: "Alex: I've uploaded the new assets.",
    time: "3h",
    unread: 0
  },
  {
    id: 4,
    user: { name: "David Smith", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", initials: "DS", status: "busy" },
    lastMessage: "See you at the meeting.",
    time: "1d",
    unread: 0
  }
];

const messages = [
  { id: 1, sender: "them", text: "Hey! Do you have a minute to chat about the Q1 goals?", time: "10:30 AM" },
  { id: 2, sender: "me", text: "Sure, Sarah. What's on your mind?", time: "10:32 AM" },
  { id: 3, sender: "them", text: "I was thinking we should adjust the target for the Green Energy Space space. It seems a bit ambitious given the current timeline.", time: "10:33 AM" },
  { id: 4, sender: "me", text: "That's a fair point. Let me pull up the latest metrics.", time: "10:35 AM" },
  { id: 5, sender: "them", text: "Great, thanks! Let me know what you find.", time: "10:36 AM" },
];

export function MessagesDialog({ open, onOpenChange }: MessagesDialogProps) {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [inputText, setInputText] = useState("");

  const selectedConversation = conversations.find(c => c.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogDescription className="sr-only">
          Conversation interface for sending and receiving messages.
        </DialogDescription>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r flex flex-col bg-muted/10 hidden md:flex">
            <div className="p-4 border-b flex items-center justify-between">
              <DialogTitle className="font-semibold text-lg">Messages</DialogTitle>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-8 bg-background" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-2 border-transparent",
                    selectedId === conv.id && "bg-muted/50 border-primary"
                  )}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conv.user.avatar} />
                      <AvatarFallback>{conv.user.initials}</AvatarFallback>
                    </Avatar>
                    {conv.user.status === 'online' && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background" style={{ background: 'var(--chart-1)' }}></span>}
                    {conv.user.status === 'busy' && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background" style={{ background: 'var(--destructive)' }}></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{conv.user.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{conv.time}</span>
                    </div>
                    <p className={cn("text-xs truncate", conv.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-background">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b flex items-center justify-between shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={selectedConversation.user.avatar} />
                      <AvatarFallback>{selectedConversation.user.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{selectedConversation.user.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--chart-1)' }}></span>
                        <span className="text-xs text-muted-foreground">Active now</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Phone className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Video className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[70%]", msg.sender === 'me' ? "ml-auto items-end" : "items-start")}>
                      <div className={cn(
                        "px-4 py-2 rounded-2xl text-sm",
                        msg.sender === 'me' 
                          ? "bg-primary text-primary-foreground rounded-br-none" 
                          : "bg-muted text-foreground rounded-bl-none"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {msg.time}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t mt-auto">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                      <Plus className="w-5 h-5" />
                    </Button>
                    <Input 
                      placeholder="Type a message..." 
                      className="flex-1" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <Button size="icon" className="shrink-0" disabled={!inputText}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}