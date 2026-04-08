import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { X } from "lucide-react";
import { CreateSpaceForm } from "../create-space/CreateSpaceForm";

interface CreateSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpaceDialog({
  open,
  onOpenChange,
}: CreateSpaceDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-background flex flex-col max-w-4xl h-[80vh] md:h-auto"
        style={{ borderRadius: "var(--radius-xl)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{
            borderBottom: "1px solid var(--border)",
            background: "color-mix(in srgb, var(--background) 95%, transparent)",
          }}
        >
          <DialogTitle
            style={{
              fontWeight: 600,
              fontSize: "var(--text-xl)",
              fontFamily: "'Inter', sans-serif",
              color: "var(--foreground)",
            }}
          >
            Create a new Space
          </DialogTitle>
          <DialogClose
            className="rounded-full p-2 transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X className="w-5 h-5" />
          </DialogClose>
        </div>
        <DialogDescription className="sr-only">
          Fill out the form to create a new space.
        </DialogDescription>

        {/* Form */}
        <div className="flex-1 overflow-hidden">
          <CreateSpaceForm onCancel={handleClose} onSuccess={handleClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
