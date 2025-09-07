import { useState } from "react";
import { Search, Filter, Star, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";

const Templates = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const templates = [
    {
      id: 1,
      title: "Modern Achievement Certificate",
      category: "Achievement",
      thumbnail: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=300&fit=crop",
      isPremium: false,
      rating: 4.8,
      downloads: 1234
    },
    {
      id: 2,
      title: "Professional Training Certificate",
      category: "Training",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      isPremium: true,
      rating: 4.9,
      downloads: 856
    },
    {
      id: 3,
      title: "Excellence Award Certificate",
      category: "Award",
      thumbnail: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=400&h=300&fit=crop",
      isPremium: false,
      rating: 4.7,
      downloads: 2341
    },
    {
      id: 4,
      title: "Corporate Recognition",
      category: "Corporate",
      thumbnail: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=300&fit=crop",
      isPremium: true,
      rating: 4.9,
      downloads: 567
    },
    {
      id: 5,
      title: "Academic Achievement",
      category: "Academic",
      thumbnail: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=400&h=300&fit=crop",
      isPremium: false,
      rating: 4.6,
      downloads: 1789
    },
    {
      id: 6,
      title: "Leadership Excellence",
      category: "Leadership",
      thumbnail: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=300&fit=crop",
      isPremium: true,
      rating: 4.8,
      downloads: 923
    }
  ];

  const categories = ["All", "Achievement", "Training", "Award", "Corporate", "Academic", "Leadership"];

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-subtle pt-20">
        <div className="container mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">
            Certificate Templates
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our professionally designed templates or create your own from scratch
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Categories */}
        <Tabs defaultValue="All" className="mb-8">
          <TabsList className="grid grid-cols-3 lg:grid-cols-7">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs lg:text-sm">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="All" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="certificate-card group">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={template.thumbnail}
                        alt={template.title}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      {template.isPremium && (
                        <Badge className="absolute top-3 right-3 bg-gradient-gold text-accent-gold-foreground">
                          Premium
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary">
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" className="btn-hero">
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4">
                    <div className="w-full">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{template.title}</h3>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="outline">{template.category}</Badge>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-accent-gold text-accent-gold" />
                            <span>{template.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{template.downloads}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-gradient-primary rounded-2xl text-white">
          <h2 className="text-3xl font-display font-bold mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Create a custom certificate from scratch with our powerful editor
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => window.location.href = '/editor'}
          >
            Start from Blank
          </Button>
        </div>
        </div>
      </div>
    </>
  );
};

export default Templates;