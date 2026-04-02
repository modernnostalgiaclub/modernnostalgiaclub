import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const LabApplication = () => {
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
                Creative Economy Lab Application
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
              className="w-full"
            >
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
                <iframe
                  src="https://pci.jotform.com/form/253309376850058"
                  title="Creative Economy Lab Application Form"
                  className="w-full border-0"
                  style={{ minHeight: "800px", height: "100vh", maxHeight: "1200px" }}
                  allowFullScreen
                />
              </div>
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
