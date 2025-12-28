import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Palette, CheckCircle, XCircle, AlertTriangle, Info, FileDown, Loader2, Volume2, RefreshCw } from 'lucide-react';
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
  const [ariaResults, setAriaResults] = useState<Array<{
    element: string;
    type: string;
    label: string;
    status: 'pass' | 'warning' | 'fail';
    issue?: string;
  }>>([]);
  const [liveRegionTest, setLiveRegionTest] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [announcementLog, setAnnouncementLog] = useState<Array<{
    message: string;
    timestamp: Date;
    type: 'polite' | 'assertive';
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

  // Scan for ARIA labels and accessibility issues
  const scanAriaLabels = () => {
    setIsScanning(true);
    const results: typeof ariaResults = [];

    // Check all interactive elements
    const interactiveSelectors = 'button, a, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"]';
    const interactiveElements = document.querySelectorAll(interactiveSelectors);

    interactiveElements.forEach((el, idx) => {
      const tagName = el.tagName.toLowerCase();
      const role = el.getAttribute('role') || tagName;
      const ariaLabel = el.getAttribute('aria-label');
      const ariaLabelledBy = el.getAttribute('aria-labelledby');
      const title = el.getAttribute('title');
      const textContent = el.textContent?.trim().slice(0, 50);
      const placeholder = el.getAttribute('placeholder');

      let label = ariaLabel || title || textContent || placeholder || '';
      let status: 'pass' | 'warning' | 'fail' = 'pass';
      let issue: string | undefined;

      // Check for missing accessible name
      if (!ariaLabel && !ariaLabelledBy && !textContent && !title && !placeholder) {
        status = 'fail';
        issue = 'Missing accessible name (no aria-label, text content, or title)';
      } else if (ariaLabel && textContent && ariaLabel !== textContent) {
        status = 'warning';
        issue = 'aria-label differs from visible text (may confuse voice control users)';
      } else if (!ariaLabel && textContent && textContent.length < 2) {
        status = 'warning';
        issue = 'Very short text content may not be descriptive enough';
      }

      // Skip hidden elements
      if (el.getAttribute('aria-hidden') === 'true') return;

      results.push({
        element: `${role}${idx + 1}`,
        type: role,
        label: label.slice(0, 60) + (label.length > 60 ? '...' : ''),
        status,
        issue,
      });
    });

    // Check for live regions
    const liveRegions = document.querySelectorAll('[aria-live], [role="alert"], [role="status"], [role="log"]');
    liveRegions.forEach((el, idx) => {
      const ariaLive = el.getAttribute('aria-live') || 
        (el.getAttribute('role') === 'alert' ? 'assertive' : 'polite');
      results.push({
        element: `liveRegion${idx + 1}`,
        type: 'live-region',
        label: `aria-live="${ariaLive}"`,
        status: 'pass',
      });
    });

    // Check images for alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, idx) => {
      const alt = img.getAttribute('alt');
      const isDecorative = alt === '';
      const ariaHidden = img.getAttribute('aria-hidden') === 'true';

      if (ariaHidden || isDecorative) {
        results.push({
          element: `img${idx + 1}`,
          type: 'image',
          label: isDecorative ? '(decorative)' : '(hidden)',
          status: 'pass',
        });
      } else if (alt) {
        results.push({
          element: `img${idx + 1}`,
          type: 'image',
          label: alt.slice(0, 60) + (alt.length > 60 ? '...' : ''),
          status: 'pass',
        });
      } else {
        results.push({
          element: `img${idx + 1}`,
          type: 'image',
          label: '(missing)',
          status: 'fail',
          issue: 'Image missing alt attribute',
        });
      }
    });

    // Check headings structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((h, idx) => {
      const level = parseInt(h.tagName[1]);
      const text = h.textContent?.trim().slice(0, 40) || '';
      let status: 'pass' | 'warning' | 'fail' = 'pass';
      let issue: string | undefined;

      if (level - lastLevel > 1 && lastLevel !== 0) {
        status = 'warning';
        issue = `Skipped heading level (h${lastLevel} to h${level})`;
      }
      lastLevel = level;

      results.push({
        element: `h${level}`,
        type: 'heading',
        label: text,
        status,
        issue,
      });
    });

    setAriaResults(results);
    setIsScanning(false);
  };

  // Test live region announcement
  const testLiveRegion = (type: 'polite' | 'assertive') => {
    const message = liveRegionTest || `Test ${type} announcement at ${new Date().toLocaleTimeString()}`;
    setAnnouncementLog(prev => [...prev, { message, timestamp: new Date(), type }]);
  };

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

      // ARIA scan stats
      const ariaPassCount = ariaResults.filter(r => r.status === 'pass').length;
      const ariaWarnCount = ariaResults.filter(r => r.status === 'warning').length;
      const ariaFailCount = ariaResults.filter(r => r.status === 'fail').length;
      const ariaTotalCount = ariaResults.length;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const summaryText = [
        `This report evaluates the accessibility compliance of the application against WCAG 2.1 guidelines.`,
        ``,
        `COLOR CONTRAST ANALYSIS:`,
        `Total Color Combinations Tested: ${totalChecks}`,
        `AAA Compliant (7:1+ ratio): ${aaaCount} (${totalChecks > 0 ? Math.round((aaaCount / totalChecks) * 100) : 0}%)`,
        `AA Compliant (4.5:1+ ratio): ${aaCount} (${totalChecks > 0 ? Math.round((aaCount / totalChecks) * 100) : 0}%)`,
        `Non-Compliant: ${failCount} (${totalChecks > 0 ? Math.round((failCount / totalChecks) * 100) : 0}%)`,
        ``,
        `ARIA & SCREEN READER ANALYSIS:`,
        `Total Elements Scanned: ${ariaTotalCount}`,
        `Passed: ${ariaPassCount} | Warnings: ${ariaWarnCount} | Issues: ${ariaFailCount}`,
        ``,
        `Overall Contrast Compliance Rate: ${passRate}%`
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
        doc.text('Contrast Recommendations', margin, yPos);
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
        yPos += 15;
      }

      // ARIA Scan Results Section
      if (ariaResults.length > 0) {
        // Add new page for ARIA results
        doc.addPage();
        yPos = 20;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('ARIA & Screen Reader Analysis', margin, yPos);
        yPos += 10;

        // ARIA Summary
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`This section analyzes ARIA labels, roles, and accessible names for screen reader compatibility.`, margin, yPos);
        yPos += 10;

        // ARIA issues table (only show warnings and failures)
        const ariaIssues = ariaResults.filter(r => r.status !== 'pass');
        
        if (ariaIssues.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('Issues Requiring Attention', margin, yPos);
          yPos += 8;

          const ariaTableData = ariaIssues.map(result => [
            result.element,
            result.type,
            result.label || '(none)',
            result.status === 'warning' ? 'Warning' : 'Issue',
            result.issue || ''
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Element', 'Type', 'Label', 'Status', 'Issue Description']],
            body: ariaTableData,
            headStyles: { 
              fillColor: [89, 42, 42],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 9
            },
            bodyStyles: {
              fontSize: 8
            },
            alternateRowStyles: {
              fillColor: [245, 245, 245]
            },
            columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 25 },
              2: { cellWidth: 40 },
              3: { cellWidth: 20, halign: 'center' },
              4: { cellWidth: 60 }
            },
            didParseCell: (data) => {
              if (data.section === 'body' && data.column.index === 3) {
                const status = data.cell.raw as string;
                if (status === 'Warning') {
                  data.cell.styles.textColor = [218, 165, 32];
                  data.cell.styles.fontStyle = 'bold';
                } else {
                  data.cell.styles.textColor = [178, 34, 34];
                  data.cell.styles.fontStyle = 'bold';
                }
              }
            }
          });

          yPos = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setTextColor(34, 139, 34);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('All scanned elements passed ARIA validation!', margin, yPos);
          yPos += 15;
        }

        // Element type breakdown
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Element Type Breakdown', margin, yPos);
        yPos += 10;

        const typeBreakdown: Record<string, { pass: number; warning: number; fail: number }> = {};
        ariaResults.forEach(r => {
          if (!typeBreakdown[r.type]) {
            typeBreakdown[r.type] = { pass: 0, warning: 0, fail: 0 };
          }
          typeBreakdown[r.type][r.status]++;
        });

        const breakdownData = Object.entries(typeBreakdown).map(([type, counts]) => [
          type,
          counts.pass.toString(),
          counts.warning.toString(),
          counts.fail.toString(),
          (counts.pass + counts.warning + counts.fail).toString()
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Element Type', 'Passed', 'Warnings', 'Issues', 'Total']],
          body: breakdownData,
          headStyles: { 
            fillColor: [89, 42, 42],
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
            0: { cellWidth: 50 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' },
            4: { cellWidth: 30, halign: 'center' }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // ARIA Best Practices
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ARIA Best Practices Reference', margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const ariaBestPractices = [
          '• All interactive elements must have accessible names (aria-label, text content, or title)',
          '• Images require alt attributes (use empty alt="" for decorative images)',
          '• Heading levels should not skip (e.g., h1 to h3 without h2)',
          '• aria-label should match or describe visible text for voice control users',
          '• Use aria-live regions for dynamic content updates',
          '• Buttons should have descriptive labels that indicate their action',
          '• Form inputs must have associated labels',
        ];

        ariaBestPractices.forEach(line => {
          doc.text(line, margin, yPos);
          yPos += 6;
        });
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
          <TabsTrigger value="screenreader" aria-label="Screen reader testing">
            <Volume2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Screen Reader
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

        <TabsContent value="screenreader">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* ARIA Label Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  ARIA Label Scanner
                  <Button 
                    onClick={scanAriaLabels} 
                    disabled={isScanning}
                    size="sm"
                    className="gap-2"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Scan Page
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Analyze ARIA labels, roles, and accessible names across the page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ariaResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Volume2 className="h-12 w-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                    <p>Click "Scan Page" to analyze ARIA labels</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-500">
                          {ariaResults.filter(r => r.status === 'pass').length}
                        </p>
                        <p className="text-xs text-muted-foreground">Pass</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-yellow-500">
                          {ariaResults.filter(r => r.status === 'warning').length}
                        </p>
                        <p className="text-xs text-muted-foreground">Warnings</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-500">
                          {ariaResults.filter(r => r.status === 'fail').length}
                        </p>
                        <p className="text-xs text-muted-foreground">Issues</p>
                      </div>
                    </div>

                    {/* Results list */}
                    {ariaResults.map((result, idx) => (
                      <div 
                        key={idx}
                        className={`p-2 rounded border text-sm ${
                          result.status === 'fail' 
                            ? 'bg-red-500/10 border-red-500/30' 
                            : result.status === 'warning'
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-muted/50 border-border/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                            <span className="font-mono text-xs">{result.element}</span>
                          </div>
                          {result.status === 'pass' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                          ) : result.status === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1 truncate">
                          Label: {result.label || '(none)'}
                        </p>
                        {result.issue && (
                          <p className="text-xs mt-1 text-destructive">{result.issue}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Region Tester */}
            <Card>
              <CardHeader>
                <CardTitle>Live Region Tester</CardTitle>
                <CardDescription>
                  Test screen reader announcements using ARIA live regions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="announcement-text">Announcement Text</Label>
                  <Input
                    id="announcement-text"
                    value={liveRegionTest}
                    onChange={(e) => setLiveRegionTest(e.target.value)}
                    placeholder="Enter text to announce..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => testLiveRegion('polite')} 
                    variant="outline"
                    className="flex-1"
                  >
                    Polite Announcement
                  </Button>
                  <Button 
                    onClick={() => testLiveRegion('assertive')}
                    variant="secondary"
                    className="flex-1"
                  >
                    Assertive Announcement
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="h-4 w-4" aria-hidden="true" />
                    <span className="font-medium">How it works:</span>
                  </div>
                  <ul className="text-muted-foreground text-xs space-y-1 ml-6">
                    <li><strong>Polite:</strong> Waits for current speech to finish</li>
                    <li><strong>Assertive:</strong> Interrupts current speech immediately</li>
                  </ul>
                </div>

                {/* Announcement Log */}
                <div className="space-y-2">
                  <Label>Announcement Log</Label>
                  <div className="h-[200px] overflow-y-auto rounded-lg border bg-background p-2 space-y-2">
                    {announcementLog.length === 0 ? (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        No announcements yet
                      </p>
                    ) : (
                      announcementLog.map((log, idx) => (
                        <div 
                          key={idx} 
                          className="p-2 rounded bg-muted/50 text-sm flex items-start justify-between"
                        >
                          <div>
                            <Badge variant={log.type === 'assertive' ? 'secondary' : 'outline'} className="text-xs mb-1">
                              {log.type}
                            </Badge>
                            <p className="text-foreground">{log.message}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {announcementLog.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setAnnouncementLog([])}
                  >
                    Clear Log
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actual Live Regions for Testing */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {announcementLog.filter(l => l.type === 'polite').slice(-1)[0]?.message}
          </div>
          <div aria-live="assertive" aria-atomic="true" className="sr-only">
            {announcementLog.filter(l => l.type === 'assertive').slice(-1)[0]?.message}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}