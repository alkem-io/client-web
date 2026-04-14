import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Sparkles, ArrowRight, ShieldCheck, Network } from "lucide-react";
import { useState } from "react";

interface AnalyticsLoginProps {
  onLogin: () => void;
}

export function AnalyticsLogin({ onLogin }: AnalyticsLoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ background: 'var(--background)', fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: 'var(--elevation-sm)' }}>
            <Network className="w-8 h-8" />
         </div>
         <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--foreground)' }}>Ecosystem Analytics</h1>
         <p style={{ fontSize: 'var(--text-base)', color: 'var(--muted-foreground)' }}>by Alkemio</p>
      </div>

      <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 delay-100" style={{ border: '2px solid var(--border)', boxShadow: 'var(--elevation-sm)' }}>
        <CardHeader className="text-center pb-2">
          <CardTitle style={{ fontSize: 'var(--text-xl)', color: 'var(--foreground)' }}>Welcome, Alex</CardTitle>
          <CardDescription style={{ fontSize: 'var(--text-base)', color: 'var(--muted-foreground)' }}>
             This is a standalone tool. Your Alkemio account controls access to sensitive data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
           <div className="p-3 rounded-lg flex items-start gap-3" style={{ background: 'color-mix(in srgb, var(--primary) 8%, var(--background))', border: '1px solid color-mix(in srgb, var(--primary) 15%, transparent)' }}>
              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--foreground)', lineHeight: 1.5 }}>
                 You'll only see Spaces and connections you are authorized to access as a <strong>Portfolio Owner</strong>.
              </p>
           </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button 
            size="lg" 
            className="w-full gap-2" 
            style={{ fontSize: 'var(--text-base)', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
               <>Authenticating...</>
            ) : (
               <>
                 Sign in with Alkemio <ArrowRight className="w-4 h-4" />
               </>
            )}
          </Button>
          <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', textAlign: 'center' }}>
             v1.2.0 &middot; Build 8923
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}