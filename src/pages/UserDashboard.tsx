import { useEffect, useState } from "react";
import { Award, Plus, Send, FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ListItemSkeleton } from "@/components/LoadingSkeleton";
import { SkipToContent } from "@/components/SkipToContent";

const UserDashboard = () => {
  const { user } = useAuth();
  const [myCertificates, setMyCertificates] = useState([]);
  const [receivedCertificates, setReceivedCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      console.log("Fetching user certificates...");
      
      // Call edge function to get all certificates in one request
      const { data, error } = await supabase.functions.invoke('get-user-certificates');

      console.log("Function response:", { data, error });

      if (error) {
        console.error("Function invocation error:", error);
        throw error;
      }

      if (data?.success) {
        console.log("Certificates loaded successfully:", data);
        setMyCertificates(data.created || []);
        setReceivedCertificates(data.received || []);
      } else {
        console.error("Function returned error:", data?.error);
        throw new Error(data?.error || 'Failed to fetch certificates');
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error(`Failed to load certificates: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (cert: any) => {
    if (cert.certificate_url) {
      window.open(`https://certify-cert.vercel.app/certificate/${cert.verification_id}`, '_blank');
    } else if (cert.certificate_data?.imageData) {
      // Ensure the image data has the proper data URL format
      let imageData = cert.certificate_data.imageData;
      if (!imageData.startsWith('data:')) {
        imageData = `data:image/png;base64,${imageData}`;
      }
      
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${cert.title}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
              <img src="${imageData}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="${cert.title}" />
            </body>
          </html>
        `);
      }
    }
  };

  const handleDownloadCertificate = (cert: any) => {
    if (cert.certificate_data?.imageData) {
      // Ensure the image data has the proper data URL format
      let imageData = cert.certificate_data.imageData;
      if (!imageData.startsWith('data:')) {
        imageData = `data:image/png;base64,${imageData}`;
      }
      
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `${cert.title.replace(/[^a-z0-9]/gi, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
    <SkipToContent />
    <div className="min-h-screen bg-background" id="main-content">
      <Navigation />
      
      <div className="container mx-auto px-8 pt-24 pb-12">
        <Breadcrumb />
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your certificates and create new ones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certificates Created
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myCertificates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certificates Received
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receivedCertificates.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/editor">
                  <Button className="w-full btn-hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Certificate
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="created" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="created">My Certificates</TabsTrigger>
            <TabsTrigger value="received">Received Certificates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="created" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certificates I Created</CardTitle>
                <CardDescription>
                  Certificates you have created and issued
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <ListItemSkeleton />
                    <ListItemSkeleton />
                    <ListItemSkeleton />
                  </div>
                ) : myCertificates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You haven't created any certificates yet
                    </p>
                    <Link to="/editor">
                      <Button className="btn-hero">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Certificate
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myCertificates.map((cert: any) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{cert.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Recipient: {cert.recipient_name || cert.recipient_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Issued: {new Date(cert.issued_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Created</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="received" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certificates I Received</CardTitle>
                <CardDescription>
                  Certificates that were issued to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <ListItemSkeleton />
                    <ListItemSkeleton />
                    <ListItemSkeleton />
                  </div>
                ) : receivedCertificates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      You haven't received any certificates yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedCertificates.map((cert: any) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{cert.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Issued: {new Date(cert.issued_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCertificate(cert)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadCertificate(cert)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Badge variant="secondary">Received</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
};

export default UserDashboard;