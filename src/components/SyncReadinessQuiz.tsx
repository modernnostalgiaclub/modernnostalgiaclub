import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, ClipboardCheck } from 'lucide-react';

// Quiz questions and scoring
const quizQuestions = [
  {
    id: 'q1',
    question: 'When a show wants to license your song, who needs to approve it?',
    options: [
      { text: 'Just me', score: 3, rightsRisk: false },
      { text: 'Me and one collaborator', score: 2, rightsRisk: false },
      { text: 'Multiple people or companies', score: 1, rightsRisk: false },
      { text: "I'm not sure", score: 0, rightsRisk: true },
    ],
  },
  {
    id: 'q2',
    question: 'Does your music include samples or covers?',
    options: [
      { text: 'No samples or covers', score: 3, rightsRisk: false },
      { text: 'Samples that are fully cleared', score: 2, rightsRisk: false },
      { text: 'Samples or covers that are not cleared', score: 0, rightsRisk: true },
      { text: "I don't know", score: 0, rightsRisk: true },
    ],
  },
  {
    id: 'q3',
    question: 'If asked today, how fast could you deliver WAVs and instrumentals?',
    options: [
      { text: 'Within 24 hours', score: 3, rightsRisk: false },
      { text: 'A few days', score: 2, rightsRisk: false },
      { text: 'Eventually', score: 1, rightsRisk: false },
      { text: "I don't have those files", score: 0, rightsRisk: false },
    ],
  },
  {
    id: 'q4',
    question: 'How brand-safe are your lyrics?',
    options: [
      { text: 'Clean and usable everywhere', score: 3, rightsRisk: false },
      { text: 'Some explicit content, but editable', score: 2, rightsRisk: false },
      { text: 'Explicit and not negotiable', score: 1, rightsRisk: false },
      { text: "I've never considered this", score: 0, rightsRisk: false },
    ],
  },
  {
    id: 'q5',
    question: 'Could you sign a sync license today without checking with anyone else?',
    options: [
      { text: 'Yes', score: 3, rightsRisk: false },
      { text: 'For some songs', score: 2, rightsRisk: false },
      { text: 'Probably not', score: 1, rightsRisk: true },
      { text: "I don't know", score: 0, rightsRisk: true },
    ],
  },
  {
    id: 'q6',
    question: 'Are all collaborators on your songs registered with a Performing Rights Organization (PRO)?',
    options: [
      { text: 'Yes, all collaborators are registered', score: 3, rightsRisk: false },
      { text: 'Some are registered, some are not', score: 1, rightsRisk: true },
      { text: 'No, collaborators are not registered', score: 0, rightsRisk: true },
      { text: "I'm not sure", score: 0, rightsRisk: true },
    ],
  },
  {
    id: 'q7',
    question: 'Are there any uncredited contributors who could later claim ownership of a song?',
    options: [
      { text: 'No, everyone is properly credited', score: 3, rightsRisk: false },
      { text: 'Possibly, but we have informal agreements', score: 1, rightsRisk: true },
      { text: "Yes, and it hasn't been addressed", score: 0, rightsRisk: true },
      { text: "I'm not sure", score: 0, rightsRisk: true },
    ],
  },
  {
    id: 'q8',
    question: 'How many finished, release-ready songs do you control?',
    options: [
      { text: '50+', score: 3, rightsRisk: false },
      { text: '20–49', score: 2, rightsRisk: false },
      { text: '5–19', score: 1, rightsRisk: false },
      { text: 'Less than 5', score: 0, rightsRisk: false },
    ],
  },
  {
    id: 'q9',
    question: 'What are you hoping sync does for you?',
    options: [
      { text: 'Long-term passive income', score: 3, rightsRisk: false },
      { text: 'Occasional placements', score: 2, rightsRisk: false },
      { text: 'Big brand moments', score: 1, rightsRisk: false },
      { text: 'Still figuring it out', score: 0, rightsRisk: false },
    ],
  },
];

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResultType = 'sync-ready' | 'almost-ready' | 'not-ready';

interface ResultConfig {
  headline: string;
  copy: string;
  cta: string;
  ctaLink: string;
  icon: React.ReactNode;
  color: string;
  auditHeadline: string;
  auditCopy: string;
  auditCta: string;
}

