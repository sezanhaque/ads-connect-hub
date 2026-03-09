import { Link } from "react-router-dom";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import dashboardPreview from "@/assets/dashboard-preview.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/ui/logo";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import {
  Check,
  ArrowRight,
  Minus,
  Zap,
  Users,
  Building2,
  Rocket,
  Shield,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { posthog } from "@/lib/posthog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const navLinks = [
  { to: "/platform-overview", label: "Product" },
  { to: "/pricing", label: "Pricing" },
  { to: "/become-partner", label: "Become a partner" },
  { to: "/blog", label: "Blog" },
];

const tiers = [
  {
    name: "Solo",
    price: "€199",
    period: "/mo",
    description: "For companies hiring 1–3 roles at a time",
    icon: Zap,
    campaigns: "1–3",
    setupFee: "€0",
    minTerm: "Monthly",
    extraCampaign: "€79/mo",
    support: ["Email support", "30 min onboarding call", "24h response time SLA"],
    supportMissing: ["Priority support", "Dedicated success manager", "Quarterly business review"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Team",
    price: "€399",
    period: "/mo",
    description: "For growing teams scaling their hiring",
    icon: Users,
    campaigns: "4–10",
    setupFee: "€249",
    minTerm: "6 months",
    extraCampaign: "€79/mo",
    support: ["Email support", "Priority support (phone + chat)", "1 hour onboarding call", "12h response time SLA"],
    supportMissing: ["Dedicated success manager", "Quarterly business review"],
    cta: "Start growing",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Business",
    price: "€649",
    period: "/mo",
    description: "For established organizations with high-volume hiring",
    icon: Building2,
    campaigns: "11–25",
    setupFee: "€499",
    minTerm: "12 months",
    extraCampaign: "€79/mo",
    support: ["Email support", "Priority support (phone + chat)", "2 hour onboarding call", "Dedicated success manager", "8h response time SLA"],
    supportMissing: ["Quarterly business review"],
    cta: "Scale up",
    highlighted: false,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "For enterprises with 25+ simultaneous vacancies",
    icon: Rocket,
    campaigns: "25+",
    setupFee: "Custom",
    minTerm: "Custom",
    extraCampaign: "Custom",
    support: ["Email support", "Priority support (phone + chat)", "Custom onboarding", "Dedicated success manager", "Quarterly business review", "4h response time SLA"],
    supportMissing: [],
    cta: "Contact us",
    highlighted: false,
  },
];

const transparencyPillars = [
  {
    icon: CreditCard,
    title: "Your own ad account",
    description: "Every organisation gets a dedicated credit card account. Ad spend flows 100% through your account — no middleman.",
  },
  {
    icon: Shield,
    title: "0% markup on ad spend",
    description: "We charge a flat subscription fee. Your advertising budget goes directly to the platforms, with zero hidden fees or commissions.",
  },
  {
    icon: BarChart3,
    title: "Real-time cost tracking",
    description: "See exactly what every euro delivers — cost per click, cost per apply, and full campaign analytics in real time.",
  },
];

const faqs = [
  {
    q: "What is the contract duration?",
    a: "We offer flexible contract terms to fit your needs. Our Solo plan is cancellable on a monthly basis, while our Team plan starts from a 6-month commitment and Business from 12 months. Looking for a longer partnership? We offer attractive discounts on 2 or 3-year contracts.",
  },
  {
    q: "Can I connect my ATS?",
    a: "Yes. TwentyTwenty Solutions integrates with all major ATS systems — and ATS integration is included on every plan at no extra cost. Don't see your ATS listed yet? We'll build the integration for you, free of charge. Our development is fully driven by client feedback, so new integrations are delivered fast.",
  },
  {
    q: "How do you handle the advertising budget?",
    a: "Every organisation receives its own built-in credit card account where you deposit your ad budget directly. This means your advertising spend flows 100% transparently through your own account — no transaction fees, no markup on spend, no hidden margins. You stay fully in control of your budget at all times.",
  },
  {
    q: "How quickly can we go live with the platform?",
    a: "After signing up, our onboarding team will get your platform fully up and running — including ATS integration — within approximately 2 to 6 hours. The exact timeline depends on your subscription tier and the complexity of your setup. From there, you can launch your first campaign in minutes.",
  },
  {
    q: "Can I try before I commit?",
    a: "Absolutely. We offer a free pilot month where you can experience the full platform with a live campaign. You only pay your own advertising budget — the platform itself is completely free during the pilot. At the end of the month, we'll share a detailed report showing your results, cost-per-apply, and exactly what your investment delivered. No obligations, no risk.",
  },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } },
};

