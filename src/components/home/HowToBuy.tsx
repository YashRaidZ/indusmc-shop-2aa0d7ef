import { UserCheck, ShoppingCart, CreditCard, Zap } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Enter Your IGN",
    description: "Provide your Minecraft username. Make sure it's spelled correctly!",
    icon: UserCheck,
  },
  {
    step: 2,
    title: "Select Products",
    description: "Browse ranks, items, or keys. Add them to your cart.",
    icon: ShoppingCart,
  },
  {
    step: 3,
    title: "Complete Payment",
    description: "Pay securely with UPI, cards, or PayPal. All major methods supported.",
    icon: CreditCard,
  },
  {
    step: 4,
    title: "Instant Delivery",
    description: "Items are delivered automatically in-game within seconds!",
    icon: Zap,
  },
];

export function HowToBuy() {
  return (
    <section className="py-24 bg-background relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-pixel text-2xl md:text-3xl text-foreground mb-4">
            How to <span className="text-neon-purple">Buy</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Purchasing is quick and easy. Follow these simple steps to get your items.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}

              <div className="minecraft-card p-6 text-center relative z-10">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-neon-green flex items-center justify-center font-pixel text-sm text-black">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mt-4 mb-4">
                  <step.icon className="h-8 w-8 text-neon-cyan" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
