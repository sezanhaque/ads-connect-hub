import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, Users, Video, Smartphone, Activity, Plug, Link2, Megaphone, BarChart3 } from "lucide-react";
import HowItWorks, { type HowItWorksStep } from "@/components/home/HowItWorks";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import { ProductDropdown } from "@/components/ProductDropdown";
import { motion } from "framer-motion";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import TikTokLogo from "@/components/icons/TikTokLogo";
import tiktokHeroPhone from "@/assets/tiktok-hero-phone.png";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

const navLinks = [
  { to: "/become-partner", label: "Become a partner" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
];

const tiktokSteps: HowItWorksStep[] = [
  {
    icon: Link2,
    title: "Connect your ATS",
    description:
      "Connect your ATS or upload a vacancy manually. The platform is designed to fit seamlessly into existing recruitment workflows and supports a growing number of ATS integrations.",
    gradient: "from-primary via-primary/80 to-primary/60",
    bgGlow: "bg-primary/20",
    step: "01",
  },
  {
    icon: Megaphone,
    title: "Launch ads across channels",
    description:
      "Create and launch TikTok video campaigns in minutes. Our platform generates video creatives using AI — select your target audience, set your budget, and go live without needing video editing skills.",
    gradient: "from-secondary via-secondary/80 to-secondary/60",
    bgGlow: "bg-secondary/20",
    step: "02",
  },
  {
    icon: BarChart3,
    title: "Track all your preferred KPI's",
    description:
      "Monitor spend, performance, and results in real time from one central dashboard. Full financial transparency with no markups or black boxes.",
    gradient: "from-accent via-accent/80 to-accent/60",
    bgGlow: "bg-accent/30",
    step: "03",
  },
];

const TikTokJobAds = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <title>TikTok Job Ads — Recruitment Advertising on TikTok | TwentyTwentySolutions.io</title>
      <meta
        name="description"
        content="Reach younger talent with AI-generated TikTok video campaigns. Launch in minutes, track cost per applicant in real time. No agency needed."
      />

      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <ProductDropdown />
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold hidden md:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild className="hidden md:inline-flex">
              <Link to="/pricing">Choose your plan</Link>
            </Button>
            <MobileNav showDemoButton={false} />
          </div>
        </nav>
      </header>

      {/* ─── HERO ─── */}
      <section className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <motion.div className="space-y-6" {...fadeUp}>
            <h1 className="font-now font-bold tracking-tight text-[clamp(2rem,5vw,3.5rem)] leading-tight">
              Attract talent that job boards will never reach.{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] bg-clip-text text-transparent">
                On TikTok.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-now leading-relaxed max-w-xl">
              Turn your vacancies into short-form video campaigns on TikTok that grab attention and drive applicants.
              <br />
              No video skills needed. No agency required.
            </p>

            {/* Trust proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {[avatar1, avatar2, avatar3, avatar4].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-background object-cover object-top"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-left">
                <span className="font-semibold text-foreground">Trusted by recruitment teams</span>
                <br />
                across Europe
              </p>
            </div>

            <Button size="lg" asChild className="text-primary-foreground">
              <Link to="/pricing">
                Choose your plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Right — Phone mockup */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>
            <img
              src={tiktokHeroPhone}
              alt="Recruitment ad on TikTok shown on a mobile phone"
              className="w-full max-w-md mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="bg-muted/50 border-y">
        <div className="container mx-auto px-4 py-6">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { emoji: "🎯", title: "Reach a younger audience", sub: "Gen Z and millennials spend 95 minutes/day on TikTok" },
              { emoji: "⚡", title: "Launch in minutes", sub: "No video editing skills needed" },
              { emoji: "🛡️", title: "0% markup", sub: "on advertising spend" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{item.emoji}</span>
                <p className="font-now font-semibold text-foreground text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground font-now">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY TIKTOK ─── */}
      <section className="py-16 md:py-24">
        <motion.div className="container mx-auto px-4 max-w-2xl text-center space-y-6" {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
            Reach talent{" "}
            <span className="bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] bg-clip-text text-transparent">
              where they actually spend their time
            </span>
          </h2>
          <p className="text-lg text-muted-foreground font-now leading-relaxed">
            TikTok is the fastest-growing platform among working-age adults. Your next hire isn't scrolling job boards —
            they're watching short-form videos during their commute, on break, or after work. TikTok ads appear natively
            in their feed, making your vacancy feel like content, not an advertisement.
          </p>
          <p className="text-lg text-muted-foreground font-now leading-relaxed">
            With Twenty Twenty Solutions, you launch TikTok recruitment campaigns directly from our platform.
            AI-generated video creatives mean you don't need a production team — just pick your vacancy, set your budget,
            and go live.
          </p>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <HowItWorks steps={tiktokSteps} />

      {/* ─── KEY BENEFITS ─── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14 space-y-3" {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Why teams choose Twenty Twenty Solutions
            </h2>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {/* Top row: 3 */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {[
                {
                  icon: Users,
                  title: "Built for recruiters",
                  desc: "You don't need to understand audience segmentation or ad bidding. Our guided flow handles the complexity, you just pick the vacancy and set the budget.",
                },
                {
                  icon: Video,
                  title: "AI-generated video ads",
                  desc: "No videographer? No problem. Our platform generates short-form video creatives tailored to your vacancy — ready to launch on TikTok without any editing.",
                },
                {
                  icon: Smartphone,
                  title: "Scroll-stopping formats",
                  desc: "TikTok's native vertical video format captures attention instantly. Your vacancy appears as content in the feed, not as a banner ad people scroll past.",
                },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  className="bg-card rounded-xl border p-6 space-y-3 shadow-sm"
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <b.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-now font-bold text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground font-now leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </div>
            {/* Bottom row: 2 centered */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                {
                  icon: Activity,
                  title: "Real-time cost per applicant",
                  desc: "Know exactly what each applicant costs, per vacancy, in real time. Connected to your ATS so you can track from impression to hire.",
                },
                {
                  icon: Plug,
                  title: "Integrated with your ATS",
                  desc: "Connect TwentyTwenty with your ATS. Jobs, applicants, and performance data flow seamlessly between systems.",
                },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  className="bg-card rounded-xl border p-6 space-y-3 shadow-sm"
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                    <b.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-now font-bold text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground font-now leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 md:p-14 border border-primary/20"
            {...fadeUp}
          >
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Ready to attract talent that job boards will never reach?
            </h2>
            <p className="text-lg text-muted-foreground font-now max-w-2xl mx-auto">
              Choose a plan that fits your team. Full features on every tier, ATS integration included, and zero markup
              on your ad spend.
            </p>
            <Button size="lg" asChild className="text-primary-foreground">
              <Link to="/pricing">
                Choose your plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TikTokJobAds;
