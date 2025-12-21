import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showNav={false} />
      
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide when connecting your Patreon account, including your name, email address, avatar, and Patreon membership tier. We also collect usage data about how you interact with our courses and community features.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information to provide access to membership content, track your course progress, personalize your experience, communicate important updates, and improve our services. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">3. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We integrate with Patreon for authentication and membership management. When you connect your Patreon account, you are also subject to Patreon's privacy policy. We may use analytics services to understand how our platform is used.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">4. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using industry-standard practices. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">5. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to maintain your session, remember your preferences, and analyze usage patterns. You can control cookie settings through your browser, though some features may not function properly without them.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal information. You can manage your account settings or request account deletion through your account page. We will respond to data requests within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide services. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the information promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of significant changes through the Service or via email. Your continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or your personal data, please contact us through our Patreon page or community channels.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
