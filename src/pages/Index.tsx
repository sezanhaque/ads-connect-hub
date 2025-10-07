import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, Rocket, Sparkles, Eye, Shield, TrendingUp, BarChart3, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
const Index = () => {
  const {
    user
  } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  useEffect(() => {
    // Load HubSpot form script
    const script = document.createElement("script");
    script.src = "https://js-eu1.hsforms.net/forms/embed/147002455.js";
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
          <div className="flex-1 flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/platform-overview">Platform Overview</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              Request demo
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-10 md:py-20">
        <div className="text-center space-y-6 md:space-y-8 max-w-5xl mx-auto">
          <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(1.5rem,6vw,3.5rem)] text-center">Recruitment Advertising Seen Clearly</h1>
          <p className="text-base md:text-xl text-muted-foreground leading-relaxed font-now subtitle px-2">Connect your favorite social media platforms, launch campaigns in minutes, and track results in one clear dashboard. Strengthen your recruitment strategy with smarter data and sharper insights.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button size="lg" variant="accent" className="text-foreground w-full sm:w-auto" onClick={() => setIsFormOpen(true)}>
              Request demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="accent" asChild className="text-foreground w-full sm:w-auto">
              <a href="/TwentyTwentySolutions_One-pager.pdf" download>
                Download One-Pager
              </a>
            </Button>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Request demo</DialogTitle>
              </DialogHeader>
              <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
            </DialogContent>
          </Dialog>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-20 px-2">
            <div className="text-center space-y-3 md:space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-[clamp(1rem,2.5vw,1.125rem)] font-now font-semibold">Hire faster, work smarter</h3>
              <p className="text-sm md:text-base text-muted-foreground font-now">Traditional recruitment is slow and costly, but with AI-optimized campaigns you cut manual effort, reduce wasted spend, and fill roles faster while keeping full control over process and cost.</p>
            </div>
            
            <div className="text-center space-y-3 md:space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/10">
                <Sparkles className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-[clamp(1rem,2.5vw,1.125rem)] font-now font-semibold">Campaigns built in minutes</h3>
              <p className="text-sm md:text-base text-muted-foreground font-now">Creating recruitment ads doesn’t have to be complex, with our guided flow you can launch complete campaigns in just a few steps, without needing marketing expertise or external agencies.</p>
            </div>
            
            <div className="text-center space-y-3 md:space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/10">
                <Eye className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-[clamp(1rem,2.5vw,1.125rem)] font-now font-semibold">Full clarity on data and costs</h3>
              <p className="text-sm md:text-base text-muted-foreground font-now">Recruitment spend is often hidden behind unclear reports and agency fees, but with real-time dashboards you see exactly where your budget goes, what results it delivers, and the true cost of every candidate.</p>
            </div>
          </div>

          {/* Built for In-House Recruitment Teams */}
          <section className="mt-16 md:mt-24">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
                Built for In-House Recruitment Teams
              </h2>
              <div className="grid sm:grid-cols-2 gap-6 text-left">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-now font-semibold text-foreground mb-2">Take control back from expensive agencies</h3>
                    <p className="text-sm text-muted-foreground font-now">Own your recruitment strategy without middlemen</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-now font-semibold text-foreground mb-2">Scale your hiring without scaling your team</h3>
                    <p className="text-sm text-muted-foreground font-now">Do more with the resources you already have</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-now font-semibold text-foreground mb-2">Make data-driven decisions with confidence</h3>
                    <p className="text-sm text-muted-foreground font-now">Real insights, not vague reports</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-now font-semibold text-foreground mb-2">Launch campaigns whenever you need</h3>
                    <p className="text-sm text-muted-foreground font-now">No waiting on agencies or long approval chains</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>;
};
export default Index;