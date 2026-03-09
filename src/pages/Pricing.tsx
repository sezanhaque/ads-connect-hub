import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/ui/logo";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import { Check, ArrowRight, Minus, Zap, Users, Building2, Rocket } from "lucide-react";
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
    period: "/month",
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
    period: "/month",
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
    period: "/month",
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


const stats = [
  { value: "0%", label: "Markup on ad spend" },
  { value: "100%", label: "Feature access on every tier" },
  { value: "1 day", label: "Live & running" },
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
            <Button variant="outline" onClick={handleDemoRequest} className="hidden md:inline-flex">
              Request demo
            </Button>
            <MobileNav onDemoClick={handleDemoRequest} links={navLinks} />
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-sm px-4 py-1.5">
            Same features everywhere · Price scales with volume · Zero markup on ad spend
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Simple pricing,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, hsl(var(--usp-gradient-start)), hsl(var(--usp-gradient-mid)), hsl(var(--usp-gradient-end)))`,
              }}
            >
              zero surprises
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Every plan includes all features. No markup on ad spend — ever.
            You only pay more when you hire more.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className={`relative rounded-2xl p-7 flex flex-col ${
                tier.highlighted
                  ? "bg-primary text-primary-foreground shadow-2xl scale-[1.03] border-2 border-primary z-10"
                  : "bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground border-0 px-4 py-1 text-sm font-bold shadow-lg">
                    {tier.badge}
                  </Badge>
                </div>
              )}

              <div className="mb-5">
                <div
                  className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3 ${
                    tier.highlighted ? "bg-primary-foreground/20" : "bg-primary/10"
                  }`}
                >
                  <tier.icon
                    className={`w-5 h-5 ${
                      tier.highlighted ? "text-primary-foreground" : "text-primary"
                    }`}
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p
                  className={`text-sm ${
                    tier.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {tier.description}
                </p>
              </div>

              <div className="mb-5">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span
                  className={`text-sm ${
                    tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {tier.period}
                </span>
              </div>

              {/* Key details */}
              <div
                className={`text-xs space-y-1.5 mb-5 pb-5 border-b ${
                  tier.highlighted ? "border-primary-foreground/20" : "border-border"
                }`}
              >
                <div className="flex justify-between">
                  <span className={tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}>Active campaigns</span>
                  <span className="font-semibold">{tier.campaigns}</span>
                </div>
                <div className="flex justify-between">
                  <span className={tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}>Setup fee</span>
                  <span className="font-semibold">{tier.setupFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className={tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}>Minimum term</span>
                  <span className="font-semibold">{tier.minTerm}</span>
                </div>
                <div className="flex justify-between">
                  <span className={tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}>Extra campaign</span>
                  <span className="font-semibold">{tier.extraCampaign}</span>
                </div>
                <div className="flex justify-between">
                  <span className={tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}>Ad spend markup</span>
                  <span className="font-bold text-accent">0%</span>
                </div>
              </div>

              {/* Support */}
              <div className="flex-1 mb-6">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                  tier.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"
                }`}>Support</p>
                <ul className="space-y-2">
                  {tier.support.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          tier.highlighted ? "text-accent" : "text-primary"
                        }`}
                      />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                  {tier.supportMissing.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Minus
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          tier.highlighted ? "text-primary-foreground/30" : "text-muted-foreground/40"
                        }`}
                      />
                      <span className={`text-sm ${
                        tier.highlighted ? "text-primary-foreground/40" : "text-muted-foreground/50"
                      }`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={handleDemoRequest}
                className={`w-full group ${
                  tier.highlighted
                    ? "bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
                    : ""
                }`}
                variant={tier.highlighted ? "accent" : "default"}
                size="lg"
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20">
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
            <p className="text-muted-foreground leading-relaxed">
              Here you'll find answers to the most frequently asked questions about Twenty Twenty Solutions. Have more questions? Feel free to get in touch with us.
            </p>
          </motion.div>

          {/* Right side FAQ items */}
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border rounded-xl"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-foreground list-none">
                  {faq.q}
                  <span className="ml-4 text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
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
