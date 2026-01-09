import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, FileText, CreditCard, Lock } from "lucide-react";

const Rules = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-pixel text-3xl md:text-4xl text-foreground mb-4">
              Rules & <span className="text-neon-cyan">Policies</span>
            </h1>
            <p className="text-muted-foreground">
              Please read and understand our rules before playing or purchasing.
            </p>
          </div>

          {/* Server Rules */}
          <section id="rules" className="mb-16">
            <div className="minecraft-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-neon-green" />
                <h2 className="font-pixel text-xl text-foreground">Server Rules</h2>
              </div>

              <div className="space-y-4 text-muted-foreground">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">1. No Cheating or Hacking</h3>
                  <p className="text-sm">Any form of hacking, cheating, or exploiting bugs is strictly prohibited. This includes but is not limited to: x-ray, kill aura, fly hacks, and speed hacks.</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">2. Respect All Players</h3>
                  <p className="text-sm">Treat everyone with respect. No harassment, discrimination, or toxic behavior will be tolerated.</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">3. No Spamming or Advertising</h3>
                  <p className="text-sm">Do not spam chat or advertise other servers, websites, or services.</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">4. No Real Money Trading</h3>
                  <p className="text-sm">Trading in-game items or accounts for real money is prohibited.</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">5. Report Bugs</h3>
                  <p className="text-sm">If you find any bugs or exploits, report them immediately to staff. Exploiting bugs will result in punishment.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Terms of Service */}
          <section id="terms" className="mb-16">
            <div className="minecraft-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-neon-cyan" />
                <h2 className="font-pixel text-xl text-foreground">Terms of Service</h2>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm">
                <p>By using IndusMC services, you agree to the following terms:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>You must be at least 13 years old to use our services.</li>
                  <li>You are responsible for maintaining the security of your account.</li>
                  <li>We reserve the right to ban or suspend accounts that violate our rules.</li>
                  <li>Virtual items and ranks are non-transferable between accounts.</li>
                  <li>We may modify these terms at any time with notice on Discord.</li>
                  <li>IndusMC is not affiliated with Mojang AB or Microsoft.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Refund Policy */}
          <section id="refunds" className="mb-16">
            <div className="minecraft-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-6 w-6 text-neon-purple" />
                <h2 className="font-pixel text-xl text-foreground">Refund Policy</h2>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm">
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="font-semibold text-destructive mb-2">Important Notice</p>
                  <p>All purchases are final. Digital goods cannot be refunded once delivered.</p>
                </div>
                <p>However, we may consider refunds in the following cases:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Technical issues preventing item delivery (with proof)</li>
                  <li>Duplicate charges (contact us within 48 hours)</li>
                  <li>Unauthorized purchases (with valid proof)</li>
                </ul>
                <p className="mt-4">
                  To request a refund, please contact us on Discord with your transaction ID and username.
                  Refund requests must be made within 7 days of purchase.
                </p>
              </div>
            </div>
          </section>

          {/* Privacy Policy */}
          <section id="privacy">
            <div className="minecraft-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-6 w-6 text-neon-pink" />
                <h2 className="font-pixel text-xl text-foreground">Privacy Policy</h2>
              </div>

              <div className="space-y-4 text-muted-foreground text-sm">
                <p>We collect and use your data to provide our services:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong>Minecraft Username:</strong> Required for in-game delivery</li>
                  <li><strong>Email:</strong> For order confirmations and support</li>
                  <li><strong>Payment Info:</strong> Processed securely by our payment providers</li>
                  <li><strong>IP Address:</strong> For security and fraud prevention</li>
                </ul>
                <p className="mt-4">
                  We do not sell or share your personal information with third parties except as required for processing payments.
                </p>
                <p>
                  You can request deletion of your data by contacting us on Discord.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Rules;
