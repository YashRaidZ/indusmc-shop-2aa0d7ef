import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin, isManager, userRole } = useAuth();
  const location = useLocation();

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to auth
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Admin route but user doesn't have admin/manager role
  if (requireAdmin) {
    const hasAccess = isAdmin || isManager;
    
    console.log("ProtectedRoute: Admin check", { 
      userRole, 
      isAdmin, 
      isManager, 
      hasAccess,
      userId: user.id 
    });
    
    if (!hasAccess) {
      console.log("ProtectedRoute: No admin access, redirecting to /");
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
