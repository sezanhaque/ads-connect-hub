import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { ArrowRight, Eye, Target, BarChart3, Users, Building2, Briefcase, CheckCircle, MessageSquare } from "lucide-react";
import { posthog } from "@/lib/posthog";

const Solution = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSalesFormOpen, setIsSalesFormOpen] = useState(false);

  const handleDemoRequest = () => {
    posthog.capture('demo_requested', { source: 'solution_page' });
    setIsFormOpen(true);
  };

  const handleSalesContact = () => {
    posthog.capture('sales_contact_requested', { source: 'solution_page' });
    setIsSalesFormOpen(true);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js-eu1.hsforms.net/forms/embed/147002455.js";
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/platform-overview" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Product
            </Link>
            <Link to="/solution" className="text-foreground font-now font-medium">
              Solution
            </Link>
            <Link to="/become-partner" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Become a Partner
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button onClick={handleDemoRequest}>
              Request demo
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-10 md:py-20">
          <div className="text-center space-y-6 md:space-y-8 max-w-5xl mx-auto">
            <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(1.75rem,4vw,3rem)]">
              Automated advertising, built for your team.
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-now subtitle max-w-3xl mx-auto">
              We built this platform to bring back clarity and remove wasted time, unnecessary agency costs, and loss of control caused by fragmented processes.
            </p>
            <div className="pt-4">
            <Button size="lg" variant="accent" className="text-foreground" onClick={handleDemoRequest}>
                Explore our product
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="container mx-auto px-4 py-10 md:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Our Vision
            </h2>
            <div className="space-y-6 text-muted-foreground font-now text-left">
              <p className="text-lg leading-relaxed">
                The current advertising landscape is broken. Companies are forced to navigate 
                complex platforms, rely on expensive agencies, or accept black-box tools that 
                hide where money goes and what results actually mean.
              </p>
              <p className="text-lg leading-relaxed">
                This creates inefficiency at every level: wasted budgets, unclear reporting, 
                and a growing disconnect between spending and outcomes. Most businesses don't 
                need more features—they need clarity.
              </p>
              <p className="text-lg leading-relaxed">
                That's why we built a platform grounded in three principles: 
                <span className="text-foreground font-medium"> transparency</span> in costs and performance, 
                <span className="text-foreground font-medium"> control</span> over campaigns without needing specialists, and 
                <span className="text-foreground font-medium"> simplicity</span> that respects your time.
              </p>
            </div>
          </div>
        </section>

        {/* Our Current Focus */}
        <section className="container mx-auto px-4 py-10 md:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Our Current Focus
            </h2>
            <div className="bg-card border rounded-xl p-8 md:p-10 text-left">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground text-lg mb-2">
                    Recruitment Advertising
                  </h3>
                  <p className="text-muted-foreground font-now">
                    Right now, the platform is purpose-built for recruitment advertising—specifically 
                    for organisations with high-volume or recurring hiring needs.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground font-now leading-relaxed">
                By focusing deeply on one domain, we can deliver real depth, quality, and measurable 
                results. This isn't a generic tool adapted to recruitment—it's designed from the 
                ground up to solve the specific challenges of hiring at scale.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Today */}
        <section className="container mx-auto px-4 py-10 md:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              How It Works Today
            </h2>
            <p className="text-lg text-muted-foreground font-now max-w-2xl mx-auto">
              From job posting to successful hire in three simple steps
            </p>
            <div className="grid md:grid-cols-3 gap-8 pt-4">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-now font-semibold text-foreground">Turn jobs into campaigns</h3>
                <p className="text-sm text-muted-foreground font-now">
                  A simple, step-by-step flow converts any vacancy into a targeted advertising campaign—no 
                  marketing expertise required.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary/10">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-now font-semibold text-foreground">Set budgets and audiences</h3>
                <p className="text-sm text-muted-foreground font-now">
                  Define your spend and target audience with intuitive controls. 
                  No jargon, no hidden complexity.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-success/10">
                  <BarChart3 className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-now font-semibold text-foreground">Track results in real time</h3>
                <p className="text-sm text-muted-foreground font-now">
                  A clear dashboard shows exactly where your budget goes and what it delivers. 
                  No guesswork.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who This Is Built For */}
        <section className="container mx-auto px-4 py-10 md:py-20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Who This Solution Is Built For
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-card border rounded-xl p-6 text-left">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-now font-semibold text-foreground mb-2">Employers</h3>
                <p className="text-sm text-muted-foreground font-now">
                  Organisations with recurring or high-volume hiring needs who want direct control 
                  over their recruitment advertising.
                </p>
              </div>
              <div className="bg-card border rounded-xl p-6 text-left">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-now font-semibold text-foreground mb-2">Staffing Agencies</h3>
                <p className="text-sm text-muted-foreground font-now">
                  Recruitment and staffing agencies managing multiple vacancies across clients 
                  who need scalable, efficient solutions.
                </p>
              </div>
              <div className="bg-card border rounded-xl p-6 text-left">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-now font-semibold text-foreground mb-2">In-House Teams</h3>
                <p className="text-sm text-muted-foreground font-now">
                  HR and talent acquisition teams that want control over campaigns without 
                  becoming advertising experts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="container mx-auto px-4 py-10 md:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Key Benefits
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 text-left">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">Full transparency on costs and performance</h3>
                  <p className="text-sm text-muted-foreground font-now">See exactly where every euro goes and what results it generates</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">No hidden fees or media markups</h3>
                  <p className="text-sm text-muted-foreground font-now">Your budget goes to advertising, not intermediary costs</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">Scalable setup for ongoing hiring needs</h3>
                  <p className="text-sm text-muted-foreground font-now">The platform grows with your needs without added complexity</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">Real-time insights and control</h3>
                  <p className="text-sm text-muted-foreground font-now">Monitor and adjust campaigns whenever you need to</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beyond Recruitment & Contact Sales */}
        <section className="container mx-auto px-4 py-10 md:py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Beyond Recruitment
            </h2>
            <p className="text-lg text-muted-foreground font-now leading-relaxed max-w-2xl mx-auto">
              The principles behind this platform—transparency, simplicity, and control—aren't 
              limited to recruitment. The underlying technology and approach apply to other 
              advertising verticals as well.
            </p>
            <p className="text-lg text-foreground font-now font-medium">
              Recruitment is where we start. It's not where we end.
            </p>
            <div className="pt-6 border-t border-border/50 mt-6">
              <p className="text-muted-foreground font-now mb-6">
                Working in a different niche? Let's explore if this platform fits your needs.
              </p>
              <Button size="lg" variant="accent" className="text-foreground" onClick={handleSalesContact}>
                Talk to Sales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Demo Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book a demo</DialogTitle>
          </DialogHeader>
          <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
        </DialogContent>
      </Dialog>

      {/* Sales Dialog */}
      <Dialog open={isSalesFormOpen} onOpenChange={setIsSalesFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Talk to Sales</DialogTitle>
          </DialogHeader>
          <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t py-8 mt-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-sm text-muted-foreground font-now">
                © 2025 20/20 Solutions. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm font-now">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <a href="/Privacyverklaring_TwentyTwentySolutions.io.pdf" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Statement
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Solution;
