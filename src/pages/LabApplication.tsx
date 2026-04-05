import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Send } from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const LabApplication = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    artist_name: "",
    genre: "",
    years_active: "",
    goals: "",
    portfolio_url: "",
    referral_source: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.full_name.trim() || !form.email.trim() || !form.goals.trim()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("incubator_applications").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      artist_name: form.artist_name.trim() || null,
      genre: form.genre.trim() || null,
      years_active: form.years_active || null,
      goals: form.goals.trim(),
      portfolio_url: form.portfolio_url.trim() || null,
      referral_source: form.referral_source || null,
    });
    setLoading(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    toast.success("Application submitted successfully!");
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Application Submitted | Modern Nostalgia Club</title>
        </Helmet>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-24 pb-16">
            <div className="container mx-auto px-4">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto text-center"
              >
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                  Application Received!
                </h1>
                <p className="text-lg text-muted-foreground mb-2">
                  Thank you for applying to the Artist Incubator. We'll review your application and reach out soon.
                </p>
                <p className="text-sm text-muted-foreground">
                  Questions? Email{" "}
                  <a href="mailto:support@modernnostalgiaclub.com" className="text-primary hover:underline">
                    support@modernnostalgiaclub.com
                  </a>
                </p>
              </motion.div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Artist Incubator Application | Modern Nostalgia Club</title>
        <meta
          name="description"
          content="Apply to join the Artist Incubator - an exclusive program for serious artists ready to build sustainable creative careers."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-8"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Artist Incubator Application
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ready to take your creative career to the next level? Fill out the application below.
                Once approved, you'll receive a link to join through Patreon.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>Fields marked with * are required</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={form.full_name}
                          onChange={(e) => handleChange("full_name", e.target.value)}
                          placeholder="Your full name"
                          required
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="you@example.com"
                          required
                          maxLength={255}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="artist_name">Artist / Stage Name</Label>
                        <Input
                          id="artist_name"
                          value={form.artist_name}
                          onChange={(e) => handleChange("artist_name", e.target.value)}
                          placeholder="Your artist name"
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="genre">Genre / Style</Label>
                        <Input
                          id="genre"
                          value={form.genre}
                          onChange={(e) => handleChange("genre", e.target.value)}
                          placeholder="e.g. R&B, Hip-Hop, Pop"
                          maxLength={100}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="years_active">How long have you been making music?</Label>
                      <Select value={form.years_active} onValueChange={(v) => handleChange("years_active", v)}>
                        <SelectTrigger id="years_active">
                          <SelectValue placeholder="Select one" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-3">1–3 years</SelectItem>
                          <SelectItem value="3-5">3–5 years</SelectItem>
                          <SelectItem value="5-10">5–10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goals">What are your goals as an artist? *</Label>
                      <Textarea
                        id="goals"
                        value={form.goals}
                        onChange={(e) => handleChange("goals", e.target.value)}
                        placeholder="Tell us what you're looking to achieve and why the Incubator interests you..."
                        required
                        maxLength={2000}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolio_url">Portfolio / Music Link</Label>
                      <Input
                        id="portfolio_url"
                        value={form.portfolio_url}
                        onChange={(e) => handleChange("portfolio_url", e.target.value)}
                        placeholder="https://open.spotify.com/artist/..."
                        maxLength={500}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral_source">How did you hear about us?</Label>
                      <Select value={form.referral_source} onValueChange={(v) => handleChange("referral_source", v)}>
                        <SelectTrigger id="referral_source">
                          <SelectValue placeholder="Select one" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="friend">Friend / Word of Mouth</SelectItem>
                          <SelectItem value="search">Google Search</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" variant="maroon" size="lg" className="w-full gap-2" disabled={loading}>
                      <Send className="w-4 h-4" />
                      {loading ? "Submitting..." : "Submit Application"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-muted-foreground">
                Questions? Reach out to us at{" "}
                <a
                  href="mailto:support@modernnostalgiaclub.com"
                  className="text-primary hover:underline"
                >
                  support@modernnostalgiaclub.com
                </a>
              </p>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LabApplication;
