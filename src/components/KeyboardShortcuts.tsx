import { useEffect, useState } from "react";
import { Command } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const shortcuts = [
  { keys: ["Ctrl", "Z"], description: "Undo last action", category: "History" },
  { keys: ["Ctrl", "Y"], description: "Redo action", category: "History" },
  { keys: ["Ctrl", "Shift", "Z"], description: "Redo action (alt)", category: "History" },
  { keys: ["Ctrl", "S"], description: "Save certificate", category: "File" },
  { keys: ["Ctrl", "C"], description: "Copy selected object", category: "Edit" },
  { keys: ["Ctrl", "V"], description: "Paste object", category: "Edit" },
  { keys: ["Ctrl", "D"], description: "Duplicate object", category: "Edit" },
  { keys: ["Delete"], description: "Delete selected object", category: "Edit" },
  { keys: ["Ctrl", "G"], description: "Group selected objects", category: "Arrange" },
  { keys: ["Ctrl", "Shift", "G"], description: "Ungroup objects", category: "Arrange" },
  { keys: ["Esc"], description: "Deselect all", category: "Selection" },
  { keys: ["?"], description: "Show this help dialog", category: "Help" },
];

export const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Command className="h-6 w-6" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to work faster and more efficiently
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {Object.entries(
            shortcuts.reduce((acc, shortcut) => {
              if (!acc[shortcut.category]) acc[shortcut.category] = [];
              acc[shortcut.category].push(shortcut);
              return acc;
            }, {} as Record<string, typeof shortcuts>)
          ).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded min-w-[28px] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Press <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">?</kbd> anytime to view shortcuts
        </p>
      </DialogContent>
    </Dialog>
  );
};
