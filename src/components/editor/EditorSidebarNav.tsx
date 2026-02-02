import { 
  Type, 
  Shapes, 
  Palette, 
  Settings2, 
  Frame, 
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

export type EditorPanel = "tools" | "shapes" | "design" | "properties" | "canvas" | "layers";

interface EditorSidebarNavProps {
  activePanel: EditorPanel;
  onPanelChange: (panel: EditorPanel) => void;
  hasSelection: boolean;
}

const navItems: { id: EditorPanel; icon: typeof Type; label: string; requiresSelection?: boolean }[] = [
  { id: "tools", icon: Type, label: "Tools" },
  { id: "shapes", icon: Shapes, label: "Shapes" },
  { id: "design", icon: Sparkles, label: "Elements" },
  { id: "properties", icon: Settings2, label: "Properties", requiresSelection: true },
  { id: "canvas", icon: Frame, label: "Canvas" },
  { id: "layers", icon: Layers, label: "Layers" },
];

export const EditorSidebarNav = ({ activePanel, onPanelChange, hasSelection }: EditorSidebarNavProps) => {
  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col items-center py-4 gap-1 bg-card border-r border-border w-14 shrink-0">
        {navItems.map(({ id, icon: Icon, label, requiresSelection }) => {
          const isDisabled = requiresSelection && !hasSelection;
          const isActive = activePanel === id;
          
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => !isDisabled && onPanelChange(id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
                  )}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {label}
                {requiresSelection && !hasSelection && (
                  <span className="text-muted-foreground ml-1">(select object)</span>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
};
