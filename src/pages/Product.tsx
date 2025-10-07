import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, Rocket, Sparkles, Eye, Link2, Zap, BarChart3, Shield, Clock, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
const Product = () => {
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
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Button size="lg" onClick={() => setIsFormOpen(true)}>
            Book a Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="text-center space-y-6 md:space-y-8 max-w-5xl mx-auto">
          <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(2rem,6vw,4rem)]">
            Create Winning Recruitment Campaigns in Minutes
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-now subtitle max-w-3xl mx-auto">For teams who want agency level results without the agency.
Take control of your hiring and outpace the competition.</p>
          <div className="pt-4">
            <Button size="lg" variant="accent" className="text-foreground" onClick={() => setIsFormOpen(true)}>
              Book a Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          {/* Placeholder for hero image */}
          <div className="mt-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 h-64 md:h-96 flex items-center justify-center border border-primary/20">
            <p className="text-muted-foreground font-now">Campaign Creation Interface Preview</p>
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Traditional recruitment advertising is complex, expensive, and opaque
            </h2>
            <p className="text-lg text-muted-foreground font-now">
              Most in-house teams struggle with fragmented tools, unclear ROI, and dependency on expensive agencies.
            </p>
            <div className="pt-4 space-y-4">
              <h3 className="text-2xl md:text-3xl font-now font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                20/20 Solutions gives you the power of professional campaigns with the simplicity of a few clicks
              </h3>
              <p className="text-lg text-muted-foreground font-now">
                One platform. Clear data. Full control. No hidden costs.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-secondary/10 to-primary/10 h-64 md:h-96 flex items-center justify-center border border-secondary/20">
            <p className="text-muted-foreground font-now">Workflow Simplification Visual</p>
          </div>
        </div>
      </section>

      {/* How It Works - Step 1 */}
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground mb-4">Add jobs manually or import them directly with seamlessly integrations. Our flexible system lets you bring in job data your way and o complex setup required.</h2>
          <p className="text-lg text-muted-foreground font-now max-w-2xl mx-auto">
            From connection to conversion in three simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto mb-16">
          <div className="order-2 md:order-1 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 h-64 md:h-80 flex items-center justify-center border border-primary/20">
            <p className="text-muted-foreground font-now">Integration Interface Mockup</p>
          </div>
          <div className="order-1 md:order-2 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
              <Link2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl md:text-3xl font-now font-bold text-foreground">
              1. Connect Your Platforms
            </h3>
            <p className="text-lg text-muted-foreground font-now">
              Link Meta, Google, and LinkedIn in seconds with secure OAuth. No technical setup required—just click and authorize.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary/10">
              <Sparkles className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-2xl md:text-3xl font-now font-bold text-foreground">
              2. Create Your Campaign
            </h3>
            <p className="text-lg text-muted-foreground font-now">
              Use our guided builder to craft compelling job ads—no marketing degree required. AI-powered suggestions help you optimize every detail.
            </p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-secondary/10 to-primary/10 h-64 md:h-80 flex items-center justify-center border border-secondary/20">
            <p className="text-muted-foreground font-now">Campaign Builder Interface</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
          <div className="order-2 md:order-1 rounded-lg bg-gradient-to-br from-success/10 to-primary/10 h-64 md:h-80 flex items-center justify-center border border-success/20">
            <p className="text-muted-foreground font-now">Dashboard Analytics View</p>
          </div>
          <div className="order-1 md:order-2 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-success/10">
              <Eye className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-2xl md:text-3xl font-now font-bold text-foreground">
              3. Launch & Track
            </h3>
            <p className="text-lg text-muted-foreground font-now">
              Go live in minutes and monitor real-time performance from one unified dashboard. See exactly what's working and adjust on the fly.
            </p>
          </div>
        </div>
      </section>

      {/* Three USPs Deep Dive */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground mb-4">
            Why In-House Teams Choose 20/20 Solutions
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {/* USP 1 */}
          <div className="bg-card rounded-lg p-6 md:p-8 space-y-4 border border-border hover:border-primary/50 transition-colors">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
              <Rocket className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-now font-bold text-foreground">
              Hire faster, work smarter
            </h3>
            <p className="text-base text-muted-foreground font-now">
              Traditional recruitment is slow and costly, but with AI-optimized campaigns you cut manual effort, reduce wasted spend, and fill roles faster while keeping full control over process and cost.
            </p>
            <div className="pt-2 space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground font-now">Average 40% reduction in time-to-hire</p>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground font-now">Save thousands vs. agency fees</p>
              </div>
            </div>
          </div>

          {/* USP 2 */}
          <div className="bg-card rounded-lg p-6 md:p-8 space-y-4 border border-border hover:border-secondary/50 transition-colors">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-secondary/10">
              <Sparkles className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-xl md:text-2xl font-now font-bold text-foreground">
              Campaigns built in minutes
            </h3>
            <p className="text-base text-muted-foreground font-now">
              Creating recruitment ads doesn't have to be complex, with our guided flow you can launch complete campaigns in just a few steps, without needing marketing expertise or external agencies.
            </p>
            <div className="pt-2 space-y-2">
              <div className="flex items-start gap-2">
                <Zap className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground font-now">Just 3 steps from blank to live</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground font-now">No technical skills required</p>
              </div>
            </div>
          </div>

          {/* USP 3 */}
          <div className="bg-card rounded-lg p-6 md:p-8 space-y-4 border border-border hover:border-success/50 transition-colors">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-success/10">
              <Eye className="h-7 w-7 text-success" />
            </div>
            <h3 className="text-xl md:text-2xl font-now font-bold text-foreground">
              Full clarity on data and costs
            </h3>
            <p className="text-base text-muted-foreground font-now">
              Recruitment spend is often hidden behind unclear reports and agency fees, but with real-time dashboards you see exactly where your budget goes, what results it delivers, and the true cost of every candidate.
            </p>
            <div className="pt-2 space-y-2">
              <div className="flex items-start gap-2">
                <BarChart3 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground font-now">Real-time ROI tracking</p>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground font-now">Cost-per-candidate transparency</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Benefits */}
      <section className="container mx-auto px-4 py-10 md:py-20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl">
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
                <p className="text-sm text-muted-foreground font-now">Real insights, not vague agency reports</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-now font-semibold text-foreground mb-2">Launch campaigns whenever you need</h3>
                <p className="text-sm text-muted-foreground font-now">No waiting on agencies or long approval chains</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Integrations */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground mb-8">
            Works With The Platforms You Already Use
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 space-y-3 border border-border">
              <div className="w-16 h-16 mx-auto rounded-lg bg-primary/10 flex items-center justify-center">
                <p className="font-now font-bold text-primary text-xl">Meta</p>
              </div>
              <h3 className="font-now font-semibold text-foreground">Meta (Facebook & Instagram)</h3>
              <p className="text-sm text-muted-foreground font-now">Launch targeted campaigns across the world's largest social networks</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 space-y-3 border border-border">
              <div className="w-16 h-16 mx-auto rounded-lg bg-secondary/10 flex items-center justify-center">
                <p className="font-now font-bold text-secondary text-xl">Google</p>
              </div>
              <h3 className="font-now font-semibold text-foreground">Google Ads</h3>
              <p className="text-sm text-muted-foreground font-now">Reach candidates actively searching for opportunities</p>
            </div>
            
            <div className="bg-card rounded-lg p-6 space-y-3 border border-border">
              <div className="w-16 h-16 mx-auto rounded-lg bg-success/10 flex items-center justify-center">
                <p className="font-now font-bold text-success text-xl">More</p>
              </div>
              <h3 className="font-now font-semibold text-foreground">LinkedIn & More</h3>
              <p className="text-sm text-muted-foreground font-now">Connect with professional networks and expand your reach</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
            Ready to Transform Your Recruitment Advertising?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-now max-w-2xl mx-auto">
            See how easy campaign creation can be. Join in-house recruitment teams who've already made the switch.
          </p>
          <div className="pt-4">
            <Button size="lg" variant="accent" className="text-foreground" onClick={() => setIsFormOpen(true)}>
              Book a Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* HubSpot Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book a Demo</DialogTitle>
          </DialogHeader>
          <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
        </DialogContent>
      </Dialog>
    </div>;
};
export default Product;