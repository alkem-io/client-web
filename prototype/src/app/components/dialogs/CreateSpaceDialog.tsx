import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/app/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { CreateSpaceForm } from "../create-space/CreateSpaceForm";
import { useState } from "react";

interface CreateSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpaceDialog({
  open,
  onOpenChange,
}: CreateSpaceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleCreate = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden [&>*]:min-w-0">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b">
          <DialogTitle>Create new Space</DialogTitle>
          <DialogDescription>Set up a new collaborative space on the platform.</DialogDescription>
        </DialogHeader>

        <CreateSpaceForm />

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Space"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
