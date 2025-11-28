import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const { user, signOut, isAdmin } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Certify Logo" className="h-8 w-8" />
            <span className="text-xl font-display font-bold">Certify</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/templates" className="text-foreground hover:text-primary transition-colors">Templates</Link>
            <Link to="/verify" className="text-foreground hover:text-primary transition-colors">Verify</Link>
            {user && isAdmin && (
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">Admin Dashboard</Link>
            )}
            {user && !isAdmin && (
              <Link to="/profile" className="text-foreground hover:text-primary transition-colors">My Profile</Link>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {user.email}</span>
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <Link to="/editor">
                  <Button className="btn-hero">
                    Create Certificate
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="btn-hero">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;