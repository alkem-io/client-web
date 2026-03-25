import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Users,
  Sparkles,
  Globe,
  Target,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import AlkemioLogo from "@/imports/AlkemioLogo";

const INTERESTS = [
  "Innovation",
  "Sustainability",
  "Education",
  "Health",
  "Urban Planning",
  "AI & Technology",
  "Social Impact",
  "Community Building",
  "Circular Economy",
  "Climate Action",
  "Data Science",
  "Entrepreneurship",
];

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Alkemio",
    subtitle: "Let's set up your profile and connect you with the right spaces.",
    icon: Sparkles,
  },
  {
    id: "interests",
    title: "What are you interested in?",
    subtitle: "Select topics that matter to you. We'll recommend relevant spaces.",
    icon: Lightbulb,
  },
  {
    id: "goals",
    title: "What brings you here?",
    subtitle: "Understanding your goals helps us personalize your experience.",
    icon: Target,
  },
  {
    id: "ready",
    title: "You're all set!",
    subtitle: "Start exploring spaces and connecting with your community.",
    icon: Check,
  },
];

const GOALS = [
  {
    id: "collaborate",
    icon: Users,
    title: "Collaborate on challenges",
    desc: "Work with others to solve complex problems",
  },
  {
    id: "explore",
    icon: Globe,
    title: "Explore new ideas",
    desc: "Discover innovative approaches and solutions",
  },
  {
    id: "lead",
    icon: Target,
    title: "Lead a space or initiative",
    desc: "Create and manage your own collaborative space",
  },
  {
    id: "connect",
    icon: Sparkles,
    title: "Connect with experts",
    desc: "Find and engage with domain specialists",
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const step = STEPS[currentStep];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedInterests.length > 0;
    if (currentStep === 2) return selectedGoals.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{
        background: "var(--background)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Logo */}
      <div className="mb-10 w-40">
        <AlkemioLogo />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === currentStep ? 32 : 12,
              background:
                i <= currentStep ? "var(--primary)" : "var(--border)",
            }}
          />
        ))}
      </div>

      {/* Content Card */}
      <div
        className="w-full max-w-lg"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "40px 32px",
        }}
      >
        {/* Step icon + title */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <step.icon className="w-6 h-6" />
          </div>
          <h1
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            {step.title}
          </h1>
          <p
            className="max-w-sm mx-auto mt-2"
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--muted-foreground)",
              lineHeight: 1.6,
            }}
          >
            {step.subtitle}
          </p>
        </div>

        {/* Step Content */}
        {currentStep === 0 && (
          <div
            className="p-4 rounded-md text-center"
            style={{
              background: "var(--secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ fontSize: "var(--text-sm)", color: "var(--foreground)" }}>
              Alkemio is a collaborative platform where people and organizations come together to
              tackle societal challenges. This quick setup will help personalize your experience.
            </p>
          </div>
        )}

        {currentStep === 1 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={cn(
                  "px-3.5 py-2 rounded-full transition-colors",
                  selectedInterests.includes(interest)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                )}
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--font-weight-medium)" as any,
                  border: selectedInterests.includes(interest)
                    ? "1px solid var(--primary)"
                    : "1px solid var(--border)",
                }}
              >
                {selectedInterests.includes(interest) && (
                  <Check className="w-3.5 h-3.5 inline mr-1.5" />
                )}
                {interest}
              </button>
            ))}
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className="flex items-start gap-3 p-4 rounded-md text-left transition-colors"
                style={{
                  border: selectedGoals.includes(goal.id)
                    ? "2px solid var(--primary)"
                    : "1px solid var(--border)",
                  background: selectedGoals.includes(goal.id)
                    ? "color-mix(in srgb, var(--primary) 5%, transparent)"
                    : "var(--background)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: selectedGoals.includes(goal.id)
                      ? "var(--primary)"
                      : "var(--secondary)",
                    color: selectedGoals.includes(goal.id)
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                  }}
                >
                  <goal.icon className="w-4 h-4" />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--foreground)",
                    }}
                  >
                    {goal.title}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--muted-foreground)",
                      marginTop: 2,
                    }}
                  >
                    {goal.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-md space-y-3"
              style={{
                background: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" style={{ color: "var(--primary)" }} />
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  Your Interests
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedInterests.map((i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full"
                    style={{
                      fontSize: "12px",
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="p-4 rounded-md space-y-3"
              style={{
                background: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: "var(--primary)" }} />
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  Your Goals
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GOALS.filter((g) => selectedGoals.includes(g.id)).map((g) => (
                  <span
                    key={g.id}
                    className="px-2.5 py-1 rounded-full"
                    style={{
                      fontSize: "12px",
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {g.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          {currentStep > 0 ? (
            <Button
              variant="ghost"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/")}>
              Skip for now
            </Button>
          )}

          <Button onClick={handleNext} disabled={!canProceed()}>
            {currentStep === STEPS.length - 1 ? "Go to Dashboard" : "Continue"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
