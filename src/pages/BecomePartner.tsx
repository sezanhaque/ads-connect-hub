import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import { ArrowRight, Mail, Phone, Handshake, CheckCircle, Users, Zap, Building2, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { posthog } from "@/lib/posthog";
import brianProfile from "@/assets/brian-profile.png";
import { MobileNav } from "@/components/MobileNav";
import Footer from "@/components/layout/Footer";
const BecomePartner = () => {
  const handleContactClick = (method: string) => {
    posthog.capture('partner_contact_clicked', {
      method
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/platform-overview" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Product
            </Link>
            <Link to="/become-partner" className="text-foreground font-now font-medium">
              Become a partner
            </Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors font-now font-medium">
              Blog
            </Link>
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
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-10 md:py-20">
          <motion.div className="text-center space-y-6 md:space-y-8 max-w-5xl mx-auto" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-now font-medium text-sm">
              <Handshake className="h-4 w-4" />
              Partnership Program
            </div>
            <h1 className="font-now font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight text-[clamp(1.75rem,4vw,3rem)]">
              Let's Build the Future of Recruitment Together
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed font-now subtitle max-w-3xl mx-auto">
              We're looking for ATS providers who want to offer their customers a seamless, integrated recruitment advertising experience.
            </p>
          </motion.div>
        </section>

        {/* Why Partner With Us */}
        <section className="container mx-auto px-4 py-10 md:py-16">
          <motion.div className="max-w-4xl mx-auto text-center space-y-8" initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-100px"
        }} transition={{
          duration: 0.5
        }}>
            <h2 className="text-3xl md:text-4xl font-now font-bold text-foreground">
              Why Partner With 20/20 Solutions?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 pt-4">
              <motion.div className="text-center space-y-4" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.4,
              delay: 0.1
            }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-now font-semibold text-foreground">Seamless Integration</h3>
                <p className="text-sm text-muted-foreground font-now">
                  Our platform is built API-first, making it easy to integrate recruitment advertising directly into your ATS workflow.
                </p>
              </motion.div>
              <motion.div className="text-center space-y-4" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.4,
              delay: 0.2
            }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary/10">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-now font-semibold text-foreground">Add Value for Customers</h3>
                <p className="text-sm text-muted-foreground font-now">
                  Give your users the ability to launch and track recruitment campaigns without leaving your platform.
                </p>
              </motion.div>
              <motion.div className="text-center space-y-4" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.4,
              delay: 0.3
            }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-success/10">
                  <Building2 className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-now font-semibold text-foreground">Revenue Opportunity</h3>
                <p className="text-sm text-muted-foreground font-now">
                  Flexible partnership models that create new revenue streams while solving real problems for your customers.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Ideal Partner */}
        <section className="container mx-auto px-4 py-10 md:py-16">
          <motion.div className="max-w-4xl mx-auto" initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-100px"
        }} transition={{
          duration: 0.5
        }}>
            <div className="bg-card border rounded-xl p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-now font-bold text-foreground mb-6 text-center">
                You're an Ideal Partner If You...
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground font-now">Offer an ATS or recruitment software platform</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground font-now">Serve companies with ongoing hiring needs</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground font-now">Want to expand your product offering</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground font-now">Value transparency and customer success</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground font-now">Are open to technical API integrations</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground font-now">Looking for innovative ways to differentiate</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section className="container mx-auto px-4 py-10 md:py-20">
          <motion.div className="max-w-4xl mx-auto" initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-100px"
        }} transition={{
          duration: 0.5
        }}>
            <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-8 md:p-12 border border-primary/20">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                {/* CEO Profile */}
                <div className="text-center md:text-left space-y-4">
                  <div className="inline-block">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1 mx-auto md:mx-0">
                      <img src={brianProfile} alt="Brian - Founder & CEO" className="w-full h-full rounded-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-now font-bold text-foreground">Brian C. Winkel</h3>
                    <p className="text-muted-foreground font-now">Founder</p>
                  </div>
                  <p className="text-muted-foreground font-now text-sm leading-relaxed">
                    We focus on building partnerships that create measurable value for your clients, with hands-on support to make sure integrations works.    
                  </p>
                  <a href="https://www.linkedin.com/in/briancwinkel/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-now text-sm" onClick={() => handleContactClick('linkedin')}>
                    <Linkedin className="h-4 w-4" />
                    Connect on LinkedIn
                  </a>
                </div>

                {/* Contact Options */}
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-now font-bold text-foreground text-center md:text-left">
                    Let's connect!
                  </h2>
                  
                  <div className="space-y-4">
                    <motion.a href="mailto:Brian@twentytwentysolutions.io" className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary/50 transition-colors group" whileHover={{
                    scale: 1.02
                  }} whileTap={{
                    scale: 0.98
                  }} onClick={() => handleContactClick('email')}>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-now font-semibold text-foreground">Send an Email</p>
                        <p className="text-sm text-muted-foreground font-now">Brian@twentytwentysolutions.io</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                    </motion.a>

                    <motion.a href="tel:+31640411523" className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary/50 transition-colors group" whileHover={{
                    scale: 1.02
                  }} whileTap={{
                    scale: 0.98
                  }} onClick={() => handleContactClick('phone')}>
                      <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                        <Phone className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-now font-semibold text-foreground">Give Me a Call</p>
                        <p className="text-sm text-muted-foreground font-now">(+31) 6 40 31 15 23</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground ml-auto group-hover:text-secondary transition-colors" />
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default BecomePartner;