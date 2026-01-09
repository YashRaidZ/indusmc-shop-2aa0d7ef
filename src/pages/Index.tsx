import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { GameModes } from "@/components/home/GameModes";
import { HowToBuy } from "@/components/home/HowToBuy";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <GameModes />
        <HowToBuy />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
