import { useState, useEffect } from "react";
import { Plus, FileText, Award, Users, BarChart3, Upload, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DashboardStatSkeleton, ListItemSkeleton } from "@/components/LoadingSkeleton";
import { ProductTour } from "@/components/ProductTour";
import { SkipToContent } from "@/components/SkipToContent";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalTemplates: 0,
    totalUsers: 0,
    totalElements: 0
  });
  const [recentCertificates, setRecentCertificates] = useState([]);
  const [elements, setElements] = useState([]);
  const [isElementDialogOpen, setIsElementDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Element form state
  const [elementTitle, setElementTitle] = useState("");
  const [elementCategory, setElementCategory] = useState("general");
  const [elementFile, setElementFile] = useState<File | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
      fetchElements();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard stats...");
      
      // Call edge function to get all dashboard data in one request
      const { data, error } = await supabase.functions.invoke('get-dashboard-stats');

      console.log("Dashboard function response:", { data, error });

      if (error) {
        console.error("Dashboard function error:", error);
        throw error;
      }

      if (data?.success) {
        console.log("Dashboard data loaded successfully");
        setStats(data.stats);
        setRecentCertificates(data.recentCertificates);
      } else {
        console.error("Dashboard function returned error:", data?.error);
        throw new Error(data?.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(`Failed to load dashboard data: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchElements = async () => {
    try {
      const { data, error } = await supabase
        .from("elements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setElements(data || []);
    } catch (error) {
      console.error("Error fetching elements:", error);
      toast.error("Failed to load elements");
    }
  };

  const handleElementUpload = async () => {
    if (!elementFile || !elementTitle.trim()) {
      toast.error("Please provide both title and file");
      return;
    }

    try {
      // Upload file to Supabase Storage
      const fileExt = elementFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `elements/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("elements")
        .upload(filePath, elementFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("elements")
        .getPublicUrl(filePath);

      // Save element to database
      const { error: dbError } = await supabase
        .from("elements")
        .insert({
          title: elementTitle,
          category: elementCategory,
          image_url: publicUrl,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;

      toast.success("Element uploaded successfully!");
      setIsElementDialogOpen(false);
      setElementTitle("");
      setElementCategory("general");
      setElementFile(null);
      fetchElements();
      fetchDashboardData();
    } catch (error) {
      console.error("Error uploading element:", error);
      toast.error("Failed to upload element");
    }
  };

  const handleDeleteElement = async (elementId: string, imageUrl: string) => {
    try {
      // Extract file path from URL for storage deletion
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `elements/${fileName}`;

      // Delete from storage
      await supabase.storage
        .from("elements")
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from("elements")
        .delete()
        .eq("id", elementId);

      if (error) throw error;

      toast.success("Element deleted successfully!");
      fetchElements();
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting element:", error);
      toast.error("Failed to delete element");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <>
      <SkipToContent />
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto p-8">
          <Breadcrumb />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Loading dashboard data...
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tour="stats">
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-tour="recent">
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <SkipToContent />
    <ProductTour tourKey="dashboard" />
    <div className="min-h-screen bg-gradient-subtle" id="main-content">
      <div className="container mx-auto p-8">
        <Breadcrumb />
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage certificates, users, and design elements
            </p>
          </div>
          <Button className="btn-hero" onClick={() => window.location.href = '/editor'}>
            <Plus className="mr-2 h-5 w-5" />
            Create Certificate
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tour="stats">
          <Card className="certificate-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-primary mr-3" />
                <div className="text-3xl font-bold">{stats.totalCertificates}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="certificate-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Award className="h-8 w-8 text-accent-gold mr-3" />
                <div className="text-3xl font-bold">{stats.totalTemplates}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="certificate-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-8 w-8 text-success mr-3" />
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="certificate-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Design Elements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-primary mr-3" />
                <div className="text-3xl font-bold">{stats.totalElements}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest certificates issued by your users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-tour="recent">
                  {recentCertificates.length > 0 ? (
                    recentCertificates.map((cert: any) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{cert.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Issued to {cert.recipient_name} on {new Date(cert.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="default">Delivered</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No certificates issued yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Management</CardTitle>
                <CardDescription>
                  View and manage all certificates in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Certificate Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced certificate management features coming soon
                  </p>
                  <Button onClick={() => window.location.href = '/templates'}>
                    Browse Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Design Elements</CardTitle>
                  <CardDescription>
                    Manage design elements available in the editor
                  </CardDescription>
                </div>
                <Dialog open={isElementDialogOpen} onOpenChange={setIsElementDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-hero">
                      <Upload className="mr-2 h-4 w-4" />
                      Add Element
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Design Element</DialogTitle>
                      <DialogDescription>
                        Add a new design element for users to use in the certificate editor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="element-title">Title</Label>
                        <Input
                          id="element-title"
                          value={elementTitle}
                          onChange={(e) => setElementTitle(e.target.value)}
                          placeholder="Enter element title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="element-category">Category</Label>
                        <Select value={elementCategory} onValueChange={setElementCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="borders">Borders</SelectItem>
                            <SelectItem value="icons">Icons</SelectItem>
                            <SelectItem value="decorations">Decorations</SelectItem>
                            <SelectItem value="logos">Logos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="element-file">Image File</Label>
                        <Input
                          id="element-file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setElementFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Supported formats: JPG, PNG, SVG. Max size: 5MB
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsElementDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleElementUpload}>Upload Element</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {elements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {elements.map((element: any) => (
                      <Card key={element.id} className="overflow-hidden">
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          <img
                            src={element.image_url}
                            alt={element.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm mb-1">{element.title}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{element.category}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleDeleteElement(element.id, element.image_url)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No design elements yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your first design element to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Track system performance and usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 border border-border rounded-lg">
                    <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{stats.totalCertificates}</h3>
                    <p className="text-muted-foreground">Certificates Issued</p>
                  </div>
                  <div className="text-center p-6 border border-border rounded-lg">
                    <Users className="h-12 w-12 text-success mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{stats.totalUsers}</h3>
                    <p className="text-muted-foreground">Active Users</p>
                  </div>
                </div>
                <div className="mt-6 text-center py-8">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed charts, trends, and reporting features will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
};

export default Dashboard;