const resultConfigs: Record<ResultType, ResultConfig> = {
  'sync-ready': {
    headline: 'Your Music Is Structurally Sync-Ready',
    copy: "Your catalog is licensable from a rights and delivery standpoint. That's rare. The next step is positioning and outreach.",
    cta: 'See the Sync Playbook',
    ctaLink: '/store',
    icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
    color: 'border-primary/30',
    auditHeadline: 'Want a second set of eyes before pitching?',
    auditCopy: 'This audit helps confirm nothing gets in the way of licensing.',
    auditCta: 'Book a Catalog Audit',
  },
  'almost-ready': {
    headline: "You're Close, But There Are Leaks",
    copy: 'Your music could be licensed, but a few structural issues are slowing or killing deals before they start.',
    cta: 'Fix Your Catalog for Sync',
    ctaLink: '/store',
    icon: <AlertTriangle className="w-12 h-12 text-muted-foreground" />,
    color: 'border-muted-foreground/30',
    auditHeadline: 'Most artists at this stage lose deals because of small rights issues.',
    auditCopy: 'This audit helps clean those up before outreach.',
    auditCta: 'Fix My Catalog',
  },
  'not-ready': {
    headline: "Your Music Isn't Sync-Ready Yet — And That's Fixable",
    copy: "This isn't about quality. It's about structure. Sync is a business format, not a genre.",
    cta: 'Start With the Sync Readiness Guide',
    ctaLink: '/store',
    icon: <XCircle className="w-12 h-12 text-maroon" />,
    color: 'border-maroon/30',
    auditHeadline: 'If you want clarity instead of guessing',
    auditCopy: 'This audit shows exactly what needs fixing.',
    auditCta: 'Start With a Catalog Audit',
  },
};

interface AnswerRecord {
  score: number;
  rightsRisk: boolean;
}

function calculateResult(answers: Record<string, AnswerRecord>): { 
  resultType: ResultType; 
  score: number; 
  hasRightsClarity: boolean;
} {
  const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
  const maxPossible = quizQuestions.length * 3; // 27
  const hasRightsClarity = Object.values(answers).some(a => a.rightsRisk);

  const percentage = totalScore / maxPossible;

  // Users with rights clarity issues cannot be fully sync-ready
  if (hasRightsClarity) {
    if (percentage >= 0.55) {
      return { resultType: 'almost-ready', score: totalScore, hasRightsClarity };
    } else {
      return { resultType: 'not-ready', score: totalScore, hasRightsClarity };
    }
  }

  if (percentage >= 0.75) {
    return { resultType: 'sync-ready', score: totalScore, hasRightsClarity };
  } else if (percentage >= 0.45) {
    return { resultType: 'almost-ready', score: totalScore, hasRightsClarity };
  } else {
    return { resultType: 'not-ready', score: totalScore, hasRightsClarity };
  }
}

