import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Palette, CheckCircle, XCircle, AlertTriangle, Info, FileDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Color blindness simulation matrices
const colorBlindnessFilters = {
  normal: 'none',
  protanopia: 'url(#protanopia)',
  deuteranopia: 'url(#deuteranopia)',
  tritanopia: 'url(#tritanopia)',
  achromatopsia: 'url(#achromatopsia)',
};

const colorBlindnessDescriptions = {
  normal: 'Normal vision',
  protanopia: 'Red-blind (1% of males)',
  deuteranopia: 'Green-blind (1% of males)',
  tritanopia: 'Blue-blind (0.01% of population)',
  achromatopsia: 'Complete color blindness (rare)',
};

// Parse color string to RGB
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }
  
  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }
  
  // Handle hsl
  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    return hslToRgb(h, s, l);
  }
  
  return null;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Calculate relative luminance per WCAG 2.1
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
  const l1 = getLuminance(color1.r, color1.g, color1.b);
  const l2 = getLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG 2.1 compliance levels
function getComplianceLevel(ratio: number, isLargeText: boolean): { level: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (isLargeText) {
    if (ratio >= 4.5) return { level: 'AAA', variant: 'default' };
    if (ratio >= 3) return { level: 'AA', variant: 'secondary' };
    return { level: 'Fail', variant: 'destructive' };
  } else {
    if (ratio >= 7) return { level: 'AAA', variant: 'default' };
    if (ratio >= 4.5) return { level: 'AA', variant: 'secondary' };
    return { level: 'Fail', variant: 'destructive' };
  }
}

// Theme color pairs to check
const themeColorPairs = [
  { name: 'Primary on Background', fg: '--primary', bg: '--background' },
  { name: 'Foreground on Background', fg: '--foreground', bg: '--background' },
  { name: 'Muted Foreground on Background', fg: '--muted-foreground', bg: '--background' },
  { name: 'Primary Foreground on Primary', fg: '--primary-foreground', bg: '--primary' },
  { name: 'Secondary Foreground on Secondary', fg: '--secondary-foreground', bg: '--secondary' },
  { name: 'Foreground on Card', fg: '--card-foreground', bg: '--card' },
  { name: 'Muted Foreground on Card', fg: '--muted-foreground', bg: '--card' },
  { name: 'Destructive Foreground on Destructive', fg: '--destructive-foreground', bg: '--destructive' },
  { name: 'Accent Foreground on Accent', fg: '--accent-foreground', bg: '--accent' },
];

