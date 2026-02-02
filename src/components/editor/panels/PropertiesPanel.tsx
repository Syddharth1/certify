import { Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PositionControls } from "../PositionControls";
import { TextControlsEnhanced } from "./TextControlsEnhanced";
import { ShapeControlsEnhanced } from "./ShapeControlsEnhanced";

interface PropertiesPanelProps {
  selectedObject: any;
  onUpdateProperty: (property: string, value: any) => void;
  onToggleStyle: (style: 'fontWeight' | 'fontStyle' | 'underline') => void;
}

export const PropertiesPanel = ({ 
  selectedObject, 
  onUpdateProperty, 
  onToggleStyle 
}: PropertiesPanelProps) => {
  if (!selectedObject) {
    return (
      <div className="space-y-6">
        <h3 className="font-semibold text-lg">Properties</h3>
        <Card>
          <CardContent className="py-12 text-center">
            <Settings2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Select an object on the canvas to edit its properties
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const objectType = selectedObject.type;
  const isText = objectType === "i-text";
  const isShape = ['rect', 'circle', 'triangle', 'polygon', 'line'].includes(objectType);
  const isImage = objectType === "image";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Properties</h3>
        <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
          {objectType === "i-text" ? "Text" : objectType}
        </span>
      </div>

      <PositionControls 
        selectedObject={selectedObject} 
        onUpdateProperty={onUpdateProperty} 
      />

      {isText && (
        <TextControlsEnhanced
          selectedObject={selectedObject}
          onUpdateProperty={onUpdateProperty}
          onToggleStyle={onToggleStyle}
        />
      )}

      {isShape && (
        <ShapeControlsEnhanced
          selectedObject={selectedObject}
          onUpdateProperty={onUpdateProperty}
        />
      )}

      {isImage && (
        <Card>
          <CardContent className="py-4 text-center text-sm text-muted-foreground">
            Image selected. Use the handles to resize and rotate.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
