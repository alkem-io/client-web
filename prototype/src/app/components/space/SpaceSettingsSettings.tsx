import { useState } from "react";
import { 
  Globe, 
  Lock, 
  UserPlus, 
  Users, 
  Mail, 
  Building2, 
  Plus, 
  X,
  AlertTriangle,
  Trash2,
  Video,
  Edit3,
  Share2,
  Calendar,
  Shield,
  Layout
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/lib/utils";

export function SpaceSettingsSettings() {
  const [visibility, setVisibility] = useState("public");
  const [membershipMode, setMembershipMode] = useState("application");
  const [organizations, setOrganizations] = useState([
    { id: '1', name: 'Alkemio Foundation', domain: 'alkemio.org' },
    { id: '2', name: 'Partner Org', domain: 'partner.com' }
  ]);
  const [autoAddOrgUsers, setAutoAddOrgUsers] = useState(true);
  const [allowedActions, setAllowedActions] = useState({
    spaceInvitations: true,
    createPosts: true,
    videoCalls: true,
    guestContributions: false,
    createSubspaces: false,
    subspaceEvents: true,
    alkemioSupport: true
  });
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handleActionToggle = (key: keyof typeof allowedActions) => {
    setAllowedActions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const removeOrganization = (id: string) => {
    setOrganizations(prev => prev.filter(org => org.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Page Title & Description */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure your space's visibility, membership policies, and allowed member actions.
          {" "}<span className="text-xs text-muted-foreground/70 italic">Changes are saved automatically.</span>
        </p>
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={["visibility", "membership", "organizations", "actions"]} className="w-full space-y-4">
        
        {/* 2. Visibility Section */}
        <AccordionItem value="visibility" className="border rounded-lg bg-card px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Visibility
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                Control who can see and access this space
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => setVisibility("public")}>
                <RadioGroupItem value="public" id="visibility-public" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="visibility-public" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                    <Globe className="w-4 h-4 text-info" />
                    Public
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This Space and its contents are visible to everyone on the platform. Users can only contribute if they are a member.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => setVisibility("private")}>
                <RadioGroupItem value="private" id="visibility-private" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="visibility-private" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                    <Lock className="w-4 h-4 text-warning" />
                    Private
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This Space is visible to everyone on the platform, but the content is only visible to members. Please note that both the information in the profile and the content are publicly visible.
                  </p>
                </div>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Consider your space's purpose and audience when choosing visibility.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Membership Application Mode Section */}
        <AccordionItem value="membership" className="border rounded-lg bg-card px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Membership
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                Choose how users join your space
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <RadioGroup value={membershipMode} onValueChange={setMembershipMode} className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => setMembershipMode("none")}>
                <RadioGroupItem value="none" id="membership-none" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="membership-none" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                    <UserPlus className="w-4 h-4 text-success" />
                    No Application Required
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All Space members can directly join, without you having to review their applications.
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">Best for public, open collaboration spaces</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => setMembershipMode("application")}>
                <RadioGroupItem value="application" id="membership-application" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="membership-application" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                    <FileTextIcon className="w-4 h-4 text-info" />
                    Application Required
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If people want to become a member, they have to fill in the application form. You receive their applications (see community tab here) and you can accept them or reject them.
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">Best for curated spaces with specific requirements</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => setMembershipMode("invitation")}>
                <RadioGroupItem value="invitation" id="membership-invitation" className="mt-1" />
                <div className="space-y-1">
                  <Label htmlFor="membership-invitation" className="text-base font-medium flex items-center gap-2 cursor-pointer">
                    <Mail className="w-4 h-4 text-primary" />
                    Invitation Only
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Users can only become a member after you've invited them. There is no 'apply' or 'join' button for others to click.
                  </p>
                  <p className="text-xs text-muted-foreground italic mt-1">Best for private, restricted collaboration teams</p>
                </div>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Host Organization Section */}
        <AccordionItem value="organizations" className="border rounded-lg bg-card px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Applicable Organizations
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                Allow people associated with organizations to join directly
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0 space-y-6">
            <div className="space-y-4">
              {organizations.map(org => (
                <div key={org.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{org.name}</p>
                      <p className="text-xs text-muted-foreground">@{org.domain}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeOrganization(org.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
                <Plus className="w-4 h-4" />
                Add Organization
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <Label htmlFor="auto-add-users" className="text-sm font-medium">Automatic Access</Label>
                <p className="text-xs text-muted-foreground max-w-md">
                  Automatically add new users with emails matching the organization domain to this space as members.
                </p>
              </div>
              <Switch 
                id="auto-add-users" 
                checked={autoAddOrgUsers}
                onCheckedChange={setAutoAddOrgUsers}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Allowed Actions Section */}
        <AccordionItem value="actions" className="border rounded-lg bg-card px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Allowed Actions
              </h3>
              <p className="text-sm text-muted-foreground font-normal text-left">
                Choose which actions members can perform in this space
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ActionToggle 
                id="spaceInvitations"
                label="Space Invitations"
                description="Allow admins of Subspaces to invite users to their Subspace."
                checked={allowedActions.spaceInvitations}
                onCheckedChange={() => handleActionToggle('spaceInvitations')}
                icon={UserPlus}
              />
              <ActionToggle 
                id="createPosts"
                label="Create Posts"
                description="Allow members to create posts in the community."
                checked={allowedActions.createPosts}
                onCheckedChange={() => handleActionToggle('createPosts')}
                icon={Edit3}
              />
              <ActionToggle 
                id="videoCalls"
                label="Video Calls"
                description="Show video call button for Jitsi conferences."
                checked={allowedActions.videoCalls}
                onCheckedChange={() => handleActionToggle('videoCalls')}
                icon={Video}
              />
              <ActionToggle 
                id="guestContributions"
                label="Guest Contributions"
                description="Allow whiteboards to be shared with non-members."
                checked={allowedActions.guestContributions}
                onCheckedChange={() => handleActionToggle('guestContributions')}
                icon={Share2}
              />
              <ActionToggle 
                id="createSubspaces"
                label="Create Subspaces"
                description="Allow members to create Subspaces in this Space."
                checked={allowedActions.createSubspaces}
                onCheckedChange={() => handleActionToggle('createSubspaces')}
                icon={Layout}
              />
              <ActionToggle 
                id="subspaceEvents"
                label="Subspace Events"
                description="Allow events from Subspaces to be visible here."
                checked={allowedActions.subspaceEvents}
                onCheckedChange={() => handleActionToggle('subspaceEvents')}
                icon={Calendar}
              />
              <ActionToggle 
                id="alkemioSupport"
                label="Alkemio Support"
                description="Allow Alkemio Support team to act as admin."
                checked={allowedActions.alkemioSupport}
                onCheckedChange={() => handleActionToggle('alkemioSupport')}
                icon={Shield}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 6. Danger Zone Section */}
        <AccordionItem value="danger" className="border border-destructive/20 rounded-lg bg-destructive/5 px-6">
          <AccordionTrigger className="hover:no-underline py-6">
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-destructive/80 font-normal text-left">
                Irreversible actions for this space
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-md bg-background">
              <div>
                <h4 className="font-semibold text-foreground">Delete this Space</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Deleting this Space is permanent. All posts, content, and membership data will be permanently removed. Be careful, this action cannot be undone.
                </p>
              </div>
              <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    Delete Space
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Delete Space?
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                      This action cannot be undone. This will permanently delete the space <strong>Green Energy Space</strong> and remove all associated data including:
                      <ul className="list-disc ml-6 mt-2 mb-2 space-y-1">
                        <li>All member associations</li>
                        <li>All document and file storage</li>
                        <li>All community posts and threads</li>
                        <li>All subspaces and their content</li>
                      </ul>
                      Please contact Alkemio support to proceed with deletion if you are sure.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={() => setDeleteConfirmationOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => {
                        // In a real app this would call API
                        setDeleteConfirmationOpen(false);
                        alert("Please contact support@alkemio.org to complete this request.");
                    }}>
                        I understand, delete this space
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Please contact the Alkemio team if you need assistance with space deletion.
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
  icon: Icon
}: { 
  id: string, 
  label: string, 
  description: string, 
  checked: boolean, 
  onCheckedChange: (checked: boolean) => void,
  icon: any
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