import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Eye, EyeOff, Info, Fingerprint, HelpCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Footer } from "@/app/components/layout/Footer";
import AlkemioLogo from "@/imports/AlkemioLogo";

/* ─── Social Provider Icons ─── */
function PasskeyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 1C8.1 1 5 4.1 5 8c0 2.4 1.2 4.5 3 5.7V22l4-2 4 2v-8.3c1.8-1.2 3-3.4 3-5.7 0-3.9-3.1-7-7-7zm0 10c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 21 21" className="w-5 h-5">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0077B5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function OryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">C</text>
    </svg>
  );
}

/* ─── Floating Label Input ─── */
function FloatingInput({
  label,
  type = "text",
  required = false,
  value,
  onChange,
  endIcon,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  endIcon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className="relative rounded"
        style={{
          border: `${focused ? "2px" : "1px"} solid ${focused ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "4px",
          transition: "border-color 0.2s",
        }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent outline-none"
          style={{
            height: "56px",
            padding: "20px 14px 8px",
            paddingRight: endIcon ? "48px" : "14px",
            fontSize: "var(--text-base)",
            color: "var(--foreground)",
            fontFamily: "'Inter', sans-serif",
          }}
        />
        <label
          className="absolute left-3 pointer-events-none transition-all duration-200"
          style={{
            top: isFloating ? "6px" : "50%",
            transform: isFloating ? "none" : "translateY(-50%)",
            fontSize: isFloating ? "12px" : "var(--text-base)",
            color: focused ? "var(--primary)" : "var(--muted-foreground)",
            background: "white",
            padding: "0 4px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {label}{required && " *"}
        </label>
        {endIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: "var(--muted-foreground)" }}>
            {endIcon}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Social Login Buttons Row ─── */
function SocialButtons({ showPasskey = true }: { showPasskey?: boolean }) {
  const providers = [
    ...(showPasskey ? [{ icon: <PasskeyIcon />, label: "Passkey" }] : []),
    { icon: <MicrosoftIcon />, label: "Microsoft" },
    { icon: <LinkedInIcon />, label: "LinkedIn" },
    { icon: <GitHubIcon />, label: "GitHub" },
    { icon: <OryIcon />, label: "Ory" },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {providers.map((p) => (
        <button
          key={p.label}
          className="flex items-center justify-center rounded-full border hover:bg-accent transition-colors"
          style={{
            width: "48px",
            height: "48px",
            borderColor: "var(--border)",
            background: "var(--card)",
          }}
          title={`Continue with ${p.label}`}
        >
          {p.icon}
        </button>
      ))}
    </div>
  );
}

/* ─── Divider ─── */
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", fontFamily: "'Inter', sans-serif" }}>
        or continue with
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

/* ─── Auth Card Wrapper ─── */
function AuthCard({
  children,
  title,
  showSignUp,
  showSignIn,
  onNavigate,
}: {
  children: React.ReactNode;
  title: string;
  showSignUp?: boolean;
  showSignIn?: boolean;
  onNavigate: (route: string) => void;
}) {
  return (
    <div
      className="w-full relative"
      style={{
        background: "var(--card)",
        borderRadius: "8px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        padding: "32px 36px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Logo + Account toggle row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="w-36 h-5 relative">
            <AlkemioLogo />
          </div>
          <p
            className="mt-1.5"
            style={{
              fontSize: "11px",
              color: "var(--muted-foreground)",
            }}
          >
            Safe Spaces for Collaboration
          </p>
        </div>
        {showSignUp && (
          <div className="text-right">
            <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>No account?</span>
            <br />
            <button
              onClick={() => onNavigate("sign-up")}
              className="font-semibold hover:underline"
              style={{ fontSize: "var(--text-sm)", color: "var(--foreground)" }}
            >
              Sign up
            </button>
          </div>
        )}
        {showSignIn && (
          <div className="text-right">
            <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>Have an account?</span>
            <br />
            <button
              onClick={() => onNavigate("sign-in")}
              className="font-semibold hover:underline"
              style={{ fontSize: "var(--text-sm)", color: "var(--foreground)" }}
            >
              Sign in
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h1
        className="mb-6"
        style={{
          fontSize: "var(--text-3xl)",
          fontWeight: 700,
          color: "var(--foreground)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>

      {children}
    </div>
  );
}

/* ─── Main Auth Page V3 — Soft Gradient Background ─── */
type AuthView = "sign-in" | "sign-up" | "sign-up-password" | "verify" | "recovery";

export default function AuthPageV3() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<AuthView>("sign-in");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleNavigate = (route: string) => {
    setView(route as AuthView);
  };

  const handleSignIn = () => {
    setIsLoggingIn(true);
    setTimeout(() => navigate("/"), 1200);
  };

  const handleSignUpNext = () => {
    setView("sign-up-password");
  };

  const handleSignUpSubmit = () => {
    setView("verify");
  };

  const handleRecovery = () => {};

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background: Soft multi-stop gradient */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        {/* Primary gradient — very soft warm-to-cool sweep */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(145deg, #f8fafc 0%, #eef4f9 25%, #f0f7fc 45%, #f5f0f8 65%, #faf5f0 85%, #f8fafc 100%)",
          }}
        />

        {/* Subtle radial orbs for depth */}
        <div
          className="absolute"
          style={{
            top: "10%",
            left: "5%",
            width: "50vw",
            height: "50vh",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(9,188,212,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "5%",
            right: "10%",
            width: "45vw",
            height: "45vh",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(168,85,247,0.04) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "40%",
            left: "30%",
            width: "40vw",
            height: "40vh",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(59,130,246,0.035) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main content area */}
      <div
        className="flex-1 flex items-center justify-end relative z-10 px-6 md:px-12 lg:px-24 xl:px-32 py-12"
        style={{
          opacity: isLoggingIn ? 0 : 1,
          transform: isLoggingIn ? "translateY(-40px) scale(0.97)" : "translateY(0) scale(1)",
          transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="w-full max-w-[420px]">
        {/* Auth Card */}
        {view === "sign-in" && (
          <AuthCard title="Sign in" showSignUp onNavigate={handleNavigate}>
            <div className="space-y-5">
              <FloatingInput
                label="E-Mail"
                type="email"
                required
                value={email}
                onChange={setEmail}
              />
              <FloatingInput
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={setPassword}
                endIcon={
                  <button onClick={() => setShowPassword(!showPassword)} className="p-1">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              <button
                onClick={() => setView("recovery")}
                className="hover:underline"
                style={{ fontSize: "var(--text-sm)", color: "var(--primary)" }}
              >
                Forgot password?
              </button>
              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                }}
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <OrDivider />
              <SocialButtons showPasskey />
            </div>
          </AuthCard>
        )}

        {view === "sign-up" && (
          <AuthCard title="Sign up" showSignIn onNavigate={handleNavigate}>
            <div className="space-y-5">
              <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                Alkemio is designed to benefit society. Please read and accept the{" "}
                <a href="#" className="underline font-medium" style={{ color: "var(--foreground)" }}>Terms of Use</a>{" "}
                and{" "}
                <a href="#" className="underline font-medium" style={{ color: "var(--foreground)" }}>Privacy Policy</a>{" "}
                before you continue.
              </p>

              <div className="flex items-start gap-2">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(v) => setTermsAccepted(!!v)}
                  className="mt-0.5"
                />
                <label style={{ fontSize: "var(--text-sm)", color: "var(--foreground)", lineHeight: 1.5 }}>
                  I accept the{" "}
                  <a href="#" className="underline font-medium">Terms of Use</a>{" "}
                  and{" "}
                  <a href="#" className="underline font-medium">Privacy Policy</a>.
                </label>
              </div>

              <FloatingInput
                label="E-Mail"
                type="email"
                required
                value={email}
                onChange={setEmail}
              />
              <FloatingInput
                label="First Name"
                required
                value={firstName}
                onChange={setFirstName}
              />
              <FloatingInput
                label="Last Name"
                required
                value={lastName}
                onChange={setLastName}
              />

              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  background: termsAccepted ? "var(--primary)" : "var(--muted)",
                  color: termsAccepted ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                  cursor: termsAccepted ? "pointer" : "not-allowed",
                }}
                disabled={!termsAccepted}
                onClick={handleSignUpNext}
              >
                Next
              </Button>

              <OrDivider />
              <SocialButtons showPasskey={false} />
            </div>
          </AuthCard>
        )}

        {view === "sign-up-password" && (
          <AuthCard title="Sign up" showSignIn onNavigate={handleNavigate}>
            <div className="space-y-5">
              <div
                className="flex items-center gap-3 p-3 rounded"
                style={{
                  background: "rgba(29, 56, 74, 0.06)",
                  border: "1px solid rgba(29, 56, 74, 0.12)",
                }}
              >
                <Info className="w-4 h-4 shrink-0" style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "var(--text-sm)", color: "var(--primary)" }}>
                  Pick a password for your account
                </span>
              </div>

              <FloatingInput
                label="Password"
                type={showSignUpPassword ? "text" : "password"}
                required
                value={signUpPassword}
                onChange={setSignUpPassword}
                endIcon={
                  <button onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="p-1">
                    {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />

              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                }}
                onClick={handleSignUpSubmit}
              >
                Next
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                  borderColor: "var(--primary)",
                  color: "var(--primary)",
                }}
                onClick={() => setView("sign-up")}
              >
                Back
              </Button>

              <OrDivider />

              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold gap-2"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                }}
              >
                <Fingerprint className="w-4 h-4" />
                Sign Up with Passkey
              </Button>

              <OrDivider />
              <SocialButtons showPasskey={false} />
            </div>
          </AuthCard>
        )}

        {view === "verify" && (
          <AuthCard title="Sign up" showSignIn onNavigate={handleNavigate}>
            <div className="space-y-6">
              <p style={{ fontSize: "var(--text-base)", color: "var(--muted-foreground)", lineHeight: 1.7 }}>
                The last step is to verify your email address. Please check your inbox for an email with instructions.
              </p>
              <p style={{ fontSize: "var(--text-base)", color: "var(--foreground)", lineHeight: 1.7 }}>
                If you have not received an email,{" "}
                <button className="underline font-medium hover:opacity-80">
                  click here to send it again.
                </button>
              </p>
            </div>
          </AuthCard>
        )}

        {view === "recovery" && (
          <AuthCard title="Password recovery" showSignUp onNavigate={handleNavigate}>
            <div className="space-y-5">
              <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                Please enter your email address below to receive a recovery link that will allow you to reset your password.
              </p>
              <FloatingInput
                label="E-Mail"
                type="email"
                required
                value={email}
                onChange={setEmail}
              />
              <Button
                size="lg"
                className="w-full uppercase tracking-wider font-semibold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  height: "48px",
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.5px",
                }}
                onClick={handleRecovery}
              >
                Continue
              </Button>
            </div>
          </AuthCard>
        )}
        </div>
      </div>

      {/* Help widget */}
      <button
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg hover:scale-105 transition-transform"
        style={{
          width: "48px",
          height: "48px",
          background: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Footer */}
      <div className="relative z-10">
        <Footer className="bg-transparent border-t-0" />
      </div>
    </div>
  );
}
