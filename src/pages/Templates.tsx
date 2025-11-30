import { useState, useEffect } from "react";
import { Search, Filter, Star, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CertificateCardSkeleton } from "@/components/LoadingSkeleton";
import { SkipToContent } from "@/components/SkipToContent";
import { TemplatePreviewDialog } from "@/components/TemplatePreviewDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Templates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('downloads', { ascending: false });

      if (error) throw error;
      
      setTemplates(data || []);
      toast.success(`Loaded ${data?.length || 0} templates`);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleUseTemplate = (template: any) => {
    navigate('/editor', { state: { templateData: template.template_data, templateId: template.id } });
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SkipToContent />
      <Navigation />
      <div className="min-h-screen bg-gradient-subtle pt-20" id="main-content">
        <div className="container mx-auto p-8">
        <Breadcrumb />
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">
            Certificate Templates
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our professionally designed templates or create your own from scratch
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="mb-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CertificateCardSkeleton />
              <CertificateCardSkeleton />
              <CertificateCardSkeleton />
              <CertificateCardSkeleton />
              <CertificateCardSkeleton />
              <CertificateCardSkeleton />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found. Try adjusting your search.</p>
            </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="certificate-card group">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={template.thumbnail_url || "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=300&fit=crop"}
                        alt={template.title}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      {template.is_premium && (
                        <Badge className="absolute top-3 right-3 bg-gradient-gold text-accent-gold-foreground">
                          Premium
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handlePreview(template)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" className="btn-hero" onClick={() => handleUseTemplate(template)}>
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4">
                    <div className="w-full">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{template.title}</h3>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="outline">{template.category}</Badge>
                        <div className="flex items-center gap-3">
                          {template.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-accent-gold text-accent-gold" />
                              <span>{template.rating}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{template.downloads || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-gradient-primary rounded-2xl text-white">
          <h2 className="text-3xl font-display font-bold mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Create a custom certificate from scratch with our powerful editor
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => window.location.href = '/editor'}
          >
            Start from Blank
          </Button>
        </div>
        </div>
        
        <TemplatePreviewDialog 
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          template={selectedTemplate}
        />
      </div>
    </>
  );
};

export default Templates;