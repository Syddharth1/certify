import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Copy,
  Clipboard,
  Trash2,
  Lock,
  Unlock,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Layers,
  Ungroup,
} from "lucide-react";

interface EditorContextMenuProps {
  children: React.ReactNode;
  selectedObject: any;
  clipboard: any;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onBringToFront: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onGroup: () => void;
  onUngroup: () => void;
}

export const EditorContextMenu = ({
  children,
  selectedObject,
  clipboard,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onToggleLock,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onGroup,
  onUngroup,
}: EditorContextMenuProps) => {
  const isLocked = selectedObject?.lockMovementX;
  const isGroup = selectedObject?.type === 'group';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {selectedObject ? (
          <>
            <ContextMenuItem onClick={onCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
              <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={onDuplicate}>
              <Layers className="mr-2 h-4 w-4" />
              Duplicate
              <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
            </ContextMenuItem>
            {clipboard && (
              <ContextMenuItem onClick={onPaste}>
                <Clipboard className="mr-2 h-4 w-4" />
                Paste
                <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onBringToFront}>
              <ArrowUpToLine className="mr-2 h-4 w-4" />
              Bring to Front
            </ContextMenuItem>
            <ContextMenuItem onClick={onBringForward}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Bring Forward
            </ContextMenuItem>
            <ContextMenuItem onClick={onSendBackward}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Send Backward
            </ContextMenuItem>
            <ContextMenuItem onClick={onSendToBack}>
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Send to Back
            </ContextMenuItem>
            <ContextMenuSeparator />
            {isGroup ? (
              <ContextMenuItem onClick={onUngroup}>
                <Ungroup className="mr-2 h-4 w-4" />
                Ungroup
                <ContextMenuShortcut>Ctrl+Shift+G</ContextMenuShortcut>
              </ContextMenuItem>
            ) : (
              <ContextMenuItem onClick={onGroup}>
                <Layers className="mr-2 h-4 w-4" />
                Group Selected
                <ContextMenuShortcut>Ctrl+G</ContextMenuShortcut>
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={onToggleLock}>
              {isLocked ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock
                </>
              )}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
              <ContextMenuShortcut>Del</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        ) : (
          <>
            {clipboard && (
              <ContextMenuItem onClick={onPaste}>
                <Clipboard className="mr-2 h-4 w-4" />
                Paste
                <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
              </ContextMenuItem>
            )}
            {!clipboard && (
              <ContextMenuItem disabled>
                <span className="text-muted-foreground">No object selected</span>
              </ContextMenuItem>
            )}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
