import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-neon-purple/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-neon-green/10 rounded-full blur-[128px]" />

      <div className="relative z-10 text-center px-4">
        <h1 className="font-pixel text-8xl md:text-9xl text-foreground mb-4">
          <span className="text-neon-green">4</span>
          <span className="text-neon-purple">0</span>
          <span className="text-neon-cyan">4</span>
        </h1>
        <p className="font-pixel text-xl text-muted-foreground mb-8">
          Lost in the void...
        </p>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/">
            <Button variant="neon" size="lg">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
