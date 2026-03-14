import { Link2, Megaphone, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface HowItWorksStep {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  bgGlow: string;
  step: string;
}

const defaultSteps: HowItWorksStep[] = [
  {
    icon: Link2,
    title: "Connect your ATS",
    description: "Connect your ATS or upload a vacancy manually. The platform is designed to fit seamlessly into existing recruitment workflows and supports a growing number of ATS integrations.",
    gradient: "from-primary via-primary/80 to-primary/60",
    bgGlow: "bg-primary/20",
    step: "01",
  },
  {
    icon: Megaphone,
    title: "Launch ads across channels",
    description: "Create and launch recruitment advertising campaigns in minutes. Select your target audience, channels, and budget without dealing with complex advertising setups.",
    gradient: "from-secondary via-secondary/80 to-secondary/60",
    bgGlow: "bg-secondary/20",
    step: "02",
  },
  {
    icon: BarChart3,
    title: "Track all your preferred KPI's",
    description: "Monitor spend, performance, and results in real time from one central dashboard. Full financial transparency with no markups or black boxes.",
    gradient: "from-accent via-accent/80 to-accent/60",
    bgGlow: "bg-accent/30",
    step: "03",
  },
];

interface HowItWorksProps {
  onDemoClick?: () => void;
  steps?: HowItWorksStep[];
}

const HowItWorks = ({ onDemoClick }: HowItWorksProps) => {
  return (
    <section className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label mb-4 inline-flex">Simple 3-step process</span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-now font-bold mt-4">How it works</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <motion.div
                className="h-full p-5 md:p-7 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={`absolute -top-20 -right-20 w-40 h-40 ${step.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="absolute top-4 right-4 text-5xl font-now font-bold text-muted/20 select-none">{step.step}</div>
                <div className="relative z-10 space-y-4">
                  <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-now font-bold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground font-now leading-relaxed text-sm">{step.description}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {onDemoClick && (
          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button size="lg" onClick={onDemoClick} className="text-primary-foreground w-full sm:w-auto">
              Get started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HowItWorks;