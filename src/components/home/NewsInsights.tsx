import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import realisticRecruitmentBlogImage from "@/assets/realistic-recruitment-blog.png";
import strategyAlignmentBlogImage from "@/assets/strategy-alignment-blog.png";
import recruitmentMistakesBlogImage from "@/assets/recruitment-mistakes-blog.avif";

const recentArticles = [
  {
    slug: "realistic-recruitment-advertising",
    title: "Why Realistic Recruitment Advertising Is Becoming a Strategic Necessity",
    excerpt: "Many HR teams experience a disconnect between attraction and retention.",
    category: "Industry Insights",
    date: "February 2, 2026",
    readTime: "4 min read",
    image: realisticRecruitmentBlogImage,
  },
  {
    slug: "aligning-hr-recruitment-marketing",
    title: "Aligning HR, Recruitment, and Marketing Through Advertising Automation",
    excerpt: "Recruitment advertising almost never lives with one team.",
    category: "Strategy",
    date: "January 30, 2026",
    readTime: "4 min read",
    image: strategyAlignmentBlogImage,
  },
  {
    slug: "5-common-mistakes-recruitment-advertising",
    title: "5 Common Mistakes in Recruitment Advertising",
    excerpt: "Recruitment advertising has become a core pillar of modern hiring strategies.",
    category: "Best Practices",
    date: "January 29, 2026",
    readTime: "4 min read",
    image: recruitmentMistakesBlogImage,
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
        
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mb-10">
          {recentArticles.map((article, index) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/blog/${article.slug}`}
                className="group block h-full"
              >
                <article className="bg-card rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {/* Image */}
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    {/* Category badge */}
                    <span className="inline-block px-2.5 py-0.5 text-xs font-now font-medium bg-primary/10 text-primary rounded-full w-fit">
                      {article.category}
                    </span>
                    
                    {/* Title */}
                    <h3 className="text-lg font-now font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-muted-foreground font-now text-sm line-clamp-2 flex-1">
                      {article.excerpt}
                    </p>
                    
                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-now pt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                </article>
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
