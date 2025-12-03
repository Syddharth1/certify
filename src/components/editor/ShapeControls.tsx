import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShapeControlsProps {
  selectedObject: any;
  onUpdateProperty: (property: string, value: any) => void;
}

const isShapeType = (type: string) => {
  return ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(type);
};

export const ShapeControls = ({ selectedObject, onUpdateProperty }: ShapeControlsProps) => {
  if (!selectedObject || !isShapeType(selectedObject.type)) return null;

  const isRect = selectedObject.type === 'rect';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Shape Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Fill Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={selectedObject.fill || "#000000"}
              onChange={(e) => onUpdateProperty("fill", e.target.value)}
              className="w-10 h-8 p-1"
            />
            <Input
              type="text"
              value={selectedObject.fill || "#000000"}
              onChange={(e) => onUpdateProperty("fill", e.target.value)}
              className="flex-1 h-8"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs">Stroke Color</Label>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={selectedObject.stroke || "#000000"}
              onChange={(e) => onUpdateProperty("stroke", e.target.value)}
              className="w-10 h-8 p-1"
            />
            <Input
              type="text"
              value={selectedObject.stroke || "#000000"}
              onChange={(e) => onUpdateProperty("stroke", e.target.value)}
              className="flex-1 h-8"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs">Stroke Width</Label>
          <Input
            type="number"
            min="0"
            max="50"
            value={selectedObject.strokeWidth || 0}
            onChange={(e) => onUpdateProperty("strokeWidth", parseInt(e.target.value))}
            className="h-8"
          />
        </div>

        {isRect && (
          <div>
            <Label className="text-xs">Corner Radius</Label>
            <div className="flex items-center gap-2">
              <Input
                type="range"
                min="0"
                max="100"
                value={selectedObject.rx || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateProperty("rx", val);
                  onUpdateProperty("ry", val);
                }}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {selectedObject.rx || 0}px
              </span>
            </div>
          </div>
        )}
        
        <div>
          <Label className="text-xs">Opacity</Label>
          <div className="flex items-center gap-2">
            <Input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedObject.opacity || 1}
              onChange={(e) => onUpdateProperty("opacity", parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {Math.round((selectedObject.opacity || 1) * 100)}%
            </span>
          </div>
        </div>

        <div>
          <Label className="text-xs">Shadow</Label>
          <div className="space-y-2 mt-1">
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={selectedObject.shadow?.color || "#000000"}
                onChange={(e) => {
                  const shadow = selectedObject.shadow || { color: '#000000', blur: 10, offsetX: 5, offsetY: 5 };
                  onUpdateProperty("shadow", { ...shadow, color: e.target.value });
                }}
                className="w-10 h-8 p-1"
              />
              <Input
                type="number"
                placeholder="Blur"
                min="0"
                max="50"
                value={selectedObject.shadow?.blur || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val === 0) {
                    onUpdateProperty("shadow", null);
                  } else {
                    const shadow = selectedObject.shadow || { color: '#000000', blur: 10, offsetX: 5, offsetY: 5 };
                    onUpdateProperty("shadow", { ...shadow, blur: val });
                  }
                }}
                className="flex-1 h-8"
              />
            </div>
            {selectedObject.shadow?.blur > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Offset X</Label>
                  <Input
                    type="number"
                    value={selectedObject.shadow?.offsetX || 0}
                    onChange={(e) => {
                      const shadow = selectedObject.shadow || { color: '#000000', blur: 10, offsetX: 5, offsetY: 5 };
                      onUpdateProperty("shadow", { ...shadow, offsetX: parseInt(e.target.value) });
                    }}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Offset Y</Label>
                  <Input
                    type="number"
                    value={selectedObject.shadow?.offsetY || 0}
                    onChange={(e) => {
                      const shadow = selectedObject.shadow || { color: '#000000', blur: 10, offsetX: 5, offsetY: 5 };
                      onUpdateProperty("shadow", { ...shadow, offsetY: parseInt(e.target.value) });
                    }}
                    className="h-8"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
