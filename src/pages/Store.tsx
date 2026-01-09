import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Gem, Key, Package, Search, Filter, Star, Loader2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const typeFilters = [
  { id: "all", name: "All Products" },
  { id: "rank", name: "Ranks" },
  { id: "crate", name: "Crates" },
  { id: "item", name: "Items" },
  { id: "bundle", name: "Bundles" },
];

const modeFilters = [
  { id: "all", name: "All Modes" },
  { id: "survival", name: "Survival" },
  { id: "lifesteal", name: "Lifesteal" },
];

const getProductIcon = (type: string) => {
  switch (type) {
    case "rank":
      return Crown;
    case "crate":
      return Key;
    case "bundle":
      return Package;
    case "item":
      return Gem;
    default:
      return Star;
  }
};

const getProductColor = (type: string, mode: string) => {
  if (mode === "lifesteal") return "text-destructive";
  switch (type) {
    case "rank":
      return "text-primary";
    case "crate":
      return "text-secondary";
    case "bundle":
      return "text-accent";
    default:
      return "text-primary";
  }
};

const Store = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");
  const [activeMode, setActiveMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("price_inr", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesType = activeType === "all" || product.type === activeType;
    const matchesMode = activeMode === "all" || product.mode === activeMode;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesMode && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-pixel text-3xl md:text-4xl text-foreground mb-4">
              <span className="text-primary">Server</span> Store
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

          {/* Mode Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {modeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveMode(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeMode === filter.id
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {filter.name}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2 mb-12">
            {typeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveType(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeType === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {filter.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const Icon = getProductIcon(product.type);
                const colorClass = getProductColor(product.type, product.mode);
                const features = Array.isArray(product.features) ? product.features : [];

                return (
                  <div
                    key={product.id}
                    className={cn(
                      "minecraft-card neon-border p-6 flex flex-col",
                      product.is_featured && "ring-2 ring-secondary"
                    )}
                  >
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {product.is_featured && (
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded">
                          POPULAR
                        </span>
                      )}
                      {product.original_price_inr && product.original_price_inr > product.price_inr && (
                        <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded">
                          SALE
                        </span>
                      )}
                      {product.lifetime && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded">
                          LIFETIME
                        </span>
                      )}
                    </div>

                    {/* Icon */}
                    <div className={cn("w-14 h-14 rounded-lg bg-muted flex items-center justify-center mb-4")}>
                      <Icon className={cn("h-7 w-7", colorClass)} />
                    </div>

                    {/* Info */}
                    <div className="mb-4">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {product.mode}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground mt-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    {features.length > 0 && (
                      <ul className="space-y-2 mb-6 flex-1">
                        {(features as string[]).slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {features.length > 4 && (
                          <li className="text-xs text-muted-foreground">
                            +{features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    )}

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                      <div>
                        {product.original_price_inr && product.original_price_inr > product.price_inr && (
                          <span className="text-sm text-muted-foreground line-through mr-2">
                            {formatCurrency(product.original_price_inr)}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-foreground">
                          {formatCurrency(product.price_inr)}
                        </span>
                      </div>
                      <Button
                        variant={product.is_featured ? "neon" : "neon-outline"}
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setActiveType("all");
                  setActiveMode("all");
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
