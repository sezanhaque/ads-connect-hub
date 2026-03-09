import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/logo";

interface NavLink {
  to: string;
  label: string;
}

interface MobileNavProps {
  links?: NavLink[];
  onDemoClick?: () => void;
  demoButtonLabel?: string;
  showDemoButton?: boolean;
}

const defaultLinks: NavLink[] = [
  { to: "/platform-overview", label: "Product" },
  { to: "/become-partner", label: "Become a partner" },
  { to: "/blog", label: "Blog" },
];

export function MobileNav({ 
  links = defaultLinks, 
  onDemoClick, 
  demoButtonLabel = "Request demo",
  showDemoButton = true 
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <Logo />
          </div>
          
          <nav className="flex-1 p-6">
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link.to}>
                  <SheetClose asChild>
                    <Link
                      to={link.to}
                      className={`block py-3 px-4 rounded-lg font-now font-medium transition-colors ${
                        isActive(link.to)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-6 border-t space-y-3">
            <SheetClose asChild>
              <Button variant="outline" asChild className="w-full font-semibold">
                <Link to="/auth">Sign in</Link>
              </Button>
            </SheetClose>
            {showDemoButton && onDemoClick && (
              <SheetClose asChild>
                <Button className="w-full" onClick={onDemoClick}>
                  {demoButtonLabel}
                </Button>
              </SheetClose>
            )}
            {showDemoButton && !onDemoClick && (
              <SheetClose asChild>
                <Button asChild className="w-full">
                  <Link to="/pilot-program">{demoButtonLabel}</Link>
                </Button>
              </SheetClose>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
