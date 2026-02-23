import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Logo from "@/components/ui/logo";
import { ArrowRight, Rocket, Sparkles, Eye, Briefcase, Zap, BarChart3, Shield, Clock, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import campaignPreview from "@/assets/campaign-preview.png";
import jobsInterface from "@/assets/jobs-interface.png";
import campaignBuilder from "@/assets/campaign-builder.png";
import dashboardPreview from "@/assets/dashboard-preview.png";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";

const Product = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

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

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && agreedToPrivacy) {
      setIsFormOpen(true);
    }
  };

  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/platform-overview" className="text-foreground font-now font-medium">
              Product
            </Link>
            <Link to="/become-partner" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Become a Partner
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold hidden md:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button onClick={() => setIsFormOpen(true)} className="hidden md:inline-flex">
              Request demo
            </Button>
            <MobileNav onDemoClick={() => setIsFormOpen(true)} />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-10 md:py-20">
        <div className="text-center space-y-6 md:space-y-8 max-w-5xl mx-auto">
          <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(2rem,6vw,4rem)]">Turn Recruitment Advertising 
Into Predictable Hires.
        </h1>
          <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-now subtitle max-w-3xl mx-auto">For teams who want agency level results without the agency.
Take control of your hiring and outpace the competition.</p>

          {/* Campaign Creation Interface Preview */}
          <div className="mt-12">
            <img src={campaignPreview} alt="Campaign Creation Interface Preview" className="w-full rounded-lg shadow-lg border border-primary/20" />
          </div>
        </div>
      </section>

      {/* How It Works - Step 1 */}
      <section className="container mx-auto px-4 py-10 md:py-16 overflow-hidden">
        <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}>

          <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground font-now max-w-2xl mx-auto">
            From connection to conversion in three simple steps
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto mb-16">
          <motion.div
          className="order-2 md:order-1"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}>

            <img src={jobsInterface} alt="Jobs Interface - Import and manage your job postings" className="w-full rounded-lg shadow-lg border border-primary/20 hover:shadow-xl transition-shadow duration-300" />
          </motion.div>
          <motion.div
          className="order-1 md:order-2 space-y-4"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}>

            <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}>

              <Briefcase className="h-8 w-8 text-primary" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-now font-bold text-foreground">
              1. Import Your Jobs
            </h3>
            <p className="text-lg text-muted-foreground font-now">Add jobs manually or import them directly with the use of seamless integrations . Our flexible system lets you bring in job data your way and no complex setup required.</p>
          </motion.div>
        </div>

        {/* Step 2 */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto mb-16">
          <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}>

            <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary/10"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300 }}>

              <Sparkles className="h-8 w-8 text-secondary" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-now font-bold text-foreground">
              2. Build Your Campaign
            </h3>
            <p className="text-lg text-muted-foreground font-now">Use our advanced multi-step campaign builder to create professional recruitment ads on Meta. From campaign basics to audience targeting and creative copy, we guide you through every detail.</p>
          </motion.div>
          <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}>

            <img src={campaignBuilder} alt="Campaign Builder Interface - Multi-step campaign creation" className="w-full rounded-lg shadow-lg border border-secondary/20 hover:shadow-xl transition-shadow duration-300" />
          </motion.div>
        </div>

        {/* Step 3 */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
          <motion.div
          className="order-2 md:order-1"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}>

            <img src={campaignPreview} alt="Campaign Dashboard - Real-time analytics and performance tracking" className="w-full rounded-lg shadow-lg border border-success/20 hover:shadow-xl transition-shadow duration-300" />
          </motion.div>
          <motion.div
          className="order-1 md:order-2 space-y-4"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}>

            <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-success/10"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}>

              <Eye className="h-8 w-8 text-success" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-now font-bold text-foreground">
              3. Launch & Track
            </h3>
            <p className="text-lg text-muted-foreground font-now">Go live in minutes and monitor real-time performance data from one unified dashboard. See exactly what's working and adjust on the fly.</p>
          </motion.div>
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
              Request demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
    </div>;
};
export default Product;