import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductDropdown } from "@/components/ProductDropdown";
import Logo from "@/components/ui/logo";
import { ArrowRight, Rocket, Sparkles, Eye, Briefcase, Zap, BarChart3, Shield, Clock, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import campaignPreview from "@/assets/campaign-preview.png";
import jobsInterface from "@/assets/jobs-interface.png";
import campaignBuilder from "@/assets/campaign-builder.png";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";

const Product = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="hidden md:flex items-center gap-8">
            <ProductDropdown />
            <Link to="/become-partner" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">Become a partner</Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">Pricing</Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">Blog</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold hidden md:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button onClick={() => setIsFormOpen(true)} className="hidden md:inline-flex">Request demo</Button>
            <MobileNav onDemoClick={() => setIsFormOpen(true)} />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 hero-padding">
        <div className="text-center space-y-5 md:space-y-6 max-w-5xl mx-auto">
          <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(1.75rem,5vw,3.5rem)]">
            Turn Recruitment Advertising Into Predictable Hires.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-now max-w-3xl mx-auto">
            Built for teams that hire at scale and are done with agency dependency, unclear performance, and disconnected ATS reporting.
          </p>

          {/* USP badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-6">
            {[
              { icon: Zap, text: "Go live in minutes." },
              { icon: Rocket, text: "Expert-led support." },
              { icon: Eye, text: "Full transparency." },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground font-now">
                <item.icon className="h-4 w-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Campaign Creation Interface Preview */}
          <div className="mt-6 md:mt-8">
            <img src={campaignPreview} alt="Campaign Creation Interface Preview" className="w-full rounded-lg shadow-lg border border-border" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-10 md:mb-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-base md:text-lg text-muted-foreground font-now max-w-2xl mx-auto">From connection to conversion in three simple steps</p>
          </motion.div>

          {/* Step 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center max-w-6xl mx-auto mb-10 md:mb-16">
            <motion.div className="order-2 md:order-1" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }}>
              <img src={jobsInterface} alt="Jobs Interface" className="w-full rounded-lg shadow-lg border border-border" />
            </motion.div>
            <motion.div className="order-1 md:order-2 space-y-3" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.3 }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-now font-bold text-foreground">1. Import Your Jobs</h3>
              <p className="text-base text-muted-foreground font-now leading-relaxed">Add jobs manually or import them directly with seamless integrations. Our flexible system lets you bring in job data your way — no complex setup required.</p>
            </motion.div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center max-w-6xl mx-auto mb-10 md:mb-16">
            <motion.div className="space-y-3" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/10">
                <Sparkles className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl md:text-2xl font-now font-bold text-foreground">2. Build Your Campaign</h3>
              <p className="text-base text-muted-foreground font-now leading-relaxed">Use our advanced multi-step campaign builder to create professional recruitment ads on Meta. From campaign basics to audience targeting and creative copy, we guide you through every detail.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.3 }}>
              <img src={campaignBuilder} alt="Campaign Builder Interface" className="w-full rounded-lg shadow-lg border border-border" />
            </motion.div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center max-w-6xl mx-auto">
            <motion.div className="order-2 md:order-1" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }}>
              <img src={campaignPreview} alt="Campaign Dashboard" className="w-full rounded-lg shadow-lg border border-border" />
            </motion.div>
            <motion.div className="order-1 md:order-2 space-y-3" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.3 }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-success/10">
                <Eye className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-xl md:text-2xl font-now font-bold text-foreground">3. Launch & Track</h3>
              <p className="text-base text-muted-foreground font-now leading-relaxed">Go live in minutes and monitor real-time performance data from one unified dashboard. See exactly what's working and adjust on the fly.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Target Audience Benefits */}
      <section className="bg-muted/30 section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">Built for In-House Recruitment Teams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
              {[
                { icon: Shield, title: "Take control back from expensive agencies", desc: "Own your recruitment strategy without middlemen", color: "primary" },
                { icon: TrendingUp, title: "Scale your hiring without scaling your team", desc: "Do more with the resources you already have", color: "secondary" },
                { icon: BarChart3, title: "Make data-driven decisions with confidence", desc: "Real insights, not vague agency reports", color: "success" },
                { icon: Clock, title: "Launch campaigns whenever you need", desc: "No waiting on agencies or long approval chains", color: "primary" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-${item.color}/10 flex items-center justify-center`}>
                    <item.icon className={`h-5 w-5 text-${item.color}`} />
                  </div>
                  <div>
                    <h3 className="font-now font-semibold text-foreground mb-1 text-sm">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-now">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="cta-banner">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">
              Ready to Transform Your Recruitment Advertising?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-now max-w-2xl mx-auto">
              See how easy campaign creation can be. Join in-house recruitment teams who've already made the switch.
            </p>
            <div className="pt-2">
              <Button size="lg" onClick={() => setIsFormOpen(true)} className="text-primary-foreground w-full sm:w-auto">
                Request demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* HubSpot Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request demo</DialogTitle>
          </DialogHeader>
          <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Product;