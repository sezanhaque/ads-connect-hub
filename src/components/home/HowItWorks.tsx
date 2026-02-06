import { Link2, Megaphone, BarChart3, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const steps = [{
  icon: Link2,
  title: "Connect your ATS",
  description: "Connect your ATS or upload a vacancy manually. The platform is designed to fit seamlessly into existing recruitment workflows and supports a growing number of ATS integrations.",
  gradient: "from-primary via-primary/80 to-primary/60",
  bgGlow: "bg-primary/20",
  step: "01"
}, {
  icon: Megaphone,
  title: "Launch ads across channels",
  description: "Create and launch recruitment advertising campaigns in minutes. Select your target audience, channels, and budget without dealing with complex advertising setups.",
  gradient: "from-secondary via-secondary/80 to-secondary/60",
  bgGlow: "bg-secondary/20",
  step: "02"
}, {
  icon: BarChart3,
  title: "Track all your preferred KPI's",
  description: "Monitor spend, performance, and results in real time from one central dashboard. Full financial transparency with no markups or black boxes.",
  gradient: "from-accent via-accent/80 to-accent/60",
  bgGlow: "bg-accent/30",
  step: "03"
}];

interface HowItWorksProps {
  onDemoClick?: () => void;
}

const HowItWorks = ({ onDemoClick }: HowItWorksProps) => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-now font-medium rounded-full mb-4">
            Simple 3-step process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-now font-bold">
            How it works
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto relative">
          {/* Connecting lines (hidden on mobile) */}
          <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30" />
            <motion.div 
              className="absolute left-0 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <ChevronRight className="w-5 h-5 text-primary/50" />
            </motion.div>
          </div>
          <div className="hidden md:block absolute top-24 left-2/3 right-[8%] h-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 to-accent/30" />
            <motion.div 
              className="absolute left-0 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              <ChevronRight className="w-5 h-5 text-secondary/50" />
            </motion.div>
          </div>
          
          {steps.map((step, index) => (
            <motion.div 
              key={step.title} 
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {/* Card */}
              <motion.div 
                className="h-full p-6 md:p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Background glow effect */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 ${step.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Step number */}
                <div className="absolute top-4 right-4 text-5xl font-now font-bold text-muted/20 select-none">
                  {step.step}
                </div>
                
                <div className="relative z-10 space-y-5">
                  {/* Icon container */}
                  <motion.div 
                    className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <step.icon className="h-8 w-8 text-white" />
                    {/* Icon glow */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} blur-xl opacity-50`} />
                  </motion.div>
                  
                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-now font-bold text-foreground whitespace-nowrap">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground font-now leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        {onDemoClick && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button size="lg" onClick={onDemoClick} className="text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
              Get started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HowItWorks;