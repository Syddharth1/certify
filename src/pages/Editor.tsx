import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Canvas as FabricCanvas, Circle, Rect, IText, util, Image as FabricImage, Triangle, Line, Polygon, loadSVGFromString, Group, ActiveSelection, Shadow } from "fabric";
import { 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Upload,
  QrCode,
  Triangle as TriangleIcon,
  Minus,
  Pentagon,
  Star,
  Hexagon,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import QRCodeGenerator from "qrcode";
import { ElementManager } from "@/components/ElementManager";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductTour } from "@/components/ProductTour";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { SkipToContent } from "@/components/SkipToContent";
import { 
  EditorToolbar, 
  PositionControls, 
  LayersPanel, 
  TextControls, 
  ShapeControls 
} from "@/components/editor";

const Editor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const [activeTool, setActiveTool] = useState<"select" | "text" | "rectangle" | "circle" | "triangle" | "line" | "star" | "pentagon" | "hexagon" | "image">("select");
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [certificateId, setCertificateId] = useState<string>("");
  const [certificateTitle, setCertificateTitle] = useState("Certificate of Achievement");
  const [message, setMessage] = useState("This certifies that the above named person has successfully completed the requirements.");
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [canvasBackground, setCanvasBackground] = useState("#ffffff");
  const [clipboard, setClipboard] = useState<any>(null);
  const [, forceUpdate] = useState({});

  const handleAISuggestion = (text: string, type: 'title' | 'message') => {
    if (type === 'title') {
      setCertificateTitle(text);
    } else if (type === 'message') {
      setMessage(text);
    }
  };

  const saveToHistory = useCallback(() => {
    if (!fabricCanvas) return;
    
    const canvasJson = JSON.stringify(fabricCanvas.toJSON());
    setCanvasHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(canvasJson);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [fabricCanvas, historyIndex]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: canvasBackground,
      preserveObjectStacking: true,
    });

    canvas.on("selection:created", (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on("selection:updated", (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on("selection:cleared", () => setSelectedObject(null));
    canvas.on('object:modified', () => forceUpdate({}));

    setFabricCanvas(canvas);
    
    const templateData = location.state?.templateData;
    if (templateData) {
      canvas.loadFromJSON(templateData, () => {
        canvas.renderAll();
        toast.success("Template loaded successfully!");
      });
    } else {
      toast("Blank canvas ready! Start creating your design.");
    }

    return () => { canvas.dispose(); };
  }, [location.state]);

  // Save history on object changes
  useEffect(() => {
    if (!fabricCanvas) return;
    const save = () => saveToHistory();
    fabricCanvas.on('object:added', save);
    fabricCanvas.on('object:removed', save);
    fabricCanvas.on('object:modified', save);
    return () => {
      fabricCanvas.off('object:added', save);
      fabricCanvas.off('object:removed', save);
      fabricCanvas.off('object:modified', save);
    };
  }, [fabricCanvas, saveToHistory]);

  // Auto-save
  useEffect(() => {
    if (!fabricCanvas) return;
    const interval = setInterval(() => {
      const objects = fabricCanvas.getObjects();
      if (objects.length > 0) {
        try {
          localStorage.setItem('savedCertificate', JSON.stringify(fabricCanvas.toJSON()));
        } catch (error) {
          console.error("Auto-save error:", error);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fabricCanvas]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        handleGroup();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'g' && e.shiftKey) {
        e.preventDefault();
        handleUngroup();
      } else if (e.key === 'Delete' && selectedObject) {
        e.preventDefault();
        handleDeleteSelected();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        fabricCanvas?.discardActiveObject();
        fabricCanvas?.renderAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, selectedObject, historyIndex, canvasHistory, clipboard]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);
    if (!fabricCanvas) return;

    const shapes: Record<string, () => any> = {
      rectangle: () => new Rect({ left: 100, top: 100, fill: activeColor, width: 150, height: 100 }),
      circle: () => new Circle({ left: 100, top: 100, fill: activeColor, radius: 75 }),
      triangle: () => new Triangle({ left: 100, top: 100, fill: activeColor, width: 100, height: 100 }),
      line: () => new Line([50, 100, 200, 100], { left: 100, top: 100, stroke: activeColor, strokeWidth: 3 }),
      star: () => createStar(100, 100, 5, 50, 25, activeColor),
      pentagon: () => createPolygon(100, 100, 50, 5, activeColor),
      hexagon: () => createPolygon(100, 100, 50, 6, activeColor),
      text: () => new IText("Your text here", { left: 100, top: 100, fontSize: 24, fill: activeColor, fontFamily: "Inter" }),
    };

    const createShape = shapes[tool];
    if (createShape) {
      const shape = createShape();
      fabricCanvas.add(shape);
      fabricCanvas.setActiveObject(shape);
      fabricCanvas.renderAll();
    }
  };

  const createStar = (centerX: number, centerY: number, points: number, outerRadius: number, innerRadius: number, color: string) => {
    const angle = Math.PI / points;
    const starPoints = [];
    for (let i = 0; i < 2 * points; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      starPoints.push({ x: centerX + Math.cos(i * angle) * radius, y: centerY + Math.sin(i * angle) * radius });
    }
    return new Polygon(starPoints, { left: centerX, top: centerY, fill: color, originX: 'center', originY: 'center' });
  };

  const createPolygon = (centerX: number, centerY: number, radius: number, sides: number, color: string) => {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      points.push({ x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius });
    }
    return new Polygon(points, { left: centerX, top: centerY, fill: color, originX: 'center', originY: 'center' });
  };

  const generateCertificateId = () => {
    if (!certificateId) {
      const newId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      setCertificateId(newId);
      return newId;
    }
    return certificateId;
  };

  const handleAddQRCode = async () => {
    if (!fabricCanvas) return;
    try {
      const certId = generateCertificateId();
      const verificationUrl = `https://certify-cert.vercel.app/certificate/${certId}`;
      const qrCodeUrl = await QRCodeGenerator.toDataURL(verificationUrl, { width: 300, margin: 1, color: { dark: '#000000', light: '#ffffff' } });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      
      qrImage.onload = async () => {
        canvas.width = qrImage.width;
        canvas.height = qrImage.height;
        ctx.drawImage(qrImage, 0, 0);
        
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        
        logo.onload = () => {
          const logoSize = canvas.width * 0.2;
          const logoX = (canvas.width - logoSize) / 2;
          const logoY = (canvas.height - logoSize) / 2;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, logoSize * 0.6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          
          const finalDataUrl = canvas.toDataURL();
          util.loadImage(finalDataUrl, { crossOrigin: 'anonymous' }).then((img) => {
            const qrCode = new FabricImage(img, { left: 650, top: 450, scaleX: 0.4, scaleY: 0.4 });
            fabricCanvas.add(qrCode);
            fabricCanvas.renderAll();
            toast.success("QR code with logo added!");
          });
        };
        
        logo.onerror = () => {
          util.loadImage(qrCodeUrl, { crossOrigin: 'anonymous' }).then((img) => {
            const qrCode = new FabricImage(img, { left: 650, top: 450, scaleX: 0.4, scaleY: 0.4 });
            fabricCanvas.add(qrCode);
            fabricCanvas.renderAll();
            toast.success("QR code added!");
          });
        };
        
        logo.src = '/logo.png';
      };
      
      qrImage.src = qrCodeUrl;
    } catch (error) {
      console.error("QR code generation error:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleAddCertificateId = () => {
    if (!fabricCanvas) return;
    const certId = generateCertificateId();
    const text = new IText(`Certificate ID: ${certId}`, {
      left: 50, top: 550, fontSize: 12, fill: "#666666", fontFamily: "Inter", fontWeight: "normal", editable: false, selectable: true,
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    toast("Certificate ID added!");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      util.loadImage(imageUrl).then((img) => {
        const fabricImage = new FabricImage(img, { left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
        fabricCanvas.add(fabricImage);
        fabricCanvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    toast("Image uploaded!");
  };

  const handleExport = (format: 'png' | 'jpeg' | 'svg') => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast.error("Canvas is empty");
      return;
    }
    
    try {
      if (format === 'svg') {
        const svg = fabricCanvas.toSVG();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "certificate.svg";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const dataURL = fabricCanvas.toDataURL({
          format,
          quality: format === 'jpeg' ? 0.9 : 1,
          multiplier: 2,
          enableRetinaScaling: false,
        });
        const link = document.createElement("a");
        link.download = `certificate.${format}`;
        link.href = dataURL;
        link.click();
      }
      toast.success(`Exported as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export");
    }
  };

  const handleSave = async () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast.error("Canvas is empty");
      return;
    }
    try {
      localStorage.setItem('savedCertificate', JSON.stringify(fabricCanvas.toJSON()));
      toast.success("Certificate saved!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0 && fabricCanvas) {
      const newIndex = historyIndex - 1;
      fabricCanvas.loadFromJSON(canvasHistory[newIndex]).then(() => {
        setHistoryIndex(newIndex);
        fabricCanvas.renderAll();
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < canvasHistory.length - 1 && fabricCanvas) {
      const newIndex = historyIndex + 1;
      fabricCanvas.loadFromJSON(canvasHistory[newIndex]).then(() => {
        setHistoryIndex(newIndex);
        fabricCanvas.renderAll();
      });
    }
  };

  const handleDeleteSelected = () => {
    if (!fabricCanvas || !selectedObject) return;
    fabricCanvas.remove(selectedObject);
    setSelectedObject(null);
    fabricCanvas.renderAll();
    toast("Object deleted");
  };

  const handleCopy = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.clone().then((cloned: any) => {
      setClipboard(cloned);
      toast("Copied to clipboard");
    });
  };

  const handlePaste = () => {
    if (!fabricCanvas || !clipboard) return;
    clipboard.clone().then((cloned: any) => {
      cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
      toast("Pasted");
    });
  };

  const handleDuplicate = () => {
    if (!fabricCanvas || !selectedObject) return;
    selectedObject.clone().then((cloned: any) => {
      cloned.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
      toast("Duplicated");
    });
  };

  const handleGroup = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length < 2) return;
    
    fabricCanvas.discardActiveObject();
    const group = new Group(activeObjects);
    activeObjects.forEach(obj => fabricCanvas.remove(obj));
    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.renderAll();
    toast("Objects grouped");
  };

  const handleUngroup = () => {
    if (!fabricCanvas || !selectedObject || selectedObject.type !== 'group') return;
    const items = selectedObject.getObjects();
    fabricCanvas.remove(selectedObject);
    items.forEach((item: any) => {
      fabricCanvas.add(item);
    });
    fabricCanvas.renderAll();
    toast("Objects ungrouped");
  };

  const toggleLock = () => {
    if (!selectedObject || !fabricCanvas) return;
    const isLocked = selectedObject.lockMovementX;
    selectedObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockRotation: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      selectable: isLocked,
      evented: isLocked
    });
    fabricCanvas.renderAll();
    toast(isLocked ? "Unlocked" : "Locked");
  };

  const handleAlign = (alignment: string) => {
    if (!fabricCanvas || !selectedObject) return;
    const canvasWidth = fabricCanvas.width || 800;
    const canvasHeight = fabricCanvas.height || 600;
    const objWidth = (selectedObject.width || 0) * (selectedObject.scaleX || 1);
    const objHeight = (selectedObject.height || 0) * (selectedObject.scaleY || 1);

    const alignments: Record<string, () => void> = {
      left: () => selectedObject.set({ left: 0 }),
      center: () => selectedObject.set({ left: (canvasWidth - objWidth) / 2 }),
      right: () => selectedObject.set({ left: canvasWidth - objWidth }),
      top: () => selectedObject.set({ top: 0 }),
      middle: () => selectedObject.set({ top: (canvasHeight - objHeight) / 2 }),
      bottom: () => selectedObject.set({ top: canvasHeight - objHeight }),
    };

    alignments[alignment]?.();
    fabricCanvas.renderAll();
    toast(`Aligned ${alignment}`);
  };

  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject || !fabricCanvas) return;
    if (property === 'shadow' && value) {
      selectedObject.set('shadow', new Shadow(value));
    } else {
      selectedObject.set(property, value);
    }
    fabricCanvas.renderAll();
    forceUpdate({});
  };

  const toggleTextStyle = (style: 'fontWeight' | 'fontStyle' | 'underline') => {
    if (!selectedObject || selectedObject.type !== "i-text" || !fabricCanvas) return;
    const styles: Record<string, () => void> = {
      fontWeight: () => selectedObject.set('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold'),
      fontStyle: () => selectedObject.set('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic'),
      underline: () => selectedObject.set('underline', !selectedObject.underline),
    };
    styles[style]?.();
    fabricCanvas.renderAll();
  };

  const handleAddElement = (imageUrl: string, title: string) => {
    if (!fabricCanvas) return;
    util.loadImage(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
      const fabricImage = new FabricImage(img, { left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
      fabricCanvas.add(fabricImage);
      fabricCanvas.renderAll();
      toast(`${title} added!`);
    }).catch(() => toast.error("Failed to load element"));
  };

  const handleSelectObject = (obj: any) => {
    if (!fabricCanvas) return;
    fabricCanvas.setActiveObject(obj);
    fabricCanvas.renderAll();
    setSelectedObject(obj);
  };

  const handleToggleVisibility = (obj: any) => {
    if (!fabricCanvas) return;
    obj.set('visible', obj.visible === false ? true : false);
    fabricCanvas.renderAll();
    forceUpdate({});
  };

  const handleToggleObjectLock = (obj: any) => {
    if (!fabricCanvas) return;
    const isLocked = obj.lockMovementX;
    obj.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockRotation: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
    });
    fabricCanvas.renderAll();
    forceUpdate({});
  };

  const handleDeleteObject = (obj: any) => {
    if (!fabricCanvas) return;
    fabricCanvas.remove(obj);
    if (selectedObject === obj) setSelectedObject(null);
    fabricCanvas.renderAll();
    forceUpdate({});
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!fabricCanvas) return;
    let newZoom = canvasZoom;
    if (direction === 'in') newZoom = Math.min(canvasZoom + 0.1, 3);
    else if (direction === 'out') newZoom = Math.max(canvasZoom - 0.1, 0.5);
    else newZoom = 1;
    setCanvasZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const changeCanvasSize = (width: number, height: number) => {
    if (!fabricCanvas) return;
    fabricCanvas.setDimensions({ width, height });
    fabricCanvas.renderAll();
    toast.success(`Canvas: ${width}x${height}`);
  };

  const handleCanvasBackgroundChange = (color: string) => {
    if (!fabricCanvas) return;
    setCanvasBackground(color);
    fabricCanvas.backgroundColor = color;
    fabricCanvas.renderAll();
  };

  return (
    <>
      <SkipToContent />
      <ProductTour tourKey="editor" />
      <KeyboardShortcuts />
      <div className="min-h-screen bg-gradient-subtle">
        <div className="flex h-screen">
          {!isPreviewMode && (
            <div className="w-80 bg-card border-r border-border overflow-y-auto">
              <div className="p-6">
                <Breadcrumb />
                <h2 className="text-xl font-display font-bold mb-4">Certificate Editor</h2>
                
                <Tabs defaultValue="tools" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5 text-xs">
                    <TabsTrigger value="tools">Tools</TabsTrigger>
                    <TabsTrigger value="shapes">Shapes</TabsTrigger>
                    <TabsTrigger value="props">Props</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="canvas">Canvas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tools" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Basic Tools</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant={activeTool === "text" ? "default" : "outline"} size="sm" onClick={() => handleToolClick("text")} className="flex items-center gap-2">
                            <Type className="h-4 w-4" /> Text
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleAddQRCode} className="flex items-center gap-2">
                            <QrCode className="h-4 w-4" /> QR Code
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleAddCertificateId} className="flex items-center gap-2 col-span-2">
                            <Hash className="h-4 w-4" /> Certificate ID
                          </Button>
                        </div>
                        <div>
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <Button variant="outline" size="sm" className="w-full" asChild>
                              <span><Upload className="h-4 w-4 mr-2" /> Upload Image</span>
                            </Button>
                          </Label>
                          <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Active Color</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Input type="color" value={activeColor} onChange={(e) => setActiveColor(e.target.value)} className="w-12 h-10 p-1" />
                          <Input type="text" value={activeColor} onChange={(e) => setActiveColor(e.target.value)} className="flex-1" />
                        </div>
                      </CardContent>
                    </Card>

                    <LayersPanel
                      fabricCanvas={fabricCanvas}
                      selectedObject={selectedObject}
                      onSelectObject={handleSelectObject}
                      onToggleVisibility={handleToggleVisibility}
                      onToggleLock={handleToggleObjectLock}
                      onDeleteObject={handleDeleteObject}
                    />
                  </TabsContent>

                  <TabsContent value="shapes" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Basic Shapes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { tool: "rectangle", Icon: Square, label: "Rectangle" },
                            { tool: "circle", Icon: CircleIcon, label: "Circle" },
                            { tool: "triangle", Icon: TriangleIcon, label: "Triangle" },
                            { tool: "line", Icon: Minus, label: "Line" },
                            { tool: "pentagon", Icon: Pentagon, label: "Pentagon" },
                            { tool: "hexagon", Icon: Hexagon, label: "Hexagon" },
                          ].map(({ tool, Icon, label }) => (
                            <Button key={tool} variant={activeTool === tool ? "default" : "outline"} size="sm" onClick={() => handleToolClick(tool as any)} className="flex items-center gap-2">
                              <Icon className="h-4 w-4" /> {label}
                            </Button>
                          ))}
                          <Button variant={activeTool === "star" ? "default" : "outline"} size="sm" onClick={() => handleToolClick("star")} className="flex items-center gap-2 col-span-2">
                            <Star className="h-4 w-4" /> Star
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="props" className="space-y-4">
                    {selectedObject && <PositionControls selectedObject={selectedObject} onUpdateProperty={updateObjectProperty} />}
                    <TextControls selectedObject={selectedObject} onUpdateProperty={updateObjectProperty} onToggleStyle={toggleTextStyle} />
                    <ShapeControls selectedObject={selectedObject} onUpdateProperty={updateObjectProperty} />
                    {!selectedObject && (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground text-sm">
                          Select an object to edit its properties
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="design" className="space-y-4">
                    <ElementManager onAddElement={handleAddElement} />
                  </TabsContent>

                  <TabsContent value="canvas" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Canvas Size</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "A4", sub: "Portrait", w: 2480, h: 3508 },
                            { label: "Letter", sub: "8.5x11", w: 2550, h: 3300 },
                            { label: "Instagram", sub: "Square", w: 1080, h: 1080 },
                            { label: "Facebook", sub: "Cover", w: 1200, h: 630 },
                          ].map(({ label, sub, w, h }) => (
                            <Button key={label} variant="outline" size="sm" onClick={() => changeCanvasSize(w, h)}>
                              {label} <span className="text-xs text-muted-foreground ml-1">({sub})</span>
                            </Button>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => changeCanvasSize(800, 600)} className="col-span-2">
                            Default (800x600)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Background</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input type="color" value={canvasBackground} onChange={(e) => handleCanvasBackgroundChange(e.target.value)} className="w-12 h-10 p-1" />
                          <Input type="text" value={canvasBackground} onChange={(e) => handleCanvasBackgroundChange(e.target.value)} className="flex-1" />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {["#ffffff", "#f8f9fa", "#fff9e6", "#e8f4f8"].map((color) => (
                            <Button key={color} variant="outline" size="sm" onClick={() => handleCanvasBackgroundChange(color)} className="h-8 w-full border-2" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Zoom ({Math.round(canvasZoom * 100)}%)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>-</Button>
                          <div className="flex-1 text-center text-sm">{Math.round(canvasZoom * 100)}%</div>
                          <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>+</Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleZoom('reset')} className="w-full">Reset Zoom</Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col">
            <EditorToolbar
              fabricCanvas={fabricCanvas}
              selectedObject={selectedObject}
              historyIndex={historyIndex}
              canvasHistoryLength={canvasHistory.length}
              isPreviewMode={isPreviewMode}
              canvasRef={canvasRef}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onToggleLock={toggleLock}
              onBringToFront={() => { fabricCanvas?.bringObjectToFront(selectedObject); fabricCanvas?.renderAll(); }}
              onBringForward={() => { fabricCanvas?.bringObjectForward(selectedObject); fabricCanvas?.renderAll(); }}
              onSendBackward={() => { fabricCanvas?.sendObjectBackwards(selectedObject); fabricCanvas?.renderAll(); }}
              onSendToBack={() => { fabricCanvas?.sendObjectToBack(selectedObject); fabricCanvas?.renderAll(); }}
              onDelete={handleDeleteSelected}
              onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
              onCopy={handleCopy}
              onPaste={handlePaste}
              onDuplicate={handleDuplicate}
              onGroup={handleGroup}
              onUngroup={handleUngroup}
              onAlignLeft={() => handleAlign('left')}
              onAlignCenter={() => handleAlign('center')}
              onAlignRight={() => handleAlign('right')}
              onAlignTop={() => handleAlign('top')}
              onAlignMiddle={() => handleAlign('middle')}
              onAlignBottom={() => handleAlign('bottom')}
              onSave={handleSave}
              onExport={handleExport}
              onAISuggestion={handleAISuggestion}
              generateCertificateId={generateCertificateId}
            />

            <div className="flex-1 p-8 overflow-auto bg-muted/20">
              <div className="flex items-center justify-center min-h-full">
                <div className="bg-white rounded-lg shadow-strong">
                  <canvas ref={canvasRef} className="max-w-full max-h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Editor;
