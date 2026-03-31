import React, { useState } from "react";
import { 
  Palette, Type, Layout, MousePointer, Box, Layers, FileText, 
  Check, Search, Bell, Menu, User, Settings, AlertCircle, Info, 
  AlertTriangle, X, ChevronRight, ChevronDown, MoreHorizontal,
  Home, Upload, MessageSquare, Heart, Share2, Plus, Trash2,
  CreditCard, Calendar, Activity, ChevronLeft, Image as ImageIcon,
  Shield, BookOpen, Monitor, Star, LogIn, Lock, Mail, ArrowRight,
  RefreshCw, Download
} from "lucide-react";

// UI Components
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Switch } from "@/app/components/ui/switch";
import { Slider } from "@/app/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/ui/card";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/app/components/ui/dropdown-menu";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/app/components/ui/accordion";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from "@/app/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/app/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { Progress } from "@/app/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/app/components/ui/alert";

import { cn } from "@/lib/utils";
import { Link } from "react-router";

// Imported Organisms
import { Header } from "@/app/components/layout/Header";
import { Sidebar } from "@/app/components/layout/Sidebar";

// --- Helper Components ---

const SectionHeader = ({ title, description }: { title: string, description?: string }) => (
  <div className="mb-10 border-b border-border pb-6">
    <h2 className="text-4xl font-bold text-foreground mb-3 tracking-tight">{title}</h2>
    {description && <p className="text-xl text-muted-foreground max-w-4xl">{description}</p>}
  </div>
);

const ComponentBlock = ({ title, description, children, className }: { title: string, description?: string, children: React.ReactNode, className?: string }) => (
  <div className={cn("mb-16", className)}>
    <div className="mb-6">
      <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
        {title}
        <Badge variant="outline" className="text-xs font-normal text-muted-foreground ml-2">Component</Badge>
      </h3>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
    </div>
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <div className="p-8 bg-background/50 overflow-x-auto">
        {children}
      </div>
    </div>
  </div>
);

// --- 1. Design Tokens ---

const ColorSwatch = ({ name, colorClass, hex, usage }: { name: string, colorClass: string, hex: string, usage: string }) => (
  <div className="flex flex-col gap-3 group">
    <div className={cn("w-full aspect-square rounded-2xl shadow-sm border border-border/50 transition-transform group-hover:scale-105", colorClass)}></div>
    <div>
      <h4 className="font-semibold text-sm text-foreground">{name}</h4>
      <div className="flex items-center justify-between mt-1">
         <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{hex}</code>
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{usage}</p>
    </div>
  </div>
);

