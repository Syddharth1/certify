import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    thumbnail_url: string | null;
    is_premium: boolean | null;
    rating: number | null;
    downloads: number | null;
    template_data: any;
  } | null;
}

export const TemplatePreviewDialog = ({ open, onOpenChange, template }: TemplatePreviewDialogProps) => {
  const navigate = useNavigate();

  if (!template) return null;

  const handleUseTemplate = () => {
    navigate('/editor', { state: { templateData: template.template_data, templateId: template.id } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl mb-2">{template.title}</DialogTitle>
              <DialogDescription>{template.description}</DialogDescription>
            </div>
            {template.is_premium && (
              <Badge className="bg-gradient-gold text-accent-gold-foreground">Premium</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Image */}
          <div className="rounded-lg overflow-hidden border border-border">
            <img 
              src={template.thumbnail_url || 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop'} 
              alt={template.title}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{template.category}</Badge>
            </div>
            {template.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent-gold text-accent-gold" />
                <span>{template.rating}</span>
              </div>
            )}
            {template.downloads !== null && (
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{template.downloads} downloads</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleUseTemplate} className="flex-1 btn-hero">
              Use This Template
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
