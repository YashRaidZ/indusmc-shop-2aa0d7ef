import { Crown, Gem, Key, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "VIP Rank",
    mode: "Survival",
    price: 299,
    icon: Crown,
    color: "neon-green",
    features: ["Custom prefix", "Home commands", "Priority queue"],
    popular: false,
  },
  {
    id: 2,
    name: "MVP Rank",
    mode: "Survival",
    price: 599,
    icon: Gem,
    color: "neon-cyan",
    features: ["All VIP perks", "Fly in lobby", "Special kits"],
    popular: true,
  },
  {
    id: 3,
    name: "Legend Rank",
    mode: "Lifesteal",
    price: 999,
    icon: Crown,
    color: "neon-purple",
    features: ["Max hearts boost", "Custom death messages", "Exclusive cosmetics"],
    popular: false,
  },
  {
    id: 4,
    name: "Mega Crate Key x5",
    mode: "Both",
    price: 199,
    icon: Key,
    color: "neon-pink",
    features: ["5 Mega Keys", "Rare items", "Exclusive drops"],
    popular: false,
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-24 bg-background relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-pixel text-2xl md:text-3xl text-foreground mb-4">
            Featured <span className="text-neon-green">Products</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Power up your gameplay with exclusive ranks, items, and keys. Instant delivery guaranteed!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`minecraft-card neon-border p-6 flex flex-col ${
                product.popular ? "ring-2 ring-neon-cyan" : ""
              }`}
            >
              {product.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neon-cyan text-black text-xs font-bold rounded-full">
                  POPULAR
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-lg bg-${product.color}/10 flex items-center justify-center mb-4`}>
                <product.icon className={`h-7 w-7 text-${product.color}`} />
              </div>

              {/* Info */}
              <div className="mb-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {product.mode}
                </span>
                <h3 className="text-lg font-semibold text-foreground mt-1">
                  {product.name}
                </h3>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-green" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <span className="text-2xl font-bold text-foreground">₹{product.price}</span>
                  <span className="text-xs text-muted-foreground ml-1">INR</span>
                </div>
                <Button
                  variant={product.popular ? "neon-cyan" : "neon-outline"}
                  size="sm"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link to="/store">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
