import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MetaLogo from "@/components/icons/MetaLogo";

const productLinks = [
  { to: "/platform-overview", label: "Platform Overview" },
  { to: "/meta-job-ads", label: "Meta Job Ads", icon: <MetaLogo size={16} /> },
];

export function ProductDropdown() {
  const location = useLocation();
  const isActive = productLinks.some((l) => location.pathname === l.to);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 font-now font-medium transition-colors outline-none text-muted-foreground hover:text-foreground data-[state=open]:text-foreground">
        <span className={isActive ? "text-foreground" : ""}>Product</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {productLinks.map((link) => (
          <DropdownMenuItem key={link.to} asChild>
            <Link
              to={link.to}
              className="flex items-center gap-2 font-now w-full"
            >
              {link.icon && link.icon}
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
