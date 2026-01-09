import { Link } from "react-router-dom";
import { Gamepad2, MessageCircle, Mail, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <Gamepad2 className="h-6 w-6 text-neon-green" />
              <span className="font-pixel text-sm text-foreground">IndusMC</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium Minecraft gaming experience with Survival, Lifesteal, and more.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Server IP:</span>
              <code className="px-2 py-1 bg-muted rounded text-neon-green font-mono">
                play.indusmc.in
              </code>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/store" className="text-muted-foreground hover:text-neon-green transition-colors">
                  Store
                </Link>
              </li>
              <li>
                <Link to="/ranks" className="text-muted-foreground hover:text-neon-green transition-colors">
                  Ranks
                </Link>
              </li>
              <li>
                <Link to="/rules" className="text-muted-foreground hover:text-neon-green transition-colors">
                  Rules
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-neon-green transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/rules#terms" className="text-muted-foreground hover:text-neon-green transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/rules#privacy" className="text-muted-foreground hover:text-neon-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/rules#refunds" className="text-muted-foreground hover:text-neon-green transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Connect</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://discord.gg/indusmc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-neon-purple transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discord
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@indusmc.in"
                  className="flex items-center gap-2 text-muted-foreground hover:text-neon-cyan transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  support@indusmc.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 IndusMC. All rights reserved. Not affiliated with Mojang AB.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
              Server Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
