import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Gem, Key, Package, Search, Filter, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", name: "All Products" },
  { id: "survival-ranks", name: "Survival Ranks" },
  { id: "lifesteal-ranks", name: "Lifesteal Ranks" },
  { id: "crates", name: "Crates & Keys" },
  { id: "items", name: "Items" },
  { id: "bundles", name: "Bundles" },
];

const products = [
  {
    id: 1,
    name: "VIP Rank",
    category: "survival-ranks",
    mode: "Survival",
    price: 299,
    originalPrice: null,
    icon: Crown,
    color: "neon-green",
    features: ["Custom [VIP] prefix", "3 homes", "/hat command", "Colored chat"],
    lifetime: true,
    popular: false,
  },
  {
    id: 2,
    name: "MVP Rank",
    category: "survival-ranks",
    mode: "Survival",
    price: 599,
    originalPrice: 799,
    icon: Gem,
    color: "neon-cyan",
    features: ["All VIP perks", "5 homes", "Fly in lobby", "/nick command"],
    lifetime: true,
    popular: true,
  },
  {
    id: 3,
    name: "Elite Rank",
    category: "survival-ranks",
    mode: "Survival",
    price: 999,
    originalPrice: null,
    icon: Crown,
    color: "neon-purple",
    features: ["All MVP perks", "10 homes", "/ec command", "Private vault"],
    lifetime: true,
    popular: false,
  },
  {
    id: 4,
    name: "Hunter Rank",
    category: "lifesteal-ranks",
    mode: "Lifesteal",
    price: 349,
    originalPrice: null,
    icon: Crown,
    color: "neon-green",
    features: ["+1 Starting heart", "Custom kill messages", "Priority queue"],
    lifetime: true,
    popular: false,
  },
  {
    id: 5,
    name: "Slayer Rank",
    category: "lifesteal-ranks",
    mode: "Lifesteal",
    price: 699,
    originalPrice: null,
    icon: Gem,
    color: "neon-cyan",
    features: ["+2 Starting hearts", "All Hunter perks", "Exclusive cosmetics"],
    lifetime: true,
    popular: true,
  },
  {
    id: 6,
    name: "Legend Rank",
    category: "lifesteal-ranks",
    mode: "Lifesteal",
    price: 1299,
    originalPrice: 1499,
    icon: Star,
    color: "neon-purple",
    features: ["+3 Starting hearts", "All Slayer perks", "Seasonal rewards"],
    lifetime: true,
    popular: false,
  },
  {
    id: 7,
    name: "Mega Crate Key x5",
    category: "crates",
    mode: "Both",
    price: 199,
    originalPrice: null,
    icon: Key,
    color: "neon-pink",
    features: ["5 Mega Keys", "Chance for rare items", "Works on all servers"],
    lifetime: false,
    popular: false,
  },
  {
    id: 8,
    name: "Ultra Crate Key x10",
    category: "crates",
    mode: "Both",
    price: 499,
    originalPrice: 599,
    icon: Key,
    color: "neon-cyan",
    features: ["10 Ultra Keys", "Legendary drop chance", "Exclusive rewards"],
    lifetime: false,
    popular: true,
  },
  {
    id: 9,
    name: "Starter Bundle",
    category: "bundles",
    mode: "Survival",
    price: 399,
    originalPrice: 500,
    icon: Package,
    color: "neon-green",
    features: ["VIP Rank", "3 Mega Keys", "Starter kit"],
    lifetime: true,
    popular: false,
  },
  {
    id: 10,
    name: "Ultimate Bundle",
    category: "bundles",
    mode: "Survival",
    price: 1499,
    originalPrice: 1999,
    icon: Package,
    color: "neon-purple",
    features: ["Elite Rank", "20 Ultra Keys", "Exclusive items", "Discord role"],
    lifetime: true,
    popular: true,
  },
];

const Store = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-pixel text-3xl md:text-4xl text-foreground mb-4">
              <span className="text-neon-green">Server</span> Store
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our collection of ranks, items, and keys. All purchases include instant in-game delivery.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} products
              </span>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeCategory === category.id
                    ? "bg-neon-green text-black"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={cn(
                  "minecraft-card neon-border p-6 flex flex-col",
                  product.popular && "ring-2 ring-neon-cyan"
                )}
              >
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  {product.popular && (
                    <span className="px-2 py-1 bg-neon-cyan text-black text-xs font-bold rounded">
                      POPULAR
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded">
                      SALE
                    </span>
                  )}
                  {product.lifetime && !product.popular && !product.originalPrice && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                      LIFETIME
                    </span>
                  )}
                </div>

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
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-green flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        ₹{product.originalPrice}
                      </span>
                    )}
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

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Store;