const DesignTokens = () => (
  <section id="tokens" className="space-y-16">
    <SectionHeader title="Design Tokens & Foundations" description="The core visual properties of the design system." />
    
    <div className="space-y-12">
      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Palette className="w-5 h-5" /> Color Palette</h3>
        <div className="space-y-10">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Primary Colors</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <ColorSwatch name="Primary" colorClass="bg-primary" hex="--primary" usage="Main brand color, call-to-actions." />
              <ColorSwatch name="Primary Foreground" colorClass="bg-primary-foreground" hex="--primary-foreground" usage="Text on primary." />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Neutral Colors</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <ColorSwatch name="Background" colorClass="bg-background" hex="--background" usage="Page background." />
              <ColorSwatch name="Foreground" colorClass="bg-foreground" hex="--foreground" usage="Primary text." />
              <ColorSwatch name="Card" colorClass="bg-card" hex="--card" usage="Card background." />
              <ColorSwatch name="Card Foreground" colorClass="bg-card-foreground" hex="--card-foreground" usage="Text on cards." />
              <ColorSwatch name="Muted" colorClass="bg-muted" hex="--muted" usage="Secondary backgrounds." />
              <ColorSwatch name="Muted Foreground" colorClass="bg-muted-foreground" hex="--muted-foreground" usage="Secondary text." />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Semantic Colors</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <ColorSwatch name="Destructive" colorClass="bg-destructive" hex="--destructive" usage="Error states." />
              <ColorSwatch name="Destructive FG" colorClass="bg-destructive-foreground" hex="--destructive-foreground" usage="Text on destructive." />
              <ColorSwatch name="Border" colorClass="bg-border" hex="--border" usage="Borders, dividers." />
              <ColorSwatch name="Input" colorClass="bg-input" hex="--input" usage="Input borders." />
              <ColorSwatch name="Ring" colorClass="bg-ring" hex="--ring" usage="Focus rings." />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Type className="w-5 h-5" /> Typography</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
           <div className="space-y-6">
              <div className="border-b border-border pb-4">
                 <h1 className="text-4xl font-bold mb-2">Heading 1</h1>
                 <p className="text-sm text-muted-foreground">text-4xl / font-bold</p>
              </div>
              <div className="border-b border-border pb-4">
                 <h2 className="text-3xl font-bold mb-2">Heading 2</h2>
                 <p className="text-sm text-muted-foreground">text-3xl / font-bold</p>
              </div>
              <div className="border-b border-border pb-4">
                 <h3 className="text-2xl font-semibold mb-2">Heading 3</h3>
                 <p className="text-sm text-muted-foreground">text-2xl / font-semibold</p>
              </div>
              <div className="border-b border-border pb-4">
                 <h4 className="text-xl font-semibold mb-2">Heading 4</h4>
                 <p className="text-sm text-muted-foreground">text-xl / font-semibold</p>
              </div>
           </div>
           <div className="space-y-6">
              <div className="border-b border-border pb-4">
                 <p className="text-base mb-2">Body Regular - The quick brown fox jumps over the lazy dog.</p>
                 <p className="text-sm text-muted-foreground">text-base / font-normal</p>
              </div>
              <div className="border-b border-border pb-4">
                 <p className="text-sm font-medium mb-2">Body Medium / Label - The quick brown fox jumps.</p>
                 <p className="text-sm text-muted-foreground">text-sm / font-medium</p>
              </div>
              <div className="border-b border-border pb-4">
                 <p className="text-sm text-muted-foreground mb-2">Body Small / Muted - The quick brown fox jumps.</p>
                 <p className="text-sm text-muted-foreground">text-sm / text-muted-foreground</p>
              </div>
              <div className="border-b border-border pb-4">
                 <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Caption / Micro</p>
                 <p className="text-sm text-muted-foreground">text-xs / uppercase</p>
              </div>
           </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><Box className="w-5 h-5" /> Spacing, Radius & Animation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Border Radius</h4>
              <div className="flex flex-wrap gap-4 items-end">
                 <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-sm mx-auto"></div>
                    <code className="text-[10px] bg-muted px-1 rounded">sm</code>
                 </div>
                 <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-md mx-auto"></div>
                    <code className="text-[10px] bg-muted px-1 rounded">md</code>
                 </div>
                 <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg mx-auto"></div>
                    <code className="text-[10px] bg-muted px-1 rounded">lg</code>
                 </div>
                 <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl mx-auto"></div>
                    <code className="text-[10px] bg-muted px-1 rounded">xl</code>
                 </div>
                 <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full mx-auto"></div>
                    <code className="text-[10px] bg-muted px-1 rounded">full</code>
                 </div>
              </div>
           </div>
           
           <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Shadows</h4>
              <div className="flex flex-wrap gap-4">
                 <div className="w-16 h-16 bg-background rounded-lg shadow-sm flex items-center justify-center text-[10px] text-muted-foreground border border-border/50">sm</div>
                 <div className="w-16 h-16 bg-background rounded-lg shadow flex items-center justify-center text-[10px] text-muted-foreground border border-border/50">default</div>
                 <div className="w-16 h-16 bg-background rounded-lg shadow-md flex items-center justify-center text-[10px] text-muted-foreground border border-border/50">md</div>
                 <div className="w-16 h-16 bg-background rounded-lg shadow-lg flex items-center justify-center text-[10px] text-muted-foreground border border-border/50">lg</div>
              </div>
           </div>

           <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Animations</h4>
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-info/10 rounded animate-pulse"></div>
                    <span className="text-xs">Pulse</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-success/10 rounded animate-bounce"></div>
                    <span className="text-xs">Bounce</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded animate-spin"></div>
                    <span className="text-xs">Spin</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

// --- 2. Atoms ---

const Atoms = () => (
  <section id="atoms" className="space-y-16">
    <SectionHeader title="Atoms" description="The smallest, reusable building blocks of the interface." />

    <ComponentBlock title="Buttons" description="Interactive elements that trigger actions.">
      <div className="space-y-8">
         <div className="flex flex-wrap gap-4 items-center">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
         </div>
         <Separator />
         <div className="flex flex-wrap gap-4 items-center">
            <Button size="lg">Large Button</Button>
            <Button size="default">Default Button</Button>
            <Button size="sm">Small</Button>
            <Button size="icon" title="Icon Button"><Plus className="w-4 h-4" /></Button>
         </div>
         <Separator />
         <div className="flex flex-wrap gap-4 items-center">
            <Button disabled>Disabled</Button>
            <Button className="gap-2"><Upload className="w-4 h-4" /> With Icon</Button>
            <Button variant="outline" className="gap-2">Next Step <ChevronRight className="w-4 h-4" /></Button>
         </div>
      </div>
    </ComponentBlock>

    <ComponentBlock title="Inputs & Controls" description="Form controls for user input.">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
          <div className="space-y-6">
             <div className="space-y-3">
                <label className="text-sm font-medium">Text Input</label>
                <Input placeholder="Enter text..." />
             </div>
             <div className="space-y-3">
                <label className="text-sm font-medium">With Icon</label>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input className="pl-9" placeholder="Search..." />
                </div>
             </div>
             <div className="space-y-3">
                <label className="text-sm font-medium">File Input</label>
                <Input type="file" />
             </div>
             <div className="space-y-3">
                <label className="text-sm font-medium">Radio Group</label>
                <RadioGroup defaultValue="option-one">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <label htmlFor="option-one" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Option One</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <label htmlFor="option-two" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Option Two</label>
                  </div>
                </RadioGroup>
             </div>
          </div>
          <div className="space-y-8">
             <div className="space-y-4">
                <label className="text-sm font-medium block">Checkboxes</label>
                <div className="flex items-center space-x-2">
                   <Checkbox id="terms" />
                   <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Accept terms</label>
                </div>
                <div className="flex items-center space-x-2">
                   <Checkbox id="checked" defaultChecked />
                   <label htmlFor="checked" className="text-sm font-medium leading-none">Checked state</label>
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-sm font-medium block">Switch</label>
                <div className="flex items-center space-x-2">
                   <Switch id="airplane-mode" />
                   <label htmlFor="airplane-mode" className="text-sm font-medium leading-none">Airplane Mode</label>
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-sm font-medium block">Slider</label>
                <Slider defaultValue={[50]} max={100} step={1} className="w-[80%]" />
             </div>
             <div className="space-y-4">
                <label className="text-sm font-medium block">Progress</label>
                <Progress value={66} className="w-[80%]" />
             </div>
          </div>
       </div>
    </ComponentBlock>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <ComponentBlock title="Badges" description="Small status indicators.">
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-info/10 text-info hover:bg-info/15 border-transparent">Custom Color</Badge>
        </div>
      </ComponentBlock>

      <ComponentBlock title="Avatars" description="Profile pictures.">
         <div className="flex items-end gap-6">
            <Avatar className="w-16 h-16">
               <AvatarImage src="https://github.com/shadcn.png" />
               <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar className="w-12 h-12">
               <AvatarImage src="https://github.com/shadcn.png" />
               <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
               <AvatarImage src="https://github.com/shadcn.png" />
               <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
               <AvatarFallback>JD</AvatarFallback>
            </Avatar>
         </div>
      </ComponentBlock>
    </div>

    <ComponentBlock title="Skeleton Loading" description="Placeholders for loading content.">
       <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
             <Skeleton className="h-4 w-[250px]" />
             <Skeleton className="h-4 w-[200px]" />
          </div>
       </div>
    </ComponentBlock>
  </section>
);

// --- 3. Molecules ---

const Molecules = () => (
  <section id="molecules" className="space-y-16">
    <SectionHeader title="Molecules" description="Groups of atoms functioning together as a unit." />

    <ComponentBlock title="Alerts & Notifications" description="Feedback components.">
       <div className="space-y-4 max-w-2xl">
          <Alert>
             <Info className="h-4 w-4" />
             <AlertTitle>Information</AlertTitle>
             <AlertDescription>New features are now available in the dashboard.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
          </Alert>
       </div>
    </ComponentBlock>

    <ComponentBlock title="Navigation Elements" description="Breadcrumbs and Pagination.">
       <div className="space-y-8">
          <div>
             <h4 className="text-sm font-medium mb-2 text-muted-foreground">Breadcrumbs</h4>
             <div className="flex items-center text-sm text-muted-foreground">
                <span className="hover:text-foreground cursor-pointer">Home</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="hover:text-foreground cursor-pointer">Settings</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-foreground font-medium">Profile</span>
             </div>
          </div>
          <div>
             <h4 className="text-sm font-medium mb-2 text-muted-foreground">Pagination</h4>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">1</Button>
                <Button variant="default" size="sm" className="h-8 w-8 p-0">2</Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">3</Button>
                <span className="text-muted-foreground">...</span>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">10</Button>
                <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
             </div>
          </div>
       </div>
    </ComponentBlock>

    <ComponentBlock title="Interactive Elements" description="Tabs, Accordions, Dialogs, Dropdowns.">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
             <div>
                <h4 className="text-sm font-medium mb-4">Tabs</h4>
                <Tabs defaultValue="account" className="w-full">
                   <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="password">Password</TabsTrigger>
                   </TabsList>
                   <TabsContent value="account">
                      <div className="p-4 border border-border rounded-lg mt-2 bg-card">Account Content</div>
                   </TabsContent>
                   <TabsContent value="password">
                      <div className="p-4 border border-border rounded-lg mt-2 bg-card">Password Content</div>
                   </TabsContent>
                </Tabs>
             </div>
             
             <div>
                <h4 className="text-sm font-medium mb-4">Accordion</h4>
                <Accordion type="single" collapsible className="w-full">
                   <AccordionItem value="item-1">
                      <AccordionTrigger>Is it accessible?</AccordionTrigger>
                      <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
                   </AccordionItem>
                   <AccordionItem value="item-2">
                      <AccordionTrigger>Is it styled?</AccordionTrigger>
                      <AccordionContent>Yes. It comes with default styles that matches the other components.</AccordionContent>
                   </AccordionItem>
                </Accordion>
             </div>
          </div>

          <div className="space-y-8">
             <div>
                <h4 className="text-sm font-medium mb-4">Dialog & Dropdown</h4>
                <div className="flex flex-col gap-4">
                   <div className="flex gap-4">
                      <Dialog>
                         <DialogTrigger asChild>
                            <Button variant="outline">Open Dialog</Button>
                         </DialogTrigger>
                         <DialogContent>
                            <DialogHeader>
                               <DialogTitle>Edit Profile</DialogTitle>
                               <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                               <div className="space-y-2">
                                  <label className="text-sm font-medium">Username</label>
                                  <Input defaultValue="@alkemio" />
                               </div>
                            </div>
                            <DialogFooter>
                               <Button type="submit">Save changes</Button>
                            </DialogFooter>
                         </DialogContent>
                      </Dialog>

                      <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="outline">Open Menu</Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuItem>Team</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
                         </DropdownMenuContent>
                      </DropdownMenu>
                   </div>
                   
                   <div className="space-y-2 w-full max-w-xs">
                       <label className="text-sm font-medium">Select</label>
                       <Select>
                          <SelectTrigger>
                             <SelectValue placeholder="Select a timezone" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="utc">UTC</SelectItem>
                             <SelectItem value="est">Eastern Time</SelectItem>
                             <SelectItem value="pst">Pacific Time</SelectItem>
                          </SelectContent>
                       </Select>
                   </div>
                </div>
             </div>

             <div>
                <h4 className="text-sm font-medium mb-4">Tooltip</h4>
                <TooltipProvider>
                   <Tooltip>
                      <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon">
                            <Info className="w-4 h-4" />
                         </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                         <p>Add to library</p>
                      </TooltipContent>
                   </Tooltip>
                </TooltipProvider>
             </div>
          </div>
       </div>
    </ComponentBlock>

    <ComponentBlock title="Cards" description="Versatile containers for content.">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
             <CardHeader>
                <CardTitle>Standard Card</CardTitle>
                <CardDescription>Basic layout with header.</CardDescription>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">Cards are used to group related information.</p>
             </CardContent>
             <CardFooter>
                <Button variant="outline" className="w-full">Action</Button>
             </CardFooter>
          </Card>
          
          <Card className="overflow-hidden">
             <div className="h-32 bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                   <ImageIcon className="w-8 h-8 opacity-50" />
                </div>
             </div>
             <CardHeader>
                <CardTitle>Image Card</CardTitle>
                <CardDescription>With media area.</CardDescription>
             </CardHeader>
             <CardContent>
                <p className="text-sm text-muted-foreground">Great for blog posts or items with visuals.</p>
             </CardContent>
          </Card>

           <Card>
             <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar>
                   <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <div>
                   <CardTitle className="text-base">Profile Card</CardTitle>
                   <CardDescription>User summary</CardDescription>
                </div>
             </CardHeader>
             <CardContent>
                <div className="flex justify-between text-sm py-2 border-b border-border">
                   <span className="text-muted-foreground">Status</span>
                   <Badge variant="secondary" className="h-5">Active</Badge>
                </div>
                <div className="flex justify-between text-sm py-2">
                   <span className="text-muted-foreground">Role</span>
                   <span>Admin</span>
                </div>
             </CardContent>
          </Card>
       </div>
    </ComponentBlock>
  </section>
);

// --- 4. Organisms ---

// Re-implementing simplified versions of complex cards for documentation self-containment
const DemoPackCard = () => (
    <div className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all w-80">
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
           <ImageIcon className="w-10 h-10" />
        </div>
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold shadow-sm">
          14 Templates
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
              GV
            </div>
            <div>
              <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">Design Sprint</h3>
              <p className="text-[10px] text-muted-foreground">by Google Ventures</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-4">Validate ideas and solve big problems in just five days.</p>
        <div className="flex flex-wrap gap-1.5 mt-auto">
           <Badge variant="secondary" className="text-[10px] h-5 font-normal">Strategy</Badge>
           <Badge variant="secondary" className="text-[10px] h-5 font-normal">Workshop</Badge>
        </div>
      </div>
    </div>
);

const Organisms = () => (
  <section id="organisms" className="space-y-16">
    <SectionHeader title="Organisms" description="Complex, distinct sections of the interface formed by molecules." />

    <ComponentBlock title="Header Navigation" description="The global application header.">
       <div className="border border-border rounded-lg overflow-hidden relative" style={{ height: '300px' }}>
          <div className="absolute inset-0 bg-muted/10">
             <Header className="absolute top-0 w-full" />
          </div>
       </div>
    </ComponentBlock>

    <ComponentBlock title="Sidebar Navigation" description="The main side navigation.">
       <div className="border border-border rounded-lg overflow-hidden relative flex" style={{ height: '500px' }}>
          <Sidebar className="h-full border-r" />
          <div className="flex-1 bg-muted/10 p-8 flex items-center justify-center text-muted-foreground">
             Content Area
          </div>
       </div>
    </ComponentBlock>

    <ComponentBlock title="Complex Cards" description="Specific card implementations.">
       <div className="flex flex-wrap gap-6">
          <DemoPackCard />
          <div className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all w-80 h-full">
             <div className="relative h-44 w-full overflow-hidden bg-muted border-b border-border/50">
               <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <Layout className="w-12 h-12" />
               </div>
               <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="backdrop-blur-md bg-white/90 shadow-sm text-[10px] h-5 px-1.5 font-normal border-white/50">Whiteboard</Badge>
               </div>
             </div>
             <div className="p-4 flex flex-col flex-1">
               <div className="mb-2">
                  <h4 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">Brainstorming Board</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Ideation</p>
               </div>
               <p className="text-xs text-muted-foreground line-clamp-2 flex-1">Collaborative space for generating ideas.</p>
             </div>
          </div>
       </div>
    </ComponentBlock>
    
    <ComponentBlock title="Comments Section" description="Conversation thread component.">
       <div className="max-w-2xl space-y-6">
          <div className="flex gap-4">
             <Avatar>
                <AvatarFallback>JD</AvatarFallback>
             </Avatar>
             <div className="flex-1 space-y-2">
                <div className="bg-muted/50 p-4 rounded-lg rounded-tl-none">
                   <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Jane Doe</span>
                      <span className="text-xs text-muted-foreground">2h ago</span>
                   </div>
                   <p className="text-sm">This design system is looking great! I really like the new atomic structure.</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pl-2">
                   <button className="hover:text-foreground">Reply</button>
                   <button className="hover:text-foreground">Like</button>
                </div>
             </div>
          </div>
          
          <div className="flex gap-4 pl-12">
             <Avatar className="h-8 w-8">
                <AvatarFallback>MK</AvatarFallback>
             </Avatar>
             <div className="flex-1 space-y-2">
                <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none">
                   <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">Mike King</span>
                      <span className="text-xs text-muted-foreground">1h ago</span>
                   </div>
                   <p className="text-sm">Agreed. The consistent spacing is a huge improvement.</p>
                </div>
             </div>
          </div>

          <div className="flex gap-4 pt-2">
             <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>ME</AvatarFallback>
             </Avatar>
             <div className="flex-1">
                <Input placeholder="Write a reply..." className="bg-background" />
             </div>
          </div>
       </div>
    </ComponentBlock>

    <ComponentBlock title="File Upload" description="Drag and drop zone.">
       <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
             <Upload className="w-6 h-6" />
          </div>
          <h4 className="font-medium mb-1">Upload files</h4>
          <p className="text-sm text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
          <Button variant="secondary" size="sm">Select Files</Button>
       </div>
    </ComponentBlock>
  </section>
);

// --- 5. Templates & Wireframes ---

const TemplatesAndPages = () => (
  <section id="templates" className="space-y-16">
    <SectionHeader title="Templates & Wireframes" description="Detailed page layouts defining structure and hierarchy." />

    <ComponentBlock title="Space Detail Wireframe" description="Layout for a Space landing page including banner, header, and tabs.">
       <div className="border border-border rounded-lg overflow-hidden bg-background h-[600px] flex flex-col shadow-sm relative">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-primary to-primary/70 w-full relative">
             <div className="absolute bottom-4 right-4 flex gap-2">
                <div className="h-8 w-24 bg-white/20 backdrop-blur rounded"></div>
             </div>
          </div>
          
          {/* Header Info */}
          <div className="px-8 pb-4 border-b border-border relative">
             <div className="flex justify-between items-end">
                <div className="flex items-end gap-6 -mt-12 mb-4">
                   <div className="w-32 h-32 rounded-xl bg-background border-4 border-background shadow-lg flex items-center justify-center text-muted-foreground">
                      <div className="w-full h-full bg-muted rounded-lg animate-pulse"></div>
                   </div>
                   <div className="mb-2 space-y-2">
                      <div className="h-8 w-64 bg-foreground/80 rounded"></div>
                      <div className="flex gap-2">
                         <div className="h-5 w-20 bg-muted rounded-full"></div>
                         <div className="h-5 w-24 bg-muted rounded-full"></div>
                      </div>
                   </div>
                </div>
                <div className="mb-4 flex gap-3">
                   <div className="h-10 w-24 bg-primary rounded"></div>
                   <div className="h-10 w-10 bg-muted rounded"></div>
                </div>
             </div>
             
             {/* Tabs */}
             <div className="flex gap-8 mt-4 border-b border-transparent">
                <div className="pb-3 border-b-2 border-primary font-medium text-foreground">About</div>
                <div className="pb-3 border-b-2 border-transparent text-muted-foreground">Community</div>
                <div className="pb-3 border-b-2 border-transparent text-muted-foreground">Resources</div>
                <div className="pb-3 border-b-2 border-transparent text-muted-foreground">Settings</div>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-muted/10 p-8 flex gap-8">
             <div className="flex-1 space-y-6">
                <div className="h-32 bg-background border border-border rounded-xl p-6">
                   <div className="h-4 w-32 bg-muted rounded mb-4"></div>
                   <div className="space-y-2">
                      <div className="h-3 w-full bg-muted/50 rounded"></div>
                      <div className="h-3 w-full bg-muted/50 rounded"></div>
                      <div className="h-3 w-2/3 bg-muted/50 rounded"></div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="h-40 bg-background border border-border rounded-xl"></div>
                   <div className="h-40 bg-background border border-border rounded-xl"></div>
                </div>
             </div>
             <div className="w-80 space-y-6">
                <div className="h-64 bg-background border border-border rounded-xl p-4">
                   <div className="h-4 w-24 bg-muted rounded mb-4"></div>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-muted"></div>
                         <div className="h-3 w-24 bg-muted/50 rounded"></div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-muted"></div>
                         <div className="h-3 w-24 bg-muted/50 rounded"></div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-muted"></div>
                         <div className="h-3 w-24 bg-muted/50 rounded"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </ComponentBlock>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
       <ComponentBlock title="Login Wireframe" description="Authentication layout.">
          <div className="bg-muted/20 h-96 flex items-center justify-center rounded-lg border border-border">
             <Card className="w-80 shadow-lg">
                <CardHeader className="space-y-1">
                   <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
                   <CardDescription className="text-center">Enter your email below to login</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input placeholder="m@example.com" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input type="password" />
                   </div>
                   <Button className="w-full">Sign In</Button>
                </CardContent>
                <CardFooter>
                   <p className="text-xs text-center w-full text-muted-foreground">Don't have an account? Sign up</p>
                </CardFooter>
             </Card>
          </div>
       </ComponentBlock>

       <ComponentBlock title="404 Error Wireframe" description="Page not found state.">
          <div className="bg-background h-96 flex flex-col items-center justify-center text-center p-8 rounded-lg border border-border">
             <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-muted-foreground" />
             </div>
             <h3 className="text-4xl font-bold text-foreground mb-2">404</h3>
             <h4 className="text-xl font-semibold mb-4">Page not found</h4>
             <p className="text-muted-foreground mb-8 max-w-xs">Sorry, we couldn't find the page you're looking for.</p>
             <div className="flex gap-4">
                <Button variant="outline">Go Back</Button>
                <Button>Go Home</Button>
             </div>
          </div>
       </ComponentBlock>
    </div>

    <ComponentBlock title="Dashboard Wireframe" description="Standard dashboard layout structure.">
       <div className="border border-border rounded-lg overflow-hidden bg-muted/10 h-96 flex flex-col">
          {/* Header */}
          <div className="h-14 bg-background border-b border-border w-full flex items-center px-4 justify-between shrink-0">
             <div className="w-32 h-5 bg-muted rounded"></div>
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted"></div>
                <div className="w-8 h-8 rounded-full bg-muted"></div>
             </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
             {/* Sidebar */}
             <div className="w-64 bg-background border-r border-border hidden md:flex flex-col p-4 gap-2 shrink-0">
                <div className="w-full h-10 bg-primary/5 rounded border border-primary/10 mb-4"></div>
                <div className="w-full h-9 bg-muted/30 rounded"></div>
                <div className="w-full h-9 bg-muted/30 rounded"></div>
                <div className="w-full h-9 bg-muted/30 rounded"></div>
                <div className="mt-auto w-full h-12 bg-muted/30 rounded"></div>
             </div>
             {/* Content */}
             <div className="flex-1 p-8 overflow-auto">
                <div className="flex items-center justify-between mb-8">
                   <div className="space-y-2">
                      <div className="w-64 h-8 bg-foreground/10 rounded"></div>
                      <div className="w-96 h-4 bg-muted rounded"></div>
                   </div>
                   <div className="w-32 h-10 bg-primary rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   <div className="h-40 bg-background border border-border rounded-xl shadow-sm p-6 space-y-4">
                      <div className="w-10 h-10 rounded bg-muted"></div>
                      <div className="w-full h-4 bg-muted rounded"></div>
                      <div className="w-2/3 h-4 bg-muted rounded"></div>
                   </div>
                   <div className="h-40 bg-background border border-border rounded-xl shadow-sm p-6 space-y-4">
                      <div className="w-10 h-10 rounded bg-muted"></div>
                      <div className="w-full h-4 bg-muted rounded"></div>
                      <div className="w-2/3 h-4 bg-muted rounded"></div>
                   </div>
                   <div className="h-40 bg-background border border-border rounded-xl shadow-sm p-6 space-y-4">
                      <div className="w-10 h-10 rounded bg-muted"></div>
                      <div className="w-full h-4 bg-muted rounded"></div>
                      <div className="w-2/3 h-4 bg-muted rounded"></div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </ComponentBlock>

    <ComponentBlock title="Implemented Page Links" description="Direct access to live pages.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
            { name: "Home Dashboard", path: "/", icon: Home, desc: "Main landing" },
            { name: "Template Library", path: "/templates", icon: Layout, desc: "Catalog view" },
            { name: "Settings", path: "/user/alex/settings/profile", icon: Settings, desc: "Form layouts" },
         ].map((page) => (
            <Link key={page.path} to={page.path} className="group block border border-border rounded-xl overflow-hidden hover:border-primary transition-colors bg-card">
               <div className="aspect-video bg-muted flex items-center justify-center relative group-hover:bg-primary/5 transition-colors">
                  <page.icon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
               </div>
               <div className="p-4">
                  <h4 className="font-semibold group-hover:text-primary transition-colors">{page.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{page.desc}</p>
               </div>
            </Link>
         ))}
      </div>
    </ComponentBlock>
  </section>
);

