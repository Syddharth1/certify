import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TextControlsEnhancedProps {
  selectedObject: any;
  onUpdateProperty: (property: string, value: any) => void;
  onToggleStyle: (style: 'fontWeight' | 'fontStyle' | 'underline') => void;
}

// Comprehensive font library organized by category
const fontCategories = {
  "Display": [
    "Playfair Display",
    "DM Serif Display", 
    "Abril Fatface",
    "Lobster",
    "Pacifico",
    "Dancing Script",
    "Great Vibes",
    "Satisfy",
    "Sacramento",
    "Cormorant Garamond",
  ],
  "Sans Serif": [
    "Inter",
    "Plus Jakarta Sans",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Nunito",
    "Raleway",
    "Work Sans",
    "DM Sans",
    "Manrope",
  ],
  "Serif": [
    "Merriweather",
    "Georgia",
    "Times New Roman",
    "PT Serif",
    "Libre Baskerville",
    "Crimson Text",
    "Source Serif Pro",
    "Lora",
    "Noto Serif",
  ],
  "Handwriting": [
    "Caveat",
    "Kalam",
    "Indie Flower",
    "Shadows Into Light",
    "Patrick Hand",
    "Architects Daughter",
    "Permanent Marker",
    "Rock Salt",
  ],
  "Monospace": [
    "Courier New",
    "Fira Code",
    "JetBrains Mono",
    "Source Code Pro",
    "IBM Plex Mono",
    "Roboto Mono",
  ],
};

const allFonts = Object.values(fontCategories).flat();

const textShadowPresets = [
  { label: "None", value: null },
  { label: "Soft", value: { color: "rgba(0,0,0,0.3)", blur: 4, offsetX: 2, offsetY: 2 } },
  { label: "Medium", value: { color: "rgba(0,0,0,0.5)", blur: 8, offsetX: 4, offsetY: 4 } },
  { label: "Strong", value: { color: "rgba(0,0,0,0.6)", blur: 12, offsetX: 6, offsetY: 6 } },
  { label: "Glow", value: { color: "rgba(59,130,246,0.6)", blur: 20, offsetX: 0, offsetY: 0 } },
  { label: "Neon", value: { color: "rgba(236,72,153,0.8)", blur: 25, offsetX: 0, offsetY: 0 } },
];

export const TextControlsEnhanced = ({ 
  selectedObject, 
  onUpdateProperty, 
  onToggleStyle 
}: TextControlsEnhancedProps) => {
  if (!selectedObject || selectedObject.type !== "i-text") return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Font Family */}
          <div>
            <Label className="text-xs mb-2 block">Font Family</Label>
            <Select
              value={selectedObject.fontFamily || "Inter"}
              onValueChange={(value) => onUpdateProperty("fontFamily", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {Object.entries(fontCategories).map(([category, fonts]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                      {category}
                    </div>
                    {fonts.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size and Line Height */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-2 block">Size</Label>
              <Input
                type="number"
                value={selectedObject.fontSize || 24}
                onChange={(e) => onUpdateProperty("fontSize", parseInt(e.target.value))}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs mb-2 block">Line Height</Label>
              <Input
                type="number"
                step="0.1"
                min="0.5"
                max="3"
                value={selectedObject.lineHeight || 1.16}
                onChange={(e) => onUpdateProperty("lineHeight", parseFloat(e.target.value))}
                className="h-9"
              />
            </div>
          </div>

          {/* Text Style Buttons */}
          <div>
            <Label className="text-xs mb-2 block">Style</Label>
            <div className="flex gap-1">
              <Button
                variant={selectedObject.fontWeight === 'bold' ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleStyle('fontWeight')}
                className="flex-1 h-9"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedObject.fontStyle === 'italic' ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleStyle('fontStyle')}
                className="flex-1 h-9"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant={selectedObject.underline ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleStyle('underline')}
                className="flex-1 h-9"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Alignment */}
          <div>
            <Label className="text-xs mb-2 block">Alignment</Label>
            <div className="flex gap-1">
              {[
                { align: "left", Icon: AlignLeft },
                { align: "center", Icon: AlignCenter },
                { align: "right", Icon: AlignRight },
                { align: "justify", Icon: AlignJustify },
              ].map(({ align, Icon }) => (
                <Button
                  key={align}
                  variant={selectedObject.textAlign === align ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateProperty("textAlign", align)}
                  className="flex-1 h-9"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Letter Spacing */}
          <div>
            <Label className="text-xs mb-2 block">Letter Spacing: {selectedObject.charSpacing || 0}</Label>
            <Slider
              value={[selectedObject.charSpacing || 0]}
              onValueChange={([value]) => onUpdateProperty("charSpacing", value)}
              min={-100}
              max={500}
              step={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs mb-2 block">Text Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={selectedObject.fill || "#000000"}
                onChange={(e) => onUpdateProperty("fill", e.target.value)}
                className="w-12 h-9 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={selectedObject.fill || "#000000"}
                onChange={(e) => onUpdateProperty("fill", e.target.value)}
                className="flex-1 h-9 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-2 block">Stroke (Outline)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={selectedObject.stroke || "#000000"}
                onChange={(e) => onUpdateProperty("stroke", e.target.value)}
                className="w-12 h-9 p-1 cursor-pointer"
              />
              <Input
                type="number"
                placeholder="Width"
                min="0"
                max="10"
                value={selectedObject.strokeWidth || 0}
                onChange={(e) => onUpdateProperty("strokeWidth", parseInt(e.target.value))}
                className="flex-1 h-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-2 block">Opacity: {Math.round((selectedObject.opacity || 1) * 100)}%</Label>
            <Slider
              value={[(selectedObject.opacity || 1) * 100]}
              onValueChange={([value]) => onUpdateProperty("opacity", value / 100)}
              min={0}
              max={100}
              step={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Text Effects */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Text Effects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs mb-2 block">Shadow Preset</Label>
            <div className="grid grid-cols-3 gap-2">
              {textShadowPresets.map(({ label, value }) => (
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
          </div>

          {selectedObject.shadow && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-xs mb-2 block">Shadow Color</Label>
                <Input
                  type="color"
                  value={selectedObject.shadow?.color?.replace(/rgba?\([^)]+\)/, '#000000') || "#000000"}
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
    </div>
  );
};
