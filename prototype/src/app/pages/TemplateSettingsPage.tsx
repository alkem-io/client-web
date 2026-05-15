import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Info, FileText, Trash2, Check, Loader2, Plus, X, Pencil, MessageSquare, Layers } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Switch } from "@/app/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { toast } from "sonner";
import { ALL_TEMPLATES } from "@/app/data/template-data";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const TEMPLATE_DATA: Record<string, {
  id: string;
  name: string;
  type: string;
  description: string;
  tags: string[];
  content: {
    title: string;
    body: string;
    additionalContent: string;
    whiteboardPreview?: string;
    references: { title: string; url: string }[];
    responseOptions: { comments: boolean; collection: string };
    // Innovation Flow (for Space type)
    innovationFlow?: {
      phases: { name: string; description: string; collaborationTools: { name: string; type: string }[] }[];
    };
    // Collaboration tools in subspace (for Collaboration Tool type uses post + whiteboard)
  };
}> = {
  t1: {
    id: "t1", name: "Sprint Space", type: "Space",
    description: "<p>A full space layout for running a design sprint with innovation flow phases: Prepare, Act, Evaluate, Iterate.</p>",
    tags: ["Sprint", "Workshop"],
    content: {
      title: "Sprint Space",
      body: "<p>Configure your sprint workspace with all the tools needed for a 5-day design sprint. Each phase guides you through the process.</p>",
      additionalContent: "none",
      references: [{ title: "Sprint Book", url: "https://www.thesprintbook.com" }],
      responseOptions: { comments: true, collection: "none" },
      innovationFlow: {
        phases: [
          { name: "Prepare", description: "Define the challenge and gather research", collaborationTools: [
            { name: "Challenge Brief", type: "Collaboration Tool" },
            { name: "User Research Notes", type: "Collaboration Tool" },
          ]},
          { name: "Act", description: "Ideate, sketch, and prototype solutions", collaborationTools: [
            { name: "Sketching Canvas", type: "Whiteboard" },
            { name: "Prototype Feedback", type: "Collaboration Tool" },
          ]},
          { name: "Evaluate", description: "Test prototypes with real users", collaborationTools: [
            { name: "Test Script", type: "Collaboration Tool" },
            { name: "Feedback Summary", type: "Collaboration Tool" },
          ]},
          { name: "Iterate", description: "Refine based on learnings", collaborationTools: [
            { name: "Retrospective", type: "Collaboration Tool" },
            { name: "Next Steps", type: "Collaboration Tool" },
          ]},
        ]
      }
    }
  },
  t2: {
    id: "t2", name: "Tackling Complex Problems", type: "Space",
    description: "<p>A community space to apply the \"Muddle Through\" method to real challenges. Each phase guides you from framing the problem to sharing what you've learned.</p>",
    tags: ["Innovation", "Design Thinking", "Incremental Innovation", "Human-Centered Design"],
    content: {
      title: "Tackling Complex Problems",
      body: "<p><strong>How to Tackle Major Problems: Muddle Through by Taking Small Incremental Steps</strong></p><p>Instead of waiting for a perfect, large-scale solution, we take small incremental steps, learn together, and build momentum.</p>",
      additionalContent: "none",
      references: [{ title: "Interaction Design Foundation", url: "https://www.interaction-design.org" }],
      responseOptions: { comments: true, collection: "whiteboards" },
      innovationFlow: {
        phases: [
          { name: "Frame", description: "Define the problem and scope", collaborationTools: [
            { name: "Problem Definition", type: "Collaboration Tool" },
            { name: "Stakeholder Map", type: "Whiteboard" },
          ]},
          { name: "Explore", description: "Research and gather perspectives", collaborationTools: [
            { name: "Expert Interviews", type: "Collaboration Tool" },
            { name: "Landscape Analysis", type: "Collaboration Tool" },
            { name: "Inspiration Board", type: "Whiteboard" },
          ]},
          { name: "Experiment", description: "Try small-scale interventions", collaborationTools: [
            { name: "Experiment Log", type: "Collaboration Tool" },
            { name: "Quick Prototype", type: "Whiteboard" },
          ]},
          { name: "Share", description: "Communicate learnings and outcomes", collaborationTools: [
            { name: "Insight Summary", type: "Collaboration Tool" },
            { name: "Community Update", type: "Collaboration Tool" },
          ]},
        ]
      }
    }
  },
  t3: {
    id: "t3", name: "Business Model Canvas", type: "Collaboration Tool",
    description: "<p>A template for creating a business model canvas collaboratively.</p>",
    tags: ["Strategy", "Canvas"],
    content: {
      title: "Business Model Canvas",
      body: "<p><strong>Map out your business model.</strong></p><p>Use this template to define the key components of your business model including value propositions, customer segments, channels, and revenue streams.</p>",
      additionalContent: "whiteboard",
      whiteboardPreview: "https://images.unsplash.com/photo-1731924532579-d23ed102496c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      references: [{ title: "BMC Guide", url: "https://strategyzer.com/canvas" }],
      responseOptions: { comments: true, collection: "whiteboards" },
    }
  },
  t4: {
    id: "t4", name: "MoSCoW Prioritization", type: "Collaboration Tool",
    description: "<p>MoSCoW helps you define which requirements have the highest priority and absolutely need to be required to reach goals.</p>",
    tags: ["Prioritization"],
    content: {
      title: "MoSCoW",
      body: "<p><strong>Prioritizing our goals with clarity.</strong></p><p>Use this MoSCoW template to define and prioritize requirements. Identify what must, should, could, and won't be included to achieve our objectives effectively.</p>",
      additionalContent: "whiteboard",
      whiteboardPreview: "https://images.unsplash.com/photo-1731924532579-d23ed102496c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      references: [],
      responseOptions: { comments: true, collection: "none" },
    }
  },
  t5: {
    id: "t5", name: "Low-Tech Social Network", type: "Collaboration Tool",
    description: "<p>The object of this game is to introduce event participants to each other by co-creating a mural-sized, visual network of their connections.</p>",
    tags: ["Networking", "Workshop"],
    content: {
      title: "Low-Tech Social Network",
      body: "<p><strong>Object of Play</strong></p><p>The object of this game is to introduce event participants to each other by co-creating a mural-sized, visual network of their connections.</p><p><strong>Number of Players</strong><br/>Large groups in an event setting</p><p><strong>How to Play</strong></p><ol><li>An emcee or leader for the event gives the participants clear instructions</li><li>Create the avatars — all participants will need a 3×5 index card</li><li>Make the connections</li><li>Find the people you know and draw lines to make the connections</li></ol><p><strong>Strategy</strong></p><p>The initial network creation will be somewhat chaotic and messy. Encourage this, and see what new connections are made.</p>",
      additionalContent: "whiteboard",
      whiteboardPreview: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      references: [{ title: "New reference", url: "" }],
      responseOptions: { comments: true, collection: "none" },
    }
  },
  t6: {
    id: "t6", name: "Empathy Map", type: "Collaboration Tool",
    description: "<p>An empathy map is useful for designers, to better understand their target, and what's needed, moods, wants, and feelings.</p>",
    tags: ["UX", "Research"],
    content: {
      title: "Empathy Map",
      body: "<p><strong>Understanding your users deeply.</strong></p><p>Use this template to map out what your users think, feel, say, and do. This helps build empathy and design better solutions.</p>",
      additionalContent: "whiteboard",
      whiteboardPreview: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      references: [],
      responseOptions: { comments: true, collection: "whiteboards" },
    }
  },
  t7: {
    id: "t7", name: "SWOT Analysis", type: "Whiteboard",
    description: "<p>A SWOT analysis whiteboard template for systematically evaluating Strengths, Weaknesses, Opportunities, and Threats.</p>",
    tags: ["Strategy", "SWOT"],
    content: {
      title: "SWOT Analysis",
      body: "",
      additionalContent: "whiteboard",
      whiteboardPreview: "https://images.unsplash.com/photo-1731924532579-d23ed102496c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      references: [],
      responseOptions: { comments: false, collection: "none" },
    }
  },
  t8: {
    id: "t8", name: "Notes", type: "Whiteboard",
    description: "<p>Use this template to capture your ideas, notes, thoughts, insights, etc. per group. Use the designated block in the template to summarize key insights.</p>",
    tags: ["Ideation", "Workshop"],
    content: {
      title: "Notes",
      body: "",
      additionalContent: "whiteboard",
      whiteboardPreview: "https://images.unsplash.com/photo-1768796370577-c6e8b708b980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      references: [],
      responseOptions: { comments: false, collection: "none" },
    }
  },
  t11: {
    id: "t11", name: "Preparation Canvas", type: "Whiteboard",
    description: "<p>Complete this canvas before meeting to define your goal, focus on the people, solve the right problem, and think of everything as a system.</p>",
    tags: ["Planning", "Preparation"],
    content: {
      title: "Preparation Canvas",
      body: "",
      additionalContent: "whiteboard",
      whiteboardPreview: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      references: [],
      responseOptions: { comments: false, collection: "none" },
    }
  },
  t12: {
    id: "t12", name: "Stakeholder Map", type: "Whiteboard",
    description: "<p>Map the relationships and influence levels of all stakeholders in your project or initiative.</p>",
    tags: ["Stakeholders"],
    content: {
      title: "Stakeholder Map",
      body: "",
      additionalContent: "whiteboard",
      whiteboardPreview: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
      references: [],
      responseOptions: { comments: false, collection: "none" },
    }
  },
  t9: {
    id: "t9", name: "Sprint Retro", type: "Post",
    description: "<p>A retrospective post template for sprint reviews.</p>",
    tags: ["Retro"],
    content: {
      title: "Sprint Retrospective",
      body: "<p><strong>What went well?</strong></p><p></p><p><strong>What could be improved?</strong></p><p></p><p><strong>What will we try next?</strong></p>",
      additionalContent: "none",
      references: [],
      responseOptions: { comments: true, collection: "posts" },
    }
  },
  t13: {
    id: "t13", name: "Idea Collection", type: "Post",
    description: "<p>Use this template to gather ideas, suggestions, and innovations in a structured way.</p>",
    tags: ["Ideation", "Brainstorm"],
    content: {
      title: "Share Your Ideas",
      body: "<p><strong>We want to hear from you!</strong></p><p>Share your ideas, suggestions, and innovations. Any form is welcome — describe your idea and explain why it matters.</p>",
      additionalContent: "none",
      references: [],
      responseOptions: { comments: true, collection: "posts" },
    }
  },
  t10: {
    id: "t10", name: "Knowledge Sharing Community", type: "Community Guidelines",
    description: "<p>Guidelines to maximize your experience in a knowledge-sharing community 🌱</p>",
    tags: ["Knowledge Sharing", "Online Community"],
    content: {
      title: "United in Knowledge: Key Guidelines for Success",
      body: "<p><strong>Community Guidelines for [Community Name]</strong></p><p><strong>Introduction</strong></p><p>Welcome to [Community Name]! Our community gathers passionate individuals who share a deep interest in [topic]. Here, we learn, share insights, and support each other. To ensure a positive and productive environment, we have established these guidelines.</p><p><strong>Key Guidelines</strong></p><ol><li><strong>Respect and Empathy</strong><ul><li>Treat every member with kindness and respect. Avoid harassment or derogatory remarks.</li><li>Approach disagreements constructively and understand diverse perspectives.</li></ul></li><li><strong>Share Knowledge Generously</strong><ul><li>Share your expertise and resources generously, ensuring accuracy.</li><li>Cite sources to maintain credibility and allow further exploration.</li></ul></li><li><strong>Stay On-Topic</strong><ul><li>Keep discussions relevant to [topic] to ensure the community remains valuable.</li><li>Use appropriate channels for specific content or questions.</li></ul></li><li><strong>Protect Privacy</strong><ul><li>Respect members' privacy. Do not share personal information without consent.</li><li>Anonymize details when discussing real-life examples.</li></ul></li><li><strong>Engage Positively</strong><ul><li>Be an active participant. Engage with others' posts by asking questions and providing feedback.</li><li>Celebrate community successes and appreciate members' efforts.</li></ul></li></ol><p><strong>Conclusion</strong></p><p>By following these guidelines, we create a supportive and inspiring environment. Let's collaborate, share, and grow together!</p>",
      additionalContent: "none",
      references: [],
      responseOptions: { comments: false, collection: "none" },
    }
  },
  t14: {
    id: "t14", name: "Innovation Community Code", type: "Community Guidelines",
    description: "<p>A code of conduct for innovation-focused communities promoting creative collaboration.</p>",
    tags: ["Innovation", "Conduct"],
    content: {
      title: "Innovation Community Guidelines",
      body: "<p><strong>Our Innovation Values</strong></p><p>We believe in the power of diverse perspectives and constructive collaboration to drive innovation.</p><ul><li><strong>Experiment Boldly</strong> — Share half-formed ideas without fear of judgment</li><li><strong>Build on Others' Ideas</strong> — Use \"Yes, and...\" rather than \"No, but...\"</li><li><strong>Embrace Failure</strong> — Every failed experiment teaches us something valuable</li><li><strong>Stay Curious</strong> — Ask questions, challenge assumptions respectfully</li><li><strong>Give Credit</strong> — Acknowledge contributions and inspirations</li></ul>",
      additionalContent: "none",
      references: [{ title: "Innovation Principles", url: "https://example.com/innovation" }],
      responseOptions: { comments: false, collection: "none" },
    }
  },
};

