import { useState } from "react";
import { Copy, Check, Users, Server, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function HeroSection() {
  const [copied, setCopied] = useState(false);
  const serverIP = "play.indusmc.in";

  const copyIP = () => {
    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    toast.success("Server IP copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/20 rounded-full blur-[128px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-cyan/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "0.5s" }} />

      <div className="container relative z-10 mx-auto px-4 py-32 text-center">
        {/* Server Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 mb-8 animate-slide-up">
          <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-sm text-neon-green font-medium">Server Online • 150+ Players</span>
        </div>

        {/* Main Title */}
        <h1 className="font-pixel text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <span className="text-glow-green">INDUS</span>
          <span className="text-neon-cyan">MC</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Premium Minecraft Experience
        </p>

        {/* Game Modes */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <span className="px-4 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-medium">
            Survival
          </span>
          <span className="px-4 py-2 rounded-lg bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-sm font-medium">
            Lifesteal
          </span>
          <span className="px-4 py-2 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-medium">
            Proxy Lobby
          </span>
        </div>

        {/* Server IP */}
        <div className="inline-flex items-center gap-2 mb-10 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-muted/50 border border-border">
            <span className="text-muted-foreground text-sm">Server IP:</span>
            <code className="font-mono text-lg text-neon-green font-bold">{serverIP}</code>
            <button
              onClick={copyIP}
              className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-neon-green"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <Link to="/store">
            <Button variant="neon" size="xl">
              Buy Ranks
            </Button>
          </Link>
          <Link to="/store">
            <Button variant="neon-outline" size="xl">
              Shop Items
            </Button>
          </Link>
          <a href="https://discord.gg/indusmc" target="_blank" rel="noopener noreferrer">
            <Button variant="neon-purple" size="xl">
              Join Discord
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.6s" }}>
          <div className="minecraft-card p-6 text-center">
            <Users className="h-8 w-8 text-neon-green mx-auto mb-3" />
            <div className="font-pixel text-2xl text-foreground mb-1">10K+</div>
            <div className="text-sm text-muted-foreground">Players</div>
          </div>
          <div className="minecraft-card p-6 text-center">
            <Server className="h-8 w-8 text-neon-cyan mx-auto mb-3" />
            <div className="font-pixel text-2xl text-foreground mb-1">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div className="minecraft-card p-6 text-center">
            <Zap className="h-8 w-8 text-neon-purple mx-auto mb-3" />
            <div className="font-pixel text-2xl text-foreground mb-1">Instant</div>
            <div className="text-sm text-muted-foreground">Delivery</div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
