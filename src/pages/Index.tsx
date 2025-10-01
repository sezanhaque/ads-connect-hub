import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, Shield, Zap as ZapIcon, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
const Index = () => {
  const {
    user
  } = useAuth();

  // Redirect to dashboard if already authenticated
  if (user) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Logo />
          <p className="text-muted-foreground font-now">Redirecting to dashboard...</p>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Logo />
          <Button asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-[1.2] text-5xl text-center">Recruitment Advertising Seen Clearly</h1>
          <p className="text-xl text-muted-foreground leading-relaxed font-now subtitle">Connect your favorite social platforms, launch campaigns in minutes, and track results in one clear dashboard. Strengthen your recruitment strategy with smarter data and sharper insights.</p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild variant="accent" className="text-foreground">
              <Link to="/auth">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">
                Sign In
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-serif-display font-semibold">Multi-Tenant Security</h3>
              <p className="text-muted-foreground font-now">
                Enterprise-grade row-level security ensures your data stays private and secure.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10">
                <ZapIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-serif-display font-semibold">Seamless Integrations</h3>
              <p className="text-muted-foreground font-now">
                Connect Meta Ads with perfect clarity. Sync data automatically with 20/20 precision.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/10">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-lg font-serif-display font-semibold">Crystal Clear Analytics</h3>
              <p className="text-muted-foreground font-now">
                Track campaigns, jobs, and performance metrics with perfect vision in one beautiful interface.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default Index;