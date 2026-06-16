import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import "@/i18n";
import { DemoDialogProvider } from "@/components/home-v2/DemoDialogContext";
import { PublicNav } from "@/components/home-v2/PublicNav";
import { HeroSection } from "@/components/home-v2/HeroSection";
import { SocialProofSection } from "@/components/home-v2/SocialProofSection";
import { PainPointsSection } from "@/components/home-v2/PainPointsSection";
import { TwoPillarsSection } from "@/components/home-v2/TwoPillarsSection";
import { ServicesSection } from "@/components/home-v2/ServicesSection";
import { ProcessSection } from "@/components/home-v2/ProcessSection";
import { CasesSection } from "@/components/home-v2/CasesSection";
import { UrgencySection } from "@/components/home-v2/UrgencySection";
import { CTASection } from "@/components/home-v2/CTASection";
import { PublicFooter } from "@/components/home-v2/PublicFooter";

const Index = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Twenty Twenty Solutions: AI voor groeiend MKB";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "We maken AI toepasbaar voor groeiend MKB dat vastloopt op verouderde tools en processen. Van AI Agents tot maatwerksoftware.");
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
    <div className="tts-home page-bg min-h-screen font-now antialiased">
      <DemoDialogProvider>
        <PublicNav />
        <main>
          <HeroSection />
          <SocialProofSection />
          <PainPointsSection />
          <TwoPillarsSection />
          <ServicesSection />
          <ProcessSection />
          <CasesSection />
          <UrgencySection />
          <CTASection />
        </main>
        <PublicFooter />
      </DemoDialogProvider>
    </div>
  );
};

export default Index;
