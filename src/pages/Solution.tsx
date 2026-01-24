import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Eye, 
  Target, 
  BarChart3, 
  Users, 
  Building2, 
  Briefcase, 
  CheckCircle, 
  Lightbulb,
  Layers,
  TrendingUp,
  Zap,
  Sparkles,
  Shield
} from "lucide-react";
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

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
        <section className="container mx-auto px-4 py-16 md:py-28">
          <motion.div 
            className="text-center space-y-8 max-w-5xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-now font-medium text-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Lightbulb className="h-4 w-4" />
              Our Solution
            </motion.div>
            <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(1.75rem,4vw,3rem)]">
              Automated advertising, built for your team.
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-now subtitle max-w-3xl mx-auto">
              Bringing back clarity and removing wasted time, unnecessary agency costs, and loss of control caused by fragmented processes.
            </p>
            <motion.div 
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button size="lg" variant="accent" className="text-foreground" onClick={handleDemoRequest}>
                Explore our product
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Decorative divider */}
        <div className="container mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Our Vision */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Eye className="h-8 w-8 text-primary" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
                Our Vision
              </h2>
            </div>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-8 pt-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div 
                className="bg-card border rounded-xl p-6 text-left hover:shadow-lg transition-shadow"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-now font-semibold text-foreground mb-2">The Problem</h3>
                <p className="text-sm text-muted-foreground font-now leading-relaxed">
                  Complex platforms, expensive agencies, and black-box tools that hide where money goes and what results mean.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-card border rounded-xl p-6 text-left hover:shadow-lg transition-shadow"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-now font-semibold text-foreground mb-2">The Impact</h3>
                <p className="text-sm text-muted-foreground font-now leading-relaxed">
                  Wasted budgets, unclear reporting, and a growing disconnect between spending and outcomes.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-card border rounded-xl p-6 text-left hover:shadow-lg transition-shadow"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-now font-semibold text-foreground mb-2">Our Principles</h3>
                <p className="text-sm text-muted-foreground font-now leading-relaxed">
                  <span className="text-foreground font-medium">Transparency</span> in costs, <span className="text-foreground font-medium">control</span> without specialists, and <span className="text-foreground font-medium">simplicity</span> that respects your time.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Decorative divider */}
        <div className="container mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Our Current Focus */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 mx-auto"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Target className="h-8 w-8 text-secondary" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
                Our Current Focus
              </h2>
            </div>
            
            <motion.div 
              className="bg-gradient-to-br from-card to-primary/5 border rounded-2xl p-8 md:p-12 text-left"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                <motion.div 
                  className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
                  whileHover={{ rotate: 10 }}
                >
                  <Briefcase className="h-8 w-8 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-now font-semibold text-foreground text-xl mb-3">
                    Recruitment Advertising
                  </h3>
                  <p className="text-muted-foreground font-now text-lg leading-relaxed">
                    Built for organisations with high-volume or recurring hiring needs.
                  </p>
                </div>
              </div>
              <div className="pl-0 md:pl-22">
                <p className="text-muted-foreground font-now leading-relaxed">
                  By focusing deeply on one domain, we deliver real depth, quality, and measurable 
                  results. This isn't a generic tool adapted to recruitment—it's designed from the 
                  ground up to solve the specific challenges of hiring at scale.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Decorative divider */}
        <div className="container mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* How It Works Today */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <motion.div 
            className="max-w-5xl mx-auto text-center space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mx-auto"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Zap className="h-8 w-8 text-accent" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground font-now max-w-2xl mx-auto">
                From job posting to successful hire in three simple steps
              </p>
            </div>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-10 pt-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div 
                className="text-center space-y-5"
                variants={fadeInUp}
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Briefcase className="h-10 w-10 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-now font-bold text-sm">1</span>
                </motion.div>
                <h3 className="font-now font-semibold text-foreground text-lg">Turn jobs into campaigns</h3>
                <p className="text-muted-foreground font-now leading-relaxed">
                  A simple flow converts any vacancy into a targeted advertising campaign—no marketing expertise required.
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center space-y-5"
                variants={fadeInUp}
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-secondary/10 relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="h-10 w-10 text-secondary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-now font-bold text-sm">2</span>
                </motion.div>
                <h3 className="font-now font-semibold text-foreground text-lg">Set budgets and audiences</h3>
                <p className="text-muted-foreground font-now leading-relaxed">
                  Define your spend and target audience with intuitive controls. No jargon, no hidden complexity.
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center space-y-5"
                variants={fadeInUp}
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-success/10 relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BarChart3 className="h-10 w-10 text-success" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-success text-success-foreground rounded-full flex items-center justify-center font-now font-bold text-sm">3</span>
                </motion.div>
                <h3 className="font-now font-semibold text-foreground text-lg">Track results in real time</h3>
                <p className="text-muted-foreground font-now leading-relaxed">
                  A clear dashboard shows exactly where your budget goes and what it delivers. No guesswork.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Who This Is Built For */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <motion.div 
            className="max-w-5xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-10 md:p-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-10">
              <div className="space-y-4">
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background/80 mx-auto"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="h-8 w-8 text-primary" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
                  Who This Solution Is Built For
                </h2>
              </div>
              
              <motion.div 
                className="grid sm:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div 
                  className="bg-background/80 backdrop-blur border rounded-2xl p-8 text-left hover:shadow-lg transition-all"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5"
                    whileHover={{ rotate: 10 }}
                  >
                    <Building2 className="h-7 w-7 text-primary" />
                  </motion.div>
                  <h3 className="font-now font-semibold text-foreground text-lg mb-3">Employers</h3>
                  <p className="text-muted-foreground font-now leading-relaxed">
                    Organisations with recurring or high-volume hiring needs who want direct control over their recruitment advertising.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-background/80 backdrop-blur border rounded-2xl p-8 text-left hover:shadow-lg transition-all"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-5"
                    whileHover={{ rotate: -10 }}
                  >
                    <Users className="h-7 w-7 text-secondary" />
                  </motion.div>
                  <h3 className="font-now font-semibold text-foreground text-lg mb-3">Staffing Agencies</h3>
                  <p className="text-muted-foreground font-now leading-relaxed">
                    Recruitment agencies managing multiple vacancies across clients who need scalable, efficient solutions.
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-background/80 backdrop-blur border rounded-2xl p-8 text-left hover:shadow-lg transition-all"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-5"
                    whileHover={{ rotate: 10 }}
                  >
                    <Eye className="h-7 w-7 text-success" />
                  </motion.div>
                  <h3 className="font-now font-semibold text-foreground text-lg mb-3">In-House Teams</h3>
                  <p className="text-muted-foreground font-now leading-relaxed">
                    HR and talent acquisition teams that want control over campaigns without becoming advertising experts.
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Key Benefits */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              <motion.div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 mx-auto"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Shield className="h-8 w-8 text-success" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
                Key Benefits
              </h2>
            </div>
            
            <motion.div 
              className="grid sm:grid-cols-2 gap-8 text-left"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div 
                className="flex gap-5 bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow"
                variants={fadeInUp}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"
                  whileHover={{ rotate: 10 }}
                >
                  <CheckCircle className="h-6 w-6 text-success" />
                </motion.div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">Full transparency</h3>
                  <p className="text-sm text-muted-foreground font-now">See exactly where every euro goes and what results it generates</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex gap-5 bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow"
                variants={fadeInUp}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                  whileHover={{ rotate: -10 }}
                >
                  <CheckCircle className="h-6 w-6 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">No hidden fees</h3>
                  <p className="text-sm text-muted-foreground font-now">Your budget goes to advertising, not intermediary costs</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex gap-5 bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow"
                variants={fadeInUp}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center"
                  whileHover={{ rotate: 10 }}
                >
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </motion.div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">Scalable setup</h3>
                  <p className="text-sm text-muted-foreground font-now">The platform grows with your needs without added complexity</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex gap-5 bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow"
                variants={fadeInUp}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center"
                  whileHover={{ rotate: -10 }}
                >
                  <CheckCircle className="h-6 w-6 text-accent" />
                </motion.div>
                <div>
                  <h3 className="font-now font-semibold text-foreground mb-2">Real-time control</h3>
                  <p className="text-sm text-muted-foreground font-now">Monitor and adjust campaigns whenever you need to</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Beyond Recruitment & Contact Sales */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-3xl p-10 md:p-16 border border-primary/20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background/80 mx-auto"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Beyond Recruitment
            </h2>
            <p className="text-lg text-muted-foreground font-now leading-relaxed max-w-2xl mx-auto">
              The principles behind this platform—transparency, simplicity, and control—aren't 
              limited to recruitment. The underlying technology applies to other advertising verticals as well.
            </p>
            <p className="text-lg text-foreground font-now font-medium">
              Recruitment is where we start. It's not where we end.
            </p>
            <div className="pt-8 border-t border-border/50 mt-8">
              <p className="text-muted-foreground font-now mb-6">
                Working in a different niche? Let's explore if this platform fits your needs.
              </p>
              <Button size="lg" variant="accent" className="text-foreground" onClick={handleSalesContact}>
                Talk to Sales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
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
      <footer className="border-t py-12 mt-16">
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
