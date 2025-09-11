import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Shield, Zap as ZapIcon, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  // Redirect to dashboard if already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Zap className="h-8 w-8 animate-pulse" />
            <span className="text-2xl font-bold">AdsConnect</span>
          </div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-8 w-8" />
            <span className="text-2xl font-bold">AdsConnect</span>
          </div>
          <Button asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Multi-Tenant Marketing Platform
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Connect your Google Sheets and Meta Ads data. Create campaigns with a guided wizard. 
            Manage everything from one clean, professional dashboard.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
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
              <h3 className="text-lg font-semibold">Multi-Tenant Security</h3>
              <p className="text-muted-foreground">
                Enterprise-grade row-level security ensures your data stays private and secure.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10">
                <ZapIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Seamless Integrations</h3>
              <p className="text-muted-foreground">
                Connect Google Sheets and Meta Ads with just a few clicks. Sync data automatically.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/10">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold">Powerful Dashboard</h3>
              <p className="text-muted-foreground">
                Track campaigns, jobs, and performance metrics in one beautiful interface.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
