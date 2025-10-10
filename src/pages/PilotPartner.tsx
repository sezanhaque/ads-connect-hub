import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, CheckCircle2, Users, TrendingUp, Target, Clock, Shield, Sparkles } from "lucide-react";
import { usePostHog } from "@/hooks/usePostHog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const PilotPartner = () => {
  const {
    posthog
  } = usePostHog();
  const [showForm, setShowForm] = useState(false);
  const [spotsRemaining] = useState(7); // Update this as needed

  useEffect(() => {
    posthog.capture('pilot_page_viewed');
  }, [posthog]);
  useEffect(() => {
    // Load HubSpot form script
    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/embed/v2.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const handleApplyClick = () => {
    posthog.capture('pilot_application_started');
    setShowForm(true);
  };
  useEffect(() => {
    if (showForm && (window as any).hbspt) {
      (window as any).hbspt.forms.create({
        region: "na1",
        portalId: "YOUR_PORTAL_ID",
        // Replace with your HubSpot portal ID
        formId: "YOUR_PILOT_FORM_ID",
        // Replace with your pilot form ID
        target: "#pilot-form-container",
        onFormSubmit: () => {
          posthog.capture('pilot_application_submitted');
        }
      });
    }
  }, [showForm, posthog]);
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold">
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" asChild className="font-semibold">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Section 1: Hero */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-5xl mx-auto text-center space-y-6 md:space-y-8">
          
          
          <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(2rem,6vw,4rem)]">Let's improve recruitment.</h1>
          
          <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-now max-w-3xl mx-auto">Be among the first 10 companies to Test, Rethink and Evolve recruitment advertising. No costs. Full support. Real impact.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" variant="accent" className="text-foreground" asChild>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSezhcUt78O1jBEkLDAKYb9BnRT5p1Vks38n5LDViBMn0PY-Ew/viewform?usp=sharing&ouid=110010414237314376062" target="_blank" rel="noopener noreferrer" onClick={() => posthog.capture('pilot_application_started')}>
                Apply for Pilot Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            
          </div>
        </div>
      </section>

      {/* Section 2: Problem + Vision */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Why Recruitment Advertising Needs More Clarity
            </h2>
            
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 space-y-3 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-now font-semibold text-foreground">Too Slow</h3>
              <p className="text-sm text-muted-foreground font-now">
                Traditional campaign setup takes weeks, losing you top candidates to faster competitors
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 space-y-3 border border-border">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-now font-semibold text-foreground">No control</h3>
              <p className="text-sm text-muted-foreground font-now">
                Agency markups and hidden fees make it hard to see where your money goes.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 space-y-3 border border-border">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-now font-semibold text-foreground">No Real Insights</h3>
              <p className="text-sm text-muted-foreground font-now">
                Without clear metrics, you can't optimize spend or prove hiring marketing effectiveness
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl font-medium font-now">There's a better way...</p>
          </div>
        </div>
      </section>

      {/* Section 3: Solution Snapshot */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-5xl mx-auto space-y-12 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">Meet 20/20: Recruitment Advertising Seen Clearly</h2>
            <p className="text-lg text-muted-foreground font-now max-w-2xl mx-auto">Transform your advertising process with smart automation that changes how your organisation attracts talent.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">Launch Recruitment Campaigns in Minutes</h3>
                  <p className="text-sm text-muted-foreground font-now">No agencies, no waiting. Go from job posting to live campaign in under 10 minutes.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">Track Every Euro with full Transparency </h3>
                  <p className="text-sm text-muted-foreground font-now">Your ad budget runs directly, with no markups, no prepayments, and complete transparency.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">Scale Without Extra Headcount</h3>
                  <p className="text-sm text-muted-foreground font-now">Run multiple campaigns across platforms and business units, all managed  without specialized advertising teams.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img src="/src/assets/campaign-builder.png" alt="Campaign Builder Interface" className="rounded-lg shadow-lg border border-primary/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Pilot Program Details */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              What You Get as a Pilot Partner
            </h2>
            <p className="text-lg text-muted-foreground font-now">
              Full transparency on benefits and expectations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-lg p-6 space-y-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-now font-semibold text-foreground text-lg">Your Benefits</h3>
              </div>
              <p className="text-sm text-muted-foreground font-now">What we provide to pilot partners</p>
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Early access to platform before public launch</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">No software costs during pilot period</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Direct input on product development and features</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Dedicated onboarding and technical support</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Preferred pricing when you transition to full subscription</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Optional case study opportunity (with approval)</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 space-y-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-now font-semibold text-foreground text-lg">Our Expectations</h3>
              </div>
              <p className="text-sm text-muted-foreground font-now">What we ask from pilot partners</p>
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">1 to 2 months pilot commitment</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Active use of platform for recruitment campaigns</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Feedback sessions during this period</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Willingness to share web analytic results</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Regular communication with product team</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm font-now">Covering own advertising spend, min €500,- </span>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </section>

      {/* Section 5: Strong CTA - Apply Now */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-2xl p-12 md:p-16 shadow-xl">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-now font-bold text-white leading-tight">
              Ready to Transform Your Recruitment Process?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 font-now max-w-2xl mx-auto leading-relaxed">
              Join the exclusive group of forward-thinking companies shaping the future of recruitment advertising.
            </p>

            <div className="pt-6">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto font-semibold shadow-lg hover:shadow-xl transition-all" asChild>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSezhcUt78O1jBEkLDAKYb9BnRT5p1Vks38n5LDViBMn0PY-Ew/viewform?usp=sharing&ouid=110010414237314376062" target="_blank" rel="noopener noreferrer" onClick={() => posthog.capture('pilot_application_started')}>
                  Apply for Pilot Access Now
                  <ArrowRight className="ml-2 h-6 w-6" />
                </a>
              </Button>
            </div>

            <p className="text-white/80 font-now text-sm">
              Limited to 10 companies • No software fees • Full support included
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Social Proof & Credibility */}
      

      {/* Section 7: CTA Repetition + Urgency */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-primary/20">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium font-now">Only {spotsRemaining} of 10 Pilot Spots Remaining</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
            Don't Miss Your Chance to Shape the Future
          </h2>

          <p className="text-lg text-muted-foreground font-now max-w-2xl mx-auto">
            We're limiting pilot participation to 10 companies to ensure each partner receives dedicated support and has meaningful impact on the product. Applications are reviewed on a first-come, first-served basis.
          </p>

          <div className="pt-4">
            <Button size="lg" variant="accent" className="text-foreground" asChild>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSezhcUt78O1jBEkLDAKYb9BnRT5p1Vks38n5LDViBMn0PY-Ew/viewform?usp=sharing&ouid=110010414237314376062" target="_blank" rel="noopener noreferrer" onClick={() => posthog.capture('pilot_application_started')}>
                Apply for Pilot Access Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground font-now">Application review takes 1-2 business days</p>
        </div>
      </section>

      {/* Section 8: FAQ */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground font-now">
              Everything you need to know about the pilot program
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-now">
                What happens after I apply?
              </AccordionTrigger>
              <AccordionContent className="font-now">
                After submitting your application, our team will review it within 1–2 business days. If selected, we'll schedule a 30-minute kickoff call to discuss your recruitment needs, timeline, and how 20/20 can best support your goals during the pilot.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-now">
                Is there any cost during the pilot?
              </AccordionTrigger>
              <AccordionContent className="font-now">
                No. There are no software fees during the pilot period. You will only need to cover your own advertising spend on Meta, which you control directly. This is the same spend you would have with any recruitment advertising approach.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-now">
                What's expected of pilot partners?
              </AccordionTrigger>
              <AccordionContent className="font-now">
                We ask for active platform usage, monthly 1-hour feedback sessions, and willingness to share anonymized results. Your input directly shapes product development. There's no obligation to continue after the pilot ends.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-now">
                Can I stop participating?
              </AccordionTrigger>
              <AccordionContent className="font-now">
                Yes. While we ask for a 1–2 month commitment, you can exit the pilot at any time if it's not meeting your needs. We simply ask for feedback on why it wasn't a fit so we can continue to improve.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left font-now">
                Will my data be shared?
              </AccordionTrigger>
              <AccordionContent className="font-now">
                No. Your company data and campaign information remain confidential. We may ask to share anonymized, aggregated results in case studies, but only with your explicit written approval. You maintain full control over what can be shared publicly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left font-now">
                What company size are you looking for?
              </AccordionTrigger>
              <AccordionContent className="font-now">
                We're open to in-house recruitment teams of all sizes, though we're particularly interested in companies hiring 10+ people per year who want to bring recruitment advertising in-house or reduce agency dependency.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

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
            </div>
          </div>
        </div>
      </footer>

      {/* HubSpot Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-now">Apply for Pilot Partner Program</DialogTitle>
          </DialogHeader>
          <div id="pilot-form-container" className="py-4"></div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default PilotPartner;