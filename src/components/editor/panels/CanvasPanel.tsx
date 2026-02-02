import { ZoomIn, ZoomOut, RotateCcw, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface CanvasPanelProps {
  canvasZoom: number;
  canvasBackground: string;
  onZoom: (direction: 'in' | 'out' | 'reset') => void;
  onCanvasSizeChange: (width: number, height: number) => void;
  onBackgroundChange: (color: string) => void;
}

const canvasPresets = [
  { label: "Certificate", sub: "800×600", w: 800, h: 600 },
  { label: "A4 Landscape", sub: "1123×794", w: 1123, h: 794 },
  { label: "A4 Portrait", sub: "794×1123", w: 794, h: 1123 },
  { label: "Letter", sub: "1056×816", w: 1056, h: 816 },
  { label: "Instagram", sub: "1080×1080", w: 1080, h: 1080 },
  { label: "LinkedIn", sub: "1200×628", w: 1200, h: 628 },
];

const backgroundPresets = [
  { color: "#ffffff", label: "White" },
  { color: "#f8f9fa", label: "Light Gray" },
  { color: "#fff9e6", label: "Cream" },
  { color: "#e8f4f8", label: "Light Blue" },
  { color: "#f0fdf4", label: "Light Green" },
  { color: "#fef2f2", label: "Light Red" },
  { color: "#faf5ff", label: "Light Purple" },
  { color: "#1a1a2e", label: "Dark Navy" },
];

export const CanvasPanel = ({
  canvasZoom,
  canvasBackground,
  onZoom,
  onCanvasSizeChange,
  onBackgroundChange,
}: CanvasPanelProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Canvas Settings</h3>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              Zoom ({Math.round(canvasZoom * 100)}%)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Slider
              value={[canvasZoom * 100]}
              onValueChange={([value]) => {
                const newZoom = value / 100;
                if (newZoom > canvasZoom) onZoom('in');
                else if (newZoom < canvasZoom) onZoom('out');
              }}
              min={50}
              max={300}
              step={10}
              className="w-full"
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onZoom('out')} className="flex-1">
                <ZoomOut className="h-4 w-4 mr-1" /> Out
              </Button>
              <Button variant="outline" size="sm" onClick={() => onZoom('reset')} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-1" /> Reset
              </Button>
              <Button variant="outline" size="sm" onClick={() => onZoom('in')} className="flex-1">
                <ZoomIn className="h-4 w-4 mr-1" /> In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Canvas Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {canvasPresets.map(({ label, sub, w, h }) => (
              <Button 
                key={label} 
                variant="outline" 
                size="sm" 
                onClick={() => onCanvasSizeChange(w, h)}
                className="h-auto py-2 flex-col"
              >
                <span className="font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{sub}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Input 
              type="color" 
              value={canvasBackground} 
              onChange={(e) => onBackgroundChange(e.target.value)} 
              className="w-12 h-10 p-1 cursor-pointer" 
            />
            <Input 
              type="text" 
              value={canvasBackground} 
              onChange={(e) => onBackgroundChange(e.target.value)} 
              className="flex-1 font-mono text-sm" 
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {backgroundPresets.map(({ color, label }) => (
              <button
                key={color}
                onClick={() => onBackgroundChange(color)}
                className="h-10 rounded-lg border-2 border-border hover:border-primary hover:scale-105 transition-all"
                style={{ backgroundColor: color }}
                aria-label={label}
                title={label}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
