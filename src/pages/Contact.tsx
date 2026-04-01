import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Mail } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-anton text-4xl md:text-5xl uppercase tracking-tight mb-4">
            Contact MNC
          </h1>
          <p className="text-muted-foreground text-lg mb-12">
            For bookings, inquiries, and collaborations — reach out directly.
          </p>

          <div className="border border-border rounded-lg p-10 md:p-14 text-center">
            <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-6" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Bookings & Inquiries
            </p>
            <a
              href="mailto:geohworks@gmail.com"
              className="text-lg md:text-xl font-medium text-foreground hover:text-primary transition-colors"
            >
              geohworks@gmail.com
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
