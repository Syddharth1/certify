import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Shield, Calendar, User, Award } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import Navigation from "@/components/Navigation";

interface Certificate {
  id: string;
  title: string;
  recipient_name: string;
  recipient_email: string;
  verification_id: string;
  certificate_data: any;
  issued_date: string;
  created_at: string;
}

const Certificate = () => {
  const { verificationId } = useParams<{ verificationId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!verificationId) {
        setError("No verification ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("certificates")
          .select("*")
          .eq("verification_id", verificationId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setError("Certificate not found");
        } else {
          setCertificate(data);
        }
      } catch (err: any) {
        console.error("Error fetching certificate:", err);
        setError("Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [verificationId]);

  const handleDownloadPDF = () => {
    if (!certificate || !certificate.certificate_data?.imageData) {
      toast.error("Certificate image data not available");
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600]
      });

      // Handle both formats: with and without data URL prefix
      let imageData = certificate.certificate_data.imageData;
      if (imageData.startsWith('data:image/')) {
        imageData = imageData.split(',')[1];
      }
      
      pdf.addImage(`data:image/png;base64,${imageData}`, 'PNG', 0, 0, 800, 600);
      pdf.save(`${certificate.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download certificate. Please try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
        </div>
      </>
    );
  }

  if (error || !certificate) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center pt-20">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Certificate Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              {error || "The certificate you're looking for could not be found."}
            </p>
          </CardContent>
        </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-subtle pt-20">
        <div className="container mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Award className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Verified Certificate
          </h1>
          <Badge variant="outline" className="text-success border-success">
            <Shield className="h-4 w-4 mr-2" />
            Verified Authentic
          </Badge>
        </div>

        {/* Certificate Details */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{certificate.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <User className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Recipient</p>
                  <p className="font-semibold">{certificate.recipient_name}</p>
                </div>
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Issued Date</p>
                  <p className="font-semibold">
                    {new Date(certificate.issued_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Verification ID</p>
                  <p className="font-mono text-sm">{certificate.verification_id}</p>
                </div>
              </div>

              {/* Certificate Image */}
              <div className="text-center mb-8">
                {certificate.certificate_data?.imageData ? (
                  <img
                    src={certificate.certificate_data.imageData}
                    alt="Certificate"
                    className="max-w-full h-auto border-2 border-border rounded-lg shadow-lg mx-auto"
                    onError={(e) => {
                      console.error("Failed to load certificate image");
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="p-8 border-2 border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">Certificate image not available</p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <div className="text-center">
                <Button onClick={handleDownloadPDF} className="btn-hero">
                  <Download className="h-4 w-4 mr-2" />
                  Download as PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Info */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-success bg-success/5">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Certificate Verified</h3>
              <p className="text-muted-foreground text-sm">
                This certificate has been verified as authentic and was issued on{" "}
                {new Date(certificate.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </>
  );
};

export default Certificate;