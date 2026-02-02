import { Type, QrCode, Hash, Upload, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ToolsPanelProps {
  activeTool: string;
  activeColor: string;
  onToolClick: (tool: string) => void;
  onColorChange: (color: string) => void;
  onAddQRCode: () => void;
  onAddCertificateId: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ToolsPanel = ({
  activeTool,
  activeColor,
  onToolClick,
  onColorChange,
  onAddQRCode,
  onAddCertificateId,
  onImageUpload,
}: ToolsPanelProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Tools</h3>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Type className="h-4 w-4" />
              Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant={activeTool === "text" ? "default" : "outline"} 
              size="sm" 
              onClick={() => onToolClick("text")} 
              className="w-full justify-start gap-2"
            >
              <Type className="h-4 w-4" /> Add Text
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddQRCode} 
              className="w-full justify-start gap-2"
            >
              <QrCode className="h-4 w-4" /> Add QR Code
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAddCertificateId} 
              className="w-full justify-start gap-2"
            >
              <Hash className="h-4 w-4" /> Add Certificate ID
            </Button>
            
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" /> Upload Image
                  </span>
                </Button>
              </Label>
              <Input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                onChange={onImageUpload} 
                className="hidden" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Active Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input 
              type="color" 
              value={activeColor} 
              onChange={(e) => onColorChange(e.target.value)} 
              className="w-12 h-10 p-1 cursor-pointer" 
            />
            <Input 
              type="text" 
              value={activeColor} 
              onChange={(e) => onColorChange(e.target.value)} 
              className="flex-1 font-mono text-sm" 
            />
          </div>
          <div className="grid grid-cols-6 gap-2 mt-3">
            {[
              "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899",
              "#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#ffffff",
            ].map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className="w-8 h-8 rounded-md border-2 border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
