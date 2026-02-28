import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Bold, Italic, Link, Image } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  id?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write something...", 
  rows = 4,
  disabled = false,
  id
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);

  const getSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, text: '' };
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: value.substring(textarea.selectionStart, textarea.selectionEnd)
    };
  }, [value]);

  const insertText = useCallback((before: string, after: string, placeholder?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, text } = getSelection();
    const selectedText = text || placeholder || '';
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newValue);

    // Set cursor position after the operation
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange, getSelection]);

  const handleBold = () => {
    insertText('**', '**', 'bold text');
  };

  const handleItalic = () => {
    insertText('*', '*', 'italic text');
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    
    const { start, end, text } = getSelection();
    const displayText = linkText.trim() || text || linkUrl;
    const markdown = `[${displayText}](${linkUrl})`;
    
    const newValue = value.substring(0, start) + markdown + value.substring(end);
    onChange(newValue);
    
    setLinkUrl('');
    setLinkText('');
    setLinkPopoverOpen(false);
    
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    
    const { start, end } = getSelection();
    const alt = imageAlt.trim() || 'image';
    const markdown = `![${alt}](${imageUrl})`;
    
    const newValue = value.substring(0, start) + markdown + value.substring(end);
    onChange(newValue);
    
    setImageUrl('');
    setImageAlt('');
    setImagePopoverOpen(false);
    
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleLinkPopoverOpen = (open: boolean) => {
    if (open) {
      const { text } = getSelection();
      setLinkText(text);
    }
    setLinkPopoverOpen(open);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-md border border-border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Bold (wrap selection in **)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          disabled={disabled}
          className="h-8 w-8 p-0"
          title="Italic (wrap selection in *)"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Popover open={linkPopoverOpen} onOpenChange={handleLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Insert link"
            >
              <Link className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="link-text">Link Text</Label>
                <Input
                  id="link-text"
                  placeholder="Display text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <Button 
                type="button" 
                size="sm" 
                onClick={handleInsertLink}
                disabled={!linkUrl.trim()}
                className="w-full"
              >
                Insert Link
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="h-8 w-8 p-0"
              title="Insert image"
            >
              <Image className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="image-alt">Alt Text (optional)</Label>
                <Input
                  id="image-alt"
                  placeholder="Image description"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
              <Button 
                type="button" 
                size="sm" 
                onClick={handleInsertImage}
                disabled={!imageUrl.trim()}
                className="w-full"
              >
                Insert Image
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <span className="ml-auto text-xs text-muted-foreground pr-2">
          Markdown supported
        </span>
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="font-mono text-sm"
      />
    </div>
  );
}
