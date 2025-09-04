import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, IText, util, Image as FabricImage, Triangle, Line, Polygon, loadSVGFromString, Group } from "fabric";
import { 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Image as ImageIcon, 
  Download, 
  Save, 
  Undo, 
  Redo,
  Palette,
  Upload,
  QrCode,
  Triangle as TriangleIcon,
  Minus,
  Pentagon,
  Star,
  Award,
  Crown,
  Zap,
  Heart,
  Hexagon,
  Trash2,
  Bold,
  Italic,
  Underline,
  Lock,
  Unlock,
  MoveUp,
  MoveDown,
  Send,
  BringToFront,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import QRCodeGenerator from "qrcode";
import { ElementManager } from "@/components/ElementManager";
import { SendCertificateDialog } from "@/components/SendCertificateDialog";

const Editor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const [activeTool, setActiveTool] = useState<"select" | "text" | "rectangle" | "circle" | "triangle" | "line" | "star" | "pentagon" | "hexagon" | "image">("select");
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [certificateId, setCertificateId] = useState<string>("");

  const saveToHistory = () => {
    if (!fabricCanvas) return;
    
    const canvasJson = JSON.stringify(fabricCanvas.toJSON());
    setCanvasHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(canvasJson);
      
      // Keep history to reasonable size
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      setHistoryIndex(prev => prev + 1);
      return newHistory;
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });

    // Selection event handler
    canvas.on("selection:created", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    // Add canvas event listeners for history tracking
    canvas.on('object:added', saveToHistory);
    canvas.on('object:removed', saveToHistory);
    canvas.on('object:modified', saveToHistory);

    setFabricCanvas(canvas);
    
    // Save initial state
    setTimeout(() => saveToHistory(), 100);
    
    toast("Blank canvas ready! Start creating your design.");

    return () => {
      canvas.dispose();
    };
  }, []);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 150,
        height: 100,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 75,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === "triangle") {
      const triangle = new Triangle({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(triangle);
      fabricCanvas.setActiveObject(triangle);
    } else if (tool === "line") {
      const line = new Line([50, 100, 200, 100], {
        left: 100,
        top: 100,
        stroke: activeColor,
        strokeWidth: 3,
      });
      fabricCanvas.add(line);
      fabricCanvas.setActiveObject(line);
    } else if (tool === "star") {
      const star = createStar(100, 100, 5, 50, 25, activeColor);
      fabricCanvas.add(star);
      fabricCanvas.setActiveObject(star);
    } else if (tool === "pentagon") {
      const pentagon = createPolygon(100, 100, 50, 5, activeColor);
      fabricCanvas.add(pentagon);
      fabricCanvas.setActiveObject(pentagon);
    } else if (tool === "hexagon") {
      const hexagon = createPolygon(100, 100, 50, 6, activeColor);
      fabricCanvas.add(hexagon);
      fabricCanvas.setActiveObject(hexagon);
    } else if (tool === "text") {
      const text = new IText("Your text here", {
        left: 100,
        top: 100,
        fontSize: 24,
        fill: activeColor,
        fontFamily: "Inter",
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    }

    fabricCanvas.renderAll();
  };

  const createStar = (centerX: number, centerY: number, points: number, outerRadius: number, innerRadius: number, color: string) => {
    const angle = Math.PI / points;
    const starPoints = [];
    
    for (let i = 0; i < 2 * points; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(i * angle) * radius;
      const y = centerY + Math.sin(i * angle) * radius;
      starPoints.push({ x, y });
    }

    return new Polygon(starPoints, {
      left: centerX,
      top: centerY,
      fill: color,
      originX: 'center',
      originY: 'center',
    });
  };

  const createPolygon = (centerX: number, centerY: number, radius: number, sides: number, color: string) => {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      points.push({ x, y });
    }

    return new Polygon(points, {
      left: centerX,
      top: centerY,
      fill: color,
      originX: 'center',
      originY: 'center',
    });
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
      const verificationUrl = `https://7aae85cb-230b-485f-a1f9-16cb028e5038.lovableproject.com/certificate/${certId}`;
      const qrCodeUrl = await QRCodeGenerator.toDataURL(verificationUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      util.loadImage(qrCodeUrl, { crossOrigin: 'anonymous' }).then((img) => {
        const qrCode = new FabricImage(img, {
          left: 650,
          top: 450,
          scaleX: 1,
          scaleY: 1,
        });
        fabricCanvas.add(qrCode);
        fabricCanvas.renderAll();
      }).catch((error) => {
        console.error("Error loading QR code:", error);
        toast.error("Failed to load QR code image");
      });

      toast("QR code added! Recipients can scan to verify the certificate.");
    } catch (error) {
      console.error("QR code generation error:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleAddCertificateId = () => {
    if (!fabricCanvas) return;

    const certId = generateCertificateId();
    const text = new IText(`Certificate ID: ${certId}`, {
      left: 50,
      top: 550,
      fontSize: 12,
      fill: "#666666",
      fontFamily: "Inter",
      fontWeight: "normal",
      editable: false,
      selectable: true,
    });
    
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    toast("Certificate ID added to the certificate! You can move but not edit it.");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      util.loadImage(imageUrl).then((img) => {
        const fabricImage = new FabricImage(img, {
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
        });
        fabricCanvas.add(fabricImage);
        fabricCanvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    toast("Image uploaded successfully!");
  };

  const handleExportPDF = () => {
    if (!fabricCanvas) {
      toast.error("Canvas not ready");
      return;
    }
    
    // Check if canvas has any objects
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast.error("Canvas is empty. Please add some elements before exporting.");
      return;
    }
    
    try {
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
        enableRetinaScaling: false,
      });
      
      // Create download link
      const link = document.createElement("a");
      link.download = "certificate.png";
      link.href = dataURL;
      link.click();
      
      toast.success("Certificate exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export certificate. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!fabricCanvas) {
      toast.error("Canvas not ready");
      return;
    }

    // Check if canvas has any objects
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast.error("Canvas is empty. Please add some elements before saving.");
      return;
    }

    try {
      // Save canvas state to localStorage for now (in a real app, you'd save to database)
      const canvasData = JSON.stringify(fabricCanvas.toJSON());
      localStorage.setItem('savedCertificate', canvasData);
      toast.success("Certificate saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save certificate. Please try again.");
    }
  };

  const addDesignElement = async (type: string) => {
    if (!fabricCanvas) return;

    try {
      let svgString = '';
      
      switch (type) {
        case 'medal':
          svgString = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#d4af37" stroke="#b8860b" stroke-width="3"/>
            <circle cx="50" cy="50" r="25" fill="#f4d03f" stroke="#d4af37" stroke-width="2"/>
            <text x="50" y="55" text-anchor="middle" font-family="serif" font-size="12" fill="#8b4513">★</text>
          </svg>`;
          break;
        case 'ribbon':
          svgString = `<svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10 L110 10 L100 30 L20 30 Z" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>
            <text x="60" y="25" text-anchor="middle" font-family="serif" font-size="10" fill="white">AWARD</text>
          </svg>`;
          break;
        case 'crown':
          svgString = `<svg width="80" height="60" viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 45 L20 20 L30 35 L40 15 L50 35 L60 20 L70 45 Z" fill="#ffd700" stroke="#ffb347" stroke-width="2"/>
            <circle cx="20" cy="20" r="3" fill="#ff6b6b"/>
            <circle cx="40" cy="15" r="4" fill="#ff6b6b"/>
            <circle cx="60" cy="20" r="3" fill="#ff6b6b"/>
          </svg>`;
          break;
        case 'seal':
          svgString = `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="35" fill="#8b0000" stroke="#654321" stroke-width="2"/>
            <circle cx="40" cy="40" r="25" fill="#a0522d"/>
            <text x="40" y="45" text-anchor="middle" font-family="serif" font-size="8" fill="#fff">OFFICIAL</text>
          </svg>`;
          break;
        case 'star-badge':
          svgString = `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 10 L45 30 L65 30 L50 42 L55 62 L40 50 L25 62 L30 42 L15 30 L35 30 Z" fill="#4169e1" stroke="#1e3a8a" stroke-width="2"/>
            <circle cx="40" cy="40" r="12" fill="#60a5fa"/>
          </svg>`;
          break;
        default:
          return;
      }

      // Convert SVG to fabric object
      loadSVGFromString(svgString).then(({ objects }) => {
        const svgObject = new Group(objects, {
          left: 100,
          top: 100,
        });
        fabricCanvas.add(svgObject);
        fabricCanvas.renderAll();
        toast(`${type} added to certificate!`);
      });
    } catch (error) {
      console.error('Error adding design element:', error);
      toast.error('Failed to add design element');
    }
  };


  const handleUndo = () => {
    if (historyIndex > 0 && fabricCanvas) {
      const newIndex = historyIndex - 1;
      const canvasState = canvasHistory[newIndex];
      
      fabricCanvas.loadFromJSON(canvasState).then(() => {
        setHistoryIndex(newIndex);
        fabricCanvas.renderAll();
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < canvasHistory.length - 1 && fabricCanvas) {
      const newIndex = historyIndex + 1;
      const canvasState = canvasHistory[newIndex];
      
      fabricCanvas.loadFromJSON(canvasState).then(() => {
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

  const handleAddElement = (imageUrl: string, title: string) => {
    if (!fabricCanvas) return;

    util.loadImage(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
      const fabricImage = new FabricImage(img, {
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
      });
      fabricCanvas.add(fabricImage);
      fabricCanvas.renderAll();
      toast(`${title} added to certificate!`);
    }).catch((error) => {
      console.error("Error loading image:", error);
      toast.error("Failed to load element image");
    });
  };

  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject || !fabricCanvas) return;

    selectedObject.set(property, value);
    fabricCanvas.renderAll();
  };

  const toggleTextStyle = (style: 'fontWeight' | 'fontStyle' | 'underline') => {
    if (!selectedObject || selectedObject.type !== "i-text" || !fabricCanvas) return;

    if (style === 'fontWeight') {
      const newWeight = selectedObject.fontWeight === 'bold' ? 'normal' : 'bold';
      selectedObject.set('fontWeight', newWeight);
    } else if (style === 'fontStyle') {
      const newStyle = selectedObject.fontStyle === 'italic' ? 'normal' : 'italic';
      selectedObject.set('fontStyle', newStyle);
    } else if (style === 'underline') {
      const newUnderline = !selectedObject.underline;
      selectedObject.set('underline', newUnderline);
    }

    fabricCanvas.renderAll();
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
    toast(isLocked ? "Object unlocked" : "Object locked");
  };

  const bringToFront = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.bringObjectToFront(selectedObject);
    fabricCanvas.renderAll();
    toast("Brought to front");
  };

  const sendToBack = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.sendObjectToBack(selectedObject);
    fabricCanvas.renderAll();
    toast("Sent to back");
  };

  const bringForward = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.bringObjectForward(selectedObject);
    fabricCanvas.renderAll();
    toast("Moved forward");
  };

  const sendBackward = () => {
    if (!selectedObject || !fabricCanvas) return;
    fabricCanvas.sendObjectBackwards(selectedObject);
    fabricCanvas.renderAll();
    toast("Moved backward");
  };
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="flex h-screen">
        <div className="w-80 bg-card border-r border-border overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-display font-bold mb-6">Certificate Editor</h2>
            
            <Tabs defaultValue="tools" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="shapes">Shapes</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
              </TabsList>

              <TabsContent value="tools" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Basic Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                     <div className="grid grid-cols-2 gap-2">
                       <Button
                         variant={activeTool === "text" ? "default" : "outline"}
                         size="sm"
                         onClick={() => handleToolClick("text")}
                         className="flex items-center gap-2"
                       >
                         <Type className="h-4 w-4" />
                         Text
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={handleAddQRCode}
                         className="flex items-center gap-2"
                       >
                         <QrCode className="h-4 w-4" />
                         QR Code
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={handleAddCertificateId}
                         className="flex items-center gap-2 col-span-2"
                       >
                         <Hash className="h-4 w-4" />
                         Certificate ID
                       </Button>
                     </div>
                    
                    <div>
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" className="w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Color</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={activeColor}
                        onChange={(e) => setActiveColor(e.target.value)}
                        className="w-12 h-10 p-1 border rounded"
                      />
                      <Input
                        type="text"
                        value={activeColor}
                        onChange={(e) => setActiveColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shapes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Basic Shapes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={activeTool === "rectangle" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("rectangle")}
                        className="flex items-center gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Rectangle
                      </Button>
                      <Button
                        variant={activeTool === "circle" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("circle")}
                        className="flex items-center gap-2"
                      >
                        <CircleIcon className="h-4 w-4" />
                        Circle
                      </Button>
                      <Button
                        variant={activeTool === "triangle" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("triangle")}
                        className="flex items-center gap-2"
                      >
                        <TriangleIcon className="h-4 w-4" />
                        Triangle
                      </Button>
                      <Button
                        variant={activeTool === "line" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("line")}
                        className="flex items-center gap-2"
                      >
                        <Minus className="h-4 w-4" />
                        Line
                      </Button>
                      <Button
                        variant={activeTool === "pentagon" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("pentagon")}
                        className="flex items-center gap-2"
                      >
                        <Pentagon className="h-4 w-4" />
                        Pentagon
                      </Button>
                      <Button
                        variant={activeTool === "hexagon" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("hexagon")}
                        className="flex items-center gap-2"
                      >
                        <Hexagon className="h-4 w-4" />
                        Hexagon
                      </Button>
                      <Button
                        variant={activeTool === "star" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToolClick("star")}
                        className="flex items-center gap-2 col-span-2"
                      >
                        <Star className="h-4 w-4" />
                        Star
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                {selectedObject && selectedObject.type === "i-text" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Text Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label>Font Size</Label>
                        <Input
                          type="number"
                          value={selectedObject.fontSize || 24}
                          onChange={(e) => updateObjectProperty("fontSize", parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Font Family</Label>
                        <select
                          className="w-full p-2 border border-border rounded"
                          value={selectedObject.fontFamily || "Inter"}
                          onChange={(e) => updateObjectProperty("fontFamily", e.target.value)}
                        >
                          <option value="Inter">Inter</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Source Sans Pro">Source Sans Pro</option>
                          <option value="Merriweather">Merriweather</option>
                          <option value="Oswald">Oswald</option>
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Helvetica">Helvetica</option>
                        </select>
                      </div>
                      <div>
                        <Label>Text Color</Label>
                        <Input
                          type="color"
                          value={selectedObject.fill || "#000000"}
                          onChange={(e) => updateObjectProperty("fill", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label>Text Style</Label>
                        <div className="flex gap-2 mt-1">
                          <Button
                            variant={selectedObject.fontWeight === 'bold' ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTextStyle('fontWeight')}
                            className="flex-1"
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedObject.fontStyle === 'italic' ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTextStyle('fontStyle')}
                            className="flex-1"
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={selectedObject.underline ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTextStyle('underline')}
                            className="flex-1"
                          >
                            <Underline className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="design" className="space-y-4">
                <ElementManager onAddElement={handleAddElement} />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="bg-card border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRedo}
                  disabled={historyIndex >= canvasHistory.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
                 {selectedObject && (
                   <>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={toggleLock}
                       title={selectedObject.lockMovementX ? "Unlock" : "Lock"}
                     >
                       {selectedObject.lockMovementX ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={bringToFront}
                       title="Bring to Front"
                     >
                       <BringToFront className="h-4 w-4" />
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={bringForward}
                       title="Bring Forward"
                     >
                       <MoveUp className="h-4 w-4" />
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={sendBackward}
                       title="Send Backward"
                     >
                       <MoveDown className="h-4 w-4" />
                     </Button>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={sendToBack}
                       title="Send to Back"
                     >
                       <Send className="h-4 w-4" />
                     </Button>
                     <Button 
                       variant="destructive" 
                       size="sm" 
                       onClick={handleDeleteSelected}
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </>
                 )}
              </div>
              
              <div className="flex items-center gap-3">
          <SendCertificateDialog 
            canvasRef={canvasRef} 
            fabricCanvas={fabricCanvas}
            certificateId={generateCertificateId()}
          />
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" className="btn-hero" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PNG
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas */}
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
  );
};

export default Editor;