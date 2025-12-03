import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PositionControlsProps {
  selectedObject: any;
  onUpdateProperty: (property: string, value: any) => void;
}

export const PositionControls = ({ selectedObject, onUpdateProperty }: PositionControlsProps) => {
  if (!selectedObject) return null;

  const getWidth = () => {
    if (selectedObject.type === 'circle') {
      return Math.round((selectedObject.radius || 50) * 2 * (selectedObject.scaleX || 1));
    }
    return Math.round((selectedObject.width || 100) * (selectedObject.scaleX || 1));
  };

  const getHeight = () => {
    if (selectedObject.type === 'circle') {
      return Math.round((selectedObject.radius || 50) * 2 * (selectedObject.scaleY || 1));
    }
    return Math.round((selectedObject.height || 100) * (selectedObject.scaleY || 1));
  };

  const setWidth = (value: number) => {
    if (selectedObject.type === 'circle') {
      const radius = value / 2 / (selectedObject.scaleX || 1);
      onUpdateProperty('radius', radius);
    } else {
      const width = value / (selectedObject.scaleX || 1);
      onUpdateProperty('width', width);
    }
  };

  const setHeight = (value: number) => {
    if (selectedObject.type === 'circle') {
      const radius = value / 2 / (selectedObject.scaleY || 1);
      onUpdateProperty('radius', radius);
    } else {
      const height = value / (selectedObject.scaleY || 1);
      onUpdateProperty('height', height);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Position & Size</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">X</Label>
            <Input
              type="number"
              value={Math.round(selectedObject.left || 0)}
              onChange={(e) => onUpdateProperty("left", parseInt(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Y</Label>
            <Input
              type="number"
              value={Math.round(selectedObject.top || 0)}
              onChange={(e) => onUpdateProperty("top", parseInt(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Width</Label>
            <Input
              type="number"
              value={getWidth()}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Height</Label>
            <Input
              type="number"
              value={getHeight()}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className="h-8"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Rotation</Label>
          <div className="flex items-center gap-2">
            <Input
              type="range"
              min="0"
              max="360"
              value={Math.round(selectedObject.angle || 0)}
              onChange={(e) => onUpdateProperty("angle", parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {Math.round(selectedObject.angle || 0)}°
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
