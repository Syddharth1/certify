import { Eye, EyeOff, Lock, Unlock, Trash2, Layers, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LayersPanelEnhancedProps {
  fabricCanvas: any;
  selectedObject: any;
  onSelectObject: (obj: any) => void;
  onToggleVisibility: (obj: any) => void;
  onToggleLock: (obj: any) => void;
  onDeleteObject: (obj: any) => void;
}

const getObjectName = (obj: any, index: number) => {
  if (obj.type === 'i-text') {
    const text = obj.text?.substring(0, 20) || 'Text';
    return text.length >= 20 ? `${text}...` : text;
  }
  const typeNames: Record<string, string> = {
    rect: 'Rectangle',
    circle: 'Circle',
    triangle: 'Triangle',
    polygon: 'Polygon',
    line: 'Line',
    image: 'Image',
    group: 'Group',
  };
  return typeNames[obj.type] || `Object ${index + 1}`;
};

const getObjectIcon = (type: string) => {
  const icons: Record<string, string> = {
    'i-text': '📝',
    rect: '⬜',
    circle: '⭕',
    triangle: '🔺',
    polygon: '⬡',
    line: '➖',
    image: '🖼️',
    group: '📦',
  };
  return icons[type] || '📦';
};

export const LayersPanelEnhanced = ({
  fabricCanvas,
  selectedObject,
  onSelectObject,
  onToggleVisibility,
  onToggleLock,
  onDeleteObject,
}: LayersPanelEnhancedProps) => {
  const objects = fabricCanvas?.getObjects?.() || [];
  const reversedObjects = [...objects].reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Layers</h3>
        <span className="text-xs bg-muted px-2 py-1 rounded">
          {objects.length} {objects.length === 1 ? 'object' : 'objects'}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          {objects.length === 0 ? (
            <div className="py-12 text-center">
              <Layers className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-sm text-muted-foreground">
                No objects on canvas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add shapes or text to get started
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="divide-y divide-border">
                {reversedObjects.map((obj: any, index: number) => {
                  const isSelected = selectedObject === obj;
                  const isLocked = obj.lockMovementX;
                  const isHidden = obj.visible === false;
                  const realIndex = objects.length - 1 - index;

                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 p-3 cursor-pointer transition-colors group",
                        isSelected ? "bg-primary/10" : "hover:bg-muted/50",
                        isHidden && "opacity-50"
                      )}
                      onClick={() => onSelectObject(obj)}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <span className="text-lg">{getObjectIcon(obj.type)}</span>
                      
                      <span className={cn(
                        "flex-1 text-sm truncate",
                        isSelected && "font-medium"
                      )}>
                        {getObjectName(obj, realIndex)}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(obj);
                          }}
                          title={isHidden ? "Show" : "Hide"}
                        >
                          {isHidden ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLock(obj);
                          }}
                          title={isLocked ? "Unlock" : "Lock"}
                        >
                          {isLocked ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteObject(obj);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Objects at the top are in front. Click to select, use the visibility and lock icons to control layers.
        </p>
      </div>
    </div>
  );
};
