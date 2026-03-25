import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Check, X, Calendar } from "lucide-react";
import { useState } from "react";

interface InvitationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialInvitations = [
  {
    id: 1,
    sender: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      initials: "SC"
    },
    space: "Sustainability Goals 2024",
    role: "Editor",
    date: "2 hours ago"
  },
  {
    id: 2,
    sender: {
      name: "Marc Johnson",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150",
      initials: "MJ"
    },
    space: "Urban Mobility Lab",
    role: "Viewer",
    date: "1 day ago"
  },
  {
    id: 3,
    sender: {
      name: "David Smith",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      initials: "DS"
    },
    space: "Q1 Financial Planning",
    role: "Admin",
    date: "2 days ago"
  }
];

export function InvitationsDialog({ open, onOpenChange }: InvitationsDialogProps) {
  const [invitations, setInvitations] = useState(initialInvitations);

  const handleAction = (id: number) => {
    setInvitations(invitations.filter(i => i.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Space Invitations</DialogTitle>
          <DialogDescription>
            You have {invitations.length} pending invitations to join spaces.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 flex flex-col gap-3">
          {invitations.length > 0 ? (
            invitations.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={invite.sender.avatar} />
                    <AvatarFallback>{invite.sender.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      <span className="font-bold">{invite.sender.name}</span> invited you to <span className="font-bold text-primary">{invite.space}</span>
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Role: {invite.role}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {invite.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Decline" onClick={() => handleAction(invite.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" title="Accept" onClick={() => handleAction(invite.id)}>
                    <Check className="w-4 h-4 mr-1" /> Accept
                  </Button>
                </div>
              </div>
            ))
          ) : (
             <div className="text-center py-8 text-muted-foreground">
               <p>No pending invitations.</p>
             </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
