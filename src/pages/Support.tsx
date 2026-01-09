import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, HelpCircle, ChevronDown, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How long does delivery take?",
    answer: "Items are delivered instantly once payment is confirmed. If you're online in-game, you'll receive them immediately. If offline, items will be delivered when you next join.",
  },
  {
    question: "Can I gift a rank to someone else?",
    answer: "Yes! During checkout, simply enter the recipient's Minecraft username instead of your own. They will receive the items automatically.",
  },
  {
    question: "I didn't receive my items. What should I do?",
    answer: "First, make sure you spelled your username correctly. If the issue persists, contact us on Discord with your order ID and we'll resolve it quickly.",
  },
  {
    question: "Can I upgrade my rank?",
    answer: "Yes, you can upgrade to a higher rank at any time. Contact us on Discord for upgrade pricing based on your current rank.",
  },
  {
    question: "Do ranks carry over between seasons?",
    answer: "Survival ranks are permanent and carry over. Lifesteal ranks are permanent but some perks may reset with new seasons.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept UPI (Google Pay, PhonePe, Paytm), debit/credit cards, and PayPal for international payments.",
  },
];

const Support = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-pixel text-3xl md:text-4xl text-foreground mb-4">
              Get <span className="text-neon-green">Support</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Need help? We're here for you. Check the FAQ or reach out to us directly.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
            <a
              href="https://discord.gg/indusmc"
              target="_blank"
              rel="noopener noreferrer"
              className="minecraft-card neon-border p-6 flex items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-lg bg-neon-purple/10 flex items-center justify-center">
                <MessageCircle className="h-7 w-7 text-neon-purple" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Discord Support</h3>
                <p className="text-sm text-muted-foreground">Fastest response • 24/7</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </a>

            <a
              href="mailto:support@indusmc.in"
              className="minecraft-card neon-border p-6 flex items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <Mail className="h-7 w-7 text-neon-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                <p className="text-sm text-muted-foreground">support@indusmc.in</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* FAQ Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="h-6 w-6 text-neon-green" />
                <h2 className="font-pixel text-xl text-foreground">FAQ</h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="minecraft-card overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-medium text-foreground">{faq.question}</span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          openFaq === index && "rotate-180"
                        )}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-4 text-sm text-muted-foreground">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Form */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-6 w-6 text-neon-cyan" />
                <h2 className="font-pixel text-xl text-foreground">Contact Us</h2>
              </div>

              <form onSubmit={handleSubmit} className="minecraft-card p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                      className="bg-muted/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                      className="bg-muted/50 border-border"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What's this about?"
                    required
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your issue or question..."
                    rows={5}
                    required
                    className="bg-muted/50 border-border resize-none"
                  />
                </div>
                <Button type="submit" variant="neon" className="w-full">
                  Send Message
                </Button>
              </form>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
