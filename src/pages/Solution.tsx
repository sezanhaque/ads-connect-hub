import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductDropdown } from "@/components/ProductDropdown";
import Logo from "@/components/ui/logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Eye, Target, BarChart3, Users, Building2, Briefcase, CheckCircle,
  Lightbulb, Layers, TrendingUp, Zap, Sparkles, Shield,
} from "lucide-react";
import { posthog } from "@/lib/posthog";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";

const Solution = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSalesFormOpen, setIsSalesFormOpen] = useState(false);

  const handleDemoRequest = () => {
    posthog.capture("demo_requested", { source: "solution_page" });
    setIsFormOpen(true);
  };

  const handleSalesContact = () => {
    posthog.capture("sales_contact_requested", { source: "solution_page" });
    setIsSalesFormOpen(true);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js-eu1.hsforms.net/forms/embed/147002455.js";
    script.defer = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };

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
            <Button onClick={handleDemoRequest} className="hidden md:inline-flex">Request demo</Button>
            <MobileNav onDemoClick={handleDemoRequest} />
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 hero-padding">
          <motion.div className="text-center space-y-5 max-w-5xl mx-auto" initial="hidden" animate="visible" variants={fadeInUp} transition={{ duration: 0.6 }}>
            <span className="section-label">
              <Lightbulb className="h-4 w-4" /> Our Solution
            </span>
            <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(1.75rem,5vw,3.5rem)]">
              Automated advertising, built for your team.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-now max-w-3xl mx-auto">
              Bringing back clarity and removing wasted time, unnecessary agency costs, and loss of control caused by fragmented processes.
            </p>
            <motion.div className="pt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Button size="lg" onClick={handleDemoRequest} className="text-primary-foreground w-full sm:w-auto">
                Explore our product <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        <div className="container mx-auto px-4"><div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" /></div>

        {/* Our Vision */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-4xl mx-auto text-center space-y-8" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} transition={{ duration: 0.5 }}>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto">
                  <Eye className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">Our Vision</h2>
              </div>

              <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                {[
                  { icon: Layers, title: "The Problem", desc: "Complex platforms, expensive agencies, and black-box tools that hide where money goes and what results mean.", color: "destructive" },
                  { icon: TrendingUp, title: "The Impact", desc: "Wasted budgets, unclear reporting, and a growing disconnect between spending and outcomes.", color: "warning" },
                  { icon: Sparkles, title: "Our Principles", desc: "Transparency in costs, control without specialists, and simplicity that respects your time.", color: "success" },
                ].map((item, i) => (
                  <motion.div key={i} className="unified-card text-left" variants={fadeInUp}>
                    <div className={`w-11 h-11 rounded-xl bg-${item.color}/10 flex items-center justify-center mb-3`}>
                      <item.icon className={`h-5 w-5 text-${item.color}`} />
                    </div>
                    <h3 className="font-now font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-now leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4"><div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" /></div>

        {/* Our Current Focus */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-4xl mx-auto text-center space-y-8" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} transition={{ duration: 0.5 }}>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 mx-auto">
                  <Target className="h-7 w-7 text-secondary" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">Our Current Focus</h2>
              </div>

              <motion.div className="unified-card !p-6 md:!p-10 text-left" whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-now font-semibold text-foreground text-lg mb-2">Recruitment Advertising</h3>
                    <p className="text-muted-foreground font-now leading-relaxed">Built for organisations with high-volume or recurring hiring needs.</p>
                  </div>
                </div>
                <div className="pl-0 md:pl-[76px]">
                  <p className="text-muted-foreground font-now leading-relaxed text-sm">
                    By focusing deeply on one domain, we deliver real depth, quality, and measurable results. This isn't a generic tool adapted to recruitment—it's designed from the ground up to solve the specific challenges of hiring at scale.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4"><div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" /></div>

        {/* How It Works */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-5xl mx-auto text-center space-y-10" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} transition={{ duration: 0.5 }}>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mx-auto">
                  <Zap className="h-7 w-7 text-accent" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">How It Works</h2>
                <p className="text-base md:text-lg text-muted-foreground font-now max-w-2xl mx-auto">From job posting to successful hire in three simple steps</p>
              </div>

              <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                {[
                  { icon: Briefcase, title: "Turn jobs into campaigns", desc: "A simple flow converts any vacancy into a targeted advertising campaign—no marketing expertise required.", color: "primary", step: "1" },
                  { icon: Users, title: "Set budgets and audiences", desc: "Define your spend and target audience with intuitive controls. No jargon, no hidden complexity.", color: "secondary", step: "2" },
                  { icon: BarChart3, title: "Track results in real time", desc: "A clear dashboard shows exactly where your budget goes and what it delivers. No guesswork.", color: "success", step: "3" },
                ].map((item, i) => (
                  <motion.div key={i} className="text-center space-y-4" variants={fadeInUp}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${item.color}/10 relative`}>
                      <item.icon className={`h-8 w-8 text-${item.color}`} />
                      <span className={`absolute -top-2 -right-2 w-7 h-7 bg-${item.color} text-${item.color}-foreground rounded-full flex items-center justify-center font-now font-bold text-xs`}>{item.step}</span>
                    </div>
                    <h3 className="font-now font-semibold text-foreground text-lg">{item.title}</h3>
                    <p className="text-muted-foreground font-now leading-relaxed text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Who This Is Built For */}
        <section className="bg-muted/30 section-padding">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-5xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 md:p-12" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} transition={{ duration: 0.5 }}>
              <div className="text-center space-y-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-background/80 mx-auto">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">Who This Solution Is Built For</h2>
                </div>

                <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-5" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  {[
                    { icon: Building2, title: "Employers", desc: "Organisations with recurring or high-volume hiring needs who want direct control over their recruitment advertising.", color: "primary" },
                    { icon: Users, title: "Staffing Agencies", desc: "Recruitment agencies managing multiple vacancies across clients who need scalable, efficient solutions.", color: "secondary" },
                    { icon: Eye, title: "In-House Teams", desc: "HR and talent acquisition teams that want control over campaigns without becoming advertising experts.", color: "success" },
                  ].map((item, i) => (
                    <motion.div key={i} className="bg-background/80 backdrop-blur border rounded-xl p-6 text-left hover:shadow-md transition-all" variants={fadeInUp}>
                      <div className={`w-12 h-12 rounded-xl bg-${item.color}/10 flex items-center justify-center mb-4`}>
                        <item.icon className={`h-6 w-6 text-${item.color}`} />
                      </div>
                      <h3 className="font-now font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground font-now leading-relaxed text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-4xl mx-auto text-center space-y-10" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} transition={{ duration: 0.5 }}>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-success/10 mx-auto">
                  <Shield className="h-7 w-7 text-success" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">Key Benefits</h2>
              </div>

              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                {[
                  { title: "Full transparency", desc: "See exactly where every euro goes and what results it generates", color: "success" },
                  { title: "No hidden fees", desc: "Your budget goes to advertising, not intermediary costs", color: "primary" },
                  { title: "Scalable setup", desc: "The platform grows with your needs without added complexity", color: "secondary" },
                  { title: "Real-time control", desc: "Monitor and adjust campaigns whenever you need to", color: "accent" },
                ].map((item, i) => (
                  <motion.div key={i} className="unified-card flex gap-4" variants={fadeInUp}>
                    <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-${item.color}/10 flex items-center justify-center`}>
                      <CheckCircle className={`h-5 w-5 text-${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-now font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground font-now">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Beyond Recruitment & Contact Sales */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <motion.div className="cta-banner !rounded-2xl" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-background/80 mx-auto">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">Beyond Recruitment</h2>
              <p className="text-base md:text-lg text-muted-foreground font-now leading-relaxed max-w-2xl mx-auto">
                The principles behind this platform—transparency, simplicity, and control—aren't limited to recruitment. The underlying technology applies to other advertising verticals as well.
              </p>
              <p className="text-base md:text-lg text-foreground font-now font-medium">Recruitment is where we start. It's not where we end.</p>
              <div className="pt-6 border-t border-border/50 mt-6">
                <p className="text-muted-foreground font-now mb-5 text-sm">Working in a different niche? Let's explore if this platform fits your needs.</p>
                <Button size="lg" onClick={handleSalesContact} className="text-primary-foreground w-full sm:w-auto">
                  Talk to Sales <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Book a demo</DialogTitle></DialogHeader>
          <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
        </DialogContent>
      </Dialog>

      <Dialog open={isSalesFormOpen} onOpenChange={setIsSalesFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Talk to Sales</DialogTitle></DialogHeader>
          <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Solution;