import { useState, useEffect } from "react";
import { FileStack, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  category: string;
  template_data: any;
}

interface TemplateQuickSwitchProps {
  fabricCanvas: any;
}

export const TemplateQuickSwitch = ({ fabricCanvas }: TemplateQuickSwitchProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("id, title, category, template_data")
        .eq("is_public", true)
        .order("title")
        .limit(10);

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const loadTemplate = async (template: Template) => {
    if (!fabricCanvas) return;
    
    setLoading(true);
    try {
      await fabricCanvas.loadFromJSON(template.template_data);
      fabricCanvas.renderAll();
      setCurrentTemplate(template.title);
      toast.success(`Loaded: ${template.title}`);
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    setCurrentTemplate(null);
    toast.success("Canvas cleared");
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={loading}>
          <FileStack className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentTemplate || "Templates"}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto">
        <DropdownMenuItem onClick={clearCanvas}>
          <span className="font-medium">Start Fresh</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
              {category}
            </div>
            {categoryTemplates.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => loadTemplate(template)}
                className="pl-4"
              >
                {template.title}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
        {templates.length === 0 && (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">No templates available</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
