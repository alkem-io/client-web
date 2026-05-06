import { useState } from "react";
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Shield, 
  CreditCard,
  User,
  AlertCircle,
  Activity,
  Calendar,
  Building
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SpaceSettingsAccount() {
  const [copied, setCopied] = useState(false);
  const spaceUrl = "https://alkem.io/green-energy";

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(spaceUrl);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* 1. Page Title & Description */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground mt-2">
          Here you find all your Spaces, Virtual Contributors, and other hosted resources. If you have any questions, feel free to reach out to the Alkemio team.
        </p>
      </div>

      <Separator />

      <div className="space-y-6">
        
        {/* 2. URL Section */}
        <div className="grid gap-2">
          <Label htmlFor="space-url" className="text-base">URL</Label>
          <div className="flex items-center gap-2 max-w-xl">
            <div className="relative flex-1">
              <Input 
                id="space-url" 
                value={spaceUrl} 
                readOnly 
                className="bg-muted/20 font-mono text-sm pr-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopyUrl}
              className="shrink-0"
              title="Copy URL"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground italic">
            The unique URL for this space. Contact Alkemio to change this.
          </p>
        </div>

        {/* 3. License Section */}
        <Card className="bg-muted/10 border-muted/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">License</CardTitle>
              </div>
              <Badge variant="secondary" className="px-3 py-1 font-semibold text-primary bg-primary/10">
                Plus Plan
              </Badge>
            </div>
            <CardDescription>
              Your current space subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Included Features</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Up to 50 active members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>Advanced whiteboard tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    <span>5GB Storage per space</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Usage</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spaces Used</span>
                    <span className="font-medium">2 / 5</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[40%]" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50 bg-muted/20 rounded-b-xl">
             <Button variant="outline" className="w-full sm:w-auto text-sm" asChild>
                <a href="#" className="flex items-center gap-2">
                  Change License
                  <ExternalLink className="w-3 h-3" />
                </a>
             </Button>
             <div className="flex-1" />
             <a href="#" className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 flex items-center gap-1">
               More about Alkemio licenses
               <ExternalLink className="w-3 h-3" />
             </a>
          </CardFooter>
        </Card>

        {/* 4. Visibility Status Section */}
        <div className="grid gap-2 p-4 border rounded-lg bg-card">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Label className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-info" />
                Visibility Status
              </Label>
              <div className="flex items-center gap-2 pt-1">
                <p className="text-sm">This Space is currently in</p>
                <Badge className="bg-primary/15 text-primary hover:bg-primary/25 border-primary/20">
                  Active
                </Badge>
                <p className="text-sm">mode</p>
              </div>
              <p className="text-xs text-muted-foreground italic pt-1">
                For status changes, contact the Alkemio team.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              Request Change
            </Button>
          </div>
        </div>

        {/* 5. Host Information Section */}
        <Card className="bg-card">
           <CardHeader className="pb-4">
             <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Host Information</CardTitle>
             </div>
             <CardDescription>
               The host is the person who created this space
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                 <Avatar className="w-12 h-12 border">
                   <AvatarImage src="https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMG1hbiUyMGJ1c2luZXNzfGVufDF8fHx8MTc2OTM2OTkxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Sarah Jenkins" />
                   <AvatarFallback>SJ</AvatarFallback>
                 </Avatar>
                 <div className="space-y-1">
                   <p className="font-medium text-base">Sarah Jenkins</p>
                   <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> Space Host
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" /> Alkemio Innovation
                      </span>
                   </div>
                 </div>
               </div>
               
               <Button variant="outline" size="sm" className="w-full sm:w-auto">
                 Change Host
               </Button>
             </div>
           </CardContent>
        </Card>

        {/* 6. Support/Contact Section (Footer) */}
        <div className="flex flex-col items-center justify-center p-6 mt-8 rounded-lg bg-muted/30 border border-dashed text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            If you want to change any of these settings, please contact the Alkemio team.
          </p>
          <Button variant="default" className="gap-2">
            Contact Alkemio Support
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}