export function AccessibilityTester() {
  const [activeSimulation, setActiveSimulation] = useState<keyof typeof colorBlindnessFilters>('normal');
  const [foregroundColor, setForegroundColor] = useState('#0d0d0d');
  const [backgroundColor, setBackgroundColor] = useState('#f5f0e6');
  const [isLargeText, setIsLargeText] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [themeResults, setThemeResults] = useState<Array<{
    name: string;
    ratio: number;
    compliance: { level: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' };
  }>>([]);

  // Calculate contrast for custom colors
  const customFg = parseColor(foregroundColor);
  const customBg = parseColor(backgroundColor);
  const customRatio = customFg && customBg ? getContrastRatio(customFg, customBg) : 0;
  const customCompliance = getComplianceLevel(customRatio, isLargeText);

  // Check theme colors on mount
  useEffect(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    const results = themeColorPairs.map(pair => {
      const fgValue = computedStyle.getPropertyValue(pair.fg).trim();
      const bgValue = computedStyle.getPropertyValue(pair.bg).trim();
      
      // Convert HSL CSS variable format to parseable format
      const fgHsl = `hsl(${fgValue})`;
      const bgHsl = `hsl(${bgValue})`;
      
      const fgColor = parseColor(fgHsl);
      const bgColor = parseColor(bgHsl);
      
      const ratio = fgColor && bgColor ? getContrastRatio(fgColor, bgColor) : 0;
      const compliance = getComplianceLevel(ratio, false);
      
      return { name: pair.name, ratio, compliance };
    });
    setThemeResults(results);
  }, []);

  // Apply color blindness simulation
  useEffect(() => {
    const root = document.documentElement;
    if (activeSimulation === 'normal') {
      root.style.filter = 'none';
    } else {
      root.style.filter = colorBlindnessFilters[activeSimulation];
    }
    
    return () => {
      root.style.filter = 'none';
    };
  }, [activeSimulation]);

  // Generate PDF Report
  const generatePdfReport = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Accessibility Audit Report', margin, yPos);
      yPos += 10;

      // Subtitle with date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, margin, yPos);
      yPos += 5;
      doc.text('ModernNostalgia.club - WCAG 2.1 Compliance Report', margin, yPos);
      yPos += 15;

      // Horizontal line
      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Executive Summary
      doc.setTextColor(0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', margin, yPos);
      yPos += 8;

      const aaaCount = themeResults.filter(r => r.compliance.level === 'AAA').length;
      const aaCount = themeResults.filter(r => r.compliance.level === 'AA').length;
      const failCount = themeResults.filter(r => r.compliance.level === 'Fail').length;
      const totalChecks = themeResults.length;
      const passRate = totalChecks > 0 ? Math.round(((aaaCount + aaCount) / totalChecks) * 100) : 0;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const summaryText = [
        `This report evaluates the color contrast compliance of the application against WCAG 2.1 guidelines.`,
        ``,
        `Total Color Combinations Tested: ${totalChecks}`,
        `AAA Compliant (7:1+ ratio): ${aaaCount} (${totalChecks > 0 ? Math.round((aaaCount / totalChecks) * 100) : 0}%)`,
        `AA Compliant (4.5:1+ ratio): ${aaCount} (${totalChecks > 0 ? Math.round((aaCount / totalChecks) * 100) : 0}%)`,
        `Non-Compliant: ${failCount} (${totalChecks > 0 ? Math.round((failCount / totalChecks) * 100) : 0}%)`,
        ``,
        `Overall Compliance Rate: ${passRate}%`
      ];

      summaryText.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 6;
      });

      yPos += 5;

      // Compliance Status Badge
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      if (failCount === 0) {
        doc.setTextColor(34, 139, 34); // Green
        doc.text('STATUS: FULLY COMPLIANT', margin, yPos);
      } else if (passRate >= 80) {
        doc.setTextColor(218, 165, 32); // Gold
        doc.text('STATUS: MOSTLY COMPLIANT - Action Recommended', margin, yPos);
      } else {
        doc.setTextColor(178, 34, 34); // Red
        doc.text('STATUS: NON-COMPLIANT - Action Required', margin, yPos);
      }
      yPos += 15;

      // Horizontal line
      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Detailed Results Section
      doc.setTextColor(0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Contrast Analysis', margin, yPos);
      yPos += 10;

      // Table data
      const tableData = themeResults.map(result => [
        result.name,
        `${result.ratio.toFixed(2)}:1`,
        result.compliance.level,
        result.compliance.level === 'AAA' ? 'Excellent' : 
          result.compliance.level === 'AA' ? 'Acceptable' : 'Needs Improvement'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Color Combination', 'Contrast Ratio', 'WCAG Level', 'Status']],
        body: tableData,
        headStyles: { 
          fillColor: [89, 42, 42], // Maroon
          textColor: 255,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 35, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 40, halign: 'center' }
        },
        didParseCell: (data) => {
          // Color code the WCAG level column
          if (data.section === 'body' && data.column.index === 2) {
            const level = data.cell.raw as string;
            if (level === 'AAA') {
              data.cell.styles.textColor = [34, 139, 34];
              data.cell.styles.fontStyle = 'bold';
            } else if (level === 'AA') {
              data.cell.styles.textColor = [218, 165, 32];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [178, 34, 34];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });

      // Get final Y position after table
      const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
      yPos = finalY + 15;

      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // WCAG Guidelines Reference
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('WCAG 2.1 Guidelines Reference', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const guidelines = [
        'Level AA Requirements:',
        '  • Normal text (< 18pt): Minimum contrast ratio of 4.5:1',
        '  • Large text (≥ 18pt or 14pt bold): Minimum contrast ratio of 3:1',
        '',
        'Level AAA Requirements (Enhanced):',
        '  • Normal text (< 18pt): Minimum contrast ratio of 7:1',
        '  • Large text (≥ 18pt or 14pt bold): Minimum contrast ratio of 4.5:1',
        '',
        'Non-text elements require a minimum contrast ratio of 3:1.'
      ];

      guidelines.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 5;
      });

      yPos += 10;

      // Recommendations section
      if (failCount > 0) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendations', margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const failingItems = themeResults.filter(r => r.compliance.level === 'Fail');
        failingItems.forEach((item, idx) => {
          doc.text(`${idx + 1}. ${item.name}: Current ratio ${item.ratio.toFixed(2)}:1 - needs improvement`, margin, yPos);
          yPos += 5;
        });
        
        yPos += 5;
        doc.text('Consider adjusting foreground or background colors to achieve at least 4.5:1 contrast.', margin, yPos);
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount} | ModernNostalgia.club Accessibility Audit`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`accessibility-audit-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SVG Filters for Color Blindness Simulation */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="
              0.567, 0.433, 0,     0, 0
              0.558, 0.442, 0,     0, 0
              0,     0.242, 0.758, 0, 0
              0,     0,     0,     1, 0
            "/>
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="
              0.625, 0.375, 0,   0, 0
              0.7,   0.3,   0,   0, 0
              0,     0.3,   0.7, 0, 0
              0,     0,     0,   1, 0
            "/>
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="
              0.95, 0.05,  0,     0, 0
              0,    0.433, 0.567, 0, 0
              0,    0.475, 0.525, 0, 0
              0,    0,     0,     1, 0
            "/>
          </filter>
          <filter id="achromatopsia">
            <feColorMatrix type="matrix" values="
              0.299, 0.587, 0.114, 0, 0
              0.299, 0.587, 0.114, 0, 0
              0.299, 0.587, 0.114, 0, 0
              0,     0,     0,     1, 0
            "/>
          </filter>
        </defs>
      </svg>

      <Tabs defaultValue="contrast" className="space-y-4">
        <TabsList role="tablist" aria-label="Accessibility testing tools">
          <TabsTrigger value="contrast" aria-label="Contrast ratio checker">
            <Palette className="h-4 w-4 mr-2" aria-hidden="true" />
            Contrast Checker
          </TabsTrigger>
          <TabsTrigger value="colorblind" aria-label="Color blindness simulator">
            <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
            Color Blindness
          </TabsTrigger>
          <TabsTrigger value="theme" aria-label="Theme analysis">
            <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
            Theme Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contrast">
          <Card>
            <CardHeader>
              <CardTitle>Contrast Ratio Checker</CardTitle>
              <CardDescription>
                Test color combinations for WCAG 2.1 compliance. AA requires 4.5:1 for normal text, 3:1 for large text. AAA requires 7:1 for normal text, 4.5:1 for large text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fg-color">Foreground Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fg-color"
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                      aria-label="Select foreground color"
                    />
                    <Input
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      placeholder="#000000"
                      aria-label="Foreground color hex value"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                      aria-label="Select background color"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#ffffff"
                      aria-label="Background color hex value"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="large-text"
                  checked={isLargeText}
                  onCheckedChange={setIsLargeText}
                />
                <Label htmlFor="large-text">Large text (18pt+ or 14pt bold)</Label>
              </div>

              {/* Preview */}
              <div 
                className="p-6 rounded-lg border"
                style={{ backgroundColor }}
              >
                <p 
                  className={isLargeText ? 'text-2xl font-bold' : 'text-base'}
                  style={{ color: foregroundColor }}
                >
                  Sample text for contrast testing. The quick brown fox jumps over the lazy dog.
                </p>
              </div>

              {/* Results */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="text-sm text-muted-foreground">Contrast Ratio</p>
                  <p className="text-3xl font-bold">{customRatio.toFixed(2)}:1</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-2">WCAG Compliance</p>
                  <div className="flex gap-2">
                    <Badge variant={customCompliance.variant}>
                      {customCompliance.level === 'Fail' ? (
                        <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                      )}
                      {customCompliance.level}
                    </Badge>
                    <Badge variant="outline">
                      {isLargeText ? 'Large Text' : 'Normal Text'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" aria-hidden="true" />
                  <span>AA Level: {isLargeText ? '3:1' : '4.5:1'} minimum | AAA Level: {isLargeText ? '4.5:1' : '7:1'} minimum</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colorblind">
          <Card>
            <CardHeader>
              <CardTitle>Color Blindness Simulation</CardTitle>
              <CardDescription>
                Preview how the site appears to users with different types of color vision deficiency. The simulation applies to the entire page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cb-simulation">Simulation Type</Label>
                <Select
                  value={activeSimulation}
                  onValueChange={(v) => setActiveSimulation(v as keyof typeof colorBlindnessFilters)}
                >
                  <SelectTrigger id="cb-simulation" aria-label="Select color blindness simulation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(colorBlindnessDescriptions).map(([key, description]) => (
                      <SelectItem key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} - {description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeSimulation !== 'normal' && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    <span className="font-medium">Simulation Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    The entire page is currently showing {colorBlindnessDescriptions[activeSimulation]}. Select "Normal" to disable.
                  </p>
                </div>
              )}

              {/* Color palette preview */}
              <div className="space-y-4">
                <h4 className="font-medium">Theme Color Preview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-primary" />
                    <p className="text-xs text-center text-muted-foreground">Primary</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-secondary" />
                    <p className="text-xs text-center text-muted-foreground">Secondary</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-destructive" />
                    <p className="text-xs text-center text-muted-foreground">Destructive</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-accent" />
                    <p className="text-xs text-center text-muted-foreground">Accent</p>
                  </div>
                </div>

                {/* Sample UI elements */}
                <div className="p-4 rounded-lg bg-card border space-y-4">
                  <h4 className="font-medium">Sample UI Elements</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button>Primary Button</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                  </div>
                  <div className="flex gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setActiveSimulation('normal')}
                disabled={activeSimulation === 'normal'}
              >
                Reset to Normal Vision
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Theme Contrast Analysis</CardTitle>
                <CardDescription>
                  Automated contrast ratio checks for your theme's color combinations.
                </CardDescription>
              </div>
              <Button 
                onClick={generatePdfReport} 
                disabled={isGeneratingPdf}
                className="gap-2"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" aria-hidden="true" />
                    Export PDF Report
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" role="list" aria-label="Theme contrast results">
                {themeResults.map((result, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    role="listitem"
                  >
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Ratio: {result.ratio.toFixed(2)}:1
                      </p>
                    </div>
                    <Badge variant={result.compliance.variant}>
                      {result.compliance.level === 'Fail' ? (
                        <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                      ) : result.compliance.level === 'AA' ? (
                        <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                      )}
                      WCAG {result.compliance.level}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <h4 className="font-medium mb-2">Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-500">
                      {themeResults.filter(r => r.compliance.level === 'AAA').length}
                    </p>
                    <p className="text-xs text-muted-foreground">AAA Pass</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-500">
                      {themeResults.filter(r => r.compliance.level === 'AA').length}
                    </p>
                    <p className="text-xs text-muted-foreground">AA Pass</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">
                      {themeResults.filter(r => r.compliance.level === 'Fail').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Fail</p>
                  </div>
                </div>
              </div>

              {/* Export info */}
              <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">
                    Export a comprehensive PDF report for compliance documentation, audits, or stakeholder review.
                    The report includes executive summary, detailed analysis, and recommendations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}