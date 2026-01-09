import { Sword, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const modes = [
  {
    id: "survival",
    name: "Survival",
    description: "Classic survival gameplay with economy, claims, and custom enchants. Build, trade, and thrive!",
    icon: Sword,
    color: "neon-green",
    features: ["Land Claims", "Economy System", "Custom Enchants", "McMMO Skills"],
    hasRanks: true,
  },
  {
    id: "lifesteal",
    name: "Lifesteal",
    description: "Intense PvP action where every kill grants you hearts. Survive or lose everything!",
    icon: Heart,
    color: "neon-purple",
    features: ["Heart Stealing", "Leaderboards", "Seasons", "Custom Items"],
    hasRanks: true,
  },
  {
    id: "lobby",
    name: "Proxy Lobby",
    description: "Your gateway to all servers. Hang out, show off cosmetics, and connect to any gamemode.",
    icon: Globe,
    color: "neon-cyan",
    features: ["Server Selector", "Cosmetics", "Parkour", "Social Hub"],
    hasRanks: false,
  },
];

export function GameModes() {
  return (
    <section className="py-24 bg-card/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-[150px]" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-pixel text-2xl md:text-3xl text-foreground mb-4">
            Game <span className="text-neon-cyan">Modes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose your adventure. Each gamemode offers unique experiences and exclusive ranks.
          </p>
        </div>

        {/* Modes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className="minecraft-card neon-border p-8 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className={`w-16 h-16 rounded-xl bg-${mode.color}/10 flex items-center justify-center`}>
                  <mode.icon className={`h-8 w-8 text-${mode.color}`} />
                </div>
                {mode.hasRanks && (
                  <span className="px-3 py-1 rounded-full bg-neon-green/10 text-neon-green text-xs font-medium">
                    Ranks Available
                  </span>
                )}
              </div>

              {/* Content */}
              <h3 className="font-pixel text-xl text-foreground mb-3">{mode.name}</h3>
              <p className="text-muted-foreground text-sm mb-6 flex-1">
                {mode.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {mode.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span className={`h-1 w-1 rounded-full bg-${mode.color}`} />
                    {feature}
                  </div>
                ))}
              </div>

              {/* CTA */}
              {mode.hasRanks ? (
                <Link to={`/ranks#${mode.id}`}>
                  <Button
                    variant={mode.color === "neon-green" ? "neon" : "neon-purple"}
                    className="w-full"
                  >
                    View Ranks
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Hub Only
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
