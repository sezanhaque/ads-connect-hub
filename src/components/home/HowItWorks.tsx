import { Rocket, Sparkles, Eye } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Rocket,
    title: "Hire faster, work smarter",
    description: "Traditional recruitment is slow and costly, but with AI-optimized campaigns you cut manual effort, reduce wasted spend, and fill roles faster while keeping full control over process and cost.",
    gradient: "from-primary to-primary/70",
    iconColor: "text-primary-foreground",
  },
  {
    icon: Sparkles,
    title: "Campaigns built in minutes",
    description: "Creating recruitment ads doesn't have to be complex. With our guided flow you can launch complete campaigns in just a few steps, without needing marketing expertise or external agencies.",
    gradient: "from-secondary to-secondary/70",
    iconColor: "text-secondary-foreground",
  },
  {
    icon: Eye,
    title: "Full clarity on data and costs",
    description: "Recruitment spend is often hidden behind unclear reports and agency fees, but with real-time dashboards you see exactly where your budget goes, what results it delivers, and the true cost of every candidate.",
    gradient: "from-accent to-accent/70",
    iconColor: "text-accent-foreground",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-now font-bold text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How it works
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="text-center space-y-5 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -4 }}
            >
              <motion.div 
                className={`mx-auto w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-md`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <step.icon className={`h-7 w-7 ${step.iconColor}`} />
              </motion.div>
              <h3 className="text-xl font-now font-bold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground font-now leading-relaxed text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
