import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Download, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

interface SendCertificateDialogProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvas: any;
  certificateId?: string;
}

export const SendCertificateDialog = ({ canvasRef, fabricCanvas, certificateId }: SendCertificateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: "",
    recipientName: "",
    certificateTitle: "",
    senderName: "",
    message: ""
  });

  const handleDownloadPDF = () => {
    if (!fabricCanvas) {
      toast.error("Canvas not ready");
      return;
    }

    // Check if canvas has any objects
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast.error("Canvas is empty. Please add some elements before downloading.");
      return;
    }

    try {
      // Get canvas as image data
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
        enableRetinaScaling: false,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit the canvas in PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add image to PDF
      pdf.addImage(dataURL, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Download the PDF
      pdf.save(`${formData.certificateTitle || 'certificate'}.pdf`);
      
      toast.success("Certificate downloaded as PDF!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleSendThroughSystem = async () => {
    if (!fabricCanvas || !formData.recipientEmail || !formData.recipientName) {
      toast.error("Please fill in recipient email and name");
      return;
    }

    // Check if canvas has any objects
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast.error("Canvas is empty. Please add some elements before sending.");
      return;
    }

    setLoading(true);
    try {
      // Get canvas as image data
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
        enableRetinaScaling: false,
      });
      
      // Extract base64 data without the data URL prefix
      const certificateData = dataURL.split(',')[1];

      const { data, error } = await supabase.functions.invoke('send-certificate', {
        body: {
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          certificateTitle: formData.certificateTitle || "Certificate",
          certificateData: certificateData,
          senderName: formData.senderName,
          message: formData.message,
          certificateId: certificateId
        }
      });

      if (error) throw error;

      toast.success("Certificate sent successfully!");
      setOpen(false);
      setFormData({
        recipientEmail: "",
        recipientName: "",
        certificateTitle: "",
        senderName: "",
        message: ""
      });
    } catch (error: any) {
      console.error("Error sending certificate:", error);
      toast.error(error.message || "Failed to send certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleSendThroughGmail = () => {
    if (!fabricCanvas || !formData.recipientEmail) {
      toast.error("Please fill in recipient email");
      return;
    }

    // Check if canvas has any objects
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast.error("Canvas is empty. Please add some elements before sending.");
      return;
    }

    try {
      // Get canvas as image data
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
        enableRetinaScaling: false,
      });

      // Create Gmail compose URL
      const subject = encodeURIComponent(`Your Certificate: ${formData.certificateTitle || 'Certificate'}`);
      const body = encodeURIComponent(
        `Dear ${formData.recipientName || 'Recipient'},\n\n` +
        `${formData.message || 'Please find your certificate attached.'}\n\n` +
        `Best regards,\n${formData.senderName || 'Certificate Issuer'}\n\n` +
        `Note: Please save the image from this email as your certificate.`
      );

      // Open Gmail compose in new tab
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(formData.recipientEmail)}&su=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');

      // Also download the certificate so user can attach it
      const link = document.createElement("a");
      link.download = `${formData.certificateTitle || 'certificate'}.png`;
      link.href = dataURL;
      link.click();

      toast.success("Gmail compose opened and certificate downloaded for attachment!");
      setOpen(false);
    } catch (error) {
      console.error("Error opening Gmail:", error);
      toast.error("Failed to open Gmail");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Send className="h-4 w-4 mr-2" />
          Send Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Certificate</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipientName">Recipient Name *</Label>
              <Input
                id="recipientName"
                value={formData.recipientName}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                placeholder="Enter recipient's name"
              />
            </div>
            <div>
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                placeholder="Enter recipient's email"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="certificateTitle">Certificate Title</Label>
              <Input
                id="certificateTitle"
                value={formData.certificateTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, certificateTitle: e.target.value }))}
                placeholder="Certificate of Achievement"
              />
            </div>
            <div>
              <Label htmlFor="senderName">Your Name</Label>
              <Input
                id="senderName"
                value={formData.senderName}
                onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Add a personal message..."
              rows={3}
            />
          </div>

          <Tabs defaultValue="system" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="system">Send via System</TabsTrigger>
              <TabsTrigger value="gmail">Send via Gmail</TabsTrigger>
              <TabsTrigger value="download">Download PDF</TabsTrigger>
            </TabsList>
            
            <TabsContent value="system" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send the certificate directly through our email system.
              </p>
              <Button 
                onClick={handleSendThroughSystem}
                disabled={loading}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {loading ? "Sending..." : "Send via System"}
              </Button>
            </TabsContent>
            
            <TabsContent value="gmail" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Open Gmail compose with the certificate details. The certificate will be downloaded so you can attach it.
              </p>
              <Button 
                onClick={handleSendThroughGmail}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Open Gmail Compose
              </Button>
            </TabsContent>
            
            <TabsContent value="download" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download the certificate as a PDF file.
              </p>
              <Button 
                onClick={handleDownloadPDF}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};