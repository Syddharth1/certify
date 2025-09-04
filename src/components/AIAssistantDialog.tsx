import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Copy, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIAssistantDialogProps {
  onSuggestion: (text: string, type: 'title' | 'message') => void;
}

const AIAssistantDialog: React.FC<AIAssistantDialogProps> = ({ onSuggestion }) => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'title' | 'message' | 'general'>('title');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt, type }
      });

      if (error) throw error;

      if (data?.success) {
        setResponse(data.text);
        toast({
          title: "Generated!",
          description: "AI suggestion is ready",
        });
      } else {
        throw new Error(data?.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate content',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUse = () => {
    if (response && (type === 'title' || type === 'message')) {
      onSuggestion(response, type);
      setIsOpen(false);
      setResponse('');
      setPrompt('');
      toast({
        title: "Applied!",
        description: `${type === 'title' ? 'Title' : 'Message'} has been applied`,
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'title':
        return 'e.g., "Create a title for completion of advanced marketing course"';
      case 'message':
        return 'e.g., "Write a congratulatory message for completing a coding bootcamp"';
      default:
        return 'Ask me anything about certificate content...';
    }
  };

  const getSuggestions = () => {
    switch (type) {
      case 'title':
        return [
          "Certificate of Excellence in Digital Marketing",
          "Professional Development Achievement Award",
          "Completion of Advanced Web Development Course"
        ];
      case 'message':
        return [
          "Congratulations on successfully completing this program and demonstrating exceptional dedication to professional growth.",
          "This certificate recognizes your outstanding achievement and commitment to excellence in your field of study.",
          "Well done on reaching this milestone. Your hard work and perseverance have truly paid off."
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bot className="h-4 w-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Certificate Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">What do you need help with?</label>
            <Select value={type} onValueChange={(value: 'title' | 'message' | 'general') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Certificate Title</SelectItem>
                <SelectItem value="message">Certificate Message</SelectItem>
                <SelectItem value="general">General Help</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Describe what you need</label>
            <Textarea
              placeholder={getPlaceholder()}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? "Generating..." : "Generate with AI"}
          </Button>

          {response && (
            <div className="space-y-3">
              <label className="text-sm font-medium">AI Suggestion:</label>
              <div className="p-3 bg-muted rounded-lg border">
                <p className="text-sm whitespace-pre-wrap">{response}</p>
              </div>
              <div className="flex gap-2">
                {(type === 'title' || type === 'message') && (
                  <Button onClick={handleUse} className="flex-1">
                    Use This {type === 'title' ? 'Title' : 'Message'}
                  </Button>
                )}
                <Button variant="outline" onClick={handleCopy} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          )}

          {!response && getSuggestions().length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick examples:</label>
              <div className="space-y-1">
                {getSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(`Generate a ${type} similar to: "${suggestion}"`)}
                    className="text-left p-2 text-xs bg-muted/50 rounded hover:bg-muted transition-colors w-full"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;