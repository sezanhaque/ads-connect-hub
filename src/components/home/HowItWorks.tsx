import { Link2, Megaphone, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
const steps = [{
  icon: Link2,
  title: "Connect your ATS",
  description: "Connect your ATS or upload a vacancy manually. The platform is designed to fit seamlessly into existing recruitment workflows and supports a growing number of ATS integrations. If your ATS isn't connected yet, we can quickly set up an integration so you can start publishing vacancies without changing how you work.",
  gradient: "from-primary to-primary/70",
  iconColor: "text-primary-foreground"
}, {
  icon: Megaphone,
  title: "Launch ads across channels",
  description: "Create and launch recruitment advertising campaigns in minutes. Select your target audience, channels, and budget without dealing with complex advertising setups or agencies. The platform handles the execution, so you can focus on hiring instead of campaign management.",
  gradient: "from-secondary to-secondary/70",
  iconColor: "text-secondary-foreground"
}, {
  icon: BarChart3,
  title: "Track all your preferred KPI's",
  description: "Monitor spend, performance, and results in real time from one central dashboard. You always know where your budget is going, how campaigns are performing, and what results they generate, with no markups, no black boxes, and full financial transparency.",
  gradient: "from-accent to-accent/70",
  iconColor: "text-accent-foreground"
}];
interface HowItWorksProps {
  onDemoClick?: () => void;
}

const HowItWorks = ({ onDemoClick }: HowItWorksProps) => {
  return <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.h2 className="text-3xl md:text-4xl font-now font-bold text-center mb-12 md:mb-16" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5
      }}>
          How it works
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          {steps.map((step, index) => <motion.div key={step.title} className="text-center space-y-5 p-6 rounded-2xl bg-card border shadow-sm hover:shadow-lg transition-shadow duration-300" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.15
        }} whileHover={{
          y: -4
        }}>
              <motion.div className={`mx-auto w-14 h-14 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-md`} whileHover={{
            scale: 1.1,
            rotate: 5
          }} transition={{
            type: "spring",
            stiffness: 300
          }}>
                <step.icon className={`h-7 w-7 ${step.iconColor}`} />
              </motion.div>
              <h3 className="text-lg font-now font-bold text-foreground whitespace-nowrap md:text-xl">{step.title}</h3>
              <p className="text-muted-foreground font-now leading-relaxed text-sm">{step.description}</p>
            </motion.div>)}
        </div>
        
        {onDemoClick && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button size="lg" onClick={onDemoClick} className="text-primary-foreground">
              Get started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>;
};
export default HowItWorks;