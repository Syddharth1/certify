import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TextControlsProps {
  selectedObject: any;
  onUpdateProperty: (property: string, value: any) => void;
  onToggleStyle: (style: 'fontWeight' | 'fontStyle' | 'underline') => void;
}

const fontFamilies = [
  "Inter",
  "Playfair Display",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans Pro",
  "Merriweather",
  "Oswald",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Helvetica",
  "Courier New",
];

export const TextControls = ({ selectedObject, onUpdateProperty, onToggleStyle }: TextControlsProps) => {
  if (!selectedObject || selectedObject.type !== "i-text") return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Text Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Font Size</Label>
            <Input
              type="number"
              value={selectedObject.fontSize || 24}
              onChange={(e) => onUpdateProperty("fontSize", parseInt(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Line Height</Label>
            <Input
              type="number"
              step="0.1"
              min="0.5"
              max="3"
              value={selectedObject.lineHeight || 1.16}
              onChange={(e) => onUpdateProperty("lineHeight", parseFloat(e.target.value))}
              className="h-8"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs">Font Family</Label>
          <Select
            value={selectedObject.fontFamily || "Inter"}
            onValueChange={(value) => onUpdateProperty("fontFamily", value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-xs">Letter Spacing</Label>
          <div className="flex items-center gap-2">
            <Input
              type="range"
              min="-100"
              max="500"
              value={selectedObject.charSpacing || 0}
              onChange={(e) => onUpdateProperty("charSpacing", parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {selectedObject.charSpacing || 0}
            </span>
          </div>
        </div>
        
        <div>
          <Label className="text-xs">Text Color</Label>
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
          <Label className="text-xs">Text Style</Label>
          <div className="flex gap-1 mt-1">
            <Button
              variant={selectedObject.fontWeight === 'bold' ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleStyle('fontWeight')}
              className="flex-1 h-8"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedObject.fontStyle === 'italic' ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleStyle('fontStyle')}
              className="flex-1 h-8"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedObject.underline ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleStyle('underline')}
              className="flex-1 h-8"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-xs">Text Alignment</Label>
          <div className="flex gap-1 mt-1">
            <Button
              variant={selectedObject.textAlign === 'left' ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdateProperty("textAlign", "left")}
              className="flex-1 h-8"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedObject.textAlign === 'center' ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdateProperty("textAlign", "center")}
              className="flex-1 h-8"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedObject.textAlign === 'right' ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdateProperty("textAlign", "right")}
              className="flex-1 h-8"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedObject.textAlign === 'justify' ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdateProperty("textAlign", "justify")}
              className="flex-1 h-8"
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>
        </div>

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
      </CardContent>
    </Card>
  );
};
