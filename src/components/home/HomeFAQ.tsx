import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Is this a replacement for a recruitment agency?",
    answer: "No. The platform enables teams to run recruitment advertising independently, with expert support when needed.",
  },
  {
    question: "Which advertising channels are supported?",
    answer: "The platform supports major advertising channels and is built to expand through integrations.",
  },
  {
    question: "Can I connect our ATS with your platform?",
    answer: "Yes. Our automated advertising platform integrates with a growing number of ATS systems. If your ATS is not yet on the list, we can quickly set up an integration with your preferred system.",
  },
  {
    question: "Do I need technical knowledge to use the platform?",
    answer: "No. You don't need technical or advertising knowledge to set up or manage advertising campaigns. The campaign setup is clear and guided, making it easy to launch and manage ads without technical complexity.",
  },
  {
    question: "Can I request help or guidance?",
    answer: "Yes. Our platform includes expert-led support, providing guidance on setup, campaign execution, and recruitment advertising optimization whenever needed.",
  },
];

const HomeFAQ = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-now font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Frequently asked questions
        </motion.h2>
        
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
                <AccordionTrigger className="text-left font-now font-semibold text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground font-now leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeFAQ;
