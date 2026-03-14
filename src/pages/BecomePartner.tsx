import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ProductDropdown } from "@/components/ProductDropdown";
import { ArrowRight, Mail, Phone, Handshake, CheckCircle, Users, Zap, Building2, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { posthog } from "@/lib/posthog";
import brianProfile from "@/assets/brian-profile.png";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";

const BecomePartner = () => {
  const handleContactClick = (method: string) => {
    posthog.capture("partner_contact_clicked", { method });
  };

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <div className="hidden md:flex items-center gap-8">
            <ProductDropdown />
            <Link to="/become-partner" className="text-foreground font-now font-medium">Become a partner</Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">Pricing</Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">Blog</Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="font-semibold hidden md:inline-flex">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild className="hidden md:inline-flex">
              <Link to="/pilot-program">Request demo</Link>
            </Button>
            <MobileNav />
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 hero-padding">
          <motion.div className="text-center space-y-5 max-w-5xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="section-label">
              <Handshake className="h-4 w-4" /> Partnership Program
            </span>
            <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(1.75rem,5vw,3.5rem)]">
              Let's Build the Future of Recruitment Together
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-now max-w-3xl mx-auto">
              We're looking for ATS providers who want to offer their customers a seamless, integrated recruitment advertising experience.
            </p>
          </motion.div>
        </section>

        {/* Why Partner With Us */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-4xl mx-auto text-center space-y-6" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold text-foreground">Why Partner With 20/20 Solutions?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {[
                  { icon: Zap, title: "Seamless Integration", desc: "Our platform is built API-first, making it easy to integrate recruitment advertising directly into your ATS workflow.", color: "primary" },
                  { icon: Users, title: "Add Value for Customers", desc: "Give your users the ability to launch and track recruitment campaigns without leaving your platform.", color: "secondary" },
                  { icon: Building2, title: "Revenue Opportunity", desc: "Flexible partnership models that create new revenue streams while solving real problems for your customers.", color: "success" },
                ].map((item, i) => (
                  <motion.div key={i} className="text-center space-y-3" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 * (i + 1) }}>
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-${item.color}/10`}>
                      <item.icon className={`h-7 w-7 text-${item.color}`} />
                    </div>
                    <h3 className="font-now font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-now">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Ideal Partner */}
        <section className="section-padding-sm">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
              <div className="unified-card !p-6 md:!p-8">
                <h2 className="text-xl md:text-2xl font-now font-bold text-foreground mb-5 text-center">You're an Ideal Partner If You...</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Offer an ATS or recruitment software platform",
                    "Serve companies with ongoing hiring needs",
                    "Want to expand your product offering",
                    "Value transparency and customer success",
                    "Are open to technical API integrations",
                    "Looking for innovative ways to differentiate",
                  ].map((text, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground font-now text-sm">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="section-padding">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-4xl mx-auto" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }}>
              <div className="cta-banner !text-left !p-6 md:!p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* CEO Profile */}
                  <div className="text-center md:text-left space-y-4">
                    <div className="inline-block">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent p-1 mx-auto md:mx-0">
                        <img src={brianProfile} alt="Brian - Founder & CEO" className="w-full h-full rounded-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-now font-bold text-foreground">Brian C. Winkel</h3>
                      <p className="text-muted-foreground font-now text-sm">Founder</p>
                    </div>
                    <p className="text-muted-foreground font-now text-sm leading-relaxed">
                      We focus on building partnerships that create measurable value for your clients, with hands-on support to make sure integrations work.
                    </p>
                    <a href="https://www.linkedin.com/in/briancwinkel/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-now text-sm" onClick={() => handleContactClick("linkedin")}>
                      <Linkedin className="h-4 w-4" /> Connect on LinkedIn
                    </a>
                  </div>

                  {/* Contact Options */}
                  <div className="space-y-5">
                    <h2 className="text-xl md:text-2xl font-now font-bold text-foreground text-center md:text-left">Let's connect!</h2>
                    <div className="space-y-3">
                      <motion.a href="mailto:Brian@twentytwentysolutions.io" className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary/50 transition-colors group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleContactClick("email")}>
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-now font-semibold text-foreground text-sm">Send an Email</p>
                          <p className="text-xs text-muted-foreground font-now truncate">Brian@twentytwentysolutions.io</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors flex-shrink-0" />
                      </motion.a>

                      <motion.a href="tel:+31640411523" className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary/50 transition-colors group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleContactClick("phone")}>
                        <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                          <Phone className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="font-now font-semibold text-foreground text-sm">Give Me a Call</p>
                          <p className="text-xs text-muted-foreground font-now">(+31) 6 40 31 15 23</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto group-hover:text-secondary transition-colors flex-shrink-0" />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BecomePartner;