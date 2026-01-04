import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SectionLabel } from '@/components/SectionLabel';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, MapPin, Clock, Filter } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Events() {
  const [eventType, setEventType] = useState<string>('all');

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      <main id="main-content" role="main" className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-5xl mx-auto"
          >
            {/* Page Header */}
            <motion.div variants={fadeIn} className="mb-12 text-center">
              <SectionLabel className="mb-4">Events</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Upcoming Events
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join us for workshops, networking sessions, and exclusive member events 
                designed to help independent artists build sustainable music careers.
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeIn} className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by:</span>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="workshop">Workshops</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="performance">Performances</SelectItem>
                    <SelectItem value="online">Online Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" asChild>
                <a 
                  href="https://modernnostalgiaclub.eventbrite.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View on Eventbrite
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </motion.div>

            {/* Events Display - Link to Eventbrite */}
            <motion.div variants={fadeIn} className="mb-12">
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Calendar className="w-16 h-16 text-maroon mx-auto mb-6" />
                <h2 className="font-display text-2xl mb-4">Browse Our Events</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  View all upcoming workshops, networking sessions, and member events on our Eventbrite page.
                  <span className="block mt-2 text-sm font-medium text-maroon">
                    Members receive exclusive discounts on all events!
                  </span>
                </p>
                <Button variant="maroon" size="lg" asChild>
                  <a 
                    href="https://modernnostalgiaclub.eventbrite.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View All Events
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Event Categories Info */}
            <motion.div variants={fadeIn} className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card border border-border rounded-lg p-6">
                <Calendar className="w-8 h-8 text-maroon mb-4" />
                <h3 className="font-display text-lg mb-2">Workshops</h3>
                <p className="text-sm text-muted-foreground">
                  Hands-on sessions covering sync licensing, publishing, and business strategy for independent artists.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <MapPin className="w-8 h-8 text-maroon mb-4" />
                <h3 className="font-display text-lg mb-2">Networking</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow artists, music supervisors, and industry professionals in person and online.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <Clock className="w-8 h-8 text-maroon mb-4" />
                <h3 className="font-display text-lg mb-2">Virtual Events</h3>
                <p className="text-sm text-muted-foreground">
                  Join from anywhere with our online workshops, Q&A sessions, and virtual meetups.
                </p>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div variants={fadeIn} className="text-center bg-card border border-border rounded-lg p-8">
              <h2 className="font-display text-2xl mb-4">Want to Host an Event?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                If you're a member interested in hosting a workshop, panel, or networking event, 
                we'd love to hear from you.
              </p>
              <Button variant="maroon" asChild>
                <a 
                  href="mailto:events@modernnostalgia.club"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Us About Events
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
