import { 
  Undo, 
  Redo,
  Lock,
  Unlock,
  MoveUp,
  MoveDown,
  Send,
  BringToFront,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Clipboard,
  Group,
  Ungroup,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Save,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SendCertificateDialog } from "@/components/SendCertificateDialog";
import AIAssistantDialog from "@/components/AIAssistantDialog";
import { TemplateQuickSwitch } from "./TemplateQuickSwitch";

interface EditorToolbarProps {
  fabricCanvas: any;
  selectedObject: any;
  historyIndex: number;
  canvasHistoryLength: number;
  isPreviewMode: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
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

export const EditorToolbar = ({
  fabricCanvas,
  selectedObject,
  historyIndex,
  canvasHistoryLength,
  isPreviewMode,
  canvasRef,
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
}: EditorToolbarProps) => {
  const activeSelection = fabricCanvas?.getActiveObjects?.()?.length > 1;

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" data-tour="tools">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRedo}
            disabled={historyIndex >= canvasHistoryLength - 1}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <TemplateQuickSwitch fabricCanvas={fabricCanvas} />
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCopy}
            disabled={!selectedObject}
            title="Copy (Ctrl+C)"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPaste}
            title="Paste (Ctrl+V)"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDuplicate}
            disabled={!selectedObject}
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="h-4 w-4" />
            <span className="ml-1 text-xs">D</span>
          </Button>

          {selectedObject && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onToggleLock}
                title={selectedObject.lockMovementX ? "Unlock" : "Lock"}
              >
                {selectedObject.lockMovementX ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" title="Layer Order">
                    <BringToFront className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onBringToFront}>
                    <BringToFront className="h-4 w-4 mr-2" />
                    Bring to Front
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onBringForward}>
                    <MoveUp className="h-4 w-4 mr-2" />
                    Bring Forward
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSendBackward}>
                    <MoveDown className="h-4 w-4 mr-2" />
                    Send Backward
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSendToBack}>
                    <Send className="h-4 w-4 mr-2" />
                    Send to Back
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" title="Align">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onAlignLeft}>
                    <AlignLeft className="h-4 w-4 mr-2" />
                    Align Left
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAlignCenter}>
                    <AlignCenter className="h-4 w-4 mr-2" />
                    Align Center
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAlignRight}>
                    <AlignRight className="h-4 w-4 mr-2" />
                    Align Right
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onAlignTop}>
                    <AlignVerticalJustifyStart className="h-4 w-4 mr-2" />
                    Align Top
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAlignMiddle}>
                    <AlignVerticalJustifyCenter className="h-4 w-4 mr-2" />
                    Align Middle
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onAlignBottom}>
                    <AlignVerticalJustifyEnd className="h-4 w-4 mr-2" />
                    Align Bottom
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {activeSelection && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onGroup}
                  title="Group (Ctrl+G)"
                >
                  <Group className="h-4 w-4" />
                </Button>
              )}
              
              {selectedObject?.type === 'group' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onUngroup}
                  title="Ungroup (Ctrl+Shift+G)"
                >
                  <Ungroup className="h-4 w-4" />
                </Button>
              )}

              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onDelete}
                title="Delete (Del)"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onTogglePreview}
            title={isPreviewMode ? "Exit Preview" : "Preview Mode"}
          >
            {isPreviewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </Button>
          <AIAssistantDialog onSuggestion={onAISuggestion} />
          <SendCertificateDialog
            canvasRef={canvasRef} 
            fabricCanvas={fabricCanvas}
            certificateId={generateCertificateId()}
          />
          <Button variant="outline" size="sm" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="btn-hero">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
  );
};
