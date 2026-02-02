import { 
  Undo, 
  Redo,
  Lock,
  Unlock,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Clipboard,
  Save,
  Download,
  MoreHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Group,
  Ungroup,
  BringToFront,
  SendToBack,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SendCertificateDialog } from "@/components/SendCertificateDialog";
import AIAssistantDialog from "@/components/AIAssistantDialog";
import { TemplateQuickSwitch } from "./TemplateQuickSwitch";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface EditorToolbarStreamlinedProps {
  fabricCanvas: any;
  selectedObject: any;
  historyIndex: number;
  canvasHistoryLength: number;
  isPreviewMode: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  clipboard: any;
  onUndo: () => void;
  onRedo: () => void;
  onToggleLock: () => void;
  onBringToFront: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onDelete: () => void;
  onTogglePreview: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onAlignTop: () => void;
  onAlignMiddle: () => void;
  onAlignBottom: () => void;
  onSave: () => void;
  onExport: (format: 'png' | 'jpeg' | 'svg') => void;
  onAISuggestion: (text: string, type: 'title' | 'message') => void;
  generateCertificateId: () => string;
}

export const EditorToolbarStreamlined = ({
  fabricCanvas,
  selectedObject,
  historyIndex,
  canvasHistoryLength,
  isPreviewMode,
  canvasRef,
  clipboard,
  onUndo,
  onRedo,
  onToggleLock,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onDelete,
  onTogglePreview,
  onCopy,
  onPaste,
  onDuplicate,
  onGroup,
  onUngroup,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onSave,
  onExport,
  onAISuggestion,
  generateCertificateId,
}: EditorToolbarStreamlinedProps) => {
  const activeSelection = fabricCanvas?.getActiveObjects?.()?.length > 1;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < canvasHistoryLength - 1;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="bg-card border-b border-border px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Section: History & Edit */}
          <div className="flex items-center gap-1">
            {/* Undo/Redo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onUndo} disabled={!canUndo}>
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRedo} disabled={!canRedo}>
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* Template Switch */}
            <TemplateQuickSwitch fabricCanvas={fabricCanvas} />

            <Separator orientation="vertical" className="h-6 mx-2" />

            {/* Copy/Paste */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy} disabled={!selectedObject}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy (Ctrl+C)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPaste} disabled={!clipboard}>
                  <Clipboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Paste (Ctrl+V)</TooltipContent>
            </Tooltip>

            {/* Selection-specific controls */}
            {selectedObject && (
              <>
                <Separator orientation="vertical" className="h-6 mx-2" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleLock}>
                      {selectedObject.lockMovementX ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{selectedObject.lockMovementX ? "Unlock" : "Lock"}</TooltipContent>
                </Tooltip>

                {/* More Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={onDuplicate}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                      <span className="ml-auto text-xs text-muted-foreground">Ctrl+D</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <BringToFront className="h-4 w-4 mr-2" />
                        Layer Order
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={onBringToFront}>Bring to Front</DropdownMenuItem>
                        <DropdownMenuItem onClick={onBringForward}>Bring Forward</DropdownMenuItem>
                        <DropdownMenuItem onClick={onSendBackward}>Send Backward</DropdownMenuItem>
                        <DropdownMenuItem onClick={onSendToBack}>Send to Back</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <AlignCenter className="h-4 w-4 mr-2" />
                        Align
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={onAlignLeft}>
                          <AlignLeft className="h-4 w-4 mr-2" /> Align Left
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onAlignCenter}>
                          <AlignCenter className="h-4 w-4 mr-2" /> Align Center
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onAlignRight}>
                          <AlignRight className="h-4 w-4 mr-2" /> Align Right
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onAlignTop}>
                          <AlignVerticalJustifyStart className="h-4 w-4 mr-2" /> Align Top
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onAlignMiddle}>
                          <AlignVerticalJustifyCenter className="h-4 w-4 mr-2" /> Align Middle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onAlignBottom}>
                          <AlignVerticalJustifyEnd className="h-4 w-4 mr-2" /> Align Bottom
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {activeSelection && (
                      <DropdownMenuItem onClick={onGroup}>
                        <Group className="h-4 w-4 mr-2" />
                        Group
                        <span className="ml-auto text-xs text-muted-foreground">Ctrl+G</span>
                      </DropdownMenuItem>
                    )}
                    
                    {selectedObject?.type === 'group' && (
                      <DropdownMenuItem onClick={onUngroup}>
                        <Ungroup className="h-4 w-4 mr-2" />
                        Ungroup
                        <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+G</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                      <span className="ml-auto text-xs">Del</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onTogglePreview}
              className="h-8"
            >
              {isPreviewMode ? <EyeOff className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
              {isPreviewMode ? "Exit" : "Preview"}
            </Button>

            <AIAssistantDialog onSuggestion={onAISuggestion} />
            
            <SendCertificateDialog
              canvasRef={canvasRef} 
              fabricCanvas={fabricCanvas}
              certificateId={generateCertificateId()}
            />

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save (Ctrl+S)</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-8 btn-hero">
                  <Download className="h-4 w-4 mr-1.5" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport('png')}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('jpeg')}>
                  Export as JPEG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('svg')}>
                  Export as SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
