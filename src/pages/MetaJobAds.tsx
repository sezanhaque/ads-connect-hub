import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, Link2, Rocket, BarChart3, Users, Image, Film, Activity, Plug } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import { ProductDropdown } from "@/components/ProductDropdown";
import { motion } from "framer-motion";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";

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

const MetaJobAds = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <title>Meta Job Ads — Recruitment Advertising on Facebook & Instagram | TwentyTwentySolutions.io</title>
      <meta name="description" content="Reach passive candidates with targeted recruitment campaigns on Facebook and Instagram. Launch in minutes, track cost per applicant in real time. No agency needed." />

      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="hidden md:flex items-center gap-8">
            <ProductDropdown />
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
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
      <section className="container mx-auto px-4 hero-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left */}
          <motion.div className="space-y-5" {...fadeUp}>
            <h1 className="font-now font-bold tracking-tight text-[clamp(1.75rem,5vw,3.5rem)] leading-tight">
              Attract Talent That Job Boards Will Never Reach.{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] bg-clip-text text-transparent">
                On Meta.
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-now leading-relaxed max-w-xl">
              Turn your vacancies into targeted Facebook & Instagram campaigns that deliver a steady flow of applicants.<br />
              No marketing expertise needed. No agency required.
            </p>

            {/* Trust proof */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {[avatar1, avatar2, avatar3, avatar4].map((src, i) => (
                  <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-background object-cover object-top" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-left">
                <span className="font-semibold text-foreground">Trusted by recruitment teams</span>
                <br />across Europe
              </p>
            </div>

            <Button size="lg" asChild className="text-primary-foreground w-full sm:w-auto">
              <Link to="/pricing">
                Choose your plan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Right — Stylised ad mockup */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }} className="relative">
            <div className="bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/5 rounded-2xl p-5 md:p-8 shadow-xl">
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden max-w-sm mx-auto">
                <div className="flex items-center gap-2 px-4 py-3 border-b">
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-xs font-bold">f</div>
                  <div>
                    <p className="text-sm font-now font-semibold text-foreground">Your Company</p>
                    <p className="text-xs text-muted-foreground font-now">Sponsored · 📍 Amsterdam</p>
                  </div>
                </div>
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                  <div className="text-center space-y-2 px-6">
                    <p className="text-lg font-now font-bold text-foreground">We're Hiring 🎯</p>
                    <p className="text-sm text-muted-foreground font-now">Senior Full-Stack Developer</p>
                    <p className="text-xs text-muted-foreground font-now">€65k – €85k · Remote-first</p>
                  </div>
                </div>
                <div className="px-4 py-3 border-t">
                  <Button size="sm" className="w-full text-primary-foreground">Learn more</Button>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-8 right-8 w-full h-full bg-accent/20 rounded-2xl blur-xl" />
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="bg-muted/50 border-y">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { emoji: "📊", title: "Reach passive candidates", sub: "73% aren't actively searching" },
              { emoji: "⚡", title: "Launch in minutes", sub: "No marketing expertise needed" },
              { emoji: "🛡️", title: "0% markup", sub: "on advertising spend" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1 py-2">
                <span className="text-2xl">{item.emoji}</span>
                <p className="font-now font-semibold text-foreground text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground font-now">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM ─── */}
      <section className="section-padding">
        <motion.div className="container mx-auto px-4 max-w-2xl text-center space-y-5" {...fadeUp}>
          <span className="section-label">Why Meta?</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">
            Job boards only reach candidates who are already looking.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-now leading-relaxed">
            The majority of your ideal candidates aren't browsing job boards. They're scrolling through Facebook and Instagram. Meta advertising lets you appear in their daily feed — with the right message, at the right moment — and turn passive scrollers into active applicants.
          </p>
          <p className="text-base md:text-lg text-muted-foreground font-now leading-relaxed">
            No agency middleman. No wasted budget on unqualified traffic. Just a direct connection between your vacancy and the people you want to hire.
          </p>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-muted/30 section-padding">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-10 md:mb-14 space-y-3" {...fadeUp}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">How it works</h2>
            <p className="text-base md:text-lg text-muted-foreground font-now">From vacancy to applicant in three steps.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Link2,
                step: "01",
                title: "Connect",
                desc: "Connect your ATS and import your vacancies. Your jobs sync automatically — when you pause or close a vacancy, the campaign stops too.",
              },
              {
                icon: Rocket,
                step: "02",
                title: "Create & Launch",
                desc: "Choose between image or video ad formats — or let our platform generate them for you using AI. Our guided flow handles targeting, budget, and creative so you can launch a complete campaign in minutes.",
              },
              {
                icon: BarChart3,
                step: "03",
                title: "Track",
                desc: "See exactly what every applicant costs. Real-time dashboards show spend, clicks, and cost-per-applicant per vacancy. Fully transparent, no hidden fees.",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="unified-card space-y-4"
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs font-now font-semibold text-muted-foreground tracking-widest uppercase">Step {s.step}</p>
                <h3 className="text-lg font-now font-bold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground font-now leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── KEY BENEFITS ─── */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-10 md:mb-14 space-y-3" {...fadeUp}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">Why recruitment teams choose TwentyTwenty</h2>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {/* Top row: 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              {[
                {
                  icon: Users,
                  title: "Built for recruiters, not marketers",
                  desc: "You don't need to understand audience segmentation or ad bidding. Our guided flow handles the complexity — you just pick the vacancy and set the budget.",
                },
                {
                  icon: Image,
                  title: "AI-generated images & videos",
                  desc: "No designer? No problem. Our platform generates scroll-stopping ad creatives for you — both static images and video — tailored to your vacancy and ready to launch.",
                },
                {
                  icon: Film,
                  title: "Multiple ad formats",
                  desc: "Run image ads, video ads, or both. Test what works best for your audience and sector. Switch formats anytime without starting over.",
                },
              ].map((b, i) => (
                <motion.div key={i} className="unified-card space-y-3" {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}>
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-now font-bold text-foreground">{b.title}</h3>
                  <p className="text-sm text-muted-foreground font-now leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </div>
            {/* Bottom row: 2 centered */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
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
                <motion.div key={i} className="unified-card space-y-3" {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}>
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
                    <b.icon className="h-5 w-5 text-primary" />
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
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <motion.div className="cta-banner" {...fadeUp}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">
              Ready to reach candidates who aren't looking?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-now max-w-2xl mx-auto">
              Start with a plan that fits your team. Every plan includes full features, ATS integration, and zero markup on ad spend.
            </p>
            <Button size="lg" asChild className="text-primary-foreground w-full sm:w-auto">
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

export default MetaJobAds;