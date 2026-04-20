import { useState } from "react";
import {
  Globe,
  Lock,
  UserPlus,
  Mail,
  AlertTriangle,
  Video,
  Edit3,
  Share2,
  Shield,
  Layout,
  Copy,
  FileBox,
  Users2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Separator } from "@/app/components/ui/separator";

// Icon helper
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

interface SubspaceSettingsSettingsProps {
  subspaceName: string;
}

export function SubspaceSettingsSettings({ subspaceName }: SubspaceSettingsSettingsProps) {
  const [visibility, setVisibility] = useState("public");
  const [membershipMode, setMembershipMode] = useState("application");
  const [allowedActions, setAllowedActions] = useState({
    spaceInvitations: true,
    createPosts: true,
    videoCalls: true,
    guestContributions: false,
    createSubSubspaces: false,
    parentContribute: true,
  });
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handleActionToggle = (key: keyof typeof allowedActions) => {
    setAllowedActions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure this subspace's visibility, membership policies, and allowed
          member actions.
          {" "}<span className="text-xs text-muted-foreground/70 italic">Changes are saved automatically.</span>
        </p>
      </div>

      <Separator />

      <Accordion
        type="multiple"
        defaultValue={["visibility", "membership", "actions"]}
        className="w-full space-y-4"
      >
        {/* Visibility */}
        <AccordionItem
          value="visibility"
          className="border rounded-lg bg-card px-6"
        >
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Visibility
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                Control who can see and access this subspace
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <RadioGroup
              value={visibility}
              onValueChange={setVisibility}
              className="space-y-4"
            >
              <div
                className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => setVisibility("public")}
              >
                <RadioGroupItem value="public" id="v-public" className="mt-1" />
                <div className="space-y-1">
                  <Label
                    htmlFor="v-public"
                    className="text-base font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-info" /> Public
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This subspace and its contents are visible to all members of
                    the parent space.
                  </p>
                </div>
              </div>
              <div
                className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => setVisibility("private")}
              >
                <RadioGroupItem value="private" id="v-private" className="mt-1" />
                <div className="space-y-1">
                  <Label
                    htmlFor="v-private"
                    className="text-base font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-warning" /> Private
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Only subspace members can see this subspace and its contents.
                  </p>
                </div>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Consider your subspace's purpose and audience when choosing visibility.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Membership */}
        <AccordionItem
          value="membership"
          className="border rounded-lg bg-card px-6"
        >
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Membership
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                Choose how users join this subspace
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <RadioGroup
              value={membershipMode}
              onValueChange={setMembershipMode}
              className="space-y-4"
            >
              <div
                className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => setMembershipMode("none")}
              >
                <RadioGroupItem value="none" id="m-none" className="mt-1" />
                <div className="space-y-1">
                  <Label
                    htmlFor="m-none"
                    className="text-base font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-success" /> No Application
                    Required
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All parent space members can join directly without approval.
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">Best for public, open collaboration spaces</p>
                </div>
              </div>
              <div
                className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => setMembershipMode("application")}
              >
                <RadioGroupItem value="application" id="m-application" className="mt-1" />
                <div className="space-y-1">
                  <Label
                    htmlFor="m-application"
                    className="text-base font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <FileTextIcon className="w-4 h-4 text-info" /> Application Required
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Members must submit an application that leads can approve or
                    reject.
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">Best for curated spaces with specific requirements</p>
                </div>
              </div>
              <div
                className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => setMembershipMode("invitation")}
              >
                <RadioGroupItem value="invitation" id="m-invitation" className="mt-1" />
                <div className="space-y-1">
                  <Label
                    htmlFor="m-invitation"
                    className="text-base font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-primary" /> Invitation Only
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Members can only join after being invited by a lead.
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">Best for private, restricted collaboration teams</p>
                </div>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Allowed Actions */}
        <AccordionItem
          value="actions"
          className="border rounded-lg bg-card px-6"
        >
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Allowed Actions
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                Configure what members can do in this subspace
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionToggle
                id="spaceInvitations"
                label="Space Invitations"
                description="Allow admins of Subspaces within this Subspace to invite users directly to their own Subspace. If a user is not yet a member of this Subspace, they will automatically become one upon accepting the invitation. Note: Only users who are already members of the Space can be invited this way."
                checked={allowedActions.spaceInvitations}
                onCheckedChange={() => handleActionToggle('spaceInvitations')}
                icon={UserPlus}
              />
              <ActionToggle
                id="createPosts"
                label="Create Posts"
                description="Allow members to create posts. If you deactivate this, members will still be able to contribute to existing posts, but will not be able to create new posts."
                checked={allowedActions.createPosts}
                onCheckedChange={() => handleActionToggle('createPosts')}
                icon={Edit3}
              />
              <ActionToggle
                id="videoCalls"
                label="Video Call"
                description="Show video call button in the tab menu. All members of this Space can use this button to start a Jitsi video conference."
                checked={allowedActions.videoCalls}
                onCheckedChange={() => handleActionToggle('videoCalls')}
                icon={Video}
              />
              <ActionToggle
                id="guestContributions"
                label="Guest Contributions"
                description="Allow whiteboards in this Space to be shared with guest users (non-members) for collaborative contributions."
                checked={allowedActions.guestContributions}
                onCheckedChange={() => handleActionToggle('guestContributions')}
                icon={Share2}
              />
              <ActionToggle
                id="createSubSubspaces"
                label="Create Subspaces"
                description="Allow members to create Subspaces in this Space. If you deactivate this, you can still create Subspaces yourself and add other people as an admin inside the Subspace."
                checked={allowedActions.createSubSubspaces}
                onCheckedChange={() => handleActionToggle('createSubSubspaces')}
                icon={Layout}
              />
              <ActionToggle
                id="parentContribute"
                label="Parent Community Contributions"
                description="Allow members of the parent community to contribute without needing to join first."
                checked={allowedActions.parentContribute}
                onCheckedChange={() => handleActionToggle('parentContribute')}
                icon={Users2}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Save as Template / Duplicate */}
        <AccordionItem value="template" className="border rounded-lg bg-card px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Template & Duplication
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                Save this subspace as a reusable template or create a copy
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-md bg-muted/20">
                <div className="flex items-start gap-3">
                  <FileBox className="w-5 h-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold text-foreground">Save as Template</h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                      Turn this subspace into a template that can be used to create new subspaces with the same structure, innovation flow, and settings.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="shrink-0">
                  Save as Template
                </Button>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-md bg-muted/20 opacity-50">
                <div className="flex items-start gap-3">
                  <Copy className="w-5 h-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold text-foreground">Duplicate Subspace</h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                      Create a copy of this subspace including its structure, posts, and settings. Members will not be copied.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="shrink-0" disabled>
                  Duplicate
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Danger Zone */}
        <AccordionItem value="danger" className="border border-destructive/20 rounded-lg bg-destructive/5 px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-destructive/80 font-normal text-left">
                Irreversible actions for this subspace
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-md bg-background">
              <div>
                <h4 className="font-semibold text-foreground">Delete this Subspace</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Deleting this subspace is permanent. All posts, content, and membership data will be permanently removed. Be careful, this action cannot be undone.
                </p>
              </div>
              <Dialog
                open={deleteConfirmationOpen}
                onOpenChange={setDeleteConfirmationOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    Delete Subspace
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Delete "{subspaceName}"?
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                      This action cannot be undone. This will permanently delete the subspace <strong>{subspaceName}</strong> and remove all associated data including:
                      <ul className="list-disc ml-6 mt-2 mb-2 space-y-1">
                        <li>All member associations</li>
                        <li>All document and file storage</li>
                        <li>All community posts and threads</li>
                        <li>All nested subspaces and their content</li>
                      </ul>
                      Please contact Alkemio support to proceed with deletion if you are sure.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={() => setDeleteConfirmationOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setDeleteConfirmationOpen(false);
                        alert("Please contact support@alkemio.org to complete this request.");
                      }}
                    >
                      I understand, delete this subspace
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Please contact the Alkemio team if you need assistance with subspace deletion.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function ActionToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: any;
}) {
  return (
    <div className="flex items-start justify-between space-x-4 p-3 rounded-lg border bg-muted/20">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-muted-foreground">
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <Label htmlFor={id} className="text-base font-medium cursor-pointer">{label}</Label>
          <p className="text-xs text-muted-foreground leading-snug max-w-[200px] sm:max-w-xs">
            {description}
          </p>
        </div>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
