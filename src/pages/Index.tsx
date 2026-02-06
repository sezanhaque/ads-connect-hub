import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import { posthog } from "@/lib/posthog";
import campaignPreview from "@/assets/campaign-preview.png";
import { motion } from "framer-motion";
const Index = () => {
  const {
    user
  } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const handleDemoRequest = () => {
    posthog.capture("demo_requested");
    setIsFormOpen(true);
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
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link to="/platform-overview" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Product
            </Link>
            <Link to="/become-partner" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Become a Partner
            </Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold hidden md:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button variant="outline" onClick={handleDemoRequest} className="hidden md:inline-flex">
              Request demo
            </Button>
            <MobileNav onDemoClick={handleDemoRequest} links={[{
            to: "/platform-overview",
            label: "Product"
          }, {
            to: "/become-partner",
            label: "Become a Partner"
          }, {
            to: "/blog",
            label: "Blog"
          }]} />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8 min-w-0">
            {/* Three-line headline */}
            <h1 className="font-now font-extrabold tracking-tight leading-[1.3] text-[clamp(1.75rem,4.5vw,3.75rem)] text-left">
              <motion.span 
                className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Go live in minutes.
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                Full transparency.
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Expert-led support.
              </motion.span>
            </h1>

            {/* Subline */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-now max-w-xl font-light text-left">A central platform for <span className="text-primary font-medium">recruitment teams</span> to manage advertising across channels with full transparency and control.</p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-px !mt-5">
              <Button size="lg" onClick={handleDemoRequest} className="text-primary-foreground">
                See how it works
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust note */}
            <p className="text-sm text-muted-foreground font-now font-medium">
              No agencies. No long setup. Full control.
            </p>
          </div>

          {/* Right: Product Visual */}
          <div className="relative w-full lg:w-[420px] xl:w-[480px] flex-shrink-0">
            <div className="bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/5 rounded-2xl p-4 md:p-6 shadow-xl">
              <img src={campaignPreview} alt="Twenty Twenty Solutions dashboard showing campaign performance metrics" className="w-full h-auto rounded-lg shadow-lg" />
            </div>
            {/* Subtle background accent */}
            <div className="absolute -z-10 top-8 right-8 w-full h-full bg-accent/20 rounded-2xl blur-xl" />
          </div>
        </div>
      </main>

      {/* Demo Dialog */}
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
export default Index;