export function SyncReadinessQuiz() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'email' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [resultType, setResultType] = useState<ResultType | null>(null);
  const [hasRightsClarity, setHasRightsClarity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const handleStartQuiz = () => {
    setStep('quiz');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionId: string, score: number, rightsRisk: boolean) => {
    const newAnswers = { ...answers, [questionId]: { score, rightsRisk } };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setStep('email');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      setStep('intro');
    }
  };

  const onSubmitEmail = async (data: EmailFormData) => {
    setIsSubmitting(true);

    try {
      const { resultType: calculatedResult, score, hasRightsClarity: rightsFlag } = calculateResult(answers);

      // Transform answers to simple score format for storage, preserving metadata
      const answersForStorage = Object.entries(answers).reduce((acc, [key, value]) => {
        acc[key] = value.score;
        return acc;
      }, {} as Record<string, number>);

      const { error } = await supabase.functions.invoke('sync-quiz-submit', {
        body: {
          email: data.email,
          answers: answersForStorage,
          score,
          resultType: calculatedResult,
          hasRightsClarity: rightsFlag,
        },
      });

      if (error) {
        throw error;
      }

      setResultType(calculatedResult);
      setHasRightsClarity(rightsFlag);
      setStep('result');
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = quizQuestions[currentQuestion];

  return (
    <section className="py-20 lg:py-28 bg-background" id="sync-quiz">
      <div className="container max-w-3xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {/* Intro Step */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="font-display text-4xl md:text-5xl tracking-wide mb-4">
                Is Your Music Actually Sync-Ready?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Most artists think they are. This quiz checks the structure, not the talent.
              </p>
              <p className="text-foreground/80 mb-8 max-w-xl mx-auto">
                Sync success depends on ownership, speed, and usability — not just good songs. Find out where
                your catalog actually stands.
              </p>

              <div className="bg-secondary/30 rounded-lg p-6 mb-8 border border-border/50 text-left">
                <p className="text-muted-foreground text-sm">
                  This takes about 2 minutes. No trick questions. Just clarity.
                </p>
              </div>

              <Button onClick={handleStartQuiz} variant="hero" size="lg">
                Start the Quiz <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* Quiz Step */}
          {step === 'quiz' && currentQ && (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-2">
                  Question {currentQuestion + 1} of {quizQuestions.length}
                </p>
                <div className="h-1 bg-secondary rounded-full">
                  <div
                    className="h-1 bg-maroon rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-semibold mb-8 leading-snug">
                {currentQ.question}
              </h3>

              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQ.id, option.score, option.rightsRisk)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200
                      ${answers[currentQ.id]?.score === option.score
                        ? 'border-maroon bg-maroon/10'
                        : 'border-border hover:border-maroon/50 hover:bg-secondary/30'
                      }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>

              <button
                onClick={handleBack}
                className="mt-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </motion.div>
          )}

          {/* Email Capture Step */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                You've completed the quiz
              </h3>
              <p className="text-muted-foreground mb-8">
                Enter your email to receive your Sync Readiness result and next steps.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitEmail)} className="max-w-md mx-auto space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="your@email.com"
                            type="email"
                            className="h-12 text-center"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'See My Results'}
                  </Button>

                  <p className="text-xs text-muted-foreground mt-4">
                    We respect your inbox. No spam, just actionable insight.
                  </p>
                </form>
              </Form>

              <button
                onClick={() => setStep('quiz')}
                className="mt-8 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors mx-auto"
              >
                <ArrowLeft className="h-4 w-4" /> Review my answers
              </button>
            </motion.div>
          )}

          {/* Result Step */}
          {step === 'result' && resultType && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className={`border ${resultConfigs[resultType].color} rounded-xl p-8 md:p-12 bg-secondary/20 mb-8`}>
                <div className="flex justify-center mb-6">
                  {resultConfigs[resultType].icon}
                </div>

                <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                  {resultConfigs[resultType].headline}
                </h3>

                <p className="text-muted-foreground mb-0 max-w-lg mx-auto">
                  {resultConfigs[resultType].copy}
                </p>

                {/* Rights clarity messaging */}
                {hasRightsClarity && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Your answers suggest some uncertainty around rights or contributor documentation. 
                      Resolving these questions now can prevent complications during licensing.
                    </p>
                  </div>
                )}
              </div>

              {/* Catalog Audit Upsell */}
              <div className="border border-border/50 rounded-xl p-6 md:p-8 bg-secondary/10 mb-8">
                <div className="flex justify-center mb-4">
                  <ClipboardCheck className="w-10 h-10 text-maroon" />
                </div>
                
                <h4 className="text-xl md:text-2xl font-semibold mb-2">
                  Catalog Audit for Sync
                </h4>
                
                <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                  A one-on-one review of your catalog focused on ownership clarity, collaborator registration, 
                  and sync usability. Designed to catch issues before they kill deals.
                </p>

                <p className="text-foreground/80 mb-6 max-w-lg mx-auto">
                  {resultConfigs[resultType].auditHeadline} {resultConfigs[resultType].auditCopy}
                </p>

                <Button asChild variant="maroon" size="lg">
                  <a href="https://form.jotform.com/253334227361048">
                    {resultConfigs[resultType].auditCta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div>

              {/* Discovery Call CTA */}
              <div className="mb-8">
                <h4 className="text-xl md:text-2xl font-semibold mb-3">
                  Ready to Talk Strategy?
                </h4>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Book a free 15-minute discovery call to discuss your catalog and sync goals.
                </p>
              </div>

              {/* Embedded Jotform */}
              <div className="w-full max-w-2xl mx-auto bg-background border border-border rounded-lg overflow-hidden mb-10">
                <iframe
                  src="https://form.jotform.com/253334227361048"
                  title="Discovery Call Booking"
                  className="w-full min-h-[500px] border-0"
                  allow="geolocation; microphone; camera; fullscreen"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Sync deals fail more often from unclear rights than bad music. This process is designed to prevent that.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