// Fallback for unknown templates
function getTemplate(id: string) {
  if (TEMPLATE_DATA[id]) return TEMPLATE_DATA[id];

  // Fallback: look up from shared template library data
  const libTemplate = ALL_TEMPLATES.find(t => t.id === id);
  if (libTemplate) {
    return {
      id: libTemplate.id,
      name: libTemplate.name,
      type: libTemplate.type,
      description: `<p>${libTemplate.description}</p>`,
      tags: libTemplate.tags || [],
      content: {
        title: libTemplate.name,
        body: "",
        additionalContent: "none",
        references: [],
        responseOptions: { comments: true, collection: "none" },
        innovationFlow: libTemplate.type === "Subspace" && libTemplate.structure?.stages
          ? { phases: libTemplate.structure.stages.map((s: any) => ({ name: s.name, description: "", collaborationTools: (s.posts || []).map((p: string) => ({ name: p, type: "Collaboration Tool" })) })) }
          : undefined,
      }
    };
  }

  return {
    id, name: "Unknown Template", type: "Collaboration Tool",
    description: "<p>Template description.</p>",
    tags: [],
    content: {
      title: "Template", body: "<p>Content here.</p>",
      additionalContent: "none", references: [],
      responseOptions: { comments: true, collection: "none" },
    }
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved";

function useSectionSave() {
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({});

  const save = useCallback((id: string, onCommit: () => void) => {
    setStatuses(s => ({ ...s, [id]: "saving" }));
    setTimeout(() => {
      onCommit();
      setStatuses(s => ({ ...s, [id]: "saved" }));
      setTimeout(() => setStatuses(s => ({ ...s, [id]: "idle" })), 1800);
    }, 600);
  }, []);

  return { statuses, save };
}

function InlineSaveButton({ dirty, status, onSave }: { dirty: boolean; status: SaveStatus; onSave: () => void }) {
  if (status === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-caption text-emerald-600 animate-in fade-in slide-in-from-left-1 duration-200">
        <Check className="w-3 h-3" /> Saved
      </span>
    );
  }
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-caption text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (!dirty) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSave}
      className="h-6 px-2 text-caption text-primary hover:text-primary hover:bg-primary/10 animate-in fade-in slide-in-from-left-1 duration-200"
    >
      Save
    </Button>
  );
}

