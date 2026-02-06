import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const recentArticles = [
  {
    slug: "realistic-recruitment-advertising",
    title: "Why Realistic Recruitment Advertising Is Becoming a Strategic Necessity",
  },
  {
    slug: "aligning-hr-recruitment-marketing",
    title: "Aligning HR, Recruitment, and Marketing Through Advertising Automation",
  },
  {
    slug: "5-common-mistakes-recruitment-advertising",
    title: "5 Common Mistakes in Recruitment Advertising",
  },
];

const NewsInsights = () => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-3xl md:text-4xl font-now font-bold text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          News & insights
        </motion.h2>
        
        <div className="max-w-2xl mx-auto space-y-6 mb-8">
          {recentArticles.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={`/blog/${article.slug}`}
                className="group block p-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <h3 className="font-now font-semibold text-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mb-16">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-primary font-now font-medium hover:underline"
          >
            View all news
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Newsletter signup */}
        <motion.div 
          className="max-w-xl mx-auto text-center space-y-6 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-2xl p-8 border border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1"
              onClick={() => setIsNewsletterOpen(true)}
              readOnly
            />
            <Button onClick={() => setIsNewsletterOpen(true)}>
              Subscribe
            </Button>
          </div>
          <p className="text-sm text-muted-foreground font-now">
            Updates on recruitment advertising, automation, and platform news.
          </p>
        </motion.div>

        {/* Newsletter Dialog */}
        <Dialog open={isNewsletterOpen} onOpenChange={setIsNewsletterOpen}>
          <DialogContent className="w-[min(640px,calc(100vw-1.5rem))] h-[calc(100vh-1.5rem)] max-h-[900px] overflow-hidden p-0">
            <iframe
              src="https://c1eb69ba.sibforms.com/serve/MUIFACFgaD0ywFJbLkU3c01zsTjuJbu_hK4vizKUGhJbiRIrUXXWqPt6qy6btsVR2F_FLAVGQNuZadDb8CwPyPmjtBZdhhHf9yCnuPl0BYi2oGh-LJ-BIPUfH9z2XTDuOk2iVzdof5OBoXTRwCLQtWSz2QDvgud22GRNGz5TBS2dvJ0BKdfj_DRX5qiPKGSY6CXPuxwFO06SM52Bdg=="
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              className="block h-full w-full border-0"
              title="Newsletter Subscription"
            />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default NewsInsights;
