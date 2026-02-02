import { Paintbrush, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShapeControlsEnhancedProps {
  selectedObject: any;
  onUpdateProperty: (property: string, value: any) => void;
}

const isShapeType = (type: string) => {
  return ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(type);
};

const gradientPresets = [
  { label: "Sunset", colors: ["#ff6b6b", "#feca57"] },
  { label: "Ocean", colors: ["#667eea", "#764ba2"] },
  { label: "Forest", colors: ["#11998e", "#38ef7d"] },
  { label: "Fire", colors: ["#f12711", "#f5af19"] },
  { label: "Purple", colors: ["#8e2de2", "#4a00e0"] },
  { label: "Sky", colors: ["#56CCF2", "#2F80ED"] },
  { label: "Gold", colors: ["#F09819", "#EDDE5D"] },
  { label: "Silver", colors: ["#bdc3c7", "#2c3e50"] },
];

const shadowPresets = [
  { label: "None", value: null },
  { label: "Soft", value: { color: "rgba(0,0,0,0.2)", blur: 10, offsetX: 3, offsetY: 3 } },
  { label: "Medium", value: { color: "rgba(0,0,0,0.35)", blur: 15, offsetX: 5, offsetY: 5 } },
  { label: "Strong", value: { color: "rgba(0,0,0,0.5)", blur: 20, offsetX: 8, offsetY: 8 } },
  { label: "Glow", value: { color: "rgba(59,130,246,0.5)", blur: 25, offsetX: 0, offsetY: 0 } },
  { label: "Neon", value: { color: "rgba(16,185,129,0.6)", blur: 30, offsetX: 0, offsetY: 0 } },
];

export const ShapeControlsEnhanced = ({ selectedObject, onUpdateProperty }: ShapeControlsEnhancedProps) => {
  if (!selectedObject || !isShapeType(selectedObject.type)) return null;

  const isRect = selectedObject.type === 'rect';
  const isLine = selectedObject.type === 'line';

  return (
    <div className="space-y-4">
      {/* Fill */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Paintbrush className="h-4 w-4" />
            Fill
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="solid" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="solid" className="text-xs">Solid</TabsTrigger>
              <TabsTrigger value="gradient" className="text-xs">Gradient</TabsTrigger>
            </TabsList>
            
            <TabsContent value="solid" className="mt-3">
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={typeof selectedObject.fill === 'string' ? selectedObject.fill : "#3b82f6"}
                  onChange={(e) => onUpdateProperty("fill", e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={typeof selectedObject.fill === 'string' ? selectedObject.fill : "#3b82f6"}
                  onChange={(e) => onUpdateProperty("fill", e.target.value)}
                  className="flex-1 h-9 font-mono text-sm"
                />
              </div>
              
              {/* Quick color palette */}
              <div className="grid grid-cols-6 gap-2 mt-3">
                {[
                  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899",
                  "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#14b8a6", "#a855f7",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateProperty("fill", color)}
                    className="w-8 h-8 rounded-md border border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="gradient" className="mt-3">
              <div className="grid grid-cols-4 gap-2">
                {gradientPresets.map(({ label, colors }) => (
                  <button
                    key={label}
                    onClick={() => {
                      // Create a gradient fill using fabric.js gradient
                      const gradient = {
                        type: 'linear',
                        coords: { x1: 0, y1: 0, x2: selectedObject.width || 100, y2: selectedObject.height || 100 },
                        colorStops: [
                          { offset: 0, color: colors[0] },
                          { offset: 1, color: colors[1] },
                        ],
                      };
                      onUpdateProperty("fill", gradient);
                    }}
                    className="h-10 rounded-lg border border-border hover:scale-105 transition-all"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` 
                    }}
                    title={label}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Click a preset to apply gradient
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Stroke */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Stroke</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={selectedObject.stroke || "#000000"}
              onChange={(e) => onUpdateProperty("stroke", e.target.value)}
              className="w-12 h-9 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={selectedObject.stroke || "#000000"}
              onChange={(e) => onUpdateProperty("stroke", e.target.value)}
              className="flex-1 h-9 font-mono text-sm"
            />
          </div>
          
          <div>
            <Label className="text-xs mb-2 block">Width: {selectedObject.strokeWidth || 0}px</Label>
            <Slider
              value={[selectedObject.strokeWidth || 0]}
              onValueChange={([value]) => onUpdateProperty("strokeWidth", value)}
              min={0}
              max={20}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Corner Radius (Rect only) */}
      {isRect && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Corner Radius</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-xs mb-2 block">{selectedObject.rx || 0}px</Label>
            <Slider
              value={[selectedObject.rx || 0]}
              onValueChange={([value]) => {
                onUpdateProperty("rx", value);
                onUpdateProperty("ry", value);
              }}
              min={0}
              max={100}
              step={1}
            />
          </CardContent>
        </Card>
      )}

      {/* Shadow Effects */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Shadow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {shadowPresets.map(({ label, value }) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                onClick={() => onUpdateProperty("shadow", value)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>

          {selectedObject.shadow && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-xs mb-2 block">Shadow Color</Label>
                <Input
                  type="color"
                  value="#000000"
                  onChange={(e) => {
                    const shadow = selectedObject.shadow || {};
                    onUpdateProperty("shadow", { ...shadow, color: e.target.value });
                  }}
                  className="w-full h-9 p-1 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Blur</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={selectedObject.shadow?.blur || 0}
                    onChange={(e) => {
                      const shadow = selectedObject.shadow || {};
                      onUpdateProperty("shadow", { ...shadow, blur: parseInt(e.target.value) });
                    }}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={selectedObject.shadow?.offsetX || 0}
                    onChange={(e) => {
                      const shadow = selectedObject.shadow || {};
                      onUpdateProperty("shadow", { ...shadow, offsetX: parseInt(e.target.value) });
                    }}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={selectedObject.shadow?.offsetY || 0}
                    onChange={(e) => {
                      const shadow = selectedObject.shadow || {};
                      onUpdateProperty("shadow", { ...shadow, offsetY: parseInt(e.target.value) });
                    }}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opacity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Opacity</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-xs mb-2 block">{Math.round((selectedObject.opacity || 1) * 100)}%</Label>
          <Slider
            value={[(selectedObject.opacity || 1) * 100]}
            onValueChange={([value]) => onUpdateProperty("opacity", value / 100)}
            min={0}
            max={100}
            step={5}
          />
        </CardContent>
      </Card>
    </div>
  );
};
