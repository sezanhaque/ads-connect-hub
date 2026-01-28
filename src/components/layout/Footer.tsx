import { Link } from "react-router-dom";
import Logo from "@/components/ui/logo";

const Footer = () => {
  return (
    <footer className="border-t py-8 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm text-muted-foreground font-now">
              © 2025 20/20 Solutions. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-sm font-now">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <a href="/Privacyverklaring_TwentyTwentySolutions.io.pdf" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Statement
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
