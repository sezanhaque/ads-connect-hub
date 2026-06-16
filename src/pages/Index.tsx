import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight } from "lucide-react";
import { ProductDropdown } from "@/components/ProductDropdown";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import { posthog } from "@/lib/posthog";
import campaignPreview from "@/assets/campaign-preview.png";
import { motion } from "framer-motion";
import HowItWorks from "@/components/home/HowItWorks";
import NewsInsights from "@/components/home/NewsInsights";
import HomeFAQ from "@/components/home/HomeFAQ";
import Hero from "@/components/home/Hero";

const Index = () => {
  const { user } = useAuth();
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Logo />
          <p className="text-muted-foreground font-now">Redirecting to dashboard...</p>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}

      {/* Hero Section */}
      <Hero />

      {/* Demo Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request demo</DialogTitle>
          </DialogHeader>
          <div className="hs-form-frame" data-region="eu1" data-form-id="de605c31-9f1e-4f10-92b7-3f621cd9bc80" data-portal-id="147002455" />
        </DialogContent>
      </Dialog>

      <HowItWorks onDemoClick={handleDemoRequest} />
      <NewsInsights />
      <HomeFAQ />

      <Footer />
    </div>
  );
};

export default Index;