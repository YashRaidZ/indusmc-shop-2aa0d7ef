import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Gamepad2, Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [minecraftIgn, setMinecraftIgn] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string; minecraftIgn?: string }>({});

  const { user, loading, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get the intended destination from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  // Handle redirect after auth state is resolved
  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading
    
    if (user) {
      // Determine where to redirect based on role and intended destination
      let redirectTo = from;
      
      // If the user was trying to access admin, check if they have permission
      if (from.startsWith("/admin")) {
        if (isAdmin || isManager) {
          redirectTo = from;
        } else {
          // Non-admin trying to access admin, redirect to home
          redirectTo = "/";
        }
      }
      
      console.log("Auth: Redirecting authenticated user to:", redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, isAdmin, isManager, navigate, from]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; displayName?: string; minecraftIgn?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!isLogin && displayName && displayName.length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters";
    }

    if (!isLogin && minecraftIgn && !/^[a-zA-Z0-9_]{3,16}$/.test(minecraftIgn)) {
      newErrors.minecraftIgn = "Invalid Minecraft username (3-16 chars, letters, numbers, underscore)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email.trim(), password);
        
        if (error) {
          let message = error.message;
          if (message.includes("Invalid login credentials")) {
            message = "Invalid email or password. Please try again.";
          }
          toast({
            variant: "destructive",
            title: "Login failed",
            description: message,
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully logged in",
          });
          // Redirect will happen via useEffect when user state updates
        }
      } else {
        const { error } = await signUp(email.trim(), password, displayName || undefined, minecraftIgn || undefined);
        
        if (error) {
          let message = error.message;
          if (message.includes("already registered")) {
            message = "This email is already registered. Please login instead.";
          }
          toast({
            variant: "destructive",
            title: "Signup failed",
            description: message,
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Import signIn and signUp from useAuth
  const { signIn, signUp } = useAuth();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setDisplayName("");
    setMinecraftIgn("");
    setErrors({});
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <div className="mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Gamepad2 className="h-10 w-10 text-primary transition-all group-hover:text-secondary" />
              <div className="absolute inset-0 blur-lg bg-primary/30 group-hover:bg-secondary/30 transition-all" />
            </div>
            <span className="font-bold text-xl text-foreground">
              IndusMC
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card rounded-lg p-8 border border-border shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isLogin ? "Login" : "Sign Up"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin
                ? "Welcome back, player!"
                : "Join the IndusMC community"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="minecraftIgn">Minecraft Username</Label>
                  <Input
                    id="minecraftIgn"
                    type="text"
                    autoComplete="username"
                    placeholder="Steve123"
                    value={minecraftIgn}
                    onChange={(e) => setMinecraftIgn(e.target.value)}
                    className="bg-muted border-border"
                    disabled={isSubmitting}
                  />
                  {errors.minecraftIgn && (
                    <p className="text-xs text-destructive">{errors.minecraftIgn}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Used for product delivery in-game</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name (optional)</Label>
                  <Input
                    id="displayName"
                    type="text"
                    autoComplete="name"
                    placeholder="Steve"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-muted border-border"
                    disabled={isSubmitting}
                  />
                  {errors.displayName && (
                    <p className="text-xs text-destructive">{errors.displayName}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="player@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted border-border pr-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isLogin ? "Login" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              disabled={isSubmitting}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Admin access is invite-only. Contact staff for permissions.
        </p>
      </div>
    </div>
  );
}
