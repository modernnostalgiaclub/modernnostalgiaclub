import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const weeks = [
  {
    week: 1,
    theme: 'Organize',
    description: 'Build the foundation for your career.',
    days: [
      { day: 1, task: 'Set up your workspace and digital folders' },
      { day: 2, task: 'Register or review your PRO and business accounts' },
      { day: 3, task: 'Create a financial tracker (Google Sheets works fine)' },
      { day: 4, task: 'Gather all unfinished projects in one place' },
      { day: 5, task: 'Label and backup everything' },
      { day: 6, task: 'Create your first split sheet' },
      { day: 7, task: 'Reflect on what feels disorganized and fix it' },
    ],
    reflection: 'What systems made my life easier this week? What clutter can I eliminate?',
  },
  {
    week: 2,
    theme: 'Create',
    description: 'Produce consistently and stop overthinking.',
    days: [
      { day: 8, task: 'Pick one idea to finish this week' },
      { day: 9, task: 'Use a template to simplify setup' },
      { day: 10, task: 'Record one clean verse or hook' },
      { day: 11, task: 'Export a rough mix' },
      { day: 12, task: 'Get feedback from one trusted ear' },
      { day: 13, task: 'Apply edits and bounce final mix' },
      { day: 14, task: 'Save all stems, label, and upload to your library' },
    ],
    reflection: 'How did focusing on one track change my workflow? Did I learn more from releasing or revising?',
  },
  {
    week: 3,
    theme: 'Publish',
    description: 'Share and collect data.',
    days: [
      { day: 15, task: 'Choose one platform to sell or share your song' },
      { day: 16, task: 'Upload and set your price or opt-in' },
      { day: 17, task: 'Create one behind-the-scenes post' },
      { day: 18, task: 'Send a message to ten people about your release' },
      { day: 19, task: 'Write your first newsletter or update' },
      { day: 20, task: 'Review analytics and note what worked' },
      { day: 21, task: 'Celebrate progress and rest' },
    ],
    reflection: 'What surprised me about my audience response? What metrics matter most to my growth?',
  },
  {
    week: 4,
    theme: 'Monetize',
    description: 'Turn attention into income.',
    days: [
      { day: 22, task: 'Create a $1 offer (song, sample, or bonus)' },
      { day: 23, task: 'Add a $10 merch or digital product' },
      { day: 24, task: 'Build or update your Link in Bio' },
      { day: 25, task: 'Email your audience about your offer' },
      { day: 26, task: 'Submit your song to a sync library' },
      { day: 27, task: 'Create one new video linking to your offer' },
      { day: 28, task: 'Plan your next 30-day cycle' },
      { day: 29, task: 'Review wins and setbacks' },
      { day: 30, task: 'Reflect, rest, and restart' },
    ],
    reflection: 'What income streams showed promise? How can I make them more consistent?',
  },
];

export default function ImplementationTracker() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - hidden when printing */}
      <div className="print:hidden">
        <Header />
      </div>
      
      <main className="pt-24 pb-16 print:pt-0 print:pb-0">
        <div className="container mx-auto px-6 print:px-4">
          {/* Action buttons - hidden when printing */}
          <div className="print:hidden mb-8 flex items-center justify-between">
            <Link to="/reference-shelf">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reference Shelf
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="maroon" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print / Save as PDF
              </Button>
            </div>
          </div>

          {/* Printable Content */}
          <div className="max-w-4xl mx-auto print:max-w-none">
            {/* Title Page */}
            <div className="text-center mb-12 print:mb-8 print:break-after-page">
              <h1 className="text-4xl md:text-5xl font-display mb-4 print:text-3xl">
                30-Day Implementation Tracker
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                Based on The Free Artist Survival Guide
              </p>
              <p className="text-sm text-muted-foreground">
                A Modernnostalgia.club Resource
              </p>
              
              <div className="mt-8 p-6 bg-muted/50 rounded-lg text-left print:bg-transparent print:border print:border-border">
                <h2 className="font-display text-xl mb-4">How to Use This Tracker</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Complete one task per day - consistency beats intensity</li>
                  <li>• Check off tasks as you complete them</li>
                  <li>• Use the reflection prompts at the end of each week</li>
                  <li>• Focus on progress, not perfection</li>
                  <li>• After 30 days, you'll have systems, clarity, and proof of growth</li>
                </ul>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-left print:grid-cols-4">
                <div className="p-4 bg-muted/30 rounded-lg print:bg-transparent print:border">
                  <p className="font-medium">Week 1</p>
                  <p className="text-sm text-muted-foreground">Organize</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg print:bg-transparent print:border">
                  <p className="font-medium">Week 2</p>
                  <p className="text-sm text-muted-foreground">Create</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg print:bg-transparent print:border">
                  <p className="font-medium">Week 3</p>
                  <p className="text-sm text-muted-foreground">Publish</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg print:bg-transparent print:border">
                  <p className="font-medium">Week 4</p>
                  <p className="text-sm text-muted-foreground">Monetize</p>
                </div>
              </div>
            </div>

            {/* Week Cards */}
            {weeks.map((week) => (
              <Card 
                key={week.week} 
                className="mb-8 print:mb-4 print:break-inside-avoid print:shadow-none print:border"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-maroon uppercase tracking-wider font-medium">
                        Week {week.week}
                      </p>
                      <CardTitle className="text-2xl print:text-xl">
                        {week.theme}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Days {week.days[0].day}-{week.days[week.days.length - 1].day}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{week.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Task Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium w-16">Day</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Task</th>
                          <th className="px-4 py-2 text-center text-sm font-medium w-20">Done</th>
                        </tr>
                      </thead>
                      <tbody>
                        {week.days.map((day, index) => (
                          <tr 
                            key={day.day} 
                            className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                          >
                            <td className="px-4 py-3 text-sm font-medium">{day.day}</td>
                            <td className="px-4 py-3 text-sm">{day.task}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center print:hidden">
                                <Checkbox id={`day-${day.day}`} />
                              </div>
                              {/* Print checkbox */}
                              <div className="hidden print:block">
                                <div className="w-5 h-5 border-2 border-border rounded mx-auto" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Reflection Section */}
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg print:bg-transparent print:border">
                    <p className="text-sm font-medium mb-2">Weekly Reflection:</p>
                    <p className="text-sm text-muted-foreground italic mb-4">
                      {week.reflection}
                    </p>
                    <div className="space-y-3 print:space-y-4">
                      <div className="border-b border-dashed border-border h-6 print:h-8" />
                      <div className="border-b border-dashed border-border h-6 print:h-8" />
                      <div className="border-b border-dashed border-border h-6 print:h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Completion Section */}
            <Card className="print:break-inside-avoid print:shadow-none print:border">
              <CardHeader>
                <CardTitle>Congratulations!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you completed this tracker, you have proof that your art is scalable. 
                  You now have systems, clarity, and a method that can grow with you.
                </p>
                <div className="p-4 bg-muted/30 rounded-lg print:bg-transparent print:border">
                  <p className="font-medium mb-2">Next Steps:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Refine your craft and document your progress</li>
                    <li>• Connect with the right community</li>
                    <li>• Plan your next 30-day cycle</li>
                    <li>• Join Modernnostalgia.club for deeper templates and mentorship</li>
                  </ul>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Start Date: _______________ &nbsp;&nbsp;&nbsp; End Date: _______________
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground print:mt-4">
              <p>© Modernnostalgia.club • The Free Artist Survival Guide</p>
            </div>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.5in;
            size: letter;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
