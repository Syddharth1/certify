import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TourStep {
  title: string;
  description: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const tourSteps: Record<string, TourStep[]> = {
  editor: [
    {
      title: "Welcome to the Certificate Editor! 🎨",
      description: "Let's take a quick tour to help you create stunning certificates. You can skip this tour anytime.",
    },
    {
      title: "Drawing Tools",
      description: "Use these tools to add text, shapes, and images to your certificate. Click any tool to get started.",
      target: "[data-tour='tools']",
    },
    {
      title: "Design Elements",
      description: "Add professional design elements like medals, ribbons, and seals to enhance your certificate.",
      target: "[data-tour='elements']",
    },
    {
      title: "AI Assistant",
      description: "Need help with text? Our AI assistant can generate titles and messages for you!",
      target: "[data-tour='ai']",
    },
    {
      title: "Save & Export",
      description: "When you're done, save your work or export it as a PDF. You can also send certificates directly via email.",
      target: "[data-tour='actions']",
    },
    {
      title: "You're All Set! 🚀",
      description: "Start creating amazing certificates. Press Ctrl+Z to undo and Ctrl+Y to redo. Have fun!",
    },
  ],
  dashboard: [
    {
      title: "Welcome to Your Dashboard! 📊",
      description: "Here you can view statistics and manage all your certificates and templates.",
    },
    {
      title: "Quick Stats",
      description: "Monitor your certificate creation activity at a glance.",
      target: "[data-tour='stats']",
    },
    {
      title: "Recent Activity",
      description: "View your most recently created certificates and their status.",
      target: "[data-tour='recent']",
    },
  ],
};

export const ProductTour = ({ tourKey }: { tourKey: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = tourSteps[tourKey] || [];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour_${tourKey}_completed`);
    if (!hasSeenTour && steps.length > 0) {
      setTimeout(() => setIsOpen(true), 500);
    }
  }, [tourKey, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tour_${tourKey}_completed`, "true");
    setIsOpen(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen || steps.length === 0) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100] animate-fade-in" />
      <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md shadow-2xl animate-scale-in">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
              <CardDescription className="text-base">
                {step.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
          <p className="text-xs text-muted-foreground mt-2">
            Step {currentStep + 1} of {steps.length}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleSkip} variant="ghost">
              Skip Tour
            </Button>
            <Button onClick={handleNext} className="btn-hero gap-2">
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
