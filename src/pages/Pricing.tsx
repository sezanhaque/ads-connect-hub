import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/ui/logo";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
import { Check, ArrowRight, Zap, Building2, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { posthog } from "@/lib/posthog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import HomeFAQ from "@/components/home/HomeFAQ";

const navLinks = [
  { to: "/platform-overview", label: "Product" },
  { to: "/become-partner", label: "Become a partner" },
  { to: "/blog", label: "Blog" },
];

const tiers = [
  {
    name: "Starter",
    price: "€299",
    period: "/month",
    description: "For companies starting with recruitment advertising",
    icon: Zap,
    features: [
      "Up to 5 active job campaigns",
      "Meta Ads (Facebook & Instagram)",
      "Real-time campaign dashboard",
      "Built-in ad spend wallet",
      "Email support",
      "Campaign builder",
    ],
    cta: "Get started",
    highlighted: false,
    setup: "€0 setup fee",
  },
  {
    name: "Growth",
    price: "€499",
    period: "/month",
    description: "For growing teams scaling their hiring efforts",
    icon: Rocket,
    features: [
      "Everything in Starter",
      "Up to 25 active job campaigns",
      "TikTok Ads integration",
      "Advanced analytics & reporting",
      "Google Sheets integration",
      "Priority support",
      "Multi-user access",
      "Campaign optimization tips",
    ],
    cta: "Start growing",
    highlighted: true,
    badge: "Most popular",
    setup: "€0 setup fee",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with complex hiring needs",
    icon: Building2,
    features: [
      "Everything in Growth",
      "Unlimited job campaigns",
      "Dedicated success manager",
      "Custom integrations",
      "White-label options",
      "SLA & premium support",
      "Custom onboarding",
      "API access",
    ],
    cta: "Contact us",
    highlighted: false,
    setup: "Custom onboarding",
  },
];

const stats = [
  { value: "50%", label: "Lower cost per hire" },
  { value: "3x", label: "Faster time to fill" },
  { value: "100%", label: "Transparent spend" },
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
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium"
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
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Plans that scale{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, hsl(var(--usp-gradient-start)), hsl(var(--usp-gradient-mid)), hsl(var(--usp-gradient-end)))`,
              }}
            >
              with your hiring
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            All features included. No hidden fees. No agency markups. 
            Just transparent recruitment advertising that delivers results.
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
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                tier.highlighted
                  ? "bg-primary text-primary-foreground shadow-2xl scale-[1.03] border-2 border-primary"
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

              <div className="mb-6">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                    tier.highlighted
                      ? "bg-primary-foreground/20"
                      : "bg-primary/10"
                  }`}
                >
                  <tier.icon
                    className={`w-6 h-6 ${
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

              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span
                  className={`text-sm ${
                    tier.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {tier.period}
                </span>
                <div
                  className={`text-xs mt-1 ${
                    tier.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {tier.setup}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        tier.highlighted ? "text-accent" : "text-primary"
                      }`}
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

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

      {/* All plans include */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Every plan includes
          </h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            No matter which plan you choose, you get access to the core features that make recruitment advertising simple and transparent.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Campaign builder", desc: "Launch campaigns in minutes with our guided flow" },
              { title: "Real-time dashboards", desc: "See exactly where your budget goes and what it delivers" },
              { title: "Built-in ad wallet", desc: "No risky upfront payments or hidden margins" },
              { title: "AI-optimized ads", desc: "Smart targeting and optimization powered by AI" },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 border border-border text-left"
              >
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-primary rounded-3xl p-12 text-primary-foreground"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your recruitment?
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Book a free demo and see how 20/20 Solutions makes hiring faster, cheaper, and fully transparent.
          </p>
          <Button
            onClick={handleDemoRequest}
            variant="accent"
            size="lg"
            className="text-base px-8"
          >
            Book your free demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* FAQ */}
      <HomeFAQ />

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
