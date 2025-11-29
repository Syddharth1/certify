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
  { keys: ["Ctrl", "Z"], description: "Undo last action" },
  { keys: ["Ctrl", "Y"], description: "Redo action" },
  { keys: ["Ctrl", "S"], description: "Save certificate" },
  { keys: ["Delete"], description: "Delete selected object" },
  { keys: ["Ctrl", "C"], description: "Copy selected object" },
  { keys: ["Ctrl", "V"], description: "Paste object" },
  { keys: ["Ctrl", "A"], description: "Select all objects" },
  { keys: ["?"], description: "Show this help dialog" },
  { keys: ["Esc"], description: "Deselect all" },
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
        <div className="grid gap-3 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded"
                  >
                    {key}
                  </kbd>
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
