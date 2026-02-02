import { 
  Square, 
  Circle, 
  Triangle, 
  Minus, 
  Pentagon, 
  Hexagon, 
  Star,
  Octagon,
  Diamond,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShapesPanelProps {
  activeTool: string;
  onToolClick: (tool: string) => void;
}

const basicShapes = [
  { tool: "rectangle", Icon: Square, label: "Rectangle" },
  { tool: "circle", Icon: Circle, label: "Circle" },
  { tool: "triangle", Icon: Triangle, label: "Triangle" },
  { tool: "line", Icon: Minus, label: "Line" },
];

const advancedShapes = [
  { tool: "pentagon", Icon: Pentagon, label: "Pentagon" },
  { tool: "hexagon", Icon: Hexagon, label: "Hexagon" },
  { tool: "star", Icon: Star, label: "Star" },
];

export const ShapesPanel = ({ activeTool, onToolClick }: ShapesPanelProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Shapes</h3>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Basic Shapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {basicShapes.map(({ tool, Icon, label }) => (
                <Button 
                  key={tool}
                  variant={activeTool === tool ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => onToolClick(tool)} 
                  className="h-12 flex-col gap-1"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Advanced Shapes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {advancedShapes.map(({ tool, Icon, label }) => (
              <Button 
                key={tool}
                variant={activeTool === tool ? "default" : "outline"} 
                size="sm" 
                onClick={() => onToolClick(tool)} 
                className="h-14 flex-col gap-1"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Click on a shape to add it to your canvas. You can then resize, rotate, and style it.
        </p>
      </div>
    </div>
  );
};
