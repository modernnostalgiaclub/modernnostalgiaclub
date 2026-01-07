import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showNav={false} />
      
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 7, 2025</p>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              ModernNostalgia.club ("Company," "we," "us," or "our"), a business operating under the laws of the State of California, United States, with its principal place of business in San Diego, California, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website modernnostalgia.club and use our Creative Economy Lab platform and related services (collectively, the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">2. Information We Collect</h2>
            
            <h3 className="font-display text-xl mb-3 mt-6">2.1 Information You Provide Directly</h3>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you voluntarily provide when you:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Create an Account:</strong> When you register via Patreon authentication, we receive your name, email address, profile picture, and Patreon membership tier information.</li>
              <li><strong>Complete Your Profile:</strong> You may optionally provide your stage name, social media handles (Instagram, TikTok, Twitter/X, Linktree), PRO affiliation, and publishing information.</li>
              <li><strong>Submit Content:</strong> When you submit music, projects, or other creative works for review or feedback.</li>
              <li><strong>Request Services:</strong> When you request beat licenses, including your name, email, artist name, and payment information processed through our payment processor.</li>
              <li><strong>Participate in Community Features:</strong> Posts, comments, and other content you share in community forums.</li>
              <li><strong>Contact Us:</strong> Any information you provide when you contact us for support or inquiries.</li>
            </ul>

            <h3 className="font-display text-xl mb-3 mt-6">2.2 Information Collected Automatically</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you access the Service, we automatically collect certain information, including:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, and IP address.</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, links clicked, course progress, lesson completions, and other interactions with the Service.</li>
              <li><strong>Log Data:</strong> Server logs that record requests made to our Service, including timestamps and referring URLs.</li>
            </ul>

            <h3 className="font-display text-xl mb-3 mt-6">2.3 Information from Third Parties</h3>
            <p className="text-muted-foreground leading-relaxed">
              We receive information from third-party services, including:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Patreon:</strong> Your Patreon user ID, email, name, profile picture, and membership/tier status.</li>
              <li><strong>Analytics Providers:</strong> Aggregated and anonymized data about website traffic and user behavior.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect for the following purposes:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Provide and Maintain the Service:</strong> To authenticate your identity, grant access to membership content based on your tier, track your learning progress, and deliver the features you request.</li>
              <li><strong>Personalize Your Experience:</strong> To tailor content, recommendations, and communications based on your preferences and usage patterns.</li>
              <li><strong>Process Transactions:</strong> To process beat license requests and other service-related transactions.</li>
              <li><strong>Communicate with You:</strong> To send important notices, updates, security alerts, and support messages. With your consent, to send promotional communications about new content, features, or events.</li>
              <li><strong>Improve the Service:</strong> To analyze usage trends, troubleshoot technical issues, and enhance the functionality and user experience of the Service.</li>
              <li><strong>Protect Rights and Safety:</strong> To detect, prevent, and address fraud, abuse, security risks, and technical issues.</li>
              <li><strong>Comply with Legal Obligations:</strong> To fulfill our legal requirements and respond to lawful requests from authorities.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are located in the European Economic Area (EEA) or United Kingdom, we process your personal data based on the following legal grounds:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Contract Performance:</strong> Processing necessary to provide the Service you requested.</li>
              <li><strong>Legitimate Interests:</strong> Processing necessary for our legitimate business interests, such as improving the Service and preventing fraud, where those interests are not overridden by your rights.</li>
              <li><strong>Consent:</strong> Where you have given explicit consent for specific processing activities, such as marketing communications.</li>
              <li><strong>Legal Obligation:</strong> Processing necessary to comply with applicable laws.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">5. Disclosure of Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With third-party vendors, consultants, and service providers who perform services on our behalf, such as hosting, analytics, email delivery, and payment processing. These parties are contractually obligated to protect your information and use it only for the purposes for which it was disclosed.</li>
              <li><strong>Community Features:</strong> Information you share in public community areas (such as forums or posts) may be visible to other members.</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, sale of assets, or bankruptcy proceeding, your information may be transferred as part of that transaction.</li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, court order, or governmental regulation, or when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.</li>
              <li><strong>With Your Consent:</strong> For any other purpose disclosed by us when you provide the information or with your explicit consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">6. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to collect and store certain information when you use the Service:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the operation of the Service, such as maintaining your login session and remembering your preferences.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the Service, enabling us to improve functionality and user experience.</li>
              <li><strong>Local Storage:</strong> We use browser local storage to store session information and user preferences.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">7. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures designed to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li>Encryption of data in transit using SSL/TLS protocols</li>
              <li>Secure cloud infrastructure with access controls</li>
              <li>Regular security assessments and monitoring</li>
              <li>Row-level security policies on database access</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">8. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you with the Service. We may also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you request deletion of your account, we will delete or anonymize your personal information within thirty (30) days, except where we are required to retain certain information for legal, tax, or accounting purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">9. Your Rights</h2>
            
            <h3 className="font-display text-xl mb-3 mt-6">9.1 General Rights</h3>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location and applicable law, you may have the following rights regarding your personal information:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request access to the personal information we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal information.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information, subject to certain exceptions.</li>
              <li><strong>Portability:</strong> Request a copy of your personal information in a structured, commonly used, machine-readable format.</li>
              <li><strong>Opt-Out:</strong> Opt out of receiving promotional communications at any time.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, please contact us using the information provided below or use the account settings available in the Service.
            </p>

            <h3 className="font-display text-xl mb-3 mt-6">9.2 California Residents (CCPA/CPRA)</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA):
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Right to Know:</strong> You have the right to request that we disclose the categories and specific pieces of personal information we have collected about you, the categories of sources, the business purpose for collecting or selling personal information, and the categories of third parties with whom we share personal information.</li>
              <li><strong>Right to Delete:</strong> You have the right to request deletion of your personal information, subject to certain exceptions.</li>
              <li><strong>Right to Correct:</strong> You have the right to request correction of inaccurate personal information.</li>
              <li><strong>Right to Opt-Out of Sale/Sharing:</strong> We do not sell or share your personal information for cross-context behavioral advertising. If this changes, you will have the right to opt out.</li>
              <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> You have the right to limit the use of sensitive personal information to purposes necessary to provide the Service.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your privacy rights.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Categories of Personal Information Collected:</strong> In the preceding 12 months, we have collected the following categories of personal information: identifiers (name, email, IP address), commercial information (transaction history), internet or network activity (browsing history, usage data), and professional information (PRO affiliation, publishing details).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Authorized Agent:</strong> You may designate an authorized agent to make a request on your behalf. We may require written permission and verification of your identity before processing requests from an authorized agent.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To submit a verifiable consumer request, please contact us using the information below. We will respond to verifiable requests within 45 days, or up to 90 days with notice if additional time is needed.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">10. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in the United States, where our servers are located. If you are accessing the Service from outside the United States, please be aware that your information will be transferred to, stored, and processed in the United States, where data protection laws may differ from those in your jurisdiction.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using the Service, you consent to the transfer of your information to the United States. Where required by law, we implement appropriate safeguards for international data transfers, such as standard contractual clauses.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">11. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service integrates with and may contain links to third-party websites, services, and applications, including:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li><strong>Patreon:</strong> For authentication and membership management</li>
              <li><strong>DISCO:</strong> For beat and music catalog access</li>
              <li><strong>Eventbrite:</strong> For event registration and management</li>
              <li><strong>JotForm:</strong> For application forms, sponsorship inquiries, and other form submissions</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These third parties have their own privacy policies governing the collection and use of your information. We are not responsible for the privacy practices of these third parties, and we encourage you to review their privacy policies before providing your information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">12. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not intended for individuals under the age of eighteen (18). We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to delete that information promptly.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately so we can take appropriate action.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">13. Do Not Track</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some browsers have a "Do Not Track" feature that allows you to signal that you do not wish to have your online activity tracked. Currently, there is no uniform standard for how websites should respond to Do Not Track signals. As such, the Service does not currently respond to Do Not Track browser signals.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">14. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated Privacy Policy on this page with a revised "Effective Date" and, where appropriate, by sending you a notification via email or through the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of the Service after any changes to this Privacy Policy constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">15. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>ModernNostalgia.club</strong><br />
              San Diego, California, United States<br />
              Email: ge@modernnostalgia.club
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              For California residents exercising CCPA/CPRA rights, you may also contact us at the above email with the subject line "CCPA Request."
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