const Pricing = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDemoRequest = () => {
    posthog.capture("demo_requested_pricing");
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-now font-medium transition-colors ${
                  link.to === "/pricing"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold hidden md:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button onClick={handleDemoRequest} className="hidden md:inline-flex">
              Request demo
            </Button>
            <MobileNav onDemoClick={handleDemoRequest} links={navLinks} />
          </div>
        </nav>
      </header>

      {/* ─── HERO ─── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, hsl(var(--hero-bg-top)) 0%, hsl(var(--hero-bg-bottom)) 100%)`,
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-20 right-[10%] w-[320px] h-[320px] rounded-full -z-10 pointer-events-none"
          style={{ background: `hsl(var(--usp-gradient-start) / 0.05)` }}
        />
        <div
          className="absolute bottom-0 left-[5%] w-[200px] h-[200px] rounded-full -z-10 pointer-events-none"
          style={{ background: `hsl(var(--usp-gradient-mid) / 0.04)` }}
        />

        <div className="container mx-auto px-4 pt-10 pb-10 md:pt-16 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-[55%_45%] gap-8 md:gap-12 items-center max-w-6xl mx-auto">
            {/* Left column — text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center md:text-left"
            >
              <h1 className="font-now font-extrabold tracking-tight leading-[1.1] text-[clamp(2rem,5vw,3.5rem)] md:whitespace-nowrap mb-5 md:mb-5">
                <span className="bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] bg-clip-text text-transparent">
                  Zero markup. Full access.
                </span>
              </h1>

              <p className="text-xs md:text-sm text-muted-foreground max-w-sm mx-auto md:mx-0 mb-6 leading-relaxed">
                Always know what you pay. Every plan includes all features.
                Zero markup on ad spend — ever.
              </p>

              {/* Social proof */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
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
                  <span className="font-semibold text-foreground">Trusted by 50+ hiring teams</span>
                  <br />
                  across Europe
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={() => {
                  posthog.capture("cta_choose_plan_pricing");
                  document.getElementById("pricing-plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                size="lg"
                className="text-base px-10 py-6 rounded-full font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] bg-gradient-to-r from-[hsl(var(--usp-gradient-start))] to-[hsl(var(--usp-gradient-mid))] hover:opacity-95 text-primary-foreground"
              >
                Choose your plan
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Right column — product visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="hidden md:block"
            >
              <img
                src={dashboardPreview}
                alt="TwentyTwenty Solutions platform preview"
                className="w-full rounded-xl shadow-xl border border-border"
              />
            </motion.div>
          </div>

          {/* USP stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-4xl mx-auto mt-10 md:mt-14"
          >
            <div
              className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50 rounded-2xl p-1"
              style={{ background: `hsl(var(--value-bar-bg))` }}
            >
              {[
                { icon: BarChart3, stat: "Volume-based", desc: "pricing" },
                { icon: Zap, stat: "Full features", desc: "on every tier" },
                { icon: Shield, stat: "0% markup", desc: "on ad spend" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-5 sm:justify-center">
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground text-sm leading-tight">{item.stat}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING CARDS ─── */}
      <section className="container mx-auto px-4 py-12 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-foreground">Find your </span>
            <span className="text-foreground">perfect plan</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Same platform, same features, every tier. Support level scales with your plan.
          </p>
        </motion.div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-7xl mx-auto"
        >
          {tiers.map((tier, idx) => {
            // Each non-highlighted card gets a unique subtle gradient accent
            const cardAccents = [
              "hover:border-[hsl(var(--usp-gradient-start))] hover:shadow-[0_8px_30px_-8px_hsl(var(--usp-gradient-start)/0.15)]",
              "", // highlighted card
              "hover:border-[hsl(var(--usp-gradient-mid))] hover:shadow-[0_8px_30px_-8px_hsl(var(--usp-gradient-mid)/0.15)]",
              "hover:border-[hsl(var(--usp-gradient-end))] hover:shadow-[0_8px_30px_-8px_hsl(var(--usp-gradient-end)/0.15)]",
            ];

            const iconBgs = [
              "bg-[hsl(var(--usp-gradient-start)/0.12)]",
              "bg-primary-foreground/15",
              "bg-[hsl(var(--usp-gradient-mid)/0.12)]",
              "bg-[hsl(var(--usp-gradient-end)/0.12)]",
            ];

            const iconColors = [
              "text-[hsl(var(--usp-gradient-start))]",
              "text-primary-foreground",
              "text-[hsl(var(--usp-gradient-mid))]",
              "text-[hsl(var(--usp-gradient-end))]",
            ];

            return (
            <motion.div
              key={tier.name}
              variants={stagger.item}
              className={`relative rounded-2xl p-6 md:p-7 flex flex-col transition-all duration-300 ${
                tier.highlighted
                  ? "bg-gradient-to-br from-[hsl(var(--usp-gradient-start))] via-[hsl(var(--usp-gradient-mid))] to-[hsl(var(--usp-gradient-end))] text-white shadow-2xl ring-2 ring-[hsl(var(--usp-gradient-mid)/0.3)] lg:scale-[1.02] z-10"
                  : `bg-card border border-border shadow-sm hover:-translate-y-1 ${cardAccents[idx]}`
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-foreground text-background border-0 px-4 py-1 text-xs font-bold shadow-lg uppercase tracking-wide">
                    {tier.badge}
                  </Badge>
                </div>
              )}

              {/* Tier name + icon */}
              <div className="mb-6">
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${iconBgs[idx]}`}
                >
                  <tier.icon className={`w-5 h-5 ${iconColors[idx]}`} />
                </div>
                <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
                <p
                  className={`text-sm leading-relaxed ${
                    tier.highlighted ? "text-white/75" : "text-muted-foreground"
                  }`}
                >
                  {tier.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                <span
                  className={`text-sm ml-1 ${
                    tier.highlighted ? "text-white/60" : "text-muted-foreground"
                  }`}
                >
                  {tier.period}
                </span>
              </div>

              {/* CTA button */}
              <Button
                onClick={handleDemoRequest}
                className={`w-full group mb-6 ${
                  tier.highlighted
                    ? "bg-white text-foreground hover:bg-white/90 font-bold shadow-lg"
                    : ""
                }`}
                variant={tier.highlighted ? undefined : "default"}
                size="lg"
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Key details */}
              <div
                className={`text-xs space-y-2.5 mb-5 pb-5 border-b ${
                  tier.highlighted ? "border-white/15" : "border-border"
                }`}
              >
                {[
                  { label: "Active campaigns", value: tier.campaigns },
                  { label: "Setup fee", value: tier.setupFee },
                  { label: "Minimum term", value: tier.minTerm },
                  { label: "Extra campaign", value: tier.extraCampaign },
                ].map((detail) => (
                  <div key={detail.label} className="flex justify-between">
                    <span className={tier.highlighted ? "text-white/60" : "text-muted-foreground"}>
                      {detail.label}
                    </span>
                    <span className="font-semibold">{detail.value}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className={tier.highlighted ? "text-white/60" : "text-muted-foreground"}>
                    Ad spend markup
                  </span>
                  <span className={`font-bold ${tier.highlighted ? "text-white" : "text-primary"}`}>
                    0%
                  </span>
                </div>
              </div>

              {/* Support features */}
              <div className="flex-1">
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${
                    tier.highlighted ? "text-white/50" : "text-muted-foreground"
                  }`}
                >
                  Support
                </p>
                <ul className="space-y-2">
                  {tier.support.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          tier.highlighted ? "text-white" : "text-primary"
                        }`}
                      />
                      <span className="text-[13px] leading-snug">{item}</span>
                    </li>
                  ))}
                  {tier.supportMissing.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Minus
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          tier.highlighted ? "text-white/25" : "text-muted-foreground/30"
                        }`}
                      />
                      <span
                        className={`text-[13px] leading-snug ${
                          tier.highlighted ? "text-white/35" : "text-muted-foreground/40"
                        }`}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.5fr] gap-12 md:gap-16 items-start">
            {/* Left side text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently asked questions
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Here you'll find answers to the most frequently asked questions about Twenty Twenty Solutions. Have more questions? Feel free to get in touch with us.
              </p>
              <Button variant="outline" onClick={handleDemoRequest} className="group">
                Get in touch
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Right side FAQ items */}
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.details
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card border border-border rounded-xl hover:border-primary/20 transition-colors"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-foreground list-none text-[15px]">
                    {faq.q}
                    <span className="ml-4 text-muted-foreground group-open:rotate-45 transition-transform duration-200 text-xl leading-none">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </motion.details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Demo Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-now">Request a Demo</DialogTitle>
          </DialogHeader>
          <div
            className="hs-form-frame"
            data-region="eu1"
            data-portal-id="147002455"
            data-form-id="2e468a6c-8e5e-40a4-8e22-ee6d1c67e205"
          ></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;
