import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, X, Crown, Gem, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const survivalRanks = [
  {
    name: "VIP",
    price: 299,
    color: "neon-green",
    icon: Crown,
    features: {
      prefix: "[VIP]",
      homes: 3,
      hatCommand: true,
      coloredChat: true,
      flyInLobby: false,
      nickCommand: false,
      enderchest: false,
      privateVault: false,
      particles: false,
    },
  },
  {
    name: "MVP",
    price: 599,
    color: "neon-cyan",
    icon: Gem,
    popular: true,
    features: {
      prefix: "[MVP]",
      homes: 5,
      hatCommand: true,
      coloredChat: true,
      flyInLobby: true,
      nickCommand: true,
      enderchest: false,
      privateVault: false,
      particles: true,
    },
  },
  {
    name: "Elite",
    price: 999,
    color: "neon-purple",
    icon: Star,
    features: {
      prefix: "[Elite]",
      homes: 10,
      hatCommand: true,
      coloredChat: true,
      flyInLobby: true,
      nickCommand: true,
      enderchest: true,
      privateVault: true,
      particles: true,
    },
  },
];

const lifestealRanks = [
  {
    name: "Hunter",
    price: 349,
    color: "neon-green",
    icon: Crown,
    features: {
      prefix: "[Hunter]",
      extraHearts: 1,
      customKillMsg: true,
      priorityQueue: true,
      exclusiveCos: false,
      seasonRewards: false,
      specialAbility: false,
    },
  },
  {
    name: "Slayer",
    price: 699,
    color: "neon-cyan",
    icon: Gem,
    popular: true,
    features: {
      prefix: "[Slayer]",
      extraHearts: 2,
      customKillMsg: true,
      priorityQueue: true,
      exclusiveCos: true,
      seasonRewards: false,
      specialAbility: true,
    },
  },
  {
    name: "Legend",
    price: 1299,
    color: "neon-purple",
    icon: Star,
    features: {
      prefix: "[Legend]",
      extraHearts: 3,
      customKillMsg: true,
      priorityQueue: true,
      exclusiveCos: true,
      seasonRewards: true,
      specialAbility: true,
    },
  },
];

const FeatureCheck = ({ available }: { available: boolean }) =>
  available ? (
    <Check className="h-5 w-5 text-neon-green" />
  ) : (
    <X className="h-5 w-5 text-muted-foreground/30" />
  );

const Ranks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-pixel text-3xl md:text-4xl text-foreground mb-4">
              Server <span className="text-neon-purple">Ranks</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upgrade your gameplay with exclusive perks and features. All ranks are lifetime and include instant delivery.
            </p>
          </div>

          {/* Survival Ranks */}
          <section id="survival" className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 w-8 bg-neon-green rounded" />
              <h2 className="font-pixel text-xl text-foreground">Survival Ranks</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {survivalRanks.map((rank) => (
                <div
                  key={rank.name}
                  className={cn(
                    "minecraft-card neon-border p-8 flex flex-col",
                    rank.popular && "ring-2 ring-neon-cyan relative"
                  )}
                >
                  {rank.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon-cyan text-black text-xs font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 rounded-2xl bg-${rank.color}/10 flex items-center justify-center mx-auto mb-4`}>
                      <rank.icon className={`h-10 w-10 text-${rank.color}`} />
                    </div>
                    <h3 className="font-pixel text-2xl text-foreground mb-2">{rank.name}</h3>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-3xl font-bold text-foreground">₹{rank.price}</span>
                      <span className="text-sm text-muted-foreground">INR</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Lifetime</span>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Prefix</span>
                      <span className={`font-mono text-sm text-${rank.color}`}>
                        {rank.features.prefix}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Homes</span>
                      <span className="text-sm text-foreground">{rank.features.homes}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">/hat Command</span>
                      <FeatureCheck available={rank.features.hatCommand} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Colored Chat</span>
                      <FeatureCheck available={rank.features.coloredChat} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Fly in Lobby</span>
                      <FeatureCheck available={rank.features.flyInLobby} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">/nick Command</span>
                      <FeatureCheck available={rank.features.nickCommand} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">/ec Anywhere</span>
                      <FeatureCheck available={rank.features.enderchest} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Private Vault</span>
                      <FeatureCheck available={rank.features.privateVault} />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Particles</span>
                      <FeatureCheck available={rank.features.particles} />
                    </div>
                  </div>

                  <Button
                    variant={rank.popular ? "neon-cyan" : "neon-outline"}
                    size="lg"
                    className="w-full"
                  >
                    Buy {rank.name}
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Lifesteal Ranks */}
          <section id="lifesteal">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 w-8 bg-neon-purple rounded" />
              <h2 className="font-pixel text-xl text-foreground">Lifesteal Ranks</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {lifestealRanks.map((rank) => (
                <div
                  key={rank.name}
                  className={cn(
                    "minecraft-card neon-border p-8 flex flex-col",
                    rank.popular && "ring-2 ring-neon-cyan relative"
                  )}
                >
                  {rank.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon-cyan text-black text-xs font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 rounded-2xl bg-${rank.color}/10 flex items-center justify-center mx-auto mb-4`}>
                      <rank.icon className={`h-10 w-10 text-${rank.color}`} />
                    </div>
                    <h3 className="font-pixel text-2xl text-foreground mb-2">{rank.name}</h3>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-3xl font-bold text-foreground">₹{rank.price}</span>
                      <span className="text-sm text-muted-foreground">INR</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Lifetime</span>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Prefix</span>
                      <span className={`font-mono text-sm text-${rank.color}`}>
                        {rank.features.prefix}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Extra Hearts</span>
                      <span className="text-sm text-foreground">+{rank.features.extraHearts}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Custom Kill Messages</span>
                      <FeatureCheck available={rank.features.customKillMsg} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Priority Queue</span>
                      <FeatureCheck available={rank.features.priorityQueue} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Exclusive Cosmetics</span>
                      <FeatureCheck available={rank.features.exclusiveCos} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Season Rewards</span>
                      <FeatureCheck available={rank.features.seasonRewards} />
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Special Ability</span>
                      <FeatureCheck available={rank.features.specialAbility} />
                    </div>
                  </div>

                  <Button
                    variant={rank.popular ? "neon-purple" : "neon-outline"}
                    size="lg"
                    className="w-full"
                  >
                    Buy {rank.name}
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Ranks;