// ─── About Tab ───────────────────────────────────────────────────────────────

function TemplateAboutTab({ template }: { template: ReturnType<typeof getTemplate> }) {
  const [name, setName] = useState(template.name);
  const [savedName, setSavedName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [savedDescription, setSavedDescription] = useState(template.description);
  const [tags, setTags] = useState(template.tags);
  const [savedTags, setSavedTags] = useState(template.tags);
  const [tagInput, setTagInput] = useState("");
  const navigate = useNavigate();
  const { packSlug } = useParams();
  const { statuses, save } = useSectionSave();

  const dirty = {
    name: name !== savedName,
    description: description !== savedDescription,
    tags: JSON.stringify(tags) !== JSON.stringify(savedTags),
  };

  const saveSection = (id: string) => {
    save(id, () => {
      if (id === "name") setSavedName(name);
      if (id === "description") setSavedDescription(description);
      if (id === "tags") setSavedTags([...tags]);
      toast.success("Saved");
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-page-title">About</h2>
        <p className="text-muted-foreground mt-2">Template metadata and description.</p>
      </div>

      <Separator />

      {/* Name */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Template Name</Label>
          <InlineSaveButton dirty={dirty.name} status={statuses["name"] || "idle"} onSave={() => saveSection("name")} />
        </div>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-muted/50 border-border" />
      </section>

      <Separator />

      {/* Description */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Template Description</Label>
          <InlineSaveButton dirty={dirty.description} status={statuses["description"] || "idle"} onSave={() => saveSection("description")} />
        </div>
        <p className="text-caption text-muted-foreground">Explain what this template is for and when to use it.</p>
        <div className="[&_.ql-editor]:min-h-[100px]">
          <ReactQuill theme="snow" value={description} onChange={setDescription} modules={quillModules} />
        </div>
      </section>

      <Separator />

      {/* Tags */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Tags</Label>
          <InlineSaveButton dirty={dirty.tags} status={statuses["tags"] || "idle"} onSave={() => saveSection("tags")} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag…"
            className="w-32 h-7 text-body bg-muted/50 border-border"
          />
        </div>
      </section>
    </div>
  );
}

// ─── Content Tab ─────────────────────────────────────────────────────────────

function TemplateContentTab({ template }: { template: ReturnType<typeof getTemplate> }) {
  const [content, setContent] = useState(template.content);
  const [savedContent, setSavedContent] = useState(template.content);
  const [sourceUrl, setSourceUrl] = useState(template.content.sourceUrl || "");
  const [isLoaded, setIsLoaded] = useState(!!(template.content.innovationFlow?.phases?.length));
  const [activePhase, setActivePhase] = useState(0);
  const { statuses, save } = useSectionSave();

  const dirty = {
    title: content.title !== savedContent.title,
    body: content.body !== savedContent.body,
    flow: JSON.stringify(content.innovationFlow) !== JSON.stringify(savedContent.innovationFlow),
    whiteboard: content.whiteboardPreview !== savedContent.whiteboardPreview || content.additionalContent !== savedContent.additionalContent,
    references: JSON.stringify(content.references) !== JSON.stringify(savedContent.references),
    responseOptions: JSON.stringify(content.responseOptions) !== JSON.stringify(savedContent.responseOptions),
  };

  const saveSection = (id: string) => {
    save(id, () => {
      setSavedContent({ ...content });
      toast.success("Saved");
    });
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  };

  // ─── Space / Subspace type: Link to source + Innovation Flow preview ─────────
  if (template.type === "Space" || template.type === "Subspace") {
    const handleLoad = () => {
      if (!sourceUrl.trim()) {
        toast.error("Please enter a URL to a space or subspace");
        return;
      }
      // Simulate loading - in production this would fetch the innovation flow
      setIsLoaded(true);
      toast.success("Innovation flow loaded from source");
    };

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-page-title">Content</h2>
          <p className="text-muted-foreground mt-2">
            Provide a link to a {template.type === "Space" ? "space" : "subspace"} to use as the template source.
          </p>
        </div>

        <Separator />

        {/* Source URL */}
        <section className="space-y-3">
          <Label className="text-label uppercase text-muted-foreground">Source {template.type}</Label>
          <div className="flex items-center gap-3">
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder={`https://alkem.io/${template.type === "Space" ? "space-name" : "space/subspace-name"}`}
              className="flex-1 bg-muted/50 border-border"
            />
            <Button
              variant="outline"
              onClick={handleLoad}
              className="shrink-0 gap-2"
            >
              Load
            </Button>
          </div>
          <p className="text-caption text-muted-foreground">
            Paste a link to an existing {template.type === "Space" ? "space" : "subspace"} to import its innovation flow.
          </p>
        </section>

        {/* Innovation Flow Preview (shown after loading) */}
        {isLoaded && content.innovationFlow?.phases && (
          <>
            <Separator />

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-label uppercase text-muted-foreground">Innovation Flow</Label>
                <InlineSaveButton dirty={dirty.flow} status={statuses["flow"] || "idle"} onSave={() => saveSection("flow")} />
              </div>

              {/* Flow stages as tab-like navigation */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-6 px-4 overflow-x-auto border-b border-border bg-muted/30">
                  {content.innovationFlow.phases.map((phase, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePhase(i)}
                      className={`pb-2 pt-3 text-control border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                        i === activePhase
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {phase.name}
                    </button>
                  ))}
                </div>
                <div className="p-4 space-y-2">
                  {content.innovationFlow.phases[activePhase]?.collaborationTools.map((tool, i) => (
                    <div key={i} className="flex items-center gap-2 text-body text-muted-foreground bg-muted/50 p-2.5 rounded-md border border-border/50">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                      {tool.name}
                      <Badge variant="outline" className="ml-auto text-badge font-normal h-4 px-1.5">{tool.type}</Badge>
                    </div>
                  ))}
                  {(!content.innovationFlow.phases[activePhase]?.collaborationTools || content.innovationFlow.phases[activePhase].collaborationTools.length === 0) && (
                    <p className="text-body text-muted-foreground py-4">No collaboration tools in this phase.</p>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    );
  }

  // ─── Whiteboard type: Whiteboard canvas only ─────────────────────────────────
  if (template.type === "Whiteboard") {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-page-title">Content</h2>
          <p className="text-muted-foreground mt-2">
            The whiteboard that gets created when someone uses this template.
          </p>
        </div>

        <Separator />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-label uppercase text-muted-foreground">Whiteboard</Label>
            <InlineSaveButton dirty={dirty.whiteboard} status={statuses["whiteboard"] || "idle"} onSave={() => saveSection("whiteboard")} />
          </div>
          <div className="relative rounded-lg border border-border overflow-hidden bg-muted aspect-[16/9]">
            {content.whiteboardPreview ? (
              <img src={content.whiteboardPreview} alt="Whiteboard preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                <FileText className="w-16 h-16" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 shadow-md"
                onClick={() => toast.info("Open whiteboard editor (placeholder)")}
              >
                <Pencil className="w-4 h-4" /> Edit Whiteboard
              </Button>
            </div>
          </div>
          <p className="text-caption text-muted-foreground">Click to open the full whiteboard editor.</p>
        </section>
      </div>
    );
  }

  // ─── Post type: Title + Description ───────────────────────────────────────────
  if (template.type === "Post") {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-page-title">Content</h2>
          <p className="text-muted-foreground mt-2">
            The post content that gets created when someone uses this template.
          </p>
        </div>

        <Separator />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-label uppercase text-muted-foreground">Post Title</Label>
            <InlineSaveButton dirty={dirty.title} status={statuses["title"] || "idle"} onSave={() => saveSection("title")} />
          </div>
          <Input
            value={content.title}
            onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
            className="bg-muted/50 border-border"
          />
        </section>

        <Separator />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-label uppercase text-muted-foreground">Description</Label>
            <InlineSaveButton dirty={dirty.body} status={statuses["body"] || "idle"} onSave={() => saveSection("body")} />
          </div>
          <div className="[&_.ql-editor]:min-h-[200px]">
            <ReactQuill
              theme="snow"
              value={content.body}
              onChange={(value) => setContent(prev => ({ ...prev, body: value }))}
              modules={quillModules}
            />
          </div>
        </section>
      </div>
    );
  }

  // ─── Community Guidelines type: Title + Body (rich text only) ─────────────────
  if (template.type === "Community Guidelines") {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-page-title">Content</h2>
          <p className="text-muted-foreground mt-2">
            The community guidelines text that members will see.
          </p>
        </div>

        <Separator />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-label uppercase text-muted-foreground">Guidelines Title</Label>
            <InlineSaveButton dirty={dirty.title} status={statuses["title"] || "idle"} onSave={() => saveSection("title")} />
          </div>
          <Input
            value={content.title}
            onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
            className="bg-muted/50 border-border"
          />
        </section>

        <Separator />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-label uppercase text-muted-foreground">Guidelines Body</Label>
            <InlineSaveButton dirty={dirty.body} status={statuses["body"] || "idle"} onSave={() => saveSection("body")} />
          </div>
          <div className="[&_.ql-editor]:min-h-[300px]">
            <ReactQuill
              theme="snow"
              value={content.body}
              onChange={(value) => setContent(prev => ({ ...prev, body: value }))}
              modules={quillModules}
            />
          </div>
        </section>
      </div>
    );
  }

  // ─── Collaboration Tool type: Post + Whiteboard ──────────────────────────────
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-page-title">Content</h2>
        <p className="text-muted-foreground mt-2">
          The post and attached whiteboard that get created when someone uses this template.
        </p>
      </div>

      <Separator />

      {/* Post section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Post Title</Label>
          <InlineSaveButton dirty={dirty.title} status={statuses["title"] || "idle"} onSave={() => saveSection("title")} />
        </div>
        <Input
          value={content.title}
          onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
          className="bg-muted/50 border-border"
        />
      </section>

      <Separator />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Post Body</Label>
          <InlineSaveButton dirty={dirty.body} status={statuses["body"] || "idle"} onSave={() => saveSection("body")} />
        </div>
        <div className="[&_.ql-editor]:min-h-[140px]">
          <ReactQuill
            theme="snow"
            value={content.body}
            onChange={(value) => setContent(prev => ({ ...prev, body: value }))}
            modules={quillModules}
          />
        </div>
      </section>

      <Separator />

      {/* Whiteboard section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Attached Whiteboard</Label>
          <InlineSaveButton dirty={dirty.whiteboard} status={statuses["whiteboard"] || "idle"} onSave={() => saveSection("whiteboard")} />
        </div>
        <div className="relative rounded-lg border border-border overflow-hidden bg-muted aspect-[16/9] max-w-lg">
          {content.whiteboardPreview ? (
            <img src={content.whiteboardPreview} alt="Whiteboard preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
              <FileText className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/10">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 shadow-md"
              onClick={() => toast.info("Open whiteboard editor (placeholder)")}
            >
              <Pencil className="w-4 h-4" /> Edit Whiteboard
            </Button>
          </div>
        </div>
        <p className="text-caption text-muted-foreground">The whiteboard content that is attached to this collaboration tool.</p>
      </section>

      <Separator />

      {/* References */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">References</Label>
          <InlineSaveButton dirty={dirty.references} status={statuses["references"] || "idle"} onSave={() => saveSection("references")} />
        </div>
        <div className="space-y-2">
          {content.references.map((ref, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={ref.title}
                onChange={(e) => {
                  const newRefs = [...content.references];
                  newRefs[i] = { ...newRefs[i], title: e.target.value };
                  setContent(prev => ({ ...prev, references: newRefs }));
                }}
                placeholder="Title"
                className="flex-1 bg-muted/50 border-border"
              />
              <Input
                value={ref.url}
                onChange={(e) => {
                  const newRefs = [...content.references];
                  newRefs[i] = { ...newRefs[i], url: e.target.value };
                  setContent(prev => ({ ...prev, references: newRefs }));
                }}
                placeholder="https://..."
                className="flex-1 bg-muted/50 border-border"
              />
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setContent(prev => ({ ...prev, references: prev.references.filter((_, idx) => idx !== i) }))}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setContent(prev => ({ ...prev, references: [...prev.references, { title: "", url: "" }] }))}
          >
            <Plus className="w-3 h-3" /> Add Reference
          </Button>
        </div>
      </section>

      <Separator />

      {/* Response Options */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-label uppercase text-muted-foreground">Response Options</Label>
          <InlineSaveButton dirty={dirty.responseOptions} status={statuses["responseOptions"] || "idle"} onSave={() => saveSection("responseOptions")} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start justify-between space-x-4 p-3 rounded-lg border bg-muted/20">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-muted-foreground">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-body-emphasis">Comments</p>
                <p className="text-caption text-muted-foreground leading-snug">Allow community members to comment</p>
              </div>
            </div>
            <Switch
              checked={content.responseOptions.comments}
              onCheckedChange={(checked) => setContent(prev => ({ ...prev, responseOptions: { ...prev.responseOptions, comments: checked } }))}
            />
          </div>

          <div className="flex items-start justify-between space-x-4 p-3 rounded-lg border bg-muted/20">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-muted-foreground">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-body-emphasis">Collection</p>
                <p className="text-caption text-muted-foreground leading-snug">Allow members to submit contributions</p>
              </div>
            </div>
            <Select
              value={content.responseOptions.collection}
              onValueChange={(v) => setContent(prev => ({ ...prev, responseOptions: { ...prev.responseOptions, collection: v } }))}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="links">Links & Files</SelectItem>
                <SelectItem value="posts">Posts</SelectItem>
                <SelectItem value="whiteboards">Whiteboards</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Danger Zone ─────────────────────────────────────────────────────────────

function DangerZone({ template }: { template: ReturnType<typeof getTemplate> }) {
  const navigate = useNavigate();
  const { packSlug } = useParams();

  return (
    <section className="space-y-4">
      <Label className="text-label uppercase text-muted-foreground">Danger Zone</Label>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
            <Trash2 className="w-4 h-4" /> Delete Template
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{template.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                toast.success("Template deleted");
                navigate(packSlug ? `/templates/packs/${packSlug}/settings/templates` : `/templates`);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function TemplateSettingsPage() {
  const { packSlug, templateId } = useParams<{ packSlug?: string; templateId: string }>();

  const template = getTemplate(templateId || "");

  return (
    <div
      className="flex flex-col w-full px-6 md:px-8"
      style={{ paddingBottom: 48, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Sticky header with title */}
      <div className="sticky top-16 z-20 border-b border-border bg-card -mx-6 md:-mx-8 px-6 md:px-8 pt-8 pb-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-page-title">{template.name}</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-caption">{template.type}</Badge>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10">
            <div
              className="w-full p-6 md:p-8 shadow-sm"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              <div className="space-y-10">
                <TemplateAboutTab template={template} />
                <Separator />
                <TemplateContentTab template={template} />
                <Separator />
                <DangerZone template={template} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
