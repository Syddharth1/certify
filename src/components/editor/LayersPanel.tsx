import { Eye, EyeOff, Lock, Unlock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LayersPanelProps {
  fabricCanvas: any;
  selectedObject: any;
  onSelectObject: (obj: any) => void;
  onToggleVisibility: (obj: any) => void;
  onToggleLock: (obj: any) => void;
  onDeleteObject: (obj: any) => void;
}

export const LayersPanel = ({
  fabricCanvas,
  selectedObject,
  onSelectObject,
  onToggleVisibility,
  onToggleLock,
  onDeleteObject,
}: LayersPanelProps) => {
  if (!fabricCanvas) return null;

  const objects = fabricCanvas.getObjects() || [];

  const getObjectLabel = (obj: any, index: number) => {
    if (obj.type === 'i-text') {
      const text = obj.text?.substring(0, 15) || 'Text';
      return text.length === 15 ? text + '...' : text;
    }
    const typeLabels: Record<string, string> = {
      rect: 'Rectangle',
      circle: 'Circle',
      triangle: 'Triangle',
      polygon: 'Polygon',
      line: 'Line',
      image: 'Image',
      group: 'Group',
    };
    return typeLabels[obj.type] || `Object ${index + 1}`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Layers ({objects.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-48">
          <div className="p-2 space-y-1">
            {objects.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No objects on canvas
              </p>
            ) : (
              [...objects].reverse().map((obj: any, index: number) => {
                const isSelected = selectedObject === obj;
                const isVisible = obj.visible !== false;
                const isLocked = obj.lockMovementX === true;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-1 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-primary/20 border border-primary/30' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => onSelectObject(obj)}
                  >
                    <span className={`flex-1 truncate ${!isVisible ? 'opacity-50' : ''}`}>
                      {getObjectLabel(obj, objects.length - 1 - index)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(obj);
                      }}
                    >
                      {isVisible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLock(obj);
                      }}
                    >
                      {isLocked ? (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteObject(obj);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
