import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "manager";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole | null;
  isAdmin: boolean;
  isManager: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string, minecraftIgn?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  const fetchUserRole = useCallback(async (userId: string): Promise<AppRole | null> => {
    try {
      setRoleLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      const role = data?.role ?? null;
      setUserRole(role);
      return role;
    } catch (err) {
      console.error("Error in fetchUserRole:", err);
      return null;
    } finally {
      setRoleLoading(false);
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (user?.id) {
      await fetchUserRole(user.id);
    }
  }, [user?.id, fetchUserRole]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        
        console.log("Auth state change:", event, newSession?.user?.email);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // When user logs out, clear role immediately
        if (!newSession?.user) {
          setUserRole(null);
          setRoleLoading(false);
        }
        
        // Defer role fetching with setTimeout to prevent deadlock
        if (newSession?.user) {
          setTimeout(() => {
            if (mounted) {
              fetchUserRole(newSession.user.id);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log("Initial session check:", existingSession?.user?.email);
        
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          // Wait for role to be fetched before setting loading to false
          await fetchUserRole(existingSession.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error: error as Error };
      }
      
      // Immediately fetch role after successful login
      if (data.user) {
        await fetchUserRole(data.user.id);
      }
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string, minecraftIgn?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
          minecraft_ign: minecraftIgn,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    setUserRole(null);
    await supabase.auth.signOut();
  };

  const isAdmin = userRole === "admin";
  const isManager = userRole === "manager";

  // Combined loading state - we're loading if either auth or role is loading
  const isLoading = loading || roleLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading: isLoading,
        userRole,
        isAdmin,
        isManager,
        signIn,
        signUp,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
