import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showNav={false} />
      
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <h1 className="font-display text-4xl md:text-5xl mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 7, 2025</p>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and ModernNostalgia.club ("Company," "we," "us," or "our"), a business operating under the laws of the State of California, United States, with its principal place of business in San Diego, California.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By accessing or using our website at modernnostalgia.club and any related services, including our Creative Economy Lab platform (collectively, the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must immediately discontinue use of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ModernNostalgia.club operates a Creative Economy Lab—an online educational platform providing training, resources, templates, professional workflows, and community features designed for independent artists and music creators seeking to build sustainable creative careers.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Access to certain features, content, and services requires an active paid membership through our authorized payment processor, Patreon, Inc. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">3. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is intended for users who are at least eighteen (18) years of age. By using the Service, you represent and warrant that: (a) you are at least 18 years old; (b) you have the legal capacity to enter into a binding agreement; (c) you are not barred from using the Service under any applicable law; and (d) you will comply with these Terms and all applicable local, state, national, and international laws, rules, and regulations.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">4. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>4.1 Account Creation.</strong> To access certain features of the Service, you must create an account by authenticating through Patreon. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>4.2 Account Security.</strong> You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security. We are not liable for any loss or damage arising from your failure to protect your account credentials.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>4.3 Account Sharing Prohibited.</strong> Your account is personal to you and may not be shared, transferred, or sold to any other person. Sharing account credentials with third parties is strictly prohibited and may result in immediate termination of your account without refund.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">5. Membership, Fees, and Payment</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>5.1 Subscription Services.</strong> Premium access to the Service is provided through tiered membership subscriptions processed exclusively through Patreon, Inc. By subscribing, you also agree to Patreon's Terms of Use and Privacy Policy, which govern billing, payment processing, and subscription management.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>5.2 Recurring Billing.</strong> Membership subscriptions automatically renew at the end of each billing cycle unless canceled prior to the renewal date. You are responsible for managing your subscription through your Patreon account.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>5.3 Price Changes.</strong> We reserve the right to modify membership pricing with at least thirty (30) days' advance notice to active subscribers. Continued use of the Service after a price change constitutes acceptance of the new pricing.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>5.4 Refunds.</strong> Refund requests are handled in accordance with Patreon's refund policy. We do not provide refunds for partial subscription periods or unused access.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">6. Intellectual Property Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>6.1 Our Content.</strong> All content available through the Service, including but not limited to text, graphics, logos, images, audio clips, video clips, digital downloads, data compilations, software, courses, templates, and educational materials (collectively, "Content"), is the property of ModernNostalgia.club or its licensors and is protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>6.2 Limited License.</strong> Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Content solely for your personal, non-commercial educational purposes. This license does not include the right to: (a) reproduce, distribute, publicly display, or publicly perform any Content; (b) modify or create derivative works based on any Content; (c) use any data mining, robots, or similar data gathering methods; (d) download or copy Content except as expressly permitted; or (e) use the Content for any commercial purpose without our prior written consent.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>6.3 User Content.</strong> You retain ownership of any content you submit to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">7. Beat Licensing and Music Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>7.1 Beat License Terms.</strong> Certain membership tiers provide access to exclusive beat licensing opportunities. Beat licenses are subject to separate licensing agreements that will be provided at the time of license request. All beat licensing transactions are final and non-refundable once the license agreement is executed.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>7.2 Music Submissions.</strong> By submitting music or other creative works for review, feedback, or placement consideration, you represent and warrant that you own or control all necessary rights to such submissions and that your submission does not infringe upon any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">8. Prohibited Conduct</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="text-muted-foreground leading-relaxed mt-4 list-disc pl-6 space-y-2">
              <li>Sharing, distributing, or reproducing any Content obtained through the Service without authorization</li>
              <li>Using the Service for any illegal purpose or in violation of any applicable laws</li>
              <li>Harassing, threatening, or intimidating other users or members of our community</li>
              <li>Impersonating any person or entity or misrepresenting your affiliation</li>
              <li>Interfering with or disrupting the Service or servers connected to the Service</li>
              <li>Attempting to gain unauthorized access to any portion of the Service or any other systems or networks connected to the Service</li>
              <li>Using automated means (including bots, scrapers, or spiders) to access the Service</li>
              <li>Circumventing any technological measures implemented to protect the Service or Content</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>9.1 Termination by You.</strong> You may terminate your account at any time by canceling your Patreon subscription and requesting account deletion through your account settings or by contacting us directly.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>9.2 Termination by Us.</strong> We reserve the right to suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>9.3 Effect of Termination.</strong> All provisions of these Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnification, and limitations of liability.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              WE DO NOT WARRANT THAT: (A) THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE; (B) THE RESULTS OBTAINED FROM THE USE OF THE SERVICE WILL BE ACCURATE OR RELIABLE; (C) THE QUALITY OF ANY PRODUCTS, SERVICES, INFORMATION, OR OTHER MATERIAL PURCHASED OR OBTAINED BY YOU THROUGH THE SERVICE WILL MEET YOUR EXPECTATIONS; OR (D) ANY ERRORS IN THE SERVICE WILL BE CORRECTED.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              EDUCATIONAL CONTENT AND BUSINESS ADVICE PROVIDED THROUGH THE SERVICE IS FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE PROFESSIONAL, LEGAL, FINANCIAL, OR TAX ADVICE. WE DO NOT GUARANTEE ANY SPECIFIC RESULTS, INCOME, OR CAREER OUTCOMES FROM USING THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">11. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MODERNNOSTALGIA.CLUB, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES (EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), ARISING OUT OF OR IN CONNECTION WITH: (A) YOUR USE OF OR INABILITY TO USE THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (C) ANY CONTENT OBTAINED FROM THE SERVICE; OR (D) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE EXCEED THE AMOUNT YOU PAID TO US, IF ANY, DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE DATE OF YOUR CLAIM.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">12. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to defend, indemnify, and hold harmless ModernNostalgia.club and its affiliates, officers, directors, employees, agents, and licensors from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from: (a) your use of and access to the Service; (b) your violation of any term of these Terms; (c) your violation of any third-party right, including without limitation any copyright, trademark, property, or privacy right; or (d) any claim that your User Content caused damage to a third party.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">13. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>13.1 Governing Law.</strong> These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>13.2 Venue.</strong> Any legal action or proceeding arising out of or relating to these Terms shall be brought exclusively in the state or federal courts located in San Diego County, California. You hereby consent to the personal jurisdiction and venue of such courts and waive any objections based on inconvenient forum.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>13.3 Informal Resolution.</strong> Before filing any formal legal claim, you agree to contact us first and attempt to resolve the dispute informally by sending written notice to our contact address. We will attempt to resolve the dispute by contacting you via email. If a dispute is not resolved within thirty (30) days of submission, you or we may proceed with formal legal proceedings.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>13.4 Class Action Waiver.</strong> YOU AGREE THAT ANY CLAIMS AGAINST US WILL BE BROUGHT SOLELY IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, COLLECTIVE, REPRESENTATIVE, OR PRIVATE ATTORNEY GENERAL PROCEEDING.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">14. General Provisions</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>14.1 Entire Agreement.</strong> These Terms, together with our Privacy Policy and any other legal notices or agreements published on the Service, constitute the entire agreement between you and us regarding the Service and supersede any prior agreements.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>14.2 Severability.</strong> If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>14.3 Waiver.</strong> Our failure to enforce any right or provision of these Terms will not be deemed a waiver of such right or provision.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>14.4 Assignment.</strong> You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may freely assign these Terms without restriction.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>14.5 Force Majeure.</strong> We shall not be liable for any failure or delay in performing our obligations where such failure or delay results from circumstances beyond our reasonable control.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">15. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email or through a prominent notice on the Service at least thirty (30) days before they take effect. Your continued use of the Service after such modifications constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl mb-4">16. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions, concerns, or notices regarding these Terms of Service, please contact us:
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>ModernNostalgia.club</strong><br />
              San Diego, California, United States<br />
              Email: legal@modernnostalgia.club
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
