import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const getDisplayName = (path: string) => {
    const names: Record<string, string> = {
      dashboard: "Admin Dashboard",
      profile: "My Profile",
      editor: "Certificate Editor",
      templates: "Templates",
      verify: "Verify Certificate",
    };
    return names[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (pathnames.length === 0) return null;

  return (
    <nav
      className="flex items-center space-x-2 text-sm text-muted-foreground mb-6"
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      {pathnames.map((path, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={to} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-foreground font-medium" aria-current="page">
                {getDisplayName(path)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-foreground transition-colors"
              >
                {getDisplayName(path)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
