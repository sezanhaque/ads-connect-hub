import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/ui/logo";
import { ArrowRight, CheckCircle2, Users, TrendingUp, Target, Clock, Shield, Sparkles } from "lucide-react";
import { usePostHog } from "@/hooks/usePostHog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PilotPartner = () => {
  const { posthog } = usePostHog();
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
        portalId: "YOUR_PORTAL_ID", // Replace with your HubSpot portal ID
        formId: "YOUR_PILOT_FORM_ID", // Replace with your pilot form ID
        target: "#pilot-form-container",
        onFormSubmit: () => {
          posthog.capture('pilot_application_submitted');
        }
      });
    }
  }, [showForm, posthog]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8" />
          </Link>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Limited Pilot Spots Available</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold font-now tracking-tight">
            Join the Future of Recruitment Advertising —{" "}
            <span className="text-primary">Before Everyone Else</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Be among the first 10 companies to shape the next generation of AI-powered recruitment advertising. No costs. Full support. Real impact.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6 h-auto" onClick={handleApplyClick}>
              Apply for Pilot Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Only {spotsRemaining} spots remaining</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Problem + Vision */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-now">
                Why Traditional Recruitment Advertising Is Broken
              </h2>
              <p className="text-lg text-muted-foreground">
                According to Josh Bersin's "The Talent Acquisition Revolution" report
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Too Slow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Traditional campaign setup takes weeks, losing you top candidates to faster competitors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Too Expensive</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Agency fees and unclear ROI drain budgets with little transparency or control
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Target className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>No Real Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Without clear metrics, you can't optimize spend or prove hiring marketing effectiveness
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-xl font-medium">There's a better way...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Solution Snapshot */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-now">
                Meet 20/20 Solutions: Recruitment Advertising, Reimagined
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform how you attract talent with AI-powered campaigns that deliver measurable results
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Launch AI-Powered Campaigns in Minutes</h3>
                    <p className="text-muted-foreground">
                      No agencies, no waiting. Go from job posting to live campaign in under 10 minutes
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Track Every Euro, Measure Every Result</h3>
                    <p className="text-muted-foreground">
                      Real-time dashboards show exactly where your budget goes and which campaigns perform
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Scale Without Extra Headcount</h3>
                    <p className="text-muted-foreground">
                      Run multiple campaigns across platforms without needing specialized advertising teams
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img 
                  src="/src/assets/campaign-builder.png" 
                  alt="Campaign Builder Interface" 
                  className="rounded-lg shadow-2xl border"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Pilot Program Details */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-now">
                What You Get as a Pilot Partner
              </h2>
              <p className="text-lg text-muted-foreground">
                Full transparency on benefits and expectations
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-primary/20 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Your Benefits
                  </CardTitle>
                  <CardDescription>What we provide to pilot partners</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Early access to platform before public launch</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>No software costs during 3-month pilot period</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Direct input on product development and features</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Dedicated onboarding and technical support</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Preferred pricing when you transition to full subscription</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Optional case study opportunity (with approval)</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-muted bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Our Expectations
                  </CardTitle>
                  <CardDescription>What we ask from pilot partners</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>3-month pilot commitment (Q1 2026)</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Active use of platform for recruitment campaigns</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Monthly feedback sessions (1 hour each)</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Willingness to share results (anonymized data)</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Regular communication with product team</span>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Cover your own advertising spend (Meta, TikTok, etc.)</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
              <p className="text-lg font-medium">
                <strong>Timeline:</strong> Applications close January 15, 2026 • Pilot begins Q1 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Social Proof & Credibility */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-now">
                Aligned with the Global AI Revolution in Talent Acquisition
              </h2>
            </div>

            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6">
                <blockquote className="text-lg md:text-xl italic text-muted-foreground mb-4">
                  "AI is fundamentally transforming talent acquisition... Companies that embrace these technologies early will gain significant competitive advantages in attracting and hiring top talent."
                </blockquote>
                <p className="font-medium">
                  — Josh Bersin, "The Talent Acquisition Revolution: AI, Automation, and the Future of Recruiting"
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">10x</div>
                <p className="text-muted-foreground">Faster campaign creation vs. traditional methods</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">100%</div>
                <p className="text-muted-foreground">Transparency on spend and performance metrics</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">24/7</div>
                <p className="text-muted-foreground">Campaign monitoring and optimization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: CTA Repetition + Urgency */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-primary/20">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Only {spotsRemaining} of 10 Pilot Spots Remaining</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold font-now">
              Don't Miss Your Chance to Shape the Future
            </h2>

            <p className="text-lg text-muted-foreground">
              We're limiting pilot participation to 10 companies to ensure each partner receives dedicated support and has meaningful impact on the product. Applications are reviewed on a first-come, first-served basis.
            </p>

            <Button size="lg" className="text-lg px-8 py-6 h-auto" onClick={handleApplyClick}>
              Apply for Pilot Access Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-sm text-muted-foreground">
              Application review takes 2-3 business days
            </p>
          </div>
        </div>
      </section>

      {/* Section 7: FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-now">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about the pilot program
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  What happens after I apply?
                </AccordionTrigger>
                <AccordionContent>
                  After submitting your application, our team will review it within 2-3 business days. If selected, we'll schedule a 30-minute kickoff call to discuss your recruitment needs, timeline, and how 20/20 can best support your goals during the pilot.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Is there any cost during the pilot?
                </AccordionTrigger>
                <AccordionContent>
                  No. There are no software fees during the 3-month pilot period. You will only need to cover your own advertising spend on platforms like Meta and TikTok (which you control directly). This is the same spend you would have with any recruitment advertising approach.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  What's expected of pilot partners?
                </AccordionTrigger>
                <AccordionContent>
                  We ask for active platform usage, monthly 1-hour feedback sessions, and willingness to share anonymized results. Your input directly shapes product development. There's no obligation to continue after the pilot ends.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  When does the pilot start?
                </AccordionTrigger>
                <AccordionContent>
                  The pilot program begins in Q1 2026. Applications close on January 15, 2026. Selected partners will be notified by late January with onboarding scheduled for February 2026.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Can I stop participating?
                </AccordionTrigger>
                <AccordionContent>
                  Yes. While we ask for a 3-month commitment, you can exit the pilot at any time if it's not meeting your needs. We simply ask for feedback on why it wasn't a fit to help us improve.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  Will my data be shared?
                </AccordionTrigger>
                <AccordionContent>
                  No. Your company data and campaign information remain confidential. We may ask to share anonymized, aggregated results in case studies, but only with your explicit written approval. You maintain full control over what can be shared publicly.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  What company size are you looking for?
                </AccordionTrigger>
                <AccordionContent>
                  We're open to in-house recruitment teams of all sizes, though we're particularly interested in companies hiring 10+ people per year who want to bring recruitment advertising in-house or reduce agency dependency.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h3 className="text-2xl font-bold font-now">Ready to Get Started?</h3>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" onClick={handleApplyClick}>
              Apply for Pilot Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo className="h-6" />
              <span className="text-sm text-muted-foreground">
                © 2025 20/20 Solutions. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm">
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
            <DialogTitle className="text-2xl">Apply for Pilot Partner Program</DialogTitle>
          </DialogHeader>
          <div id="pilot-form-container" className="py-4"></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PilotPartner;