// --- Main Page Component ---

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState("tokens");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button 
      onClick={() => scrollToSection(id)}
      className={cn(
        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3",
        activeSection === id 
          ? "bg-primary text-primary-foreground font-medium shadow-sm" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-border bg-muted/10 overflow-y-auto hidden lg:block flex-shrink-0">
        <div className="p-8 sticky top-0 bg-muted/10 backdrop-blur z-10">
          <div className="flex items-center gap-3 font-bold text-2xl mb-1 text-foreground">
             <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm">
                <Layers className="w-5 h-5" />
             </div>
             Atomic DS
          </div>
          <p className="text-xs text-muted-foreground ml-12">v3.0.0 • Complete Catalog</p>
        </div>
        
        <nav className="px-6 pb-8 space-y-8">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Foundations</h4>
            <div className="space-y-1">
              <NavItem id="tokens" label="Design Tokens" icon={Palette} />
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Components</h4>
            <div className="space-y-1">
              <NavItem id="atoms" label="Atoms" icon={MousePointer} />
              <NavItem id="molecules" label="Molecules" icon={Box} />
              <NavItem id="organisms" label="Organisms" icon={Layout} />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Patterns</h4>
            <div className="space-y-1">
               <NavItem id="templates" label="Templates & Wireframes" icon={FileText} />
            </div>
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-border mx-6">
           <Button variant="outline" className="w-full gap-2" asChild>
              <Link to="/">
                 <ChevronLeft className="w-4 h-4" /> Back to App
              </Link>
           </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth bg-background">
        <div className="max-w-[1600px] mx-auto px-12 py-16">
          <div className="max-w-4xl mb-20">
            <h1 className="text-6xl font-extrabold tracking-tight text-foreground mb-6">Design System</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              The single source of truth for the Alkemio platform. 
              This catalog includes every component, token, and pattern used in the application.
            </p>
            <div className="flex gap-4 mt-8">
               <Badge variant="secondary" className="px-3 py-1 text-sm">React</Badge>
               <Badge variant="secondary" className="px-3 py-1 text-sm">Tailwind CSS</Badge>
               <Badge variant="secondary" className="px-3 py-1 text-sm">shadcn/ui</Badge>
               <Badge variant="secondary" className="px-3 py-1 text-sm">Lucide Icons</Badge>
            </div>
          </div>
          
          <div className="space-y-32 pb-32">
            <DesignTokens />
            <Atoms />
            <Molecules />
            <Organisms />
            <TemplatesAndPages />
          </div>

          <footer className="border-t border-border pt-12 mt-20 text-center text-muted-foreground">
             <p>© 2026 Alkemio Platform Design System. Internal Use Only.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}