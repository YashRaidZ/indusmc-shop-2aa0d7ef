import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Gamepad2, User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart/CartSheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Store", path: "/store" },
  { name: "Rules", path: "/rules" },
  { name: "Support", path: "/support" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isManager, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Gamepad2 className="h-8 w-8 text-neon-green transition-all group-hover:text-neon-cyan" />
              <div className="absolute inset-0 blur-lg bg-neon-green/30 group-hover:bg-neon-cyan/30 transition-all" />
            </div>
            <span className="font-pixel text-lg text-foreground group-hover:text-glow-green transition-all">
              IndusMC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-300",
                  location.pathname === link.path
                    ? "text-neon-green bg-neon-green/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {link.name}
              </Link>
            ))}
            {/* Admin Link */}
            {(isAdmin || isManager) && (
              <Link
                to="/admin"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-1.5",
                  location.pathname.startsWith("/admin")
                    ? "text-secondary bg-secondary/10"
                    : "text-muted-foreground hover:text-secondary hover:bg-muted"
                )}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <CartSheet />
            
            {loading ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                    <span className="text-sm font-medium text-primary">
                      {user.email?.[0].toUpperCase()}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    {(isAdmin || isManager) && (
                      <p className="text-xs text-muted-foreground capitalize">{isAdmin ? "Admin" : "Manager"}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  {(isAdmin || isManager) && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
            
            <Button variant="neon" size="sm" asChild>
              <Link to="/store">Buy Ranks</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-neon-green transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border/50 py-4 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    location.pathname === link.path
                      ? "text-neon-green bg-neon-green/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {/* Mobile Admin Link */}
              {(isAdmin || isManager) && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    location.pathname.startsWith("/admin")
                      ? "text-secondary bg-secondary/10"
                      : "text-muted-foreground hover:text-secondary hover:bg-muted"
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              
              <div className="flex gap-2 mt-4 px-4">
                <CartSheet />
                {user ? (
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                )}
                <Button variant="neon" size="sm" className="flex-1" asChild>
                  <Link to="/store" onClick={() => setIsOpen(false)}>Buy Ranks</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
