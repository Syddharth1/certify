import { Award, Shield, Sparkles, Users, Code, FileCheck, QrCode, Palette, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  const teamMembers = [
    {
      name: "Jai Marcony C. Torrefranca",
      role: "Programmer",
      icon: Code,
    },
    {
      name: "Jhon Angelo Lanojan",
      role: "System Analyst",
      icon: Users,
    },
    {
      name: "Mico Guzman",
      role: "Documents",
      icon: FileCheck,
    },
  ];

  const technologies = [
    { name: "React", description: "Modern UI Library" },
    { name: "TypeScript", description: "Type-safe JavaScript" },
    { name: "Tailwind CSS", description: "Utility-first CSS" },
    { name: "Supabase", description: "Backend as a Service" },
    { name: "Vite", description: "Fast Build Tool" },
    { name: "Fabric.js", description: "Canvas Library" },
  ];

  const services = [
    {
      icon: Palette,
      title: "Custom Certificate Design",
      description: "Create beautiful certificates with our intuitive drag-and-drop editor and professional templates.",
    },
    {
      icon: QrCode,
      title: "QR Code Verification",
      description: "Every certificate includes a unique QR code for instant verification and authenticity.",
    },
    {
      icon: Download,
      title: "Multiple Export Formats",
      description: "Download your certificates in various formats including PDF, PNG, and more.",
    },
    {
      icon: Shield,
      title: "Secure Certificate Management",
      description: "Manage all your certificates securely with user authentication and access control.",
    },
  ];
  
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Enhanced Hero Section */}
      <section className="bg-[linear-gradient(0deg,_rgba(63,94,251,1)_0%,_rgba(252,70,107,1)_100%)] text-white py-32">
        <div className="container mx-auto px-8 text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-7xl font-display font-bold mb-8 leading-tight">
              Create Professional Certificates in
              <span className="text-accent-gold block mt-2">Minutes</span>
            </h1>
            <p className="text-2xl opacity-90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Design, customize, and distribute beautiful certificates with our powerful drag-and-drop editor. 
              Complete with QR verification and professional templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="btn-hero bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to="/templates">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                      Browse Templates
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="btn-hero bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/templates">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                      Browse Templates
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-foreground mb-6">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the power of modern certificate creation with our advanced features
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <Award className="h-16 w-16 text-accent-gold mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">Professional Templates</h3>
                <p className="text-muted-foreground">Choose from dozens of professionally designed certificate templates</p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-success mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">QR Verification</h3>
                <p className="text-muted-foreground">Built-in QR codes ensure your certificates are authentic and verifiable</p>
              </CardContent>
            </Card>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center">
                <Sparkles className="h-16 w-16 text-primary-glow mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">Easy to Use</h3>
                <p className="text-muted-foreground">Intuitive drag-and-drop editor makes certificate creation effortless</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-foreground mb-6">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The talented individuals behind this innovative certificate platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <member.icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{member.name}</h3>
                  <p className="text-primary font-medium">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-foreground mb-6">Built with Modern Technologies</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by cutting-edge technologies for optimal performance and reliability
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Carousel 
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {technologies.map((tech, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                        <div className="bg-gradient-primary rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Code className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{tech.name}</h3>
                        <p className="text-muted-foreground text-sm">{tech.description}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-foreground mb-6">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive certificate solutions to meet all your professional needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center h-full flex flex-col">
                  <div className="bg-primary/10 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm flex-grow">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-primary text-white">
        <div className="container mx-auto px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-display font-bold mb-6">Ready to Create Amazing Certificates?</h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of users who trust our platform for their certificate needs
            </p>
            {!user && (
              <Link to="/auth">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg">
                  Start Creating Today
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
