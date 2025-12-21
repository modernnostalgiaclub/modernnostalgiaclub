import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showNav={false} />
      
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using ModernNostalgia.club ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ModernNostalgia.club is a Creative Economy Lab providing educational content, training materials, professional workflows, and community resources for artists and music creators. Access to certain features requires an active Patreon membership.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">4. Membership and Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
              Access to premium content is provided through Patreon. Billing, subscription management, and payment processing are handled by Patreon according to their terms of service. We reserve the right to modify membership tiers and pricing with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content provided through the Service, including but not limited to courses, videos, documents, and templates, is the intellectual property of ModernNostalgia.club. You may not reproduce, distribute, or create derivative works without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">6. User Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to use the Service in a lawful manner and not to share account access, redistribute content, harass other members, or engage in any activity that disrupts the Service or community.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. Educational content is for informational purposes and does not guarantee specific results.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, ModernNostalgia.club shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, please contact us through our Patreon page or community channels.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
