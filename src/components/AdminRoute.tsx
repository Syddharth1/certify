import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - Client-side route protection for admin pages
 * 
 * SECURITY NOTE: This component provides UI-only protection.
 * It prevents non-admin users from seeing admin UI, but does NOT provide
 * actual security. All admin functionality MUST be protected server-side:
 * 
 * 1. Edge functions must use requireAdmin() for authorization
 * 2. RLS policies must enforce admin-only access on database level
 * 3. Never trust client-side role checks for security decisions
 * 
 * This component is for UX purposes only - hiding admin UI from non-admins.
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !isAdmin) {
      navigate("/profile");